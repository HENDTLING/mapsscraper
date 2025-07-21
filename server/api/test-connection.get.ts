export default defineEventHandler(async (event) => {
  try {
    // Debug: Environment Variables anzeigen (ohne sensitive Daten)
    const envDebug = {
      hasSupabaseUrl: !!process.env.SUPABASE_URL || !!process.env.SUPABASE_PROJECT_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY || !!process.env.SUPABASE_API_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.SUPABASE_SECRET,
      supabaseUrl: process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || 'NOT_SET',
      keyLength: (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY || '').length
    }

    // Test Supabase Connection
    const { supabase } = await import('~/server/utils/supabase')
    
    // Einfacher Test: Versuche eine einfache Abfrage
    const { data, error } = await supabase
      .from('leads')
      .select('count')
      .limit(1)
    
    if (error) {
      return {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        envDebug
      }
    }

    return {
      success: true,
      message: 'Supabase-Verbindung erfolgreich!',
      data: data,
      envDebug
    }

  } catch (error: any) {
    console.error('Supabase Connection Test Error:', error)
    
    return {
      success: false,
      error: error.message || 'Unbekannter Fehler',
      stack: error.stack,
      envDebug: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL || !!process.env.SUPABASE_PROJECT_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY || !!process.env.SUPABASE_API_KEY,
        supabaseUrl: process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || 'NOT_SET',
        keyLength: (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY || '').length
      }
    }
  }
}) 