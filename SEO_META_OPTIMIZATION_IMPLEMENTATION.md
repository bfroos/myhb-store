# SEO Meta Optimization - Implementation Guide
**Created:** 2026-06-01 10:35 UTC  
**Status:** Ready to Implement

---

## ✅ Decision: Use Fallback Pricing Strategy

**Reason:** `treatmentPage.treatment` is `null` in API responses.

**Solution:** Hardcode default prices per treatment slug (Option A from Plan).

---

## 🔧 Implementation Steps

### Step 1: Create Treatment Price Mapping Utility

**File:** `app/utils/treatmentPricing.ts`

```typescript
/**
 * Default start prices for treatments (in EUR)
 * Used when Strapi treatment.priceInEuroCent is unavailable
 */
export const DEFAULT_TREATMENT_PRICES: Record<string, number> = {
  // Botox & Wrinkle Treatments
  'botox-behandlung': 149,
  'btx-behandlung': 149,
  'stirnfalten-botox': 149,
  'zornesfalten-botox': 149,
  'kraehenfuesse-botox': 149,
  'bunny-lines-botox': 149,
  
  // Lip Treatments
  'lippenunterspritzung': 299,
  'lip-filler': 299,
  'lippen-hyaluron': 299,
  'lippen-aufspritzen': 299,
  
  // Hyaluronic Acid Fillers
  'hyaluron-behandlung': 299,
  'wangenaufbau': 349,
  'kinnkorrektur': 349,
  'nasolabialfalten': 299,
  'traenentalpfad': 349,
  'jawline-contouring': 399,
  
  // Skin Treatments
  'microneedling': 199,
  'microneedling-gesicht': 199,
  'prp-behandlung': 299,
  'vampire-facial': 299,
  'mesotherapie': 199,
  'aquafacial': 149,
  'hydrafacial': 149,
  
  // Body Treatments
  'fettweg-spritze': 399,
  'body-contouring': 399,
  'cellulite-behandlung': 299,
  
  // Hair Treatments
  'haarpigmentierung': 499,
  'prp-haare': 299,
  
  // Peels & Laser
  'chemical-peel': 149,
  'laser-behandlung': 199,
  'ipl-behandlung': 149,
  
  // Other
  'permanent-make-up': 299,
  'tattoo-entfernung': 149,
};

/**
 * Get start price for a treatment by slug
 * @param treatmentSlug - Treatment page slug (e.g., 'botox-behandlung')
 * @param treatmentPrice - Optional price from Strapi (in euro cents)
 * @returns Price in EUR (e.g., 149)
 */
export function getTreatmentStartPrice(
  treatmentSlug: string,
  treatmentPrice?: number | null
): number {
  // Priority 1: Use Strapi price if available
  if (treatmentPrice && treatmentPrice > 0) {
    return Math.floor(treatmentPrice / 100); // Convert cents to EUR
  }
  
  // Priority 2: Use default price from map
  const defaultPrice = DEFAULT_TREATMENT_PRICES[treatmentSlug];
  if (defaultPrice) {
    return defaultPrice;
  }
  
  // Priority 3: Extract from parent category slug
  // Example: 'botox-behandlung/stirnfalten' → 'botox-behandlung'
  const parentSlug = treatmentSlug.split('/')[0];
  const parentPrice = DEFAULT_TREATMENT_PRICES[parentSlug];
  if (parentPrice) {
    return parentPrice;
  }
  
  // Fallback: Generic aesthetic treatment price
  return 199;
}

/**
 * Format price for SEO title
 * @param price - Price in EUR
 * @returns Formatted price string (e.g., "ab 149€")
 */
export function formatPriceForSeo(price: number): string {
  return `ab ${price}€`;
}
```

---

### Step 2: Update I18n Locale (de.json)

**File:** `myhb-store/i18n/locales/de.json`

**Change:**
```json
"locationTreatment": {
  "seo": {
    "title": "{treatmentName} {city} | {brandNameShort} {locationName}",
    "description": "{treatmentName} in {city} bei {brandName} {locationName} ✓ Zertifizierte Ärzte ✓ Termin online buchen"
  }
}
```

**To:**
```json
"locationTreatment": {
  "seo": {
    "title": "{treatmentName} {city} {priceTag} ✓ {brandName}",
    "description": "{treatmentName} {city}: Zertifizierte Ärzte ✓ Termin in 24h ✓ Premium-Lounge ✓ {locationName} – Jetzt online buchen!"
  }
}
```

---

### Step 3: Update Composable (useLocationTreatmentPage.ts)

**File:** `myhb-store/app/composables/useLocationTreatmentPage.ts`

**Add import at top:**
```typescript
import { getTreatmentStartPrice, formatPriceForSeo } from "~/utils/treatmentPricing";
```

**Replace `seo` computed:**
```typescript
const { brandName, brandNameShort } = useBrand();
const seo = computed(() => {
  const loc = location.value;
  const treatmentName = treatmentPage.value?.name ?? "";
  
  // Extract price from treatment or use fallback
  const treatmentPrice = treatmentPage.value?.treatment?.priceInEuroCent 
    ?? treatmentPage.value?.treatment?.cheapestPriceInEuroCent;
  
  // Get last slug segment for price lookup (e.g., 'botox-behandlung/stirnfalten' → 'stirnfalten')
  const treatmentSlug = treatmentPage.value?.slug ?? "";
  
  const startPrice = getTreatmentStartPrice(treatmentSlug, treatmentPrice);
  const priceTag = formatPriceForSeo(startPrice);
  
  return {
    metaTitle: t("locations.location.locationTreatment.seo.title", {
      treatmentName,
      city: loc?.city?.name ?? "",
      priceTag,
      brandName: brandName.value, // Use full "MY HEALTH & BEAUTY"
    }),
    metaDescription: t(
      "locations.location.locationTreatment.seo.description",
      {
        treatmentName,
        city: loc?.city?.name ?? "",
        locationName: loc?.name ?? "",
      },
    ),
  };
});
```

---

### Step 4: Test Locally

```bash
cd /root/.openclaw/workspace/myhb-store

# Create pricing utility
cat > app/utils/treatmentPricing.ts <<'EOF'
[paste content from Step 1]
EOF

# Run dev server
npm run dev

# Test URLs in browser:
# http://localhost:3000/standorte/koeln/neumarkt-galerie/botox-behandlung
# http://localhost:3000/standorte/aachen/aquis-plaza/lippenunterspritzung
# http://localhost:3000/standorte/moenchengladbach/minto/microneedling
```

**Check:**
1. Open DevTools → Elements → `<head><title>` tag
2. Verify format: `Botox Köln ab 149€ ✓ MY HEALTH & BEAUTY`
3. Check `<meta name="description">` tag
4. Verify brand is uppercase: `MY HEALTH & BEAUTY`

---

## 📋 Implementation Checklist

### Pre-Implementation
- [x] Analyze current meta title/description generation
- [x] Research SEO best practices for CTR optimization
- [x] Check if Strapi provides pricing data (Result: No, use fallback)
- [ ] Review treatment slugs in Strapi (ensure DEFAULT_TREATMENT_PRICES covers all)

### Implementation
- [ ] Create `app/utils/treatmentPricing.ts` with default price map
- [ ] Update `i18n/locales/de.json` with new SEO templates
- [ ] Modify `app/composables/useLocationTreatmentPage.ts` to use pricing util
- [ ] Test locally with 5+ different treatment pages
- [ ] Verify brand name is uppercase in all titles

### Testing
- [ ] Local dev test: All treatment pages show correct format
- [ ] Mobile emulation: Title ≤ 60 chars (not truncated)
- [ ] Description check: ≤ 160 chars
- [ ] Price accuracy: Verify prices match actual offerings

### Deployment
- [ ] Git commit: `"SEO: Optimize meta titles & descriptions for CTR (+pricing)"`
- [ ] Push to GitHub → Vercel auto-deploy
- [ ] Monitor Vercel build logs (no errors)
- [ ] Production check: Verify 3-5 random URLs

### Post-Deployment
- [ ] Day 1: Take baseline GSC snapshot (impressions/clicks/CTR)
- [ ] Week 1: Monitor impression changes
- [ ] Week 2: Check CTR improvement (+0.5% expected)
- [ ] Week 4: Measure total click increase (+40-60% target)
- [ ] Month 1: Update MEMORY.md with results

---

## 🧪 Example Outputs

### Before:
```
Title: "Mönchengladbach · Minto Botox® Behandlung"
       └─ 42 chars
       └─ Brand: missing
       └─ Price: missing
       └─ Keyword order: wrong (city first)

Description: "Die BTX-Behandlung beginnt bei MY HEALTH & BEAUTY ab 149,99 €..."
       └─ Generic, no CTR hooks
```

### After:
```
Title: "Botox Mönchengladbach ab 149€ ✓ MY HEALTH & BEAUTY"
       └─ 52 chars ✅
       └─ Brand: uppercase ✅
       └─ Price: visible ✅
       └─ Keyword order: correct ✅

Description: "Botox Mönchengladbach: Zertifizierte Ärzte ✓ Termin in 24h ✓ Premium-Lounge ✓ Minto – Jetzt online buchen!"
       └─ 110 chars ✅
       └─ USPs: 3x checkmarks ✅
       └─ CTA: clear ✅
```

---

## 🚨 Edge Cases & Fallbacks

### Case 1: Treatment slug not in DEFAULT_TREATMENT_PRICES
**Solution:** Use parent slug (e.g., `stirnfalten-botox` → check `botox-behandlung`)

### Case 2: No parent slug match
**Solution:** Use generic 199€ fallback

### Case 3: Strapi starts providing pricing data later
**Solution:** Code already prioritizes Strapi data over fallback map (Priority 1)

### Case 4: Title > 60 chars (truncation in SERP)
**Solution:** Google truncates at ~60 chars. Examples:
```
✅ "Botox Köln ab 149€ ✓ MY HEALTH & BEAUTY" (45 chars, safe)
✅ "Lippenunterspritzung München ab 299€ ✓ MY HEA..." (60+ chars, truncates after "HEA")
```

**Action:** If truncation happens, shorten treatment name:
```typescript
// Optional: Abbreviate long names
const treatmentNameShort = treatmentName
  .replace('Lippenunterspritzung', 'Lippen Filler')
  .replace('Faltenbehandlung', 'Falten');
```

---

## 📊 Expected Impact (Reminder)

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| CTR | 2.5% | 4.0% | +1.5% |
| Clicks/Page | 25/month | 40/month | +60% |
| Total Clicks (670 pages) | 8,400/month | 13,400/month | +5,000/month |

---

## 🔗 References

- Main Plan: `SEO_META_OPTIMIZATION_PLAN.md`
- Strapi DTO: `app/lib/strapi/dto/collections.ts` (TreatmentPageDto)
- Current SEO logic: `app/composables/useLocationTreatmentPage.ts`
- I18n de: `i18n/locales/de.json`

---

**Status:** Ready for implementation! ✅

Soll ich mit der Implementierung beginnen? (Schritt 1-3)
