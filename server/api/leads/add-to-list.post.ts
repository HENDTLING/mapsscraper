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
    
    // Prüfe ob lead_lists Tabelle existiert
    const { data: existingRelations, error: checkError } = await supabase
      .from('lead_lists')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.warn('Lead-Listen-Tabelle existiert noch nicht')
      return {
        success: false,
        error: 'Listen-Funktion ist noch nicht verfügbar. Bitte führen Sie zuerst die Datenbank-Migration aus.',
        details: 'Lead-Listen-Tabelle wurde noch nicht erstellt'
      }
    }
    
    // Füge Lead zur Liste hinzu
    const { data, error } = await supabase
      .from('lead_lists')
      .insert([{
        lead_id: body.lead_id,
        list_id: body.list_id
      }])
      .select()
      .single()
    
    if (error) {
      // Wenn Lead bereits in der Liste ist, ist das OK
      if (error.code === '23505') { // Unique constraint violation
        return {
          success: true,
          data: { lead_id: body.lead_id, list_id: body.list_id },
          message: 'Lead ist bereits in der Liste'
        }
      }
      throw error
    }
    
    return {
      success: true,
      data,
      message: 'Lead erfolgreich zur Liste hinzugefügt'
    }
  } catch (error) {
    console.error('Fehler beim Hinzufügen zur Liste:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Hinzufügen zur Liste'
    })
  }
}) 