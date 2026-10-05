<template>
  <PagesTreatmentAdsV2Page
    v-if="fixedBlocks?.hero"
    :hero="fixedBlocks.hero"
    :treatment-page="treatmentPage"
    :location="location"
  />
</template>

<script setup lang="ts">
/**
 * go.* Vorschau der Seitenvorlage v2 (bfroos/myhb-store#203).
 *
 * /vorschau-v2/standorte/<stadt>/<standort>/<behandlung> zeigt dieselben
 * Strapi-Daten wie die echte Seite /standorte/..., aber in der Vorlage v2.
 * Nur go. und nur Seiten aus ADS_TEMPLATE_V2_PAGES, sonst 404. Die echten
 * Anzeigen-Ziel-URLs bleiben unveraendert (Benjamin, 30.09.2026: erst
 * ansehen, dann aktivieren). noindex, Canonical auf die echte Seite,
 * Tracking mit template: "v2-preview".
 */
const isV2 = useAdsTemplateV2();
const { t } = useI18n();
if (!isV2.value) {
  throw handleNotFound(t);
}

const {
  fetchPage,
  fetchTreatmentPrice,
  fixedBlocks,
  seo,
  locationLocalizations,
  cityLocalizations,
  treatmentPageLocalizations,
  treatmentPage,
  location,
} = useLocationTreatmentPage();

const pageLoaded = await fetchPage();
if (pageLoaded) {
  await fetchTreatmentPrice();
  usePageI18nParamsFromSources([
    { localizations: locationLocalizations.value ?? [], key: "slug", paramName: "locationSlug" },
    { localizations: cityLocalizations.value ?? [], key: "slug", paramName: "citySlug" },
    { localizations: treatmentPageLocalizations.value ?? [], key: "pathKey", paramName: "treatmentSlug" },
  ]);
  // Vorschaubild beim Teilen: Titelbild der Seite statt des allgemeinen
  await setPageSeo(seo.value, (fixedBlocks.value?.hero as any)?.cover ?? null);
}

// Vorschau nie in den Index, egal was Strapi als metaRobots pflegt.
useHead({
  meta: [{ name: "robots", content: "noindex, nofollow", key: "robots", tagPriority: "high" }],
});

const PREVIEW_TEMPLATE = "v2-preview";
if (import.meta.client) {
  (window as any).__myhbPreviewTemplate = PREVIEW_TEMPLATE;
  ((window as any).dataLayer = (window as any).dataLayer || []).push({
    template: PREVIEW_TEMPLATE,
  });
}
onBeforeUnmount(() => {
  if (!import.meta.client) return;
  delete (window as any).__myhbPreviewTemplate;
  (window as any).dataLayer?.push({ template: undefined });
});
</script>
