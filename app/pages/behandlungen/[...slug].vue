<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <BlockTreatmentHero v-if="fixedBlocks.hero" v-bind="fixedBlocks.hero" />
  <PagesTreatmentCommonBlocks :fixed-blocks="fixedBlocks" />
  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>
<script setup lang="ts">
const {
  fetchTreatment,
  fixedBlocks,
  breadcrumbItems,
  seo,
  localizations,
  blocks,
} = useTreatmentPage();

const treatmentPageLoaded = await fetchTreatment();

if (treatmentPageLoaded) {
  usePageI18nParams(localizations.value, "pathKey");
  await setPageSeo(seo.value);
}
</script>
