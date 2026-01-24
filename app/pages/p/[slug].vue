<template>
  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>

<script setup lang="ts">
const { fetchGeneralPage, seo, blocks, localizations } = useGeneralPage();

const pageLoaded = await fetchGeneralPage();

if (pageLoaded) {
  await setPageSeo(seo.value);
  usePageI18nParams(localizations.value, "slug");
}
</script>
