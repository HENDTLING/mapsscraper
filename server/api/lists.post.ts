import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
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
      .limit(1)
    
    if (checkError) {
      console.warn('Listen-Tabelle existiert noch nicht')
      return {
        success: false,
        error: 'Listen-Funktion ist noch nicht verfügbar. Bitte führen Sie zuerst die Datenbank-Migration aus.',
        details: 'Listen-Tabelle wurde noch nicht erstellt'
      }
    }
    
    const listData = {
      name: body.name.trim(),
      description: body.description || '',
      icon: body.icon || 'list',
      color: body.color || '#3B82F6',
      is_default: body.is_default || false
    }
    
    const { data, error } = await supabase
      .from('lists')
      .insert([listData])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      success: true,
      data,
      message: 'Liste erfolgreich erstellt'
    }
  } catch (error) {
    console.error('Fehler beim Erstellen der Liste:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Erstellen der Liste'
    })
  }
}) 