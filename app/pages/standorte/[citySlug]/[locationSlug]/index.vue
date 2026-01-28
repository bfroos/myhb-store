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
  <BlockMediaCard v-if="fixedBlocks?.about" v-bind="fixedBlocks.about" />
  <BlockReviewsBlock v-if="fixedBlocks?.reviews" v-bind="fixedBlocks.reviews" />
  <BlockTreatmentTeasers
    v-if="fixedBlocks?.treatmentTeasers"
    v-bind="fixedBlocks.treatmentTeasers"
  />
</template>
<script setup lang="ts">
const globals = useGlobals();

const {
  fetchWithTreatments,
  fixedBlocks,
  breadcrumbItems,
  locationLocalizations,
  cityLocalizations,
  seo,
} = useLocationPage(globals.value.brand.name);

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
