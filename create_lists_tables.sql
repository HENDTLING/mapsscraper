-- Erstelle Listen-Tabellen für Lead-Organisation

-- Erstelle Listen-Tabelle
CREATE TABLE IF NOT EXISTS lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'list',
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

-- Erstelle Indexes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_lead_lists_lead_id ON lead_lists(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_lists_list_id ON lead_lists(list_id);
CREATE INDEX IF NOT EXISTS idx_lists_name ON lists(name);
CREATE INDEX IF NOT EXISTS idx_lists_is_default ON lists(is_default);

-- Erstelle Standard-Listen (Deal Stages)
INSERT INTO lists (name, description, color, icon, is_default) VALUES
  ('Alle Leads', 'Alle Leads ohne spezielle Zuordnung', '#6B7280', 'list', TRUE),
  ('Neu', 'Neue Leads - Erste Kontaktaufnahme', '#3B82F6', 'person_add', FALSE),
  ('Kontaktiert', 'Leads wurden kontaktiert', '#8B5CF6', 'phone', FALSE),
  ('Qualifiziert', 'Qualifizierte Leads - Interesse bestätigt', '#F59E0B', 'verified', FALSE),
  ('Angebot', 'Angebot erstellt - Verhandlung läuft', '#EF4444', 'description', FALSE)
ON CONFLICT DO NOTHING;

-- Kommentare für Listen-Tabellen
COMMENT ON TABLE lists IS 'Listen zur Organisation von Leads';
COMMENT ON TABLE lead_lists IS 'Viele-zu-viele Beziehung zwischen Leads und Listen';
COMMENT ON COLUMN lists.icon IS 'Material Icon Name für die Liste'; 