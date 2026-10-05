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
 * go.* Angebots-Test, Variante B (shared/adsOfferVariant.ts):
 * /ab-beratung/standorte/<stadt>/<standort>/<behandlung> zeigt die echte
 * v2-Seite mit "Kostenlose Beratung buchen", regulaeren Preisen und ohne
 * Rabattbotschaft. Eigener Pfad, weil Vercel-ISR die Query nicht an das
 * Server-Rendern weitergibt. Nur Seiten, die live in v2 laufen; sonst bzw.
 * mit Notschalter aus -> echte Seite. noindex, Canonical auf die echte Seite,
 * Tracking wie v2 (template: "v2") plus offer_variant: "b".
 */
import {
  ADS_OFFER_AB_ENABLED,
  adsOfferRegularPriceLine,
  adsOfferRegularText,
  stripAdsOfferB,
} from "#shared/adsOfferVariant";
import { formatEuroCent } from "#shared/newCustomerOffer";
import { rememberOfferVariant } from "~/lib/offerVariant";

const route = useRoute();
const isV2 = useAdsTemplateV2();
if (!ADS_OFFER_AB_ENABLED || !isV2.value) {
  const { isAdsMode } = useSiteModeFlags();
  if (!isAdsMode.value) throw handleNotFound(useI18n().t);
  await navigateTo({ path: stripAdsOfferB(route.path), query: route.query, hash: route.hash }, { redirectCode: 302, replace: true });
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
  // Titel/Beschreibung tragen auf go. den Neukundenpreis; hier regulaer.
  const regular = adsOfferRegularPriceLine(fixedBlocks.value?.hero?.treatment as any, formatEuroCent);
  const s: any = seo.value ? { ...seo.value } : null;
  const fix = (o: any, keys: string[]) => {
    for (const k of keys) if (typeof o?.[k] === "string") o[k] = adsOfferRegularText(o[k], regular);
  };
  if (s) {
    fix(s, ["metaTitle", "metaDescription"]);
    if (s.openGraph) {
      s.openGraph = { ...s.openGraph };
      fix(s.openGraph, ["ogTitle", "ogDescription"]);
    }
  }
  await setPageSeo(s, (fixedBlocks.value?.hero as any)?.cover ?? null);
}

useHead({
  meta: [{ name: "robots", content: "noindex, nofollow", key: "robots", tagPriority: "high" }],
});

const V2_TEMPLATE = "v2";
if (import.meta.client) {
  (window as any).__myhbPreviewTemplate = V2_TEMPLATE;
  ((window as any).dataLayer = (window as any).dataLayer || []).push({
    template: V2_TEMPLATE,
    offer_variant: "b",
  });
  rememberOfferVariant("b");
}
onBeforeUnmount(() => {
  if (!import.meta.client) return;
  if (/^\/ab-beratung\/standorte\//.test(window.location.pathname)) return;
  delete (window as any).__myhbPreviewTemplate;
  (window as any).dataLayer?.push({ template: undefined });
});
</script>
