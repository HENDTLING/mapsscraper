import db from '../utils/database.js'

export default defineEventHandler(async (event) => {
  try {
    const workspaceId = 1 // Default workspace

    // Pipeline-Stages mit erweiterten Metriken
    const stages = [
      { status: 'neu', label: 'Neue Leads', color: '#3b82f6' },
      { status: 'kontaktiert', label: 'Kontaktiert', color: '#f59e0b' },
      { status: 'gespräch', label: 'Gespräch', color: '#8b5cf6' },
      { status: 'angebot', label: 'Angebot', color: '#ef4444' },
      { status: 'gewonnen', label: 'Gewonnen', color: '#10b981' },
      { status: 'verloren', label: 'Verloren', color: '#6b7280' }
    ]

    const pipelineData = []

    for (const stage of stages) {
      // Basis-Statistiken für jede Stage
      const stageStats = db.prepare(`
        SELECT 
          COUNT(*) as count,
          AVG(lead_score) as avg_lead_score,
          AVG(page_speed_score) as avg_page_speed,
          SUM(CASE WHEN mobile_friendly = 1 THEN 1 ELSE 0 END) as mobile_friendly_count,
          SUM(CASE WHEN has_contact_form = 1 THEN 1 ELSE 0 END) as contact_form_count
        FROM leads 
        WHERE workspace_id = ? AND status = ?
      `).get(workspaceId, stage.status)

      // Budget-Schätzung für diese Stage
      const budgetStats = db.prepare(`
        SELECT estimated_budget, COUNT(*) as count
        FROM leads 
        WHERE workspace_id = ? AND status = ?
        GROUP BY estimated_budget
      `).all(workspaceId, stage.status)

      let totalValue = 0
      budgetStats.forEach(item => {
        const budget = item.estimated_budget
        if (budget.includes('€5.000 - €15.000')) {
          totalValue += item.count * 10000
        } else if (budget.includes('€3.000 - €8.000')) {
          totalValue += item.count * 5500
        } else if (budget.includes('€2.000 - €5.000')) {
          totalValue += item.count * 3500
        } else {
          totalValue += item.count * 2000
        }
      })

      // Top Leads in dieser Stage
      const topLeads = db.prepare(`
        SELECT name, lead_score, business_category, estimated_budget
        FROM leads 
        WHERE workspace_id = ? AND status = ? AND lead_score > 0
        ORDER BY lead_score DESC 
        LIMIT 3
      `).all(workspaceId, stage.status)

      // Branchen-Verteilung
      const categoryDistribution = db.prepare(`
        SELECT business_category, COUNT(*) as count
        FROM leads 
        WHERE workspace_id = ? AND status = ?
        GROUP BY business_category
        ORDER BY count DESC
      `).all(workspaceId, stage.status)

      pipelineData.push({
        ...stage,
        count: stageStats.count,
        avgLeadScore: Math.round(stageStats.avg_lead_score || 0),
        avgPageSpeed: Math.round(stageStats.avg_page_speed || 0),
        mobileFriendlyPercentage: stageStats.count > 0 ? 
          Math.round((stageStats.mobile_friendly_count / stageStats.count) * 100) : 0,
        contactFormPercentage: stageStats.count > 0 ? 
          Math.round((stageStats.contact_form_count / stageStats.count) * 100) : 0,
        totalValue: Math.round(totalValue),
        percentage: 0, // Wird später berechnet
        topLeads,
        categoryDistribution
      })
    }

    // Gesamtzahl für Prozentberechnung
    const totalLeads = pipelineData.reduce((sum, stage) => sum + stage.count, 0)

    // Prozentuale Verteilung berechnen
    pipelineData.forEach(stage => {
      stage.percentage = totalLeads > 0 ? Math.round((stage.count / totalLeads) * 100) : 0
    })

    // Gesamt-Statistiken
    const overallStats = db.prepare(`
      SELECT 
        COUNT(*) as total_leads,
        AVG(lead_score) as avg_lead_score,
        AVG(page_speed_score) as avg_page_speed,
        SUM(CASE WHEN mobile_friendly = 1 THEN 1 ELSE 0 END) as mobile_friendly_total,
        SUM(CASE WHEN has_contact_form = 1 THEN 1 ELSE 0 END) as contact_form_total,
        COUNT(CASE WHEN status IN ('gewonnen') THEN 1 END) as won_leads,
        COUNT(CASE WHEN status IN ('kontaktiert', 'gespräch', 'angebot', 'gewonnen') THEN 1 END) as active_leads
      FROM leads 
      WHERE workspace_id = ?
    `).get(workspaceId)

    // Conversion-Raten
    const conversionRate = overallStats.total_leads > 0 ? 
      Math.round((overallStats.won_leads / overallStats.total_leads) * 100) : 0

    const activeRate = overallStats.total_leads > 0 ? 
      Math.round((overallStats.active_leads / overallStats.total_leads) * 100) : 0

    return {
      success: true,
      data: {
        stages: pipelineData,
        overall: {
          totalLeads: overallStats.total_leads,
          avgLeadScore: Math.round(overallStats.avg_lead_score || 0),
          avgPageSpeed: Math.round(overallStats.avg_page_speed || 0),
          mobileFriendlyPercentage: overallStats.total_leads > 0 ? 
            Math.round((overallStats.mobile_friendly_total / overallStats.total_leads) * 100) : 0,
          contactFormPercentage: overallStats.total_leads > 0 ? 
            Math.round((overallStats.contact_form_total / overallStats.total_leads) * 100) : 0,
          conversionRate,
          activeRate,
          wonLeads: overallStats.won_leads,
          activeLeads: overallStats.active_leads
        }
      }
    }

  } catch (error) {
    console.error('Fehler beim Laden der Pipeline-Daten:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Pipeline-Daten'
    })
  }
}) 