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

const {
  fetchPage,
  fixedBlocks,
  breadcrumbItems,
  seo,
  locationLocalizations,
  cityLocalizations,
  treatmentPageLocalizations,
  treatmentPage,
  location,
} = useLocationTreatmentPage();

const { isAdsMode } = useSiteModeFlags();
const pageLoaded = await fetchPage();

if (pageLoaded) {
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

const medicalProcedureSchema = computed(() =>
  buildMedicalProcedureSchema(treatmentPage.value, location.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: brandName.value,
  }),
);

// Schema.org BreadcrumbList
const breadcrumbSchema = computed(() =>
  buildBreadcrumbSchema(breadcrumbItems.value, (config.public.publicUrl as string) || ""),
);

// Schema.org FAQPage (nur wenn FAQ-Block vorhanden)
const faqSchema = computed(() => {
  // Merge faqs from both direct faqs and faqSets
  const directFaqs = fixedBlocks.value?.faq?.faqs ?? [];
  const faqSetsItems = fixedBlocks.value?.faq?.faqSets?.flatMap(
    (set: any) => set.faqs ?? [],
  ) ?? [];
  const allFaqs = [...directFaqs, ...faqSetsItems];
  return buildFaqPageSchema(allFaqs);
});

// Schema.org VideoObject (für About/MediaBento Block Videos)
const videoSchema = computed(() => {
  const aboutBlock = fixedBlocks.value?.about;
  if (!aboutBlock?.videos || aboutBlock.videos.length === 0) {
    return null;
  }

  const videos = aboutBlock.videos.map((video: any) =>
    buildVideoObjectSchema({
      media: video,
      name: video.name || `${treatmentPage.value?.name || "Treatment"} Video`,
      description: video.description || treatmentPage.value?.hero?.text || "Treatment video",
      uploadDate: video.uploadedAt || new Date().toISOString(),
      duration: video.duration,
      embedUrl: video.embedUrl,
    }),
  ).filter((v): v is Record<string, unknown> => v !== null);

  if (videos.length === 0) return null;
  if (videos.length === 1) return videos[0];

  // Multiple videos: wrap in WebPage collection
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${treatmentPage.value?.name || "Treatment"} Videos`,
    url: route.path,
    video: videos,
  };
});

useSchemaOrg(medicalProcedureSchema);
useSchemaOrg(breadcrumbSchema);
useSchemaOrg(faqSchema);
useSchemaOrg(videoSchema);
</script>
