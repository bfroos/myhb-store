# Strapi Content Types & Frontend Integration Guide

**Erstellt:** 2026-05-19  
**Projekt:** MY HEALTH & BEAUTY (myhb-store + myhb-cms)

---

## 📋 Inhaltsverzeichnis

1. [Architektur-Übersicht](#architektur-übersicht)
2. [Content Type erstellen (Strapi Admin)](#content-type-erstellen)
3. [Frontend Types generieren](#frontend-types)
4. [Component Integration](#component-integration)
5. [Styling & Design System](#styling--design-system)
6. [Best Practices](#best-practices)
7. [Praktisches Beispiel: Floating CTA Config](#beispiel-floating-cta-config)

---

## Architektur-Übersicht

### Data Flow
```
Strapi CMS (Backend)
  ↓ REST API
TypeScript Types (Frontend)
  ↓ Composables/Utils
Vue Components
  ↓ CSS/Design System
User sieht Content
```

### File Structure
```
myhb-store/
├── app/
│   ├── components/
│   │   └── block/
│   │       └── YourComponent.vue
│   ├── composables/
│   │   └── useYourData.ts
│   └── utils/
│       └── strapi.ts
├── lib/
│   └── strapi/
│       └── dto/
│           ├── types.ts          # Strapi Content Types
│           ├── components.ts     # Strapi Components
│           └── enums.ts          # Enums
└── assets/
    └── css/
        └── components/
            └── your-component.css
```

---

## Content Type erstellen

### Strapi Admin UI (striking-bear-e5a15ddc94.strapiapp.com)

1. **Content-Type Builder öffnen**
   - Linke Sidebar → "Content-Type Builder"

2. **Neuen Content Type erstellen**
   - Click "Create new collection type"
   - **Display name:** `Floating CTA Config` (singular)
   - **API ID (singular):** `floating-cta-config` (automatisch)
   - **API ID (plural):** `floating-cta-configs` (automatisch)

3. **Felder hinzufügen**

   **Text Fields:**
   ```
   - title (Text, Short text)
   - buttonText (Text, Short text)
   - buttonUrl (Text, Short text)
   ```

   **Rich Text:**
   ```
   - description (Rich Text - Markdown)
   ```

   **Relations:**
   ```
   - treatment (Relation to Treatment, Many-to-One)
   ```

   **Enums:**
   ```
   - mode (Enumeration)
     Options: seo, ads, both
   ```

   **Boolean:**
   ```
   - showReviews (Boolean, default: true)
   - isActive (Boolean, default: true)
   ```

   **Media:**
   ```
   - icon (Media - Single file, Images only)
   ```

4. **Speichern & Permissions**
   - Click "Save"
   - Settings → Roles → Public → Find your Content Type
   - Enable `find` and `findOne` permissions
   - Save

---

## Frontend Types generieren

### 1. TypeScript Interface erstellen

**File:** `lib/strapi/dto/types.ts`

```typescript
export interface FloatingCtaConfig {
  id: number;
  documentId: string;
  title: string;
  buttonText: string;
  buttonUrl: string;
  description?: string;
  mode: 'seo' | 'ads' | 'both';
  showReviews: boolean;
  isActive: boolean;
  icon?: StrapiMedia;
  treatment?: Treatment;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale?: string;
}
```

### 2. API Response Type

**File:** `lib/strapi/dto/types.ts`

```typescript
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export type FloatingCtaConfigResponse = StrapiResponse<FloatingCtaConfig[]>;
```

### 3. Composable erstellen

**File:** `app/composables/useFloatingCtaConfig.ts`

```typescript
import type { FloatingCtaConfig } from '~/lib/strapi/dto/types';

export const useFloatingCtaConfig = () => {
  const config = useNuxtApp().$config;
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
            populate: ['icon', 'treatment'],
            sort: ['createdAt:desc']
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

---

## Component Integration

### 1. Component Props Update

**File:** `app/components/block/TreatmentHero.vue`

```typescript
// Add to script setup
const props = defineProps<BlockTreatmentHeroDto & {
  showFloatingCta?: boolean;
  floatingCtaConfig?: FloatingCtaConfig; // NEW
}>();

// Fetch config if not provided
const { fetchFloatingCtaConfig } = useFloatingCtaConfig();
const ctaConfig = ref<FloatingCtaConfig | null>(props.floatingCtaConfig || null);

onMounted(async () => {
  if (props.showFloatingCta && !ctaConfig.value && props.treatment?.id) {
    ctaConfig.value = await fetchFloatingCtaConfig(props.treatment.id);
  }
});

// Use config in template
const floatingCtaTitle = computed(() => 
  ctaConfig.value?.title || props.eyebrow || props.headline
);

const floatingCtaButtonText = computed(() => 
  ctaConfig.value?.buttonText || 'Termin buchen'
);
```

### 2. Template Update

**File:** `app/components/block/TreatmentHero.vue`

```vue
<div v-show="showFloatingBanner" class="floating-cta">
  <div class="floating-cta__content">
    <div class="floating-cta__text">
      <strong v-if="priceLabel" class="floating-cta__price">
        {{ priceLabel }}
      </strong>
      <span class="floating-cta__title">
        {{ floatingCtaTitle }}
      </span>
    </div>
    <div class="floating-cta__actions">
      <!-- Reviews Badge -->
      <UiMoleculeReviewsBadge
        v-if="ctaConfig?.showReviews !== false && showReviews"
        ...
      />
      
      <!-- Custom Button from Config -->
      <SharedButton
        :button="{
          label: floatingCtaButtonText,
          method: SharedButtonMethod.EXTERNAL_URL,
          externalUrl: ctaConfig?.buttonUrl || calendlyUrl
        }"
        :button-props="{ size: 'md', variant: 'primary' }"
      />
    </div>
  </div>
</div>
```

---

## Styling & Design System

### CSS Architecture

```
assets/css/
├── base/
│   ├── variables.css      # CSS Custom Properties
│   └── typography.css     # Font definitions
├── components/
│   └── floating-cta.css   # Component-specific styles
└── utilities/
    └── spacing.css        # Utility classes
```

### 1. CSS Variables definieren

**File:** `assets/css/base/variables.css`

```css
:root {
  /* Floating CTA Variables */
  --floating-cta-bg: var(--color-white);
  --floating-cta-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  --floating-cta-padding: var(--space-400);
  --floating-cta-height: auto;
  
  /* Mode-specific overrides */
  --floating-cta-primary-color: var(--color-primary);
}

/* Ads Mode Override */
[data-site-mode="ads"] {
  --floating-cta-primary-color: var(--color-accent);
  --floating-cta-bg: var(--color-gray-50);
}
```

### 2. Component Styles

**File:** `assets/css/components/floating-cta.css`

```css
.floating-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-floating-cta, 100);
  
  background: var(--floating-cta-bg);
  box-shadow: var(--floating-cta-shadow);
  padding: var(--floating-cta-padding);
  
  transform: translateY(100%);
  transition: transform 0.3s ease-in-out;
}

.floating-cta-enter-active,
.floating-cta-leave-active {
  transition: transform 0.3s ease-in-out;
}

.floating-cta-enter-from,
.floating-cta-leave-to {
  transform: translateY(100%);
}

.floating-cta__content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: var(--space-300);
}

.floating-cta__text {
  flex: 1;
  min-width: 0; /* Prevent text overflow */
}

.floating-cta__title {
  font-size: var(--font-base);
  font-weight: 600;
  color: var(--color-text-primary);
  
  /* Truncate long titles on mobile */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.floating-cta__actions {
  display: flex;
  align-items: center;
  gap: var(--space-200);
  flex-shrink: 0;
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .floating-cta {
    padding: var(--space-300);
  }

  .floating-cta__content {
    gap: var(--space-200);
  }

  .floating-cta__reviews {
    display: none; /* Hide reviews on small screens */
  }
}

/* Tablet and up */
@media (min-width: 768px) {
  .floating-cta__title {
    white-space: normal; /* Allow wrapping on larger screens */
  }
}

/* Mode-specific styling */
[data-site-mode="ads"] .floating-cta {
  background: linear-gradient(
    135deg,
    var(--color-gray-50) 0%,
    var(--color-white) 100%
  );
}

[data-site-mode="ads"] .floating-cta__title {
  color: var(--floating-cta-primary-color);
}
```

### 3. Site Mode Detection

**File:** `app/app.vue` (oder root layout)

```vue
<template>
  <div :data-site-mode="siteMode">
    <NuxtPage />
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const siteMode = config.public.siteMode; // 'seo' or 'ads'
</script>
```

---

## Best Practices

### 1. TypeScript First
- ✅ Immer TypeScript Interfaces definieren
- ✅ Nutze `satisfies` für Type Safety
- ✅ Generiere nie Types manuell - nutze Strapi Schema

### 2. CSS Organization
```css
/* ❌ Bad: Inline styles */
<div style="color: red">

/* ❌ Bad: Global styles ohne namespace */
.title { color: red; }

/* ✅ Good: Component-scoped */
.floating-cta__title { color: var(--color-text-primary); }

/* ✅ Good: CSS variables for theming */
--floating-cta-bg: var(--color-white);
```

### 3. Data Fetching
```typescript
// ❌ Bad: Direct fetch in component
const data = await $fetch('/api/...')

// ✅ Good: Composable with error handling
const { fetchFloatingCtaConfig } = useFloatingCtaConfig()
const config = await fetchFloatingCtaConfig(id)
```

### 4. Mode-Specific Content
```typescript
// ✅ Filter by mode in Strapi query
filters: {
  $or: [
    { mode: { $eq: 'seo' } },
    { mode: { $eq: 'both' } }
  ]
}
```

### 5. Testing
- Test beide Modes (SEO + Ads)
- Mobile + Desktop
- Mit/ohne behandlung relation
- Empty states

---

## Beispiel: Floating CTA Config

### Complete Implementation Checklist

- [ ] **Strapi:**
  - [ ] Content Type erstellt
  - [ ] Permissions gesetzt (Public: find, findOne)
  - [ ] Test-Eintrag angelegt

- [ ] **Frontend Types:**
  - [ ] `FloatingCtaConfig` interface in `types.ts`
  - [ ] API Response types

- [ ] **Composable:**
  - [ ] `useFloatingCtaConfig.ts` erstellt
  - [ ] Mode-Filter implementiert
  - [ ] Error handling

- [ ] **Component:**
  - [ ] Props updated
  - [ ] Config fetching
  - [ ] Template bindings

- [ ] **Styling:**
  - [ ] CSS variables definiert
  - [ ] Component styles
  - [ ] Mode-specific styles
  - [ ] Mobile responsive

- [ ] **Testing:**
  - [ ] SEO Mode funktioniert
  - [ ] Ads Mode funktioniert
  - [ ] Mobile responsive
  - [ ] Fallback ohne Config

---

## Debugging Tipps

### 1. Strapi API testen
```bash
# Direct API call
curl "https://striking-bear-e5a15ddc94.strapiapp.com/api/floating-cta-configs?populate=*"
```

### 2. Vue DevTools
- Check props in TreatmentHero
- Verify `ctaConfig` computed property
- Inspect CSS variables in Elements tab

### 3. Console Logs
```typescript
console.log('Fetching CTA config for treatment:', treatmentId);
console.log('Site mode:', mode);
console.log('Config response:', config);
```

### 4. Network Tab
- Check API requests
- Verify filters are correct
- Check response structure

---

## Weiterführende Ressourcen

- [Strapi Documentation](https://docs.strapi.io/)
- [Nuxt 3 Composables](https://nuxt.com/docs/guide/directory-structure/composables)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

**Ende der Anleitung**  
Bei Fragen: Diese Anleitung als Referenz nutzen und spezifische Probleme debuggen.
