import { getLeads } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const period = query.period || 'month'
    
    const leads = await getLeads()
    
    // Aktuelle Periode berechnen
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    
    // Aktuelle Periode Leads
    const currentPeriodLeads = leads.filter(lead => 
      new Date(lead.created_at) >= startDate
    )
    
    // Vorherige Periode Leads (gleiche Länge)
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    const previousPeriodLeads = leads.filter(lead => 
      new Date(lead.created_at) >= previousPeriodStart && 
      new Date(lead.created_at) < startDate
    )
    
    // Wachstum berechnen
    const currentCount = currentPeriodLeads.length
    const previousCount = previousPeriodLeads.length
    const growth = previousCount > 0 
      ? Math.round(((currentCount - previousCount) / previousCount) * 100)
      : currentCount > 0 ? 100 : 0
    
    // Pipeline-Stages mit echten Daten
    const pipelineStages = [
      { status: 'new', label: 'Neu', count: leads.filter(l => l.status === 'Neu').length },
      { status: 'contacted', label: 'Kontaktiert', count: leads.filter(l => l.status === 'Kontaktiert').length },
      { status: 'qualified', label: 'Qualifiziert', count: leads.filter(l => l.status === 'Qualifiziert').length },
      { status: 'proposal', label: 'Angebot', count: leads.filter(l => l.status === 'Angebot').length },
      { status: 'closed', label: 'Geschlossen', count: leads.filter(l => l.status === 'Geschlossen').length }
    ]
    
    // Prozentuale Verteilung berechnen
    const totalLeads = leads.length
    pipelineStages.forEach(stage => {
      stage.percentage = totalLeads > 0 ? Math.round((stage.count / totalLeads) * 100) : 0
      stage.value = stage.count * 1000 // Beispielwert pro Lead
    })
    
    // Lead-Quellen (basierend auf business_category)
    const leadSources = [
      { name: 'Google Maps', icon: 'location_on', description: 'Direkte Suche', leads: leads.filter(l => l.business_category?.includes('Recht')).length, conversion: 28, revenue: 15600 },
      { name: 'Keyword Research', icon: 'search', description: 'SEO-basiert', leads: leads.filter(l => l.business_category?.includes('Anwalt')).length, conversion: 32, revenue: 8900 },
      { name: 'Referrals', icon: 'people', description: 'Empfehlungen', leads: leads.filter(l => l.business_category?.includes('Kanzlei')).length, conversion: 45, revenue: 4200 },
      { name: 'Social Media', icon: 'share', description: 'LinkedIn & Co.', leads: leads.filter(l => !l.business_category || l.business_category === 'Unbekannt').length, conversion: 18, revenue: 2100 }
    ]
    
    // Chart-Daten (letzte 12 Monate)
    const chartData = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthLeads = leads.filter(lead => {
        const leadDate = new Date(lead.created_at)
        return leadDate >= monthStart && leadDate <= monthEnd
      }).length
      chartData.push(monthLeads)
    }
    
    // Top-Performer
    const topSources = leadSources
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 4)
      .map(source => ({ name: source.name, value: `${source.leads} Leads` }))
    
    const topConversions = leadSources
      .sort((a, b) => b.conversion - a.conversion)
      .slice(0, 4)
      .map(source => ({ name: source.name, rate: source.conversion }))
    
    return {
      success: true,
      data: {
        totalLeads: leads.length,
        conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'Geschlossen').length / leads.length) * 100) : 0,
        totalRevenue: leads.reduce((sum, lead) => {
          const budget = lead.estimated_budget || '€0'
          return sum + (parseInt(budget.replace(/[^\d]/g, '')) || 0)
        }, 0),
        avgResponseTime: 4.2, // Placeholder
        pipelineStages,
        leadSources,
        chartData,
        topSources,
        topConversions,
        growth
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden der Analytics-Daten:', error)
    
    return {
      success: false,
      error: 'Fehler beim Laden der Analytics-Daten',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }
  }
}) 