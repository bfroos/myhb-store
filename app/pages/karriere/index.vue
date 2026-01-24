<template>
  <BlockRenderer v-if="topBlocks && topBlocks.length > 0" :blocks="topBlocks" />
  <BlockJobTeasers
    v-if="fixedBlocks.jobTeasers"
    v-bind="fixedBlocks.jobTeasers"
  />
  <BlockRenderer
    v-if="bottomBlocks && bottomBlocks.length > 0"
    :blocks="bottomBlocks"
  />
</template>

<script setup lang="ts">
const { fetchPage, seo, topBlocks, bottomBlocks, fixedBlocks } =
  useCareerPage();

const pageLoaded = await fetchPage();

if (pageLoaded) {
  await setPageSeo(seo.value);
}
</script>
