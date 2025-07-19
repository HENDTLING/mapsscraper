import { updateLead } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!id) {
      return {
        success: false,
        error: 'Lead ID ist erforderlich'
      }
    }

    const updatedLead = await updateLead(id, body)
    
    return {
      success: true,
      data: updatedLead
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Leads:', error)
    
    return {
      success: false,
      error: 'Fehler beim Aktualisieren des Leads',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }
  }
}) 