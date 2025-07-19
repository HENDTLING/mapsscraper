import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Datenbank-Datei im server-Verzeichnis erstellen
const dbPath = path.join(__dirname, '..', 'data', 'maps-scraper.db');

// Datenbank-Verzeichnis erstellen falls nicht vorhanden
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Tabellen erstellen
db.exec(`
  CREATE TABLE IF NOT EXISTS workspaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    workspace_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
  );

  CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL DEFAULT 1,
    query TEXT NOT NULL,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
  );

  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL DEFAULT 1,
    search_id INTEGER,
    place_id TEXT,
    name TEXT,
    address TEXT,
    phone TEXT,
    website TEXT,
    rating REAL,
    website_quality TEXT,
    website_quality_score INTEGER,
    
    -- Erweiterte Datenanreicherung
    page_speed_score INTEGER,
    mobile_friendly BOOLEAN,
    has_contact_form BOOLEAN,
    technology_stack TEXT,
    social_media_presence BOOLEAN,
    
    -- Webdesign Lead-Scoring
    lead_score INTEGER,
    lead_score_breakdown TEXT,
    urgency_level TEXT,
    estimated_budget TEXT,
    business_size TEXT,
    business_category TEXT,
    
    -- Zusätzliche Business-Info
    business_status TEXT,
    price_level INTEGER,
    opening_hours TEXT,
    review_count INTEGER,
    last_updated DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (search_id) REFERENCES searches (id),
    FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL DEFAULT 1,
    name TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    city TEXT,
    category TEXT,
    score INTEGER,
    score_label TEXT,
    note TEXT,
    favorite INTEGER DEFAULT 0,
    status TEXT DEFAULT 'neu',
    
    -- Erweiterte Lead-Felder
    lead_score INTEGER,
    urgency_level TEXT,
    estimated_budget TEXT,
    business_size TEXT,
    business_category TEXT,
    technology_stack TEXT,
    page_speed_score INTEGER,
    mobile_friendly BOOLEAN,
    has_contact_form BOOLEAN,
    social_media_presence BOOLEAN,
    business_status TEXT,
    price_level INTEGER,
    opening_hours TEXT,
    review_count INTEGER,
    rating REAL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
  );

  -- Indizes für bessere Performance
  CREATE INDEX IF NOT EXISTS idx_results_workspace ON results(workspace_id);
  CREATE INDEX IF NOT EXISTS idx_results_lead_score ON results(lead_score);
  CREATE INDEX IF NOT EXISTS idx_results_business_category ON results(business_category);
  CREATE INDEX IF NOT EXISTS idx_results_website_quality_score ON results(website_quality_score);
  
  CREATE INDEX IF NOT EXISTS idx_leads_workspace ON leads(workspace_id);
  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score);
  CREATE INDEX IF NOT EXISTS idx_leads_business_category ON leads(business_category);

  INSERT OR IGNORE INTO workspaces (id, name) VALUES (1, 'Default Workspace');
`);

export const getDatabase = () => db;
export default db; 