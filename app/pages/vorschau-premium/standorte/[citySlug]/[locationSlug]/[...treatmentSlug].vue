<template>
  <!-- Huelle .ads-premium: die Premium-Ebene (ads-premium.css) greift nur
       hier; Page.vue selbst bleibt unveraendert. -->
  <div ref="premiumRoot" class="ads-premium" data-ads-layer="premium">
    <PagesTreatmentAdsV2Page
      v-if="heroView"
      :hero="heroView"
      :treatment-page="treatmentPage"
      :location="location"
    />
  </div>
</template>

<script setup lang="ts">
import { resolveAdsOverrides } from "#shared/adsPremium";
import type { AdsOverridesRaw } from "#shared/adsPremium";
import "~/assets/css/components/ads-premium.css";

/**
 * go.* Vorschau der Premium-Ebene (shared/adsPremium.ts, Ticket "Premium
 * Ads Landing Page", Parya 05.10.2026).
 *
 * /vorschau-premium/standorte/<stadt>/<standort>/<behandlung> zeigt exakt
 * dieselbe Seite wie /vorschau-v2/... (gleiche Strapi-Daten, Inhalte,
 * Preise, Knoepfe, Tracking), nur mit der Premium-Ebene. Zum Vergleich:
 *   alt:     /vorschau-v2/standorte/duesseldorf/duesseldorf-arcaden/skinbooster/profhilo
 *   premium: /vorschau-premium/standorte/duesseldorf/duesseldorf-arcaden/skinbooster/profhilo
 * Nur go., nur Seiten aus ADS_TEMPLATE_V2_PAGES (sonst 404), noindex,
 * Canonical auf die echte Seite (stripAdsAnyPreview), Tracking mit
 * template: "v2-premium-preview". Die echten Anzeigen-URLs bleiben
 * unveraendert (ADS_PREMIUM_PAGES ist leer).
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
  await setPageSeo(seo.value);
}

// Redaktions-Overrides (Strapi ads.overrides, Schema-Entwurf in
// docs/strapi-schema/ads/): in Phase 1 nur die Hero-Ueberschrift. Unterzeile
// und Abschnitts-Ueberschriften setzt Page.vue selbst (v2-Texte haben dort
// Vorrang) - die folgen in Phase 2. Fehlt das Feld (heute ueberall), bleibt
// der v2-Hero unveraendert.
const { isAdsMode } = useSiteModeFlags();
const overrides = computed(() =>
  resolveAdsOverrides((treatmentPage.value as { adsOverrides?: AdsOverridesRaw } | undefined)?.adsOverrides, {
    goMode: isAdsMode.value,
  }),
);
const heroView = computed(() => {
  const hero = fixedBlocks.value?.hero;
  if (!hero) return null;
  const headline = overrides.value.heroHeadline;
  return headline ? { ...hero, headline, headlinePrefix: undefined, headlineSuffix: undefined } : hero;
});

// Ruhige Hero-Parallaxe nur Desktop/Maus (app/composables/useAdsDepth.ts).
const premiumRoot = ref<HTMLElement | null>(null);
useAdsDepth(premiumRoot, ref(true));

// Vorschau nie in den Index, egal was Strapi als metaRobots pflegt.
useHead({
  meta: [{ name: "robots", content: "noindex, nofollow", key: "robots", tagPriority: "high" }],
});

const PREVIEW_TEMPLATE = "v2-premium-preview";
if (import.meta.client) {
  (window as any).__myhbPreviewTemplate = PREVIEW_TEMPLATE;
  ((window as any).dataLayer = (window as any).dataLayer || []).push({
    template: PREVIEW_TEMPLATE,
  });
}
onBeforeUnmount(() => {
  if (!import.meta.client) return;
  if ((window as any).__myhbPreviewTemplate !== PREVIEW_TEMPLATE) return;
  delete (window as any).__myhbPreviewTemplate;
  (window as any).dataLayer?.push({ template: undefined });
});
</script>
