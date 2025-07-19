# GitHub Repository Setup

## 🚀 Repository erstellen und pushen

### 1. GitHub Repository erstellen

1. Gehe zu [github.com](https://github.com) und erstelle ein neues **privates** Repository
2. Repository-Name: `leadpro-maps-scraper` (oder wie du möchtest)
3. **Wichtig**: Repository als **PRIVAT** markieren
4. **NICHT** README, .gitignore oder License hinzufügen (da wir bereits alles haben)

### 2. Repository mit lokalem Code verbinden

```bash
# Remote hinzufügen (ersetze USERNAME und REPO-NAME)
git remote add origin https://github.com/USERNAME/REPO-NAME.git

# Branch umbenennen (GitHub Standard)
git branch -M main

# Code pushen
git push -u origin main
```

### 3. Environment Variables setzen

Nach dem Push musst du die Environment Variables in deinem Deployment-Service setzen:

#### Für Vercel:
1. Gehe zu deinem Vercel Dashboard
2. Wähle dein Projekt aus
3. Gehe zu "Settings" → "Environment Variables"
4. Füge hinzu:
   - `SUPABASE_URL` = deine Supabase URL
   - `SUPABASE_KEY` = dein Supabase anon key
   - `GOOGLE_API_KEY` = dein Google API Key

#### Für Netlify:
1. Gehe zu deinem Netlify Dashboard
2. Wähle dein Projekt aus
3. Gehe zu "Site settings" → "Environment variables"
4. Füge die gleichen Variablen hinzu

### 4. Supabase Setup vervollständigen

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Kopiere die URL und den anon key
4. Führe das SQL-Schema aus (siehe README.md)

### 5. Deployment

```bash
# Für Vercel
npx vercel --prod

# Für Netlify
npx netlify deploy --prod
```

## 🔐 Sicherheit

- Repository ist **PRIVAT** - nur du hast Zugriff
- Environment Variables sind **verschlüsselt** im Deployment
- Supabase hat **Row Level Security** aktiviert
- API Keys sind **nicht** im Code gespeichert

## 🤖 AI Agent Zugriff

Sobald das Repository online ist, können AI Agents darauf zugreifen:

1. **Cursor AI**: Kann das Repository direkt lesen
2. **GitHub Copilot**: Kann Code-Vorschläge machen
3. **Andere AI Tools**: Können das Repository klonen und analysieren

## 📝 Nächste Schritte

1. ✅ Repository erstellt und gepusht
2. ✅ Supabase Projekt eingerichtet
3. ✅ Environment Variables gesetzt
4. ✅ Deployment konfiguriert
5. 🎉 Bereit für AI Agent Zusammenarbeit!

---

**Tipp**: Du kannst jetzt AI Agents wie mich beauftragen, direkt mit deinem Code zu arbeiten! 🚀 