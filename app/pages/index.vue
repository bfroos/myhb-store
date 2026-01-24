<template>
  <BlockRenderer v-if="blocks && blocks.length > 0" :blocks="blocks" />
</template>

<script setup lang="ts">
const { fetchHomepage, seo, blocks } = useHomepage();

const homepageLoaded = await fetchHomepage();

if (homepageLoaded) {
  await setPageSeo(seo.value);
}
</script>
