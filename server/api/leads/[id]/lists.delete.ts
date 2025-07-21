import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const leadId = getRouterParam(event, 'id')
    
    if (!leadId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead ID ist erforderlich'
      })
    }
    
    // Lösche alle Listen-Zuordnungen für den Lead
    const { error } = await supabase
      .from('lead_lists')
      .delete()
      .eq('lead_id', leadId)
    
    if (error) throw error
    
    return {
      success: true,
      message: 'Alle Listen-Zuordnungen gelöscht'
    }
  } catch (error) {
    console.error('Fehler beim Löschen der Lead-Listen:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Löschen der Lead-Listen'
    })
  }
}) 