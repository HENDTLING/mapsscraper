import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    
    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Listen:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Abrufen der Listen'
    })
  }
}) 