import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.lead_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead ID ist erforderlich'
      })
    }
    
    if (!body.list_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Listen ID ist erforderlich'
      })
    }
    
    // Entferne Lead aus der Liste
    const { error } = await supabase
      .from('lead_lists')
      .delete()
      .eq('lead_id', body.lead_id)
      .eq('list_id', body.list_id)
    
    if (error) throw error
    
    return {
      success: true,
      message: 'Lead erfolgreich aus der Liste entfernt'
    }
  } catch (error) {
    console.error('Fehler beim Entfernen aus der Liste:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Entfernen aus der Liste'
    })
  }
}) 