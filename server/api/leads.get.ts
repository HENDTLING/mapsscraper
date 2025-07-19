import { getLeads } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const leads = await getLeads()
    
    return {
      success: true,
      data: leads
    }
  } catch (error) {
    console.error('Fehler beim Laden der Leads:', error)
    
    return {
      success: false,
      error: 'Fehler beim Laden der Leads',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }
  }
}) 