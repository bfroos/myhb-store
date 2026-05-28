# Google Ratings Auto-Update

Automatisches monatliches Update der Google Business Ratings für alle MY HEALTH & BEAUTY Standorte.

## 🎯 Was wird aktualisiert?

### 1. Standort-spezifische Ratings
**File:** `app/utils/schemaLocation.ts`
- `GOOGLE_RATINGS` Object mit aktuellen Werten pro Standort
- Verwendet für LocalBusiness Schema auf Standortseiten

### 2. Globales aggregiertes Rating
**File:** `app.config.ts`
- `seo.aggregateRating` mit gewichtetem Durchschnitt über alle Standorte
- Verwendet für MedicalProcedure Schema auf Behandlungsseiten

---

## 🔧 Setup

### 1. Google Places API Key erstellen

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Projekt: `openclaw-myhb` auswählen
3. **APIs & Services** → **Library**
4. **Places API** aktivieren
5. **Credentials** → **Create Credentials** → **API Key**
6. API Key einschränken:
   - **Application restrictions:** None (für jetzt)
   - **API restrictions:** Restrict key → Places API

### 2. API Key in GitHub Secrets speichern

1. GitHub Repo: `bfroos/myhb-store`
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
   - Name: `GOOGLE_PLACES_API_KEY`
   - Value: `[dein-api-key]`

### 3. Lokales Testing

```bash
# .env File erstellen
echo "GOOGLE_PLACES_API_KEY=your-api-key-here" > .env

# Script ausführen
npm run update:ratings

# Ergebnis prüfen
git diff app/utils/schemaLocation.ts app.config.ts
```

---

## 📅 Automatisches Update

**GitHub Action:** `.github/workflows/update-google-ratings.yml`

- **Zeitplan:** 1. jeden Monats um 02:00 UTC
- **Manuell:** Via GitHub Actions Tab → "Update Google Ratings" → "Run workflow"

**Was passiert:**
1. Script holt aktuelle Ratings von Google Places API
2. Aktualisiert `schemaLocation.ts` und `app.config.ts`
3. Committed & Pushed automatisch
4. Vercel deployt automatisch

---

## 🔍 Monitoring

Nach jedem Update checken:

1. **GitHub Actions**: Workflow erfolgreich?
2. **Vercel Deploy**: Build erfolgreich?
3. **Schema Validator**: 
   ```bash
   https://validator.schema.org/#url=https://www.myhealthandbeauty.com/behandlungen/botox/kraehenfuesse
   ```
4. **Rich Results Test**:
   ```bash
   https://search.google.com/test/rich-results
   ```

---

## 📊 Beispiel Output

```
🔄 Fetching ratings for 9 active locations...

✅ ChIJoesgRlglv0cRh0fAgCZ9MTk: 4.9 ⭐ (412 reviews)
✅ ChIJoct0O2RTqEcRZthU8Tn5dGs: 4.9 ⭐ (220 reviews)
✅ ChIJYyPheE7LuEcRAIgZkPAOJyU: 4.9 ⭐ (155 reviews)
...

📊 Fetched 9/9 locations

📈 Aggregated Rating:
   4.9 ⭐ (1456 reviews)

✅ Updated app/utils/schemaLocation.ts
✅ Updated app.config.ts

✅ All done! Commit the changes and deploy.
```

---

## 🚨 Troubleshooting

### "GOOGLE_PLACES_API_KEY not found"
- Lokales Testing: `.env` File erstellen
- GitHub Actions: Secret in Repository Settings hinzufügen

### "API Key not authorized"
- Places API aktiviert?
- API Key Restrictions korrekt?
- Billing aktiviert? (Google Cloud benötigt Zahlungsmethode)

### "Could not find GOOGLE_RATINGS block"
- File manuell geändert? Regex pattern prüfen
- Backup von `schemaLocation.ts` erstellen

---

## 💰 Kosten

**Google Places API Pricing:**
- Place Details (Basic): $0.017 per request
- Monatliche Kosten: 9 Standorte × $0.017 = **~$0.15/Monat**
- Mit Free Tier ($200/Monat): **Praktisch kostenlos**

---

## 🔄 Manuelles Update

Jederzeit ausführbar:

```bash
npm run update:ratings
git add app/utils/schemaLocation.ts app.config.ts
git commit -m "chore(seo): update Google ratings"
git push
```

---

## 📚 Referenzen

- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service/details)
- [GitHub Actions Cron Syntax](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Schema.org AggregateRating](https://schema.org/AggregateRating)
