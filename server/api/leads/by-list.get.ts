import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const listId = query.list_id as string
    
    if (!listId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'List ID ist erforderlich'
      })
    }
    
    // Hole Leads für die spezifische Liste
    const { data, error } = await supabase
      .from('lead_lists')
      .select(`
        lead_id,
        leads (
          id,
          name,
          email,
          phone,
          website,
          address,
          status,
          urgency,
          notes,
          contact_person,
          company_size,
          industry,
          source,
          estimated_budget,
          created_at,
          updated_at
        )
      `)
      .eq('list_id', listId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Extrahiere die Lead-Daten
    const leads = data.map(item => item.leads).filter(Boolean)
    
    return {
      success: true,
      data: leads,
      count: leads.length
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Leads für Liste:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Abrufen der Leads für Liste'
    })
  }
}) 