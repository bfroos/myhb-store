<template>
  <PageBuilderRenderer :template-json="templateJson" />
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

const { fetchLandingPage, seo, templateJson } = useLandingPage();

const pageLoaded = await fetchLandingPage();

if (pageLoaded) {
  await setPageSeo(seo.value);
}
</script>
