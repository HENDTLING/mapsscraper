import { deleteLead } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      return {
        success: false,
        error: 'Lead ID ist erforderlich'
      }
    }

    await deleteLead(id)
    
    return {
      success: true,
      message: 'Lead erfolgreich gelöscht'
    }
  } catch (error) {
    console.error('Fehler beim Löschen des Leads:', error)
    
    return {
      success: false,
      error: 'Fehler beim Löschen des Leads',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }
  }
}) 