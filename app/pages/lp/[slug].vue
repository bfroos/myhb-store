<template>
  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

const { fetchLandingPage, seo, blocks, localizations } = useLandingPage();
const route = useRoute();

const pageLoaded = await fetchLandingPage();

if (pageLoaded) {
  await setPageSeo(seo.value);
  usePageI18nParams(route.path, localizations);
}
</script>
