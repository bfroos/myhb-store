<template>
  <BaseAppHeader />
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <BlockTreatmentHero v-if="fixedBlocks.hero" v-bind="fixedBlocks.hero" />
  <PagesTreatmentCommonBlocks :fixed-blocks="fixedBlocks" />
  <!-- <BlockLocationMap
    :card-settings="{
      colorTheme: ColorTheme.STRONG,
    }"
  /> -->
  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>
<script setup lang="ts">
// import { ColorTheme } from "~/lib/strapi/dto/enums";

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
