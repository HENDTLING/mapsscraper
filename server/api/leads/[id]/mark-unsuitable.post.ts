import { markLeadAsUnsuitable } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw new Error('Lead ID ist erforderlich')
    }
    
    const updatedLead = await markLeadAsUnsuitable(id)
    
    return {
      success: true,
      data: updatedLead,
      message: 'Lead als ungeeignet markiert'
    }
  } catch (error) {
    console.error('Fehler beim Markieren des Leads als ungeeignet:', error)
    
    return {
      success: false,
      error: 'Fehler beim Markieren des Leads',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }
  }
}) 