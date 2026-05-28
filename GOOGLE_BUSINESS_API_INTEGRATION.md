# Google Business Profile API Integration - Plan

## 🎯 Ziel
Automatisches Aktualisieren der AggregateRating-Werte aus Google Business Profile

## 📊 Aktueller Stand
- **Manuell:** Hardcoded in `app.config.ts`
- **Werte:** 5.0 Sterne, 2737 Reviews
- **Update-Frequenz:** Manuell (nicht nachhaltig)

---

## 🔧 Implementierungs-Optionen

### **Option 1: Globales Rating (EMPFOHLEN)** ⭐

**Ansatz:** Aggregiere alle Standort-Reviews zu einem Marken-Rating

**Vorteile:**
- ✅ Höhere Review-Anzahl (beeindruckender)
- ✅ Konsistent über alle Behandlungsseiten
- ✅ Einfacher zu pflegen
- ✅ Marken-Level Trust Signal

**Implementierung:**

1. **Google Business Profile API Setup**
   ```bash
   # API aktivieren in Google Cloud Console
   # https://console.cloud.google.com/apis/library/mybusinessbusinessinformation.googleapis.com
   ```

2. **Service Account Credentials**
   - Nutze existierenden Service Account: `openclaw-gsc-bot-325@openclaw-myhb.iam.gserviceaccount.com`
   - Berechtigung: "Business Profile API" hinzufügen

3. **Standorte abrufen**
   ```typescript
   // Alle MY HEALTH & BEAUTY Locations
   const locations = await businessProfile.accounts.locations.list({
     parent: 'accounts/{accountId}'
   });
   ```

4. **Reviews aggregieren**
   ```typescript
   let totalReviews = 0;
   let weightedRating = 0;

   for (const location of locations) {
     const reviews = location.metadata?.reviews || {};
     totalReviews += reviews.count || 0;
     weightedRating += (reviews.averageRating || 0) * (reviews.count || 0);
   }

   const globalRating = weightedRating / totalReviews;
   ```

5. **Automatisches Update via Cron**
   ```typescript
   // Täglich um 2:00 Uhr UTC
   cron.schedule('0 2 * * *', async () => {
     const ratings = await fetchAggregatedGoogleBusinessRatings();
     await updateAppConfig('seo.aggregateRating', ratings);
   });
   ```

---

### **Option 2: Location-spezifische Ratings**

**Ansatz:** Jede Standortseite zeigt eigene Reviews

**Vorteile:**
- ✅ Präziser
- ✅ Authentischer

**Nachteile:**
- ❌ Komplexer
- ❌ Kleinere Zahlen pro Standort
- ❌ Inkonsistent (nicht alle Standorte haben viele Reviews)

**Implementierung:**
```typescript
// In LocalBusiness Schema
const locationRating = await fetchGoogleBusinessRating(location.googlePlaceId);
schema.aggregateRating = locationRating;
```

---

## 🛠️ Technische Umsetzung (Option 1)

### **1. Dependencies installieren**
```bash
npm install @google-cloud/local-business-data
```

### **2. API Service erstellen**
**File:** `app/server/api/google-business/ratings.ts`

```typescript
import { defineEventHandler } from 'h3';
import { google } from '@googleapis/mybusinessbusinessinformation';

export default defineEventHandler(async (event) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/business.manage'],
  });

  const businessInfo = google.mybusinessbusinessinformation({
    version: 'v1',
    auth,
  });

  // Alle Locations abrufen
  const locations = await businessInfo.accounts.locations.list({
    parent: `accounts/${process.env.GOOGLE_BUSINESS_ACCOUNT_ID}`,
    readMask: 'name,metadata',
  });

  // Reviews aggregieren
  let totalReviews = 0;
  let weightedSum = 0;

  for (const location of locations.data.locations || []) {
    const metadata = location.metadata?.newReviewUri; // Google Business Metadata
    // Rating & Count aus Metadata extrahieren
    const rating = metadata?.averageRating || 0;
    const count = metadata?.totalReviewCount || 0;

    totalReviews += count;
    weightedSum += rating * count;
  }

  const averageRating = totalReviews > 0 ? weightedSum / totalReviews : 0;

  return {
    ratingValue: Math.round(averageRating * 10) / 10, // 1 Dezimalstelle
    reviewCount: totalReviews,
    lastUpdated: new Date().toISOString(),
    source: 'Google Business Profile API',
  };
});
```

### **3. Cron Job für tägliches Update**
**File:** `app/server/tasks/update-google-ratings.ts`

```typescript
export default defineTask({
  meta: {
    name: 'update-google-ratings',
    description: 'Update AggregateRating from Google Business Profile API',
  },
  async run() {
    const ratings = await $fetch('/api/google-business/ratings');
    
    // App Config aktualisieren (via ENV oder File Write)
    // Option A: ENV-Variable setzen (Vercel)
    // Option B: File schreiben (nur bei selbst-gehosteten Setups)
    
    console.log('Updated ratings:', ratings);
    return { result: ratings };
  },
});
```

### **4. Vercel Cron konfigurieren**
**File:** `vercel.json`
```json
{
  "crons": [{
    "path": "/api/tasks/update-google-ratings",
    "schedule": "0 2 * * *"
  }]
}
```

---

## 🔑 Benötigte Credentials

1. **Google Cloud Project:** `openclaw-myhb` (bereits vorhanden)
2. **Service Account:** `openclaw-gsc-bot-325@openclaw-myhb.iam.gserviceaccount.com`
3. **API aktivieren:** Google Business Profile API
4. **Account ID:** Deine Google Business Profile Account ID

**Account ID finden:**
```bash
# Via Google Business Profile
https://business.google.com/
# In URL: accounts/{ACCOUNT_ID}/locations/...
```

---

## 📅 Rollout-Plan

### **Phase 1: MVP (2-3 Stunden)**
1. ✅ App Config angelegt (bereits erledigt)
2. ⏳ Google Business Profile API aktivieren
3. ⏳ Service Account Berechtigung hinzufügen
4. ⏳ Manueller API-Test (Postman/curl)

### **Phase 2: Automatisierung (4-6 Stunden)**
1. ⏳ Nuxt Server API Route implementieren
2. ⏳ Cron Job einrichten
3. ⏳ Error Handling & Logging
4. ⏳ Monitoring (z.B. Sentry)

### **Phase 3: Produktion**
1. ⏳ Testing auf Staging
2. ⏳ Deploy to Production
3. ⏳ Monitoring aktivieren

---

## 🚨 Wichtige Hinweise

- **Rate Limits:** Google Business Profile API hat Limits (10,000 requests/day)
- **Caching:** Ratings sollten mindestens 24h gecached werden
- **Fallback:** Bei API-Fehler auf letzte bekannte Werte zurückfallen
- **Privacy:** Keine individuellen Reviews speichern, nur Aggregat-Daten

---

## 📚 Referenzen

- [Google Business Profile API Docs](https://developers.google.com/my-business/content/overview)
- [Nuxt Server Tasks](https://nuxt.com/docs/guide/directory-structure/server#server-tasks)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
