<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
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
const {
  fetchWithTreatments,
  fixedBlocks,
  breadcrumbItems,
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
</script>
