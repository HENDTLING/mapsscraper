import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    // Prüfe ob Listen-Tabelle existiert
    const { data: lists, error: listsError } = await supabase
      .from('lists')
      .select('*')
      .order('name', { ascending: true })
    
    if (listsError) {
      console.warn('Listen-Tabelle existiert noch nicht, verwende Fallback-Daten')
      // Fallback-Daten bis Listen-Tabelle erstellt ist
      return {
        success: true,
        data: [
          {
            id: 'default',
            name: 'Alle Leads',
            description: 'Alle Leads ohne spezielle Zuordnung',
            color: '#6B7280',
            icon: 'list',
            is_default: true,
            lead_count: 0
          }
        ]
      }
    }
    
    // Hole Lead-Zählung für jede Liste
    const stats = await Promise.all(
      lists.map(async (list) => {
        try {
          const { count, error } = await supabase
            .from('lead_lists')
            .select('*', { count: 'exact', head: true })
            .eq('list_id', list.id)
          
          if (error) {
            console.error(`Fehler beim Zählen der Leads für Liste ${list.id}:`, error)
            return { ...list, lead_count: 0 }
          }
          
          return { ...list, lead_count: count || 0 }
        } catch (error) {
          console.error(`Fehler beim Zählen der Leads für Liste ${list.id}:`, error)
          return { ...list, lead_count: 0 }
        }
      })
    )
    
    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Listen-Statistiken:', error)
    // Fallback-Daten bei Fehler
    return {
      success: true,
      data: [
        {
          id: 'default',
          name: 'Alle Leads',
          description: 'Alle Leads ohne spezielle Zuordnung',
          color: '#6B7280',
          icon: 'list',
          is_default: true,
          lead_count: 0
        }
      ]
    }
  }
}) 