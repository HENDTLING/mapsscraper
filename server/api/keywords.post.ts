import { createKeyword } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Validierung
    if (!body.term) {
      return {
        success: false,
        error: 'Keyword ist erforderlich'
      }
    }

    const keywordData = {
      term: body.term,
      category: body.category || null,
      lead_count: body.lead_count || 0,
      last_search: body.last_search || null,
      status: body.status || 'Aktiv'
    }

    const newKeyword = await createKeyword(keywordData)
    
    return {
      success: true,
      data: newKeyword
    }
  } catch (error) {
    console.error('Fehler beim Erstellen des Keywords:', error)
    
    return {
      success: false,
      error: 'Fehler beim Erstellen des Keywords',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }
  }
}) 