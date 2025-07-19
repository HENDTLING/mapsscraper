import { createLead } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Validierung
    if (!body.name) {
      return {
        success: false,
        error: 'Name ist erforderlich'
      }
    }

    const leadData = {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      website: body.website || null,
      address: body.address || null,
      business_category: body.business_category || null,
      lead_score: body.lead_score || 0,
      status: body.status || 'Neu',
      urgency_level: body.urgency_level || 'Niedrig',
      estimated_budget: body.estimated_budget || null,
      notes: body.notes || null
    }

    const newLead = await createLead(leadData)
    
    return {
      success: true,
      data: newLead
    }
  } catch (error) {
    console.error('Fehler beim Erstellen des Leads:', error)
    
    return {
      success: false,
      error: 'Fehler beim Erstellen des Leads',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }
  }
}) 