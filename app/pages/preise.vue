<template>
  <BlockRenderer v-if="topBlocks" :blocks="topBlocks" />
  <BlockProductCategoryPriceOverview :productCategories="productCategories" />
  <BlockRenderer v-if="bottomBlocks" :blocks="bottomBlocks" />
</template>

<script setup lang="ts">
const { fetchPage, productCategories, seo, topBlocks, bottomBlocks } =
  usePricesPage();

const pageLoaded = await fetchPage();

if (pageLoaded) {
  await setPageSeo(seo.value);
}
</script>
