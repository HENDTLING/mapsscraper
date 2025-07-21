-- Erweitere die leads Tabelle um neue Felder für bessere Lead-Verwaltung

-- Füge neue Spalten hinzu
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Google Maps',
ADD COLUMN IF NOT EXISTS estimated_budget INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS list_id UUID REFERENCES lists(id) ON DELETE SET NULL;

-- Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_list_id ON leads(list_id);

-- Kommentare für die neuen Spalten
COMMENT ON COLUMN leads.contact_person IS 'Ansprechpartner im Unternehmen';
COMMENT ON COLUMN leads.company_size IS 'Unternehmensgröße (z.B. 1-10, 11-50, etc.)';
COMMENT ON COLUMN leads.industry IS 'Branche des Unternehmens';
COMMENT ON COLUMN leads.source IS 'Quelle des Leads (Google Maps, Website, etc.)';
COMMENT ON COLUMN leads.estimated_budget IS 'Geschätztes Budget in Euro';
COMMENT ON COLUMN leads.list_id IS 'Referenz zur Liste, zu der der Lead gehört';

-- Aktualisiere bestehende Leads mit Standardwerten
UPDATE leads 
SET 
  contact_person = COALESCE(contact_person, ''),
  company_size = COALESCE(company_size, ''),
  industry = COALESCE(industry, ''),
  source = COALESCE(source, 'Google Maps'),
  estimated_budget = COALESCE(estimated_budget, 0)
WHERE contact_person IS NULL 
   OR company_size IS NULL 
   OR industry IS NULL 
   OR source IS NULL 
   OR estimated_budget IS NULL;

-- Erstelle Listen-Tabelle
CREATE TABLE IF NOT EXISTS lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle Lead-Listen Junction-Tabelle für viele-zu-viele Beziehungen
CREATE TABLE IF NOT EXISTS lead_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lead_id, list_id)
);

-- Erstelle Indexes für Lead-Listen
CREATE INDEX IF NOT EXISTS idx_lead_lists_lead_id ON lead_lists(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_lists_list_id ON lead_lists(list_id);

-- Erstelle Standard-Listen
INSERT INTO lists (name, description, color, is_default) VALUES
  ('Alle Leads', 'Alle Leads ohne spezielle Zuordnung', '#6B7280', TRUE),
  ('Heiße Leads', 'Leads mit hoher Priorität', '#EF4444', FALSE),
  ('Kaltakquise', 'Leads aus Kaltakquise', '#3B82F6', FALSE),
  ('Empfehlungen', 'Leads aus Empfehlungen', '#10B981', FALSE),
  ('Follow-up', 'Leads die nachverfolgt werden müssen', '#F59E0B', FALSE)
ON CONFLICT DO NOTHING;

-- Kommentare für Listen-Tabellen
COMMENT ON TABLE lists IS 'Listen zur Organisation von Leads';
COMMENT ON TABLE lead_lists IS 'Viele-zu-viele Beziehung zwischen Leads und Listen'; 