# Supabase Setup Anleitung

## 🚀 Schritt-für-Schritt Setup

### 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Klicke "Start your project"
3. Wähle "New project"
4. Gib einen Projektnamen ein (z.B. "leadpro-maps-scraper")
5. Gib ein sicheres Passwort ein
6. Wähle eine Region (z.B. "West Europe")
7. Klicke "Create new project"

### 2. Verbindungsdaten kopieren

1. Gehe zu "Settings" → "Database"
2. Kopiere die folgenden Werte:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Pool Mode**: `transaction`

### 3. API Keys kopieren

1. Gehe zu "Settings" → "API"
2. Kopiere:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **API Keys** (Neue Keys - Empfohlen):
     - `SUPABASE_API_PUB`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - `SUPABASE_API_SECRET`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Legacy Keys** (Fallback):
     - `anon public key`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - `service_role key`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Environment Variables setzen

Erstelle eine `.env` Datei im `maps-scraper-app` Ordner:

```bash
# Supabase Configuration
SUPABASEHOST=db.xxxxxxxxxxxxx.supabase.co
SUPABASEPORT=5432
SUPABASEDATABASE=postgres
SUPABASEUSER=postgres
SUPABASEPOOLMODE=transaction

# API Keys (Neue Keys - Empfohlen)
SUPABASE_API_PUB=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # API public key
SUPABASE_API_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # API secret key

# Legacy Keys (Fallback)
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # anon public key
SUPABASE_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # service_role key

# Google API Key
GOOGLE_API_KEY=your_google_api_key_here
```

**Wichtig**: 
- **Neue API Keys** (empfohlen): `SUPABASE_API_PUB` und `SUPABASE_API_SECRET`
- **Legacy Keys** (Fallback): `SUPABASE_KEY` und `SUPABASE_SECRET`
- Public Keys sind für Client-Side, Secret Keys für Server-Side

### 5. Datenbank-Schema erstellen

1. Gehe zu "SQL Editor" in deinem Supabase Dashboard
2. Klicke "New query"
3. Kopiere den gesamten Inhalt von `supabase-schema.sql`
4. Klicke "Run" um das Schema zu erstellen

### 6. Tabellen überprüfen

1. Gehe zu "Table Editor"
2. Du solltest jetzt sehen:
   - `leads` Tabelle
   - `keywords` Tabelle
   - Beispieldaten in beiden Tabellen

### 7. App testen

```bash
cd maps-scraper-app
nvm use v20
npm run dev
```

Gehe zu `http://localhost:3000` und teste:
- Dashboard sollte Daten anzeigen
- Kontakte-Seite sollte Leads laden
- Keywords-Seite sollte Keywords anzeigen

## 🔧 Troubleshooting

### Problem: "Connection failed"
- Prüfe ob alle Environment Variables korrekt sind
- Stelle sicher, dass die `.env` Datei im richtigen Ordner liegt
- Prüfe ob Supabase Projekt aktiv ist

### Problem: "Table not found"
- Führe das SQL-Schema nochmal aus
- Prüfe ob die Tabellen im Table Editor sichtbar sind

### Problem: "Permission denied"
- Prüfe ob Row Level Security Policies erstellt wurden
- Stelle sicher, dass die API Keys korrekt sind
- Verwende den API Secret Key für Server-Side Operations

## 📊 Erwartete Ergebnisse

Nach erfolgreichem Setup solltest du sehen:

### In Supabase Table Editor:
- `leads` Tabelle mit 3 Beispieldatensätzen
- `keywords` Tabelle mit 4 Beispieldatensätzen

### In der App:
- Dashboard mit Statistiken
- Kontakte-Seite mit Lead-Liste
- Keywords-Seite mit Keyword-Übersicht

## 🎯 Nächste Schritte

1. ✅ Supabase Projekt erstellt
2. ✅ Environment Variables gesetzt
3. ✅ Datenbank-Schema erstellt
4. ✅ App getestet
5. 🎉 Bereit für Produktion!

---

**Tipp**: Du kannst jetzt echte Leads und Keywords in der App verwalten! 🚀 