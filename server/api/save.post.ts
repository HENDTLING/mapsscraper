import { createLead } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.leads || !Array.isArray(body.leads)) {
      return {
        success: false,
        error: 'Keine Leads zum Speichern übergeben'
      }
    }

    const savedLeads = []
    
    for (const lead of body.leads) {
      try {
        const leadData = {
          name: lead.name || 'Unbekannt',
          email: lead.email || null,
          phone: lead.phone || null,
          website: lead.website || null,
          address: lead.address || null,
          business_category: lead.business_category || null,
          lead_score: lead.lead_score || 0,
          status: 'Neu',
          urgency_level: 'Niedrig',
          estimated_budget: lead.estimated_budget || null,
          notes: lead.notes || null
        }
        
        const savedLead = await createLead(leadData)
        savedLeads.push(savedLead)
      } catch (error) {
        console.error(`Fehler beim Speichern von Lead ${lead.name}:`, error)
      }
    }
    
    return {
      success: true,
      message: `${savedLeads.length} Leads erfolgreich gespeichert`,
      data: savedLeads
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Leads:', error)
    
    return {
      success: false,
      error: 'Fehler beim Speichern der Leads',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }
  }
}) 