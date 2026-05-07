# Strapi 5 Live Preview — Root Cause Analysis

## Problem Found (12:51 UTC)
User ist richtig: Ich war zu chaotisch. Nach echtem Recherchieren:

### Die echte Issue:
1. **Strapi sendet `strapiUpdate` Event** ✓ (funktioniert)
2. **Frontend plugin refreshed mit URL-Param** ✓ (funktioniert)
3. **ABER: Backend sieht `__preview=1` Query-Param nie!**

Warum? Weil:
- Erste Navigation: `/preview?__preview=1&url=/lippen` ✓
- Plugin macht Reload: `window.location.href = url + '?__preview=1&_preview_refresh=timestamp'` ✓
- **ABER:** Nächste Anfrage geht auf `/api/strapi/pages/lippen` — die hat NO `__preview` Query!

### Der echte Fehler in meiner Lösung:
Ich dachte, der Query-Param würde sich durch alle API-Calls durchpropagieren. **TUT ER NICHT!**

Die API-Calls gehen über `useStrapiFetch()` Composable, und der Query-Param muss **explizit mitgegeben** werden:
```typescript
// Das macht mein Code:
const url = new URL(window.location.href);
url.searchParams.set('__preview', '1');
window.location.href = url.toString();  // ← Nur Frontend-Reload!

// Aber useStrapiFetch macht: GET /api/strapi/pages/lippen ← Kein Query-Param!
```

### Strapi-dokumentierte Lösung:
**Nutze SameSite=None Cookie** — Das war von Anfang an korrekt:

```javascript
// /api/preview Route
setCookie(event, '__NUXT_PREVIEW', 'true', {
  maxAge: 60 * 60 * 24 * 7,
  httpOnly: false,
  secure: true,
  sameSite: 'none',  // ← CRITICAL: Erlaubt Cross-Domain iframe Requests
  domain: '.myhealthandbeauty.com'  // ← Freigegebene Domain
});
```

**Das funktioniert, weil:**
- Initiale Anfrage: Strapi → Frontend. Cookie wird gesetzt in Response.
- Browser speichert Cookie mit `SameSite=none; Secure`
- Iframe-interne Navigation: Cookie wird MITGESENDET (weil SameSite=none)
- Alle API-Calls haben Cookie automatisch

## Was nicht funktioniert hat:
1. **Cookie allein (ohne SameSite=none)** — Browser sendet nicht bei iframe
2. **Query-Param allein** — Wird nicht in Sub-API-Calls mitgegeben
3. **URL-Param Reload** — Funktioniert für Frontend, aber nicht für `/api/strapi` API-Calls

## Die ECHTE Lösung:
**Combine beide:**
1. **Initial:** Cookie mit `SameSite=none; Secure` + URL-Redirect
2. **Alle API-Calls:** Backend prüft NUR Cookie (nicht Query-Param)
3. **Soft-Reload:** Frontend Reload erhält automatisch Cookie von Browser

## Folgender Plan:
- [ ] Cookie korrekt konfigurieren (`sameSite: 'none'`, `secure: true`, `domain: '.myhealthandbeauty.com'`)
- [ ] Backend-Proxy nur Cookie prüfen (Query-Param entfernen — war verschwendete Zeit)
- [ ] Test im Browser (DevTools → Application → Cookies prüfen ob Cookie mitgesendet wird)

---

**Lesson learned:** Nicht rumhalluzinieren, sondern:
1. **Offizielle Docs lesen** (Strapi Docs)
2. **StackOverflow/Forum durchsuchen** (Best Practices)
3. **Root Cause debuggen** (Warum funktioniert's nicht?)
4. **Implementieren** (Eine saubere Lösung)
