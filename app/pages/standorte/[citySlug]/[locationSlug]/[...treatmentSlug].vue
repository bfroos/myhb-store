<template>
  <UiOrganismBaseBreadcrumb
    v-if="!isAdsMode"
    :items="breadcrumbItems"
  />
  <!-- 1. Hero -->
  <BlockTreatmentHero
    v-if="fixedBlocks?.hero"
    v-bind="fixedBlocks.hero"
    show-floating-cta
  />

  <!-- SEO mode: original order with location blocks early -->
  <template v-if="!isAdsMode">
    <BlockLocationContact
      v-if="fixedBlocks?.locationContact"
      v-bind="fixedBlocks.locationContact"
    />
    <BlockMediaCard
      v-if="fixedBlocks?.aboutLocation"
      v-bind="fixedBlocks.aboutLocation"
    />
    <BlockLocationDirections
      v-if="fixedBlocks?.locationDirections"
      v-bind="fixedBlocks.locationDirections"
    />
    <PagesTreatmentCommonBlocks :fixed-blocks="fixedBlocks" />
  </template>

  <!-- Ads mode: custom order (2→3→4→5→6→7→8→9→10→11→12) -->
  <template v-if="isAdsMode">
    <!-- 2. About (Video) -->
    <BlockMediaBento
      v-if="fixedBlocks?.about"
      v-bind="fixedBlocks.about"
      id="how-it-works"
    />
    <!-- 3. Reviews -->
    <BlockReviewsBlock
      v-if="fixedBlocks?.reviews"
      v-bind="fixedBlocks.reviews"
      id="reviews"
    />
    <!-- 4. Treatment Details -->
    <BlockTreatmentDetails
      v-if="fixedBlocks?.treatmentDetails"
      v-bind="fixedBlocks.treatmentDetails"
      id="treatment-details"
    />
    <!-- 5. Related Treatments -->
    <BlockTreatmentTeasers
      v-if="fixedBlocks?.relatedTreatments"
      v-bind="fixedBlocks.relatedTreatments"
      id="related-treatments"
    />
    <!-- 6. Treatment Process Steps -->
    <BlockProcessSteps
      v-if="fixedBlocks?.treatmentProcess"
      v-bind="fixedBlocks.treatmentProcess"
      id="treatment-process-steps"
    />
    <!-- 7. Benefits -->
    <BlockBenefitsList
      v-if="fixedBlocks?.benefits"
      v-bind="fixedBlocks.benefits"
      id="benefits"
    />
    <!-- 8. Medical Team -->
    <BlockEmployeeBlock
      v-if="fixedBlocks?.medicalTeamHighlight"
      v-bind="fixedBlocks.medicalTeamHighlight"
      id="employee"
    />
    <!-- 9. Suitability (Comparison) -->
    <BlockComparisonBlock
      v-if="fixedBlocks?.suitability"
      v-bind="fixedBlocks.suitability"
      id="suitability"
    />
    <!-- 10. Table of Contents (Inhaltsverzeichnis) -->
    <BlockTableOfContents
      v-if="fixedBlocks?.tableOfContents"
      v-bind="fixedBlocks.tableOfContents"
    />
    <!-- 11. Treatment Plan (if exists) -->
    <BlockTreatmentPlan
      v-if="fixedBlocks?.treatmentPlan"
      v-bind="fixedBlocks.treatmentPlan"
      id="treatment-plan"
    />
    <!-- 12. Map/Contact -->
    <BlockLocationContact
      v-if="fixedBlocks?.locationContact"
      v-bind="fixedBlocks.locationContact"
    />
    <!-- 13. About Location (Du findest unsere Lounge...) -->
    <BlockMediaCard
      v-if="fixedBlocks?.aboutLocation"
      v-bind="fixedBlocks.aboutLocation"
    />
    <!-- 14. Directions (Wegbeschreibung) -->
    <BlockLocationDirections
      v-if="fixedBlocks?.locationDirections"
      v-bind="fixedBlocks.locationDirections"
    />
    <!-- 15. FAQ (ganz am Ende) -->
    <BlockFaqBlock v-if="fixedBlocks?.faq" v-bind="fixedBlocks.faq" id="faq" />
  </template>
</template>
<script setup lang="ts">
import { buildVideoObjectSchema } from "~/utils/schemaVideo";
import { buildLocalBusinessSchema } from "~/utils/schemaLocation";

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

// Schema.org FAQPage (nur wenn FAQ-Block vorhanden)
const faqSchema = computed(() => {
  if (!fixedBlocks.value?.faq) return null;
  
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
