# LeadPro - Lead Management System

Ein professionelles Lead-Management-System für Google Maps Daten-Sammlung und Cold Mailings.

## 🚀 Features

- **Dashboard** - Übersicht über alle Leads und Statistiken
- **Pipeline** - Kanban-Board für Lead-Management
- **Kontakte** - Lead-Verwaltung und Kontaktdaten
- **Recherche** - Google Maps API Integration für Lead-Generierung
- **Analytics** - Performance-Tracking und Berichte
- **Keywords** - Keyword-Management für bessere Lead-Generierung

## 🛠️ Setup

### 1. Supabase Setup

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Kopiere die Verbindungsdaten aus den Projekteinstellungen
3. Erstelle eine `.env` Datei im Root-Verzeichnis:

```bash
# Supabase Configuration
SUPABASEHOST=your_supabase_host
SUPABASEPORT=your_supabase_port
SUPABASEDATABASE=your_database_name
SUPABASEUSER=your_username
SUPABASEPOOLMODE=your_pool_mode
SUPABASE_KEY=your_supabase_anon_key

# Google API Key
GOOGLE_API_KEY=your_google_api_key
```

### 2. Datenbank-Schema

Führe folgende SQL-Befehle in der Supabase SQL Editor aus:

```sql
-- Leads Tabelle
CREATE TABLE leads (
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
CREATE TABLE keywords (
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
CREATE POLICY "Allow public access to leads" ON leads FOR ALL USING (true);
CREATE POLICY "Allow public access to keywords" ON keywords FOR ALL USING (true);
```

### 3. Installation

```bash
# Node.js Version 20 verwenden
nvm use v20

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## 📁 Projektstruktur

```
maps-scraper-app/
├── app/                    # App-Konfiguration
├── assets/                 # CSS und Assets
├── components/             # Vue Komponenten
├── pages/                  # Seiten
├── server/                 # API Endpoints
│   └── api/               # Nuxt Server API
├── public/                 # Statische Dateien
└── nuxt.config.ts         # Nuxt Konfiguration
```

## 🎨 Design

- **Flat Design** mit modernem Look
- **Material Icons** für konsistente Icons
- **Inter Schriftart** für bessere Lesbarkeit
- **Responsive Design** für alle Geräte
- **Einheitliche Farbpalette** (Blau, Grau, Schwarz)

## 🔧 Technologie-Stack

- **Frontend**: Vue 3 + Nuxt 3
- **Backend**: Nuxt Server API
- **Datenbank**: Supabase (PostgreSQL)
- **Styling**: CSS Custom Properties
- **Icons**: Material Icons
- **Deployment**: Vercel/Netlify ready

## 📊 API Endpoints

- `GET /api/leads` - Alle Leads abrufen
- `POST /api/leads` - Neuen Lead erstellen
- `PUT /api/leads/[id]` - Lead aktualisieren
- `DELETE /api/leads/[id]` - Lead löschen
- `GET /api/leads/stats` - Lead-Statistiken
- `GET /api/keywords` - Alle Keywords abrufen
- `POST /api/keywords` - Neues Keyword erstellen

## 🚀 Deployment

Das Projekt ist bereit für Deployment auf:
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **Supabase Edge Functions**: Für Serverless API

## 📝 License

MIT License - siehe LICENSE Datei für Details.
