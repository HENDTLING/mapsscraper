-- Füge is_unsuitable Feld zur leads Tabelle hinzu
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS is_unsuitable BOOLEAN DEFAULT FALSE;

-- Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_leads_unsuitable ON leads(is_unsuitable);

-- Kommentar hinzufügen
COMMENT ON COLUMN leads.is_unsuitable IS 'Markiert ob ein Lead als ungeeignet eingestuft wurde'; 