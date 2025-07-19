import db from '../../utils/database.js'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const metric = query.metric || 'leads'
    const workspaceId = 1 // Default workspace

    // Verfügbare Metriken
    const availableMetrics = ['leads', 'conversions', 'revenue', 'lead_score', 'page_speed']

    if (!availableMetrics.includes(metric)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Ungültige Metrik'
      })
    }

    // Daten für die letzten 12 Monate
    const months = []
    const currentDate = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
      })
    }

    const chartData = []

    for (const month of months) {
      let data = {}

      if (metric === 'leads') {
        const result = db.prepare(`
          SELECT COUNT(*) as count
          FROM leads 
          WHERE workspace_id = ? 
          AND strftime('%Y-%m', created_at) = ?
        `).get(workspaceId, `${month.year}-${month.month.toString().padStart(2, '0')}`)
        
        data = { value: result.count }

      } else if (metric === 'conversions') {
        const result = db.prepare(`
          SELECT COUNT(*) as count
          FROM leads 
          WHERE workspace_id = ? 
          AND status = 'gewonnen'
          AND strftime('%Y-%m', updated_at) = ?
        `).get(workspaceId, `${month.year}-${month.month.toString().padStart(2, '0')}`)
        
        data = { value: result.count }

      } else if (metric === 'revenue') {
        const leads = db.prepare(`
          SELECT estimated_budget
          FROM leads 
          WHERE workspace_id = ? 
          AND status = 'gewonnen'
          AND strftime('%Y-%m', updated_at) = ?
        `).all(workspaceId, `${month.year}-${month.month.toString().padStart(2, '0')}`)
        
        let revenue = 0
        leads.forEach(lead => {
          const budget = lead.estimated_budget
          if (budget.includes('€5.000 - €15.000')) {
            revenue += 10000
          } else if (budget.includes('€3.000 - €8.000')) {
            revenue += 5500
          } else if (budget.includes('€2.000 - €5.000')) {
            revenue += 3500
          } else {
            revenue += 2000
          }
        })
        
        data = { value: revenue }

      } else if (metric === 'lead_score') {
        const result = db.prepare(`
          SELECT AVG(lead_score) as avg_score
          FROM leads 
          WHERE workspace_id = ? 
          AND lead_score > 0
          AND strftime('%Y-%m', created_at) = ?
        `).get(workspaceId, `${month.year}-${month.month.toString().padStart(2, '0')}`)
        
        data = { value: Math.round(result.avg_score || 0) }

      } else if (metric === 'page_speed') {
        const result = db.prepare(`
          SELECT AVG(page_speed_score) as avg_speed
          FROM leads 
          WHERE workspace_id = ? 
          AND page_speed_score > 0
          AND strftime('%Y-%m', created_at) = ?
        `).get(workspaceId, `${month.year}-${month.month.toString().padStart(2, '0')}`)
        
        data = { value: Math.round(result.avg_speed || 0) }
      }

      chartData.push({
        month: month.label,
        ...data
      })
    }

    // Zusätzliche Statistiken für die Metrik
    let additionalStats = {}

    if (metric === 'leads') {
      const totalLeads = db.prepare(`
        SELECT COUNT(*) as count FROM leads WHERE workspace_id = ?
      `).get(workspaceId).count
      
      const recentLeads = db.prepare(`
        SELECT COUNT(*) as count 
        FROM leads 
        WHERE workspace_id = ? 
        AND created_at >= datetime('now', '-30 days')
      `).get(workspaceId).count
      
      additionalStats = {
        total: totalLeads,
        recent: recentLeads,
        growth: totalLeads > 0 ? Math.round(((recentLeads / totalLeads) * 100)) : 0
      }

    } else if (metric === 'conversions') {
      const totalWon = db.prepare(`
        SELECT COUNT(*) as count FROM leads WHERE workspace_id = ? AND status = 'gewonnen'
      `).get(workspaceId).count
      
      const recentWon = db.prepare(`
        SELECT COUNT(*) as count 
        FROM leads 
        WHERE workspace_id = ? 
        AND status = 'gewonnen'
        AND updated_at >= datetime('now', '-30 days')
      `).get(workspaceId).count
      
      additionalStats = {
        total: totalWon,
        recent: recentWon,
        growth: totalWon > 0 ? Math.round(((recentWon / totalWon) * 100)) : 0
      }

    } else if (metric === 'revenue') {
      const allWonLeads = db.prepare(`
        SELECT estimated_budget FROM leads WHERE workspace_id = ? AND status = 'gewonnen'
      `).all(workspaceId)
      
      let totalRevenue = 0
      allWonLeads.forEach(lead => {
        const budget = lead.estimated_budget
        if (budget.includes('€5.000 - €15.000')) {
          totalRevenue += 10000
        } else if (budget.includes('€3.000 - €8.000')) {
          totalRevenue += 5500
        } else if (budget.includes('€2.000 - €5.000')) {
          totalRevenue += 3500
        } else {
          totalRevenue += 2000
        }
      })
      
      const recentWonLeads = db.prepare(`
        SELECT estimated_budget 
        FROM leads 
        WHERE workspace_id = ? 
        AND status = 'gewonnen'
        AND updated_at >= datetime('now', '-30 days')
      `).all(workspaceId)
      
      let recentRevenue = 0
      recentWonLeads.forEach(lead => {
        const budget = lead.estimated_budget
        if (budget.includes('€5.000 - €15.000')) {
          recentRevenue += 10000
        } else if (budget.includes('€3.000 - €8.000')) {
          recentRevenue += 5500
        } else if (budget.includes('€2.000 - €5.000')) {
          recentRevenue += 3500
        } else {
          recentRevenue += 2000
        }
      })
      
      additionalStats = {
        total: totalRevenue,
        recent: recentRevenue,
        growth: totalRevenue > 0 ? Math.round(((recentRevenue / totalRevenue) * 100)) : 0
      }
    }

    return {
      success: true,
      data: {
        metric,
        chartData,
        additionalStats
      }
    }

  } catch (error) {
    console.error('Fehler beim Laden der Chart-Daten:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Chart-Daten'
    })
  }
}) 