import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const listId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!listId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Listen-ID ist erforderlich'
      })
    }
    
    if (!body.name || body.name.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Listenname ist erforderlich'
      })
    }
    
    // Prüfe ob Listen-Tabelle existiert
    const { data: existingLists, error: checkError } = await supabase
      .from('lists')
      .select('id')
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
    
    const updateData = {
      name: body.name.trim(),
      description: body.description || '',
      icon: body.icon || 'list',
      color: body.color || '#3B82F6',
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('lists')
      .update(updateData)
      .eq('id', listId)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      success: true,
      data,
      message: 'Liste erfolgreich aktualisiert'
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Liste:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Aktualisieren der Liste'
    })
  }
}) 