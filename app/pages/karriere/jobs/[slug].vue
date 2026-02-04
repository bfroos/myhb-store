<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <BlockPageHeader v-if="fixedBlocks.jobHero" v-bind="fixedBlocks.jobHero" />
  <PagesJobDescriptionBlock
    v-if="fixedBlocks.jobDescription"
    v-bind="fixedBlocks.jobDescription"
    :seo="seo"
  />
  <BlockRenderer v-if="blocks" :blocks="blocks" />
  <BlockCompanyStats />
</template>

<script setup lang="ts">
const {
  fetchJobPage,
  fixedBlocks,
  blocks,
  seo,
  jobDetails,
  localizations,
  breadcrumbItems,
} = useJobPage();

const jobPageLoaded = await fetchJobPage();

if (jobPageLoaded) {
  usePageI18nParams(localizations.value, "slug");
  await setPageSeo(seo.value);
}

// Schema.org JobPosting
const config = useRuntimeConfig();
const globals = useGlobals();
const route = useRoute();

const jobPostingSchema = computed(() =>
  buildJobPostingSchema(jobDetails.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: globals.value?.brand?.name,
  }),
);

useSchemaOrg(jobPostingSchema);
</script>
