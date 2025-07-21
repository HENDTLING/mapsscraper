# Supabase Listen-Setup

## Listen-Tabellen erstellen

Führe das folgende SQL-Script in deinem Supabase Dashboard aus:

### 1. Gehe zu Supabase Dashboard
- Öffne dein Supabase Projekt
- Klicke auf "SQL Editor" in der linken Sidebar

### 2. Führe das Script aus
Kopiere den gesamten Inhalt aus `create_lists_tables.sql` und füge ihn in den SQL Editor ein:

```sql
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

-- Erstelle Standard-Listen
INSERT INTO lists (name, description, color, icon, is_default) VALUES
  ('Alle Leads', 'Alle Leads ohne spezielle Zuordnung', '#6B7280', 'list', TRUE),
  ('Heiße Leads', 'Leads mit hoher Priorität', '#EF4444', 'local_fire_department', FALSE),
  ('Kaltakquise', 'Leads aus Kaltakquise', '#3B82F6', 'search', FALSE),
  ('Empfehlungen', 'Leads aus Empfehlungen', '#10B981', 'recommend', FALSE),
  ('Follow-up', 'Leads die nachverfolgt werden müssen', '#F59E0B', 'schedule', FALSE),
  ('Qualifiziert', 'Qualifizierte Leads', '#8B5CF6', 'verified', FALSE),
  ('Interessiert', 'Interessierte Leads', '#06B6D4', 'thumb_up', FALSE)
ON CONFLICT DO NOTHING;

-- Kommentare für Listen-Tabellen
COMMENT ON TABLE lists IS 'Listen zur Organisation von Leads';
COMMENT ON TABLE lead_lists IS 'Viele-zu-viele Beziehung zwischen Leads und Listen';
COMMENT ON COLUMN lists.icon IS 'Material Icon Name für die Liste';
```

### 3. Klicke auf "Run"
Das Script wird ausgeführt und die Tabellen werden erstellt.

### 4. RLS-Policies erstellen
Führe auch das zweite Script aus (`create_lists_rls_policies.sql`):

```sql
-- RLS-Policies für Listen-Tabellen

-- Aktiviere RLS für lists Tabelle
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- Aktiviere RLS für lead_lists Tabelle
ALTER TABLE lead_lists ENABLE ROW LEVEL SECURITY;

-- Policy für lists: Alle können lesen
CREATE POLICY "Listen sind öffentlich lesbar" ON lists
  FOR SELECT USING (true);

-- Policy für lists: Alle können erstellen
CREATE POLICY "Listen können erstellt werden" ON lists
  FOR INSERT WITH CHECK (true);

-- Policy für lists: Alle können aktualisieren
CREATE POLICY "Listen können aktualisiert werden" ON lists
  FOR UPDATE USING (true);

-- Policy für lists: Alle können löschen
CREATE POLICY "Listen können gelöscht werden" ON lists
  FOR DELETE USING (true);

-- Policy für lead_lists: Alle können lesen
CREATE POLICY "Lead-Listen sind öffentlich lesbar" ON lead_lists
  FOR SELECT USING (true);

-- Policy für lead_lists: Alle können erstellen
CREATE POLICY "Lead-Listen können erstellt werden" ON lead_lists
  FOR INSERT WITH CHECK (true);

-- Policy für lead_lists: Alle können löschen
CREATE POLICY "Lead-Listen können gelöscht werden" ON lead_lists
  FOR DELETE USING (true);
```

### 5. Überprüfung
Nach der Ausführung solltest du:
- Keine Fehler mehr beim Laden der Listen sehen
- Die Standard-Listen in der Listen-Seite sehen
- Listen erstellen können

## Troubleshooting

Falls du Fehler siehst:
1. **Überprüfe die RLS-Policies**: Stelle sicher, dass die Tabellen öffentlich lesbar sind
2. **Überprüfe die Verbindung**: Stelle sicher, dass deine App mit Supabase verbunden ist
3. **Überprüfe die Logs**: Schaue in die Browser-Konsole für detaillierte Fehlermeldungen 