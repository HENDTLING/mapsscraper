-- LeadPro Supabase Database Schema
-- Führe dieses Script in der Supabase SQL Editor aus

-- Leads Tabelle
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  business_category TEXT,
  lead_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Neu',
  urgency_level TEXT DEFAULT 'Niedrig',
  estimated_budget TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keywords Tabelle
CREATE TABLE IF NOT EXISTS keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL,
  category TEXT,
  lead_count INTEGER DEFAULT 0,
  last_search TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'Aktiv',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security aktivieren
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

-- Policies für öffentlichen Zugriff (für Demo)
DROP POLICY IF EXISTS "Allow public access to leads" ON leads;
CREATE POLICY "Allow public access to leads" ON leads FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to keywords" ON keywords;
CREATE POLICY "Allow public access to keywords" ON keywords FOR ALL USING (true);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(business_category);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_keywords_term ON keywords(term);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Beispieldaten einfügen (optional)
INSERT INTO leads (name, email, phone, website, address, business_category, lead_score, status, urgency_level, estimated_budget, notes) VALUES
('Muster Restaurant', 'info@muster-restaurant.de', '+49 89 123456', 'https://muster-restaurant.de', 'Musterstraße 1, 80331 München', 'Gastronomie', 75, 'Kontaktiert', 'Hoch', '€5.000 - €8.000', 'Interessiert an neuer Website'),
('Beispiel Zahnarzt', 'kontakt@beispiel-zahnarzt.de', '+49 89 654321', 'https://beispiel-zahnarzt.de', 'Beispielweg 5, 80331 München', 'Gesundheit', 85, 'Qualifiziert', 'Hoch', '€8.000 - €12.000', 'Alte Website, hoher Lead-Score'),
('Test Anwalt', 'info@test-anwalt.de', '+49 89 789012', 'https://test-anwalt.de', 'Testplatz 10, 80331 München', 'Recht', 65, 'Neu', 'Mittel', '€3.000 - €6.000', 'Neue Praxis, braucht Website');

INSERT INTO keywords (term, category, lead_count, status) VALUES
('Zahnarzt München', 'Gesundheit', 45, 'Aktiv'),
('Restaurant München', 'Gastronomie', 32, 'Aktiv'),
('Anwalt München', 'Recht', 28, 'Aktiv'),
('Webdesign München', 'Dienstleistung', 67, 'Aktiv');

-- Bestätigung
SELECT 'Database schema created successfully!' as status; 