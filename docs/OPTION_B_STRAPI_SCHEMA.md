# Option B: Strapi CMS Landing Pages Schema

## Collection: Landing Pages (General Pages)

This schema defines how to set up landing pages in Strapi CMS for both Google Ads and Social Media traffic variants.

### Content Type: `landing-pages`

**API ID:** `landing-pages`  
**Display Name:** Landing Pages  
**Kind:** Collection Type  
**Draftable:** Yes  
**Publishable:** Yes  

---

## Fields

### 1. **Basic Info**

#### Title
- **Type:** String (Short text)
- **Required:** Yes
- **Unique:** No
- **Default Value:** None
- **Help Text:** "Landing page title (used in browser tab and metadata)"

#### Slug
- **Type:** String (Short text)
- **Required:** Yes
- **Unique:** Yes
- **Default Value:** Auto-generate from title
- **Help Text:** "URL-friendly slug (e.g., lippen-aachen)"
- **Pattern:** `^[a-z0-9-]+$`

#### Variant
- **Type:** Enumeration
- **Required:** Yes
- **Options:**
  - `ads` — Google Ads / Search Intent (Conversion-focused)
  - `social` — Social Media / Community (Engagement-focused)
  - `default` — Standard landing page
- **Default:** `default`

#### Description
- **Type:** Text (Long text)
- **Required:** No
- **Help Text:** "Internal description for content team"

---

### 2. **Hero Section**

#### Hero Headline
- **Type:** String
- **Required:** Yes (if variant = ads or social)

#### Hero Subheadline
- **Type:** String
- **Required:** No

#### Hero CTA Text
- **Type:** String
- **Default:** "Termin Buchen"

#### Hero CTA Link
- **Type:** String
- **Default:** "/termin-buchen"

#### Hero Background Image
- **Type:** Media
- **Required:** Yes (if variant = ads or social)
- **Allowed Types:** Images
- **Help Text:** "Hero background image (min 1920x1080)"

#### Hero Overlay Color
- **Type:** String (Color picker)
- **Default:** "#00000030" (30% black overlay)

---

### 3. **Content Blocks**

#### Blocks (Repeatable)
- **Type:** Dynamic Zone
- **Enabled Components:**
  - `blocks.before-after-carousel`
  - `blocks.testimonial-section`
  - `blocks.process-steps`
  - `blocks.faq-accordion`
  - `blocks.trust-signals`
  - `blocks.final-cta`
  - `blocks.quiz-section`
  - `blocks.results-showcase`
  - `blocks.community-section`
  - `blocks.limited-offer`

---

### 4. **SEO & Metadata**

#### SEO (Component)
- **Type:** Component (Non-repeatable)
- **Fields:**
  - **Meta Title** (String) — "SEO title (55-60 chars)"
  - **Meta Description** (String, 160 chars max)
  - **Keywords** (String) — "Comma-separated keywords"
  - **Og Image** (Media) — "Social share image (1200x630)"
  - **Canonical URL** (String) — "Avoid duplicate content"
  - **No Index** (Boolean) — "Exclude from search engines"

#### Localizations
- **Type:** Relation (One-to-many)
- **Relation:** Landing Pages (self)
- **Help Text:** "Manage translations in different languages"

---

### 5. **Analytics & Performance**

#### Google Ads Campaign ID
- **Type:** String
- **Help Text:** "Link to Google Ads campaign (e.g., campaign_12345)"

#### Social Media Campaign ID
- **Type:** String
- **Help Text:** "Link to social campaign (e.g., instagram_campaign_xyz)"

#### Expected Conversion Rate
- **Type:** String
- **Help Text:** "Target conversion rate (e.g., 3%, 5%)"

#### Created By Doctor
- **Type:** Relation (Many-to-one)
- **Relation:** Doctors collection
- **Help Text:** "Which doctor manages this page?"

---

## Components (Reusable Blocks)

### Component: `blocks.before-after-carousel`
```json
{
  "displayName": "Before/After Carousel",
  "fields": [
    { "name": "title", "type": "String", "required": true },
    { "name": "subtitle", "type": "String" },
    {
      "name": "items",
      "type": "Component",
      "repeatable": true,
      "fields": [
        { "name": "beforeImage", "type": "Media" },
        { "name": "afterImage", "type": "Media" },
        { "name": "treatmentTitle", "type": "String" },
        { "name": "treatmentDescription", "type": "String" }
      ]
    }
  ]
}
```

