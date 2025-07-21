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
    
    // Hole Listen für den spezifischen Lead
    const { data, error } = await supabase
      .from('lead_lists')
      .select(`
        list_id,
        lists (
          id,
          name,
          description,
          color,
          icon,
          is_default
        )
      `)
      .eq('lead_id', leadId)
    
    if (error) throw error
    
    // Extrahiere die Listen-Daten
    const lists = data.map(item => item.lists).filter(Boolean)
    
    return {
      success: true,
      data: lists
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Lead-Listen:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Abrufen der Lead-Listen'
    })
  }
}) 