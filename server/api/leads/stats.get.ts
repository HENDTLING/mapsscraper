import { getLeads } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const leads = await getLeads()
    
    // Statistiken berechnen
    const totalLeads = leads.length
    const activeLeads = leads.filter(lead => lead.status !== 'Geschlossen').length
    const highPriorityLeads = leads.filter(lead => lead.urgency_level === 'Hoch').length
    
    // Durchschnittlicher Lead-Score
    const avgLeadScore = totalLeads > 0 
      ? Math.round(leads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / totalLeads)
      : 0
    
    // Branchen-Verteilung
    const categoryStats = leads.reduce((acc, lead) => {
      const category = lead.business_category || 'Unbekannt'
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category]++
      return acc
    }, {} as Record<string, number>)
    
    // Top-Kategorien
    const topCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }))
    
    // Status-Verteilung
    const statusStats = leads.reduce((acc, lead) => {
      const status = lead.status || 'Neu'
      if (!acc[status]) {
        acc[status] = 0
      }
      acc[status]++
      return acc
    }, {} as Record<string, number>)
    
    // Gesamtwert aller Leads
    const totalValue = leads.reduce((sum, lead) => {
      const budget = lead.estimated_budget || '€0'
      const amount = parseInt(budget.replace(/[^\d]/g, '')) || 0
      return sum + amount
    }, 0)
    
    return {
      success: true,
      data: {
        totalLeads,
        activeLeads,
        highPriorityLeads,
        avgLeadScore,
        totalValue,
        topCategories,
        statusStats,
        categoryStats
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden der Lead-Statistiken:', error)
    
    return {
      success: false,
      error: 'Fehler beim Laden der Lead-Statistiken',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }
  }
}) 