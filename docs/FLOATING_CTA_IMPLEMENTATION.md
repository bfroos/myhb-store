# Floating CTA Config - Implementation Guide

**Quick Start für Floating CTA Anpassung**

---

## 🎯 Ziel

Separate Floating CTA Konfiguration für:
- **SEO Mode** (www.myhealthandbeauty.com) - Organischer Traffic
- **Ads Mode** (go.myhealthandbeauty.com) - Paid Traffic

---

## 📝 Strapi Content Type (Backend)

### 1. Content Type Builder öffnen
URL: https://striking-bear-e5a15ddc94.strapiapp.com/admin/plugins/content-type-builder

### 2. Neuer Collection Type

**Name:** `Floating CTA Config`

**Felder:**

| Field Name | Type | Options |
|------------|------|---------|
| `title` | Text (Short) | Required |
| `subtitle` | Text (Short) | Optional |
| `buttonText` | Text (Short) | Required, Default: "Termin buchen" |
| `buttonUrl` | Text (Short) | Optional (falls custom URL) |
| `priceLabel` | Text (Short) | Optional (z.B. "ab 249 €") |
| `mode` | Enumeration | Options: `seo`, `ads`, `both` |
| `showReviews` | Boolean | Default: `true` |
| `isActive` | Boolean | Default: `true` |
| `backgroundColor` | Text (Short) | Optional (CSS color, z.B. "#ffffff") |
| `textColor` | Text (Short) | Optional (CSS color) |
| `priority` | Number (Integer) | Default: 0 (höher = wichtiger) |
| `treatment` | Relation | Treatment (Many-to-One), Optional |

### 3. Permissions
Settings → Roles → Public → Floating CTA Config
- ✅ `find`
- ✅ `findOne`

### 4. Test-Einträge anlegen

**SEO Mode Beispiel:**
```
title: "Lippen sanft aufspritzen"
subtitle: "Premium-Qualität zum fairen Preis"
buttonText: "Kostenlose Beratung"
priceLabel: "ab 249 €"
mode: seo
showReviews: true
isActive: true
```

**Ads Mode Beispiel:**
```
title: "🎁 Spare 15% auf deine erste Behandlung"
subtitle: "Nur heute gültig"
buttonText: "Jetzt Termin sichern"
priceLabel: "ab 211 €"
mode: ads
showReviews: false
isActive: true
backgroundColor: "#FFF3CD"
textColor: "#856404"
```

---

## 💻 Frontend Integration

### Schritt 1: TypeScript Types

**File:** `lib/strapi/dto/types.ts`

```typescript
export interface FloatingCtaConfig {
  id: number;
  documentId: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonUrl?: string;
  priceLabel?: string;
  mode: 'seo' | 'ads' | 'both';
  showReviews: boolean;
  isActive: boolean;
  backgroundColor?: string;
  textColor?: string;
  priority: number;
  treatment?: Treatment;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

### Schritt 2: Composable

**File:** `app/composables/useFloatingCtaConfig.ts`

```typescript
import type { FloatingCtaConfig } from '~/lib/strapi/dto/types';

export const useFloatingCtaConfig = () => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;
  const mode = config.public.siteMode; // 'seo' or 'ads'

  const fetchFloatingCtaConfig = async (
    treatmentId?: number
  ): Promise<FloatingCtaConfig | null> => {
    try {
      const filters: Record<string, any> = {
        isActive: { $eq: true },
        $or: [
          { mode: { $eq: mode } },
          { mode: { $eq: 'both' } }
        ]
      };

      if (treatmentId) {
        filters.treatment = { id: { $eq: treatmentId } };
      }

      const response = await $fetch<any>(
        `${strapiUrl}/api/floating-cta-configs`,
        {
          params: {
            filters,
            populate: ['treatment'],
            sort: ['priority:desc', 'createdAt:desc']
          }
        }
      );

      return response.data?.[0] || null;
    } catch (error) {
      console.error('Failed to fetch Floating CTA config:', error);
      return null;
    }
  };

  return {
    fetchFloatingCtaConfig
  };
};
```

### Schritt 3: Component Update

**File:** `app/components/block/TreatmentHero.vue`

**Script Section - Add after existing props:**

```typescript
// Floating CTA Config
const { fetchFloatingCtaConfig } = useFloatingCtaConfig();
const ctaConfig = ref<FloatingCtaConfig | null>(null);

// Computed values for Floating CTA
const floatingCtaTitle = computed(() => 
  ctaConfig.value?.title || props.eyebrow || props.headline || ''
);

const floatingCtaSubtitle = computed(() => 
  ctaConfig.value?.subtitle || ''
);

const floatingCtaButtonText = computed(() => 
  ctaConfig.value?.buttonText || 'Termin buchen'
);

const floatingCtaPriceLabel = computed(() => 
  ctaConfig.value?.priceLabel || props.priceLabel || ''
);

const floatingCtaShowReviews = computed(() => 
  ctaConfig.value?.showReviews ?? props.showReviews ?? true
);

const floatingCtaStyles = computed(() => {
  const styles: Record<string, string> = {};
  if (ctaConfig.value?.backgroundColor) {
    styles['--floating-cta-bg'] = ctaConfig.value.backgroundColor;
  }
  if (ctaConfig.value?.textColor) {
    styles['--floating-cta-text-color'] = ctaConfig.value.textColor;
  }
  return styles;
});

// Fetch config on mount
onMounted(async () => {
  isMounted.value = true;

  if (!props.showFloatingCta) return;

  // Fetch CTA config
  const treatmentId = props.treatment?.id;
  ctaConfig.value = await fetchFloatingCtaConfig(treatmentId);

  // ... existing scroll handler code ...
});
```

**Template Section - Replace Floating CTA:**

```vue
<Teleport to="body" v-if="showFloatingCta && isMounted">
  <Transition name="floating-cta">
    <div 
      v-show="showFloatingBanner" 
      class="floating-cta"
      :style="floatingCtaStyles"
    >
      <div class="floating-cta__content">
        <div class="floating-cta__text">
          <strong 
            v-if="floatingCtaPriceLabel" 
            class="floating-cta__price"
          >
            {{ floatingCtaPriceLabel }}
          </strong>
          <span class="floating-cta__title">
            {{ floatingCtaTitle }}
          </span>
          <span 
            v-if="floatingCtaSubtitle" 
            class="floating-cta__subtitle"
          >
            {{ floatingCtaSubtitle }}
          </span>
        </div>
        <div class="floating-cta__actions">
          <template v-if="floatingCtaShowReviews">
            <UiMoleculeReviewsBadge
              v-if="googlePlaceId"
              show-text
              :source="ReviewSource.GOOGLE"
              :rating="5"
              :local-rating-threshold="4"
              :local-min-reviews="5"
              :google-place-id="googlePlaceId"
              class="floating-cta__reviews"
            />
            <UiMoleculeReviewsBadge
              v-else
              show-text
              :source="ReviewSource.GOOGLE"
              :rating="5"
              class="floating-cta__reviews"
            />
          </template>
          <SharedButton
            v-if="cta"
            :button="cta"
            :data="{
              calendlyUrl: ctaConfig?.buttonUrl || calendlyUrl,
              treatmentType: treatment?.type,
            }"
            :button-props="{ size: 'md', variant: 'primary' }"
          >
            {{ floatingCtaButtonText }}
          </SharedButton>
        </div>
      </div>
    </div>
  </Transition>
</Teleport>
```

### Schritt 4: Styling Update

**File:** `app/components/block/TreatmentHero.vue` (Style Section)

Add these CSS variables and styles:

```css
.floating-cta {
  /* ... existing styles ... */
  
  /* CSS Variables für dynamisches Styling */
  background: var(--floating-cta-bg, var(--color-white));
  color: var(--floating-cta-text-color, var(--color-text-primary));
}

.floating-cta__subtitle {
  display: block;
  font-size: var(--font-sm);
  color: var(--floating-cta-text-color, var(--color-text-secondary));
  margin-top: var(--space-100);
}

/* Ads Mode spezifische Styles */
[data-site-mode="ads"] .floating-cta {
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
}

[data-site-mode="ads"] .floating-cta__title {
  font-weight: 700;
}
```

---

## ✅ Testing Checklist

### Strapi
- [ ] Content Type erstellt
- [ ] Permissions gesetzt
- [ ] SEO Mode Eintrag angelegt
- [ ] Ads Mode Eintrag angelegt
- [ ] API testen: `curl https://striking-bear-e5a15ddc94.strapiapp.com/api/floating-cta-configs`

### Frontend
- [ ] Types kompilieren ohne Fehler
- [ ] Composable importiert
- [ ] Component updated
- [ ] www.myhealthandbeauty.com zeigt SEO Config
- [ ] go.myhealthandbeauty.com zeigt Ads Config
- [ ] Fallback funktioniert (ohne Config)

### UX
- [ ] Floating CTA erscheint beim Scrollen
- [ ] Verschwindet bei Seitenende
- [ ] Mobile responsive
- [ ] Button funktioniert
- [ ] Farben korrekt

---

## 🐛 Debugging

### Config wird nicht geladen
```typescript
// Add console.log in composable
console.log('Fetching with mode:', mode);
console.log('Filters:', filters);
console.log('Response:', response);
```

### Falsche Config angezeigt
- Check `siteMode` in `nuxt.config.ts`
- Verify `NUXT_PUBLIC_SITE_MODE` env variable
- Check Strapi `mode` field value

### Styling funktioniert nicht
- Inspect element in DevTools
- Check CSS variable values
- Verify `floatingCtaStyles` computed property

---

## 📚 Beispiel-Content für verschiedene Seiten

### Lippen aufspritzen (SEO)
```
title: "Lippen sanft aufspritzen"
priceLabel: "ab 249 €"
buttonText: "Kostenlose Beratung"
mode: seo
showReviews: true
```

### Lippen aufspritzen (Ads)
```
title: "🎁 15% Rabatt auf Lippenbehandlung"
subtitle: "Nur heute! Code: LIPPEN15"
priceLabel: "ab 211 €"
buttonText: "Angebot sichern"
mode: ads
showReviews: false
backgroundColor: "#FFF3CD"
```

### Botox Behandlung (Both Modes)
```
title: "Botox® Behandlung"
priceLabel: "ab 199 €"
buttonText: "Termin buchen"
mode: both
showReviews: true
```

---

## 🚀 Deployment

1. **Strapi:**
   - Content Type erstellen
   - Test-Einträge anlegen
   - Keine Code-Änderungen nötig (Cloud-hosted)

2. **Frontend:**
   - Alle Files commiten
   - Push zu GitHub
   - Vercel Auto-Deploy (~2 Minuten)

3. **Testing:**
   - www.myhealthandbeauty.com/behandlungen/hyaluron/lippen-aufspritzen
   - go.myhealthandbeauty.com/behandlungen/hyaluron/lippen-aufspritzen
   - Verify unterschiedliche CTAs

---

**Status:** Ready to implement  
**Estimated Time:** 30-45 minutes  
**Difficulty:** Medium
