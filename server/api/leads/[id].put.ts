import { updateLead } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead ID ist erforderlich'
      })
    }
    
    // Validiere erforderliche Felder
    if (!body.name || body.name.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name ist erforderlich'
      })
    }
    
    // Bereite die Daten für die Aktualisierung vor
    const updateData = {
      name: body.name.trim(),
      email: body.email || '',
      phone: body.phone || '',
      website: body.website || '',
      address: body.address || '',
      business_category: body.business_category || '',
      status: body.status || 'Neu',
      lead_score: body.lead_score || 0,
      urgency_level: body.urgency_level || 'Niedrig',
      estimated_budget: body.estimated_budget || 0,
      notes: body.notes || ''
      // Temporär auskommentiert bis DB-Migration läuft:
      // contact_person: body.contact_person || '',
      // company_size: body.company_size || '',
      // industry: body.industry || '',
      // source: body.source || 'Google Maps'
    }
    
    const updatedLead = await updateLead(id, updateData)
    
    return {
      success: true,
      data: updatedLead,
      message: 'Lead erfolgreich aktualisiert'
    }
    
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Leads:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Aktualisieren des Leads'
    })
  }
}) 