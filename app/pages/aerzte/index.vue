<template>
  <BaseAppHeader />
  <BlockRenderer v-if="blocks && blocks.length > 0" :blocks="blocks" />
</template>

<script setup lang="ts">
const { fetchPage, seo, blocks } = useDoctorsPage();

const pageLoaded = await fetchPage();

if (pageLoaded) {
  await setPageSeo(seo.value);
}
</script>
