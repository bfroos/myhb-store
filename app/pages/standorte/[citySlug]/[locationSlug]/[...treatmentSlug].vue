<template>
  <!-- go.-Seitenvorlage v2 (shared/adsTemplateV2.ts, seit 01.10.2026 live) -->
  <PagesTreatmentAdsV2Page
    v-if="isV2 && fixedBlocks?.hero"
    :hero="fixedBlocks.hero"
    :treatment-page="treatmentPage"
    :location="location"
  />
  <template v-else>
    <UiOrganismBaseBreadcrumb v-if="!isAdsMode" :items="breadcrumbItems" />
    <PagesTreatmentOrderedBlocks
      :fixed-blocks="fixedBlocks"
      :dynamic-blocks="treatmentPage?.blocks"
      :order="blockOrder"
    />
    <!-- go.: Sternchen-Erklaerung + regulaerer Preis (nicht mehr im Hero) -->
    <BlockAdsPriceFootnote
      v-if="isAdsMode && fixedBlocks?.hero"
      :treatment="fixedBlocks.hero.treatment"
      :treatment-path-key="fixedBlocks.hero.treatmentPathKey"
    />
  </template>
</template>
<script setup lang="ts">
import { buildVideoObjectSchema } from "~/utils/schemaVideo";
import { buildLocalBusinessSchema } from "~/utils/schemaLocation";
import { mergeBlockOrder } from "~/lib/blocks/mergeBlockOrder";
import { isAdsTemplateV2LivePage } from "#shared/adsTemplateV2";
import { ADS_OFFER_AB_ENABLED, ADS_OFFER_REDIRECT_SCRIPT } from "#shared/adsOfferVariant";
import { rememberOfferVariant } from "~/lib/offerVariant";
import {
  LOCATION_ADS_BLOCK_ORDER,
  LOCATION_SEO_BLOCK_ORDER,
} from "~/lib/blocks/treatmentBlockOrder";

const {
  fetchPage,
  fetchTreatmentPrice,
  fixedBlocks,
  breadcrumbItems,
  seo,
  locationLocalizations,
  cityLocalizations,
  treatmentPageLocalizations,
  treatmentPage,
  location,
  treatmentPrice, // Expose for schema
} = useLocationTreatmentPage();

const { isAdsMode } = useSiteModeFlags();
// go.: Seitenvorlage v2 fuer die Seiten aus ADS_TEMPLATE_V2_PAGES.
const isV2 = useAdsTemplateV2();
const pageLoaded = await fetchPage();

// Tracking: Ereignisse auf v2-Seiten tragen `template: "v2"` (Vorschau:
// "v2-preview"), damit sich vorher/nachher trennen laesst
// (useGoogleAnalytics liest window.__myhbPreviewTemplate).
const V2_TEMPLATE = "v2";
if (import.meta.client && isV2.value) {
  (window as any).__myhbPreviewTemplate = V2_TEMPLATE;
  ((window as any).dataLayer = (window as any).dataLayer || []).push({
    template: V2_TEMPLATE,
  });
}
// Angebots-Test (shared/adsOfferVariant.ts): `?angebot=beratung` fuehrt vor
// dem ersten Zeichnen auf /ab-beratung/... (Variante B). Die Seite kommt aus
// dem ISR-Cache ohne Query, deshalb ein Skript im <head> statt Server-Weiche.
// Ohne den Parameter tut es nichts; hier ist man in Variante A.
if (isV2.value && ADS_OFFER_AB_ENABLED) {
  useHead({
    script: [{ key: "ads-offer-ab", innerHTML: ADS_OFFER_REDIRECT_SCRIPT, tagPosition: "head", tagPriority: "critical" }],
  });
  if (import.meta.client) rememberOfferVariant("a");
}
onBeforeUnmount(() => {
  if (!import.meta.client) return;
  if ((window as any).__myhbPreviewTemplate !== V2_TEMPLATE) return;
  // Beim Wechsel auf die naechste v2-Seite hat deren setup die Markierung
  // schon gesetzt (die URL ist hier bereits die neue) - dann stehen lassen.
  const next = /^\/standorte\/([^/]+)\/([^/]+)\/(.+?)\/?$/.exec(window.location.pathname);
  if (next && isAdsTemplateV2LivePage(next[1], next[2], next[3])) return;
  delete (window as any).__myhbPreviewTemplate;
  (window as any).dataLayer?.push({ template: undefined });
});

// blockOrder sortiert nur; nicht gelistete Bloecke werden in Default-
// Reihenfolge angehaengt. Ausgeblendet wird ausschliesslich ueber
// hiddenBlocks. Details: lib/blocks/mergeBlockOrder.ts
const blockOrder = computed<string[]>(() =>
  mergeBlockOrder(
    (treatmentPage.value as any)?.blockOrder,
    isAdsMode.value ? LOCATION_ADS_BLOCK_ORDER : LOCATION_SEO_BLOCK_ORDER,
    (treatmentPage.value as any)?.hiddenBlocks,
  ),
);

if (pageLoaded) {
  // Fetch price fallback from general treatment page
  await fetchTreatmentPrice();
  usePageI18nParamsFromSources([
    {
      localizations: locationLocalizations.value ?? [],
      key: "slug",
      paramName: "locationSlug",
    },
    {
      localizations: cityLocalizations.value ?? [],
      key: "slug",
      paramName: "citySlug",
    },
    {
      localizations: treatmentPageLocalizations.value ?? [],
      key: "pathKey",
      paramName: "treatmentSlug",
    },
  ]);
  await setPageSeo(seo.value);
}

// Schema.org MedicalProcedure
const config = useRuntimeConfig();
const route = useRoute();
const { brandName } = useBrand();
const appConfig = useAppConfig();

const medicalProcedureSchema = computed(() =>
  buildMedicalProcedureSchema(treatmentPage.value, location.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: brandName.value,
    ratingValue: appConfig.seo?.aggregateRating?.ratingValue,
    reviewCount: appConfig.seo?.aggregateRating?.reviewCount,
    priceInEuroCent: treatmentPrice?.value, // Pass fetched price to schema
    omitOffer: isAdsMode.value,
  }),
);

// Schema.org BreadcrumbList
const breadcrumbSchema = computed(() =>
  buildBreadcrumbSchema(breadcrumbItems.value, (config.public.publicUrl as string) || ""),
);

// Schema.org FAQPage (nur wenn FAQ-Block sichtbar ist)
const faqSchema = computed(() => {
  if (!fixedBlocks.value?.faq) return null;
  // v2 zeigt eigene Fragen statt des Strapi-FAQ-Blocks.
  if (isV2.value) return null;
  // Ausgeblendete Bloecke duerfen nicht im strukturierten Datensatz landen -
  // sonst bewirbt Google FAQs, die auf der Seite nicht existieren.
  if (!blockOrder.value.includes("faq")) return null;

  // Merge faqs from both direct faqs and faqSets
  const directFaqs = fixedBlocks.value.faq.faqs ?? [];
  const faqSetsItems = (fixedBlocks.value.faq.faqSets ?? []).flatMap(
    (set: any) => set.faqs ?? [],
  );
  const allFaqs = [...directFaqs, ...faqSetsItems];
  return buildFaqPageSchema(allFaqs);
});

// Schema.org VideoObject (from about block videos)
const videoSchema = computed(() => {
  if (!blockOrder.value.includes("about")) return null;
  // v2 zeigt den About-Block (und sein Video) nicht.
  if (isV2.value) return null;

  const about = fixedBlocks.value?.about as any;

  return buildVideoObjectSchema({
    media: about?.mediaItems?.[0],
    poster: about?.poster,
    name: about?.headline || treatmentPage.value?.name || "",
    description: about?.intro || about?.headline || "",
  });
});

// Schema.org LocalBusiness (for address + stars in SERPs)
const localBusinessSchema = computed(() =>
  buildLocalBusinessSchema(location.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: brandName.value,
    // Ads mode: only advertise this page's own treatment in the offer catalog
    // (no generic Botox/Hyaluron/PRP/... leaking into a go.* landing page).
    isAdsMode: isAdsMode.value,
    offerCatalogTreatmentName:
      treatmentPage.value?.treatment?.name ?? treatmentPage.value?.name ?? null,
  }),
);

useSchemaOrg(medicalProcedureSchema);
useSchemaOrg(breadcrumbSchema);
useSchemaOrg(faqSchema);
useSchemaOrg(videoSchema);
useSchemaOrg(localBusinessSchema); // NEW: Address + Stars in SERPs
</script>
