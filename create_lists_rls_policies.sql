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