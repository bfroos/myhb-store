<template>
  <UiOrganismBaseBreadcrumb v-if="!isAdsMode" :items="breadcrumbItems" />
  <PagesTreatmentOrderedBlocks
    :fixed-blocks="fixedBlocks"
    :dynamic-blocks="treatmentPage?.blocks"
    :order="blockOrder"
  />
</template>
<script setup lang="ts">
import { buildVideoObjectSchema } from "~/utils/schemaVideo";
import { buildLocalBusinessSchema } from "~/utils/schemaLocation";
import { mergeBlockOrder } from "~/lib/blocks/mergeBlockOrder";
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
const pageLoaded = await fetchPage();

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
  }),
);

// Schema.org BreadcrumbList
const breadcrumbSchema = computed(() =>
  buildBreadcrumbSchema(breadcrumbItems.value, (config.public.publicUrl as string) || ""),
);

// Schema.org FAQPage (nur wenn FAQ-Block sichtbar ist)
const faqSchema = computed(() => {
  if (!fixedBlocks.value?.faq) return null;
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

  const aboutMedia = fixedBlocks.value?.about?.media;
  if (!aboutMedia) return null;

  // Get first video from media
  const video = Array.isArray(aboutMedia)
    ? aboutMedia.find(m => m?.mime?.startsWith("video/"))
    : aboutMedia.mime?.startsWith("video/")
    ? aboutMedia
    : null;

  if (!video) return null;

  return buildVideoObjectSchema({
    media: video,
    name: treatmentPage.value?.name ?? "Treatment Video",
    description: treatmentPage.value?.hero?.text ?? treatmentPage.value?.name ?? "",
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
