import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const listId = getRouterParam(event, 'id')
    
    if (!listId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Listen-ID ist erforderlich'
      })
    }
    
    // Prüfe ob Listen-Tabelle existiert
    const { data: existingLists, error: checkError } = await supabase
      .from('lists')
      .select('id, is_default')
      .eq('id', listId)
      .limit(1)
    
    if (checkError) {
      console.warn('Listen-Tabelle existiert noch nicht')
      return {
        success: false,
        error: 'Listen-Funktion ist noch nicht verfügbar. Bitte führen Sie zuerst die Datenbank-Migration aus.',
        details: 'Listen-Tabelle wurde noch nicht erstellt'
      }
    }
    
    if (!existingLists || existingLists.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Liste nicht gefunden'
      })
    }
    
    const list = existingLists[0]
    
    // Verhindere Löschung von Standard-Listen
    if (list.is_default) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Standard-Listen können nicht gelöscht werden'
      })
    }
    
    // Lösche zuerst alle Lead-Zuordnungen
    const { error: deleteRelationsError } = await supabase
      .from('lead_lists')
      .delete()
      .eq('list_id', listId)
    
    if (deleteRelationsError) {
      console.error('Fehler beim Löschen der Lead-Zuordnungen:', deleteRelationsError)
    }
    
    // Lösche dann die Liste selbst
    const { error: deleteListError } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId)
    
    if (deleteListError) throw deleteListError
    
    return {
      success: true,
      message: 'Liste erfolgreich gelöscht'
    }
  } catch (error) {
    console.error('Fehler beim Löschen der Liste:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Löschen der Liste'
    })
  }
}) 