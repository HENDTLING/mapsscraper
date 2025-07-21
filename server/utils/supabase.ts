import { createClient } from '@supabase/supabase-js'

// Direct Connection - Verwende die Standard Supabase URL und Keys
const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY

// Debug: Log Environment Variables (ohne sensitive Daten)
console.log('Supabase Config Debug:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseKey?.length || 0,
  envKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
})

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL oder SUPABASE_PROJECT_URL ist nicht gesetzt!')
}

if (!supabaseKey) {
  throw new Error('SUPABASE_ANON_KEY oder SUPABASE_API_KEY ist nicht gesetzt!')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Typen für unsere Tabellen
export interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  website?: string
  address?: string
  business_category?: string
  lead_score: number
  status: string
  urgency_level: string
  estimated_budget?: number
  notes?: string
  contact_person?: string
  company_size?: string
  industry?: string
  source?: string
  created_at: string
  updated_at: string
}

export interface Keyword {
  id: string
  term: string
  category?: string
  lead_count: number
  last_search?: string
  status: string
  created_at: string
}

// Helper-Funktionen
export async function getLeads(excludeUnsuitable: boolean = true) {
  let query = supabase
    .from('leads')
    .select(`
      *,
      lead_lists (
        list_id,
        lists (
          id,
          name,
          description,
          color,
          icon,
          is_default
        )
      )
    `)
    .order('created_at', { ascending: false })
  
  // Temporär deaktiviert bis is_unsuitable Feld in DB existiert
  // if (excludeUnsuitable) {
  //   query = query.eq('is_unsuitable', false)
  // }
  
  const { data, error } = await query
  
  if (error) throw error
  
  // Transformiere die Daten um Listen direkt verfügbar zu machen
  return data.map(lead => ({
    ...lead,
    lists: lead.lead_lists?.map(item => item.lists).filter(Boolean) || []
  }))
}

export async function createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('leads')
    .insert([lead])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const { data, error } = await supabase
    .from('leads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function markLeadAsUnsuitable(id: string) {
  const { data, error } = await supabase
    .from('leads')
    .update({ 
      status: 'Verloren',
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteLead(id: string) {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

export async function getKeywords() {
  const { data, error } = await supabase
    .from('keywords')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createKeyword(keyword: Omit<Keyword, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('keywords')
    .insert([keyword])
    .select()
    .single()
  
  if (error) throw error
  return data
} 