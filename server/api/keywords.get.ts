import { getKeywords } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const keywords = await getKeywords()
    
    return {
      success: true,
      data: keywords
    }
  } catch (error) {
    console.error('Fehler beim Laden der Keywords:', error)
    
    return {
      success: false,
      error: 'Fehler beim Laden der Keywords',
      details: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }
  }
}) 