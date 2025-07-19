import { getLeads } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const leads = await getLeads()
    
    // Pipeline-Stages definieren
    const stages = [
      { status: 'Neu', label: 'Neu', count: 0, percentage: 0, value: 0 },
      { status: 'Kontaktiert', label: 'Kontaktiert', count: 0, percentage: 0, value: 0 },
      { status: 'Qualifiziert', label: 'Qualifiziert', count: 0, percentage: 0, value: 0 },
      { status: 'Angebot', label: 'Angebot', count: 0, percentage: 0, value: 0 },
      { status: 'Geschlossen', label: 'Geschlossen', count: 0, percentage: 0, value: 0 }
    ]
    
    // Leads nach Status gruppieren
    const leadsByStatus = leads.reduce((acc, lead) => {
      const status = lead.status || 'Neu'
      if (!acc[status]) {
        acc[status] = []
      }
      acc[status].push(lead)
      return acc
    }, {} as Record<string, any[]>)
    
    // Stages mit Daten füllen
    const totalLeads = leads.length
    stages.forEach(stage => {
      const stageLeads = leadsByStatus[stage.status] || []
      stage.count = stageLeads.length
      stage.percentage = totalLeads > 0 ? Math.round((stage.count / totalLeads) * 100) : 0
      stage.value = stageLeads.reduce((sum, lead) => {
        const budget = lead.estimated_budget || '€0'
        const amount = parseInt(budget.replace(/[^\d]/g, '')) || 0
        return sum + amount
      }, 0)
    })
    
    return {
      success: true,
      data: {
        stages,
        totalLeads,
        totalValue: stages.reduce((sum, stage) => sum + stage.value, 0)
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden der Pipeline-Daten:', error)
    
    return {
      success: false,
      error: 'Fehler beim Laden der Pipeline-Daten',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }
  }
}) 