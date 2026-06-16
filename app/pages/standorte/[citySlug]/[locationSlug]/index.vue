<template>
  <UiOrganismBaseBreadcrumb v-if="!isAdsMode" :items="breadcrumbItems" />
  <BlockTreatmentHero v-if="fixedBlocks?.hero" v-bind="fixedBlocks.hero" />
  <BlockLocationContact
    v-if="fixedBlocks?.locationContact"
    v-bind="fixedBlocks.locationContact"
  />
  <BlockLocationDirections
    v-if="fixedBlocks?.locationDirections"
    v-bind="fixedBlocks.locationDirections"
  />
  <BlockMediaBento v-if="fixedBlocks?.about" v-bind="fixedBlocks.about" />
  <BlockTreatmentTeasers
    v-if="fixedBlocks?.treatmentTeasers"
    v-bind="fixedBlocks.treatmentTeasers"
  />
  <BlockReviewsBlock v-if="fixedBlocks?.reviews" v-bind="fixedBlocks.reviews" />
  <BlockJobTeasers
    v-if="fixedBlocks?.jobTeasers"
    v-bind="fixedBlocks.jobTeasers"
  />
</template>
<script setup lang="ts">
const { isAdsMode } = useSiteModeFlags();
const {
  fetchWithTreatments,
  fixedBlocks,
  breadcrumbItems,
  location,
  locationLocalizations,
  cityLocalizations,
  seo,
} = useLocationPage();

const locationLoaded = await fetchWithTreatments();

if (locationLoaded) {
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
  ]);
  await setPageSeo(seo.value);
}

// Schema.org LocalBusiness
const config = useRuntimeConfig();
const route = useRoute();
const { brandName } = useBrand();

const localBusinessSchema = computed(() =>
  buildLocalBusinessSchema(location.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: brandName.value,
    // Ads mode: location overview has no single treatment focus, so drop the
    // generic offer catalog entirely (no Botox/Hyaluron/PRP/... in go.* HTML).
    isAdsMode: isAdsMode.value,
  }),
);

useSchemaOrg(localBusinessSchema);
</script>
