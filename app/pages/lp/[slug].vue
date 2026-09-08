<template>
  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

const { fetchLandingPage, seo, blocks, localizations } = useLandingPage();

const pageLoaded = await fetchLandingPage();

if (pageLoaded) {
  // Reihenfolge zaehlt: setPageSeo liest die von usePageI18nParams gemeldete
  // Sprachabdeckung, um nur existierende hreflang-Alternates auszugeben.
  usePageI18nParams(localizations.value, "slug");
  await setPageSeo(seo.value);
}
</script>