### Component: `blocks.testimonial-section`
```json
{
  "displayName": "Testimonials",
  "fields": [
    { "name": "title", "type": "String", "required": true },
    { "name": "subtitle", "type": "String" },
    {
      "name": "testimonials",
      "type": "Component",
      "repeatable": true,
      "fields": [
        { "name": "name", "type": "String" },
        { "name": "role", "type": "String" },
        { "name": "quote", "type": "Text" },
        { "name": "rating", "type": "Integer", "min": 1, "max": 5 },
        { "name": "image", "type": "Media" },
        { "name": "socialHandle", "type": "String" }
      ]
    }
  ]
}
```

### Component: `blocks.process-steps`
```json
{
  "displayName": "Process Steps (3-5 steps)",
  "fields": [
    { "name": "title", "type": "String", "required": true },
    { "name": "subtitle", "type": "String" },
    {
      "name": "steps",
      "type": "Component",
      "repeatable": true,
      "fields": [
        { "name": "number", "type": "Integer" },
        { "name": "title", "type": "String" },
        { "name": "description", "type": "Text" },
        { "name": "icon", "type": "String" }
      ]
    }
  ]
}
```

### Component: `blocks.faq-accordion`
```json
{
  "displayName": "FAQ Accordion",
  "fields": [
    { "name": "title", "type": "String", "required": true },
    {
      "name": "faqs",
      "type": "Component",
      "repeatable": true,
      "fields": [
        { "name": "question", "type": "String" },
        { "name": "answer", "type": "Text" }
      ]
    }
  ]
}
```

### Component: `blocks.trust-signals`
```json
{
  "displayName": "Trust Signals Grid",
  "fields": [
    { "name": "title", "type": "String" },
    {
      "name": "signals",
      "type": "Component",
      "repeatable": true,
      "fields": [
        { "name": "title", "type": "String" },
        { "name": "description", "type": "String" },
        { "name": "icon", "type": "String" },
        { "name": "image", "type": "Media" }
      ]
    }
  ]
}
```

### Component: `blocks.final-cta`
```json
{
  "displayName": "Final CTA Section",
  "fields": [
    { "name": "headline", "type": "String" },
    { "name": "description", "type": "Text" },
    { "name": "ctaText", "type": "String" },
    { "name": "ctaLink", "type": "String" },
    { "name": "backgroundColor", "type": "String" }
  ]
}
```

### Component: `blocks.quiz-section` (Social Only)
```json
{
  "displayName": "Interactive Quiz",
  "fields": [
    { "name": "title", "type": "String" },
    { "name": "description", "type": "Text" },
    {
      "name": "questions",
      "type": "Component",
      "repeatable": true,
      "fields": [
        { "name": "question", "type": "String" },
        { "name": "options", "type": "String" }
      ]
    }
  ]
}
```

### Component: `blocks.results-showcase` (Social Only)
```json
{
  "displayName": "Results Showcase Grid",
  "fields": [
    { "name": "title", "type": "String" },
    { "name": "subtitle", "type": "String" },
    {
      "name": "results",
      "type": "Component",
      "repeatable": true,
      "fields": [
        { "name": "beforeImage", "type": "Media" },
        { "name": "afterImage", "type": "Media" },
        { "name": "patientName", "type": "String" },
        { "name": "treatment", "type": "String" }
      ]
    }
  ]
}
```

### Component: `blocks.limited-offer` (Social Only)
```json
{
  "displayName": "Limited Time Offer Banner",
  "fields": [
    { "name": "title", "type": "String" },
    { "name": "discountPercentage", "type": "Integer" },
    { "name": "promoCode", "type": "String" },
    { "name": "validUntil", "type": "DateTime" },
    { "name": "backgroundColor", "type": "String" }
  ]
}
```

---

## Example Entries

### Entry 1: Lippen aufspritzen Aachen (Ads Variant)

```json
{
  "title": "Lippen aufspritzen Aachen",
  "slug": "lippen-aachen",
  "variant": "ads",
  "heroHeadline": "Perfekte Lippen in einer Stunde",
  "heroSubheadline": "Natürliche und volle Lippen — sicher und ästhetisch",
  "heroCtaText": "Termin Buchen",
  "heroCtaLink": "/termin-buchen",
  "blocks": [
    {
      "__component": "blocks.before-after-carousel",
      "title": "Echte Ergebnisse von echten Patienten",
      "items": [
        {
          "beforeImage": "...",
          "afterImage": "...",
          "treatmentTitle": "Lippen-Volumen",
          "treatmentDescription": "Subtile und natürliche Steigerung"
        }
      ]
    },
    {
      "__component": "blocks.testimonial-section",
      "title": "Was sagen unsere Patienten?",
      "testimonials": [...]
    },
    {
      "__component": "blocks.process-steps",
      "title": "So läuft die Behandlung ab",
      "steps": [...]
    },
    {
      "__component": "blocks.faq-accordion",
      "title": "Häufig gestellte Fragen",
      "faqs": [...]
    }
  ],
  "seo": {
    "metaTitle": "Lippen aufspritzen Aachen | Perfekte Lippen in einer Stunde",
    "metaDescription": "Lippen Filler in Aachen von erfahrenen Ärzten. Natürliche Ergebnisse, sichere Behandlung. Kostenloses Beratungsgespräch."
  }
}
```

### Entry 2: Botox gegen Zornesfalte Köln (Social Variant)

```json
{
  "title": "Botox gegen Zornesfalte Köln",
  "slug": "botox-zornesfalte-koeln",
  "variant": "social",
  "heroHeadline": "Fühle dich selbstbewusster",
  "heroSubheadline": "In einer Stunde. Natürlich. Sicher.",
  "blocks": [
    {
      "__component": "blocks.quiz-section",
      "title": "Was ist dein Hauttyp?",
      "questions": [...]
    },
    {
      "__component": "blocks.results-showcase",
      "title": "Echte Transformationen",
      "results": [...]
    },
    {
      "__component": "blocks.testimonial-section",
      "title": "Was sagen unsere Patienten?",
      "testimonials": [...]
    },
    {
      "__component": "blocks.limited-offer",
      "title": "15% Rabatt auf deine erste Behandlung",
      "promoCode": "SOCIAL15"
    }
  ]
}
```

---

## Implementation Steps in Strapi

1. **Go to Content-Type Builder**
   - Plugins > Content-Type Builder

2. **Create Collection Type: `landing-pages`**
   - Name: Landing Pages
   - API ID: landing-pages
   - Enable: Draftable, Publishable, Internationalization

3. **Add Fields** (as documented above)

4. **Create Components** (Plugins > Content-Type Builder > Components)
   - `blocks.before-after-carousel`
   - `blocks.testimonial-section`
   - `blocks.process-steps`
   - `blocks.faq-accordion`
   - `blocks.trust-signals`
   - `blocks.final-cta`
   - `blocks.quiz-section`
   - `blocks.results-showcase`
   - `blocks.limited-offer`

5. **Add Dynamic Zone** in landing-pages collection
   - Field: `blocks`
   - Type: Dynamic Zone
   - Add all components

6. **Create Content** using the examples above

7. **Publish** and test via API:
   ```
   GET /api/landing-pages?filters[slug][$eq]=lippen-aachen
   ```

---

## API Endpoints

### List all landing pages
```
GET /api/landing-pages?populate=*
```

### Get by slug
```
GET /api/landing-pages?filters[slug][$eq]=lippen-aachen&populate=*
```

### Get by variant (Ads only)
```
GET /api/landing-pages?filters[variant][$eq]=ads&populate=*
```

### Get by variant (Social only)
```
GET /api/landing-pages?filters[variant][$eq]=social&populate=*
```

---

## Frontend Integration (Vue/Nuxt)

```vue
<template>
  <BlockRenderer :blocks="landingPage.blocks" />
</template>

<script setup>
const route = useRoute();
const slug = route.params.slug;

const { data: landingPages } = await useStrapiFetch(
  `/landing-pages?filters[slug][$eq]=${slug}&populate=*`
);

const landingPage = landingPages.value?.data?.[0];
</script>
```

---

## Notes

- **Variant Strategy:** Use `variant` field to customize rendering behavior
- **SEO First:** Always fill meta title, description, and canonical URL
- **Performance:** Use image optimization and lazy loading
- **A/B Testing:** Create multiple pages with same treatment, different copy
- **Webhooks:** Set up Strapi webhooks to trigger Vercel redeploys

