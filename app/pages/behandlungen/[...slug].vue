<template>
  <UiOrganismBaseBreadcrumb
    v-if="!isAdsMode"
    :items="breadcrumbItems"
  />
  <BlockTreatmentHero
    v-if="fixedBlocks.hero"
    v-bind="fixedBlocks.hero"
    show-floating-cta
  />
  <PagesTreatmentCommonBlocks :fixed-blocks="fixedBlocks" />
  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>
<script setup lang="ts">
const config = useRuntimeConfig();
const { isAdsMode } = useSiteModeFlags();
const {
  fetchTreatment,
  fixedBlocks,
  breadcrumbItems,
  seo,
  localizations,
  blocks,
  treatmentPage,
} = useTreatmentPage();

const treatmentPageLoaded = await fetchTreatment();

if (treatmentPageLoaded) {
  usePageI18nParams(localizations.value, "pathKey");
  await setPageSeo(seo.value);
}

// Schema.org MedicalProcedure

const route = useRoute();
const { brandName } = useBrand();

const medicalProcedureSchema = computed(() =>
  buildGeneralMedicalProcedureSchema(treatmentPage.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: brandName.value,
  }),
);

useSchemaOrg(medicalProcedureSchema);
</script>
