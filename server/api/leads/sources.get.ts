import db from '../../utils/database.js'

export default defineEventHandler(async (event) => {
  try {
    const workspaceId = 1 // Default workspace

    // Lead-Quellen basierend auf Business-Kategorien
    const sources = [
      {
        name: 'Gastronomie',
        icon: '🍽️',
        description: 'Restaurants, Cafés, Bars',
        category: 'Gastronomie'
      },
      {
        name: 'Gesundheitswesen',
        icon: '🏥',
        description: 'Ärzte, Zahnärzte, Therapeuten',
        category: 'Zahnarzt'
      },
      {
        name: 'Rechtswesen',
        icon: '⚖️',
        description: 'Anwälte, Notare, Berater',
        category: 'Rechtsanwalt'
      },
      {
        name: 'Beauty & Wellness',
        icon: '💄',
        description: 'Salons, Spas, Fitness',
        category: 'Beauty/Salon'
      },
      {
        name: 'Immobilien',
        icon: '🏠',
        description: 'Makler, Vermieter, Entwickler',
        category: 'Immobilien'
      },
      {
        name: 'Automobil',
        icon: '🚗',
        description: 'Händler, Werkstätten, Services',
        category: 'Automobil'
      },
      {
        name: 'Einzelhandel',
        icon: '🛍️',
        description: 'Shops, Boutiquen, Online-Handel',
        category: 'Einzelhandel'
      },
      {
        name: 'Dienstleister',
        icon: '💼',
        description: 'Berater, Agenturen, Services',
        category: 'Dienstleister'
      }
    ]

    const sourcesData = []

    for (const source of sources) {
      // Statistiken für diese Quelle
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as leads,
          AVG(lead_score) as avg_lead_score,
          AVG(page_speed_score) as avg_page_speed,
          AVG(rating) as avg_rating,
          SUM(CASE WHEN status IN ('gewonnen') THEN 1 ELSE 0 END) as won_leads,
          SUM(CASE WHEN status IN ('kontaktiert', 'gespräch', 'angebot', 'gewonnen') THEN 1 ELSE 0 END) as active_leads
        FROM leads 
        WHERE workspace_id = ? AND business_category = ?
      `).get(workspaceId, source.category)

      // Budget-Verteilung
      const budgetStats = db.prepare(`
        SELECT estimated_budget, COUNT(*) as count
        FROM leads 
        WHERE workspace_id = ? AND business_category = ?
        GROUP BY estimated_budget
      `).all(workspaceId, source.category)

      let totalRevenue = 0
      budgetStats.forEach(item => {
        const budget = item.estimated_budget
        if (budget.includes('€5.000 - €15.000')) {
          totalRevenue += item.count * 10000
        } else if (budget.includes('€3.000 - €8.000')) {
          totalRevenue += item.count * 5500
        } else if (budget.includes('€2.000 - €5.000')) {
          totalRevenue += item.count * 3500
        } else {
          totalRevenue += item.count * 2000
        }
      })

      // Conversion-Rate berechnen
      const conversionRate = stats.leads > 0 ? 
        Math.round((stats.won_leads / stats.leads) * 100) : 0

      // Technologie-Verteilung
      const techStats = db.prepare(`
        SELECT technology_stack, COUNT(*) as count
        FROM leads 
        WHERE workspace_id = ? AND business_category = ?
        GROUP BY technology_stack
        ORDER BY count DESC
      `).all(workspaceId, source.category)

      sourcesData.push({
        ...source,
        leads: stats.leads,
        avgLeadScore: Math.round(stats.avg_lead_score || 0),
        avgPageSpeed: Math.round(stats.avg_page_speed || 0),
        avgRating: Math.round((stats.avg_rating || 0) * 10) / 10,
        wonLeads: stats.won_leads,
        activeLeads: stats.active_leads,
        conversion: conversionRate,
        revenue: Math.round(totalRevenue),
        technologyDistribution: techStats
      })
    }

    // Top-Performer basierend auf verschiedenen Metriken
    const topSourcesByLeads = [...sourcesData]
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 5)

    const topSourcesByConversion = [...sourcesData]
      .filter(s => s.leads >= 3) // Mindestens 3 Leads für aussagekräftige Conversion-Rate
      .sort((a, b) => b.conversion - a.conversion)
      .slice(0, 5)

    const topSourcesByRevenue = [...sourcesData]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Gesamt-Statistiken
    const totalStats = db.prepare(`
      SELECT 
        COUNT(*) as total_leads,
        AVG(lead_score) as avg_lead_score,
        AVG(page_speed_score) as avg_page_speed,
        SUM(CASE WHEN status IN ('gewonnen') THEN 1 ELSE 0 END) as total_won,
        SUM(CASE WHEN status IN ('kontaktiert', 'gespräch', 'angebot', 'gewonnen') THEN 1 ELSE 0 END) as total_active
      FROM leads 
      WHERE workspace_id = ?
    `).get(workspaceId)

    const overallConversionRate = totalStats.total_leads > 0 ? 
      Math.round((totalStats.total_won / totalStats.total_leads) * 100) : 0

    return {
      success: true,
      data: {
        sources: sourcesData,
        topSources: topSourcesByLeads,
        topConversions: topSourcesByConversion,
        topRevenue: topSourcesByRevenue,
        overall: {
          totalLeads: totalStats.total_leads,
          avgLeadScore: Math.round(totalStats.avg_lead_score || 0),
          avgPageSpeed: Math.round(totalStats.avg_page_speed || 0),
          conversionRate: overallConversionRate,
          wonLeads: totalStats.total_won,
          activeLeads: totalStats.total_active
        }
      }
    }

  } catch (error) {
    console.error('Fehler beim Laden der Lead-Quellen:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Lead-Quellen'
    })
  }
}) 