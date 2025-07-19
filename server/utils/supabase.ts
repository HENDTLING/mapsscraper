import { createClient } from '@supabase/supabase-js'

// Verwende die spezifischen Environment Variables
const supabaseHost = process.env.SUPABASEHOST!
const supabasePort = process.env.SUPABASEPORT!
const supabaseDatabase = process.env.SUPABASEDATABASE!
const supabaseUser = process.env.SUPABASEUSER!
const supabasePoolMode = process.env.SUPABASEPOOLMODE!

// Konstruiere die Supabase URL
const supabaseUrl = `https://${supabaseHost}:${supabasePort}`
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY!

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
  estimated_budget?: string
  notes?: string
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
export async function getLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
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