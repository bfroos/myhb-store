<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <BlockPageHeader v-if="fixedBlocks.hero" v-bind="fixedBlocks.hero" />
  <BlockTextContent
    v-if="fixedBlocks.textContent"
    v-bind="fixedBlocks.textContent"
  />
  <BlockEmployeeQualifications
    v-if="fixedBlocks.qualifications"
    v-bind="fixedBlocks.qualifications"
  />
  <BlockTreatmentTeasers
    v-if="fixedBlocks.treatmentSpecialties"
    v-bind="fixedBlocks.treatmentSpecialties"
  />
  <BlockLocationTeasers
    v-if="fixedBlocks.locations"
    v-bind="fixedBlocks.locations"
  />
</template>
<script setup lang="ts">
const globals = useGlobals();

const { fetchPage, fixedBlocks, seo, breadcrumbItems, localizations } =
  useDoctorPage(globals.value.brand.name);

const pageLoaded = await fetchPage();

if (pageLoaded) {
  await setPageSeo(seo.value);
  usePageI18nParams(localizations.value, "slug");
}
</script>
