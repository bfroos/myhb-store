<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <BlockPageHeader v-if="fixedBlocks.jobHero" v-bind="fixedBlocks.jobHero" />
  <PagesJobDescriptionBlock
    v-if="fixedBlocks.jobDescription"
    v-bind="fixedBlocks.jobDescription"
  />
  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>

<script setup lang="ts">
const {
  fetchJobPage,
  fixedBlocks,
  blocks,
  seo,
  localizations,
  breadcrumbItems,
} = useJobPage();

const jobPageLoaded = await fetchJobPage();

if (jobPageLoaded) {
  usePageI18nParams(localizations.value, "slug");
  await setPageSeo(seo.value);
}
</script>
