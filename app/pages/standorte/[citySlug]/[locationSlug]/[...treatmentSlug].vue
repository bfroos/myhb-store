<template>
  <UiOrganismBaseBreadcrumb
    v-if="!isAdsMode"
    :items="breadcrumbItems"
  />
  <BlockTreatmentHero
    v-if="fixedBlocks?.hero"
    v-bind="fixedBlocks.hero"
    show-floating-cta
  />
  <!-- SEO mode: location blocks early (original position) -->
  <template v-if="!isAdsMode">
    <BlockLocationContact
      v-if="fixedBlocks?.locationContact"
      v-bind="fixedBlocks.locationContact"
    />
  </template>
  <BlockMediaCard
    v-if="fixedBlocks?.aboutLocation"
    v-bind="fixedBlocks.aboutLocation"
  />
  <!-- SEO mode: directions early (original position) -->
  <template v-if="!isAdsMode">
    <BlockLocationDirections
      v-if="fixedBlocks?.locationDirections"
      v-bind="fixedBlocks.locationDirections"
    />
  </template>
  <PagesTreatmentCommonBlocks :fixed-blocks="fixedBlocks" />
  <!-- Ads mode: location blocks at the end -->
  <template v-if="isAdsMode">
    <BlockLocationContact
      v-if="fixedBlocks?.locationContact"
      v-bind="fixedBlocks.locationContact"
    />
    <BlockLocationDirections
      v-if="fixedBlocks?.locationDirections"
      v-bind="fixedBlocks.locationDirections"
    />
  </template>
</template>
<script setup lang="ts">
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

useSchemaOrg(medicalProcedureSchema);
</script>
