<template>
  <BlockPageHeader
    v-if="fixedBlocks.pageHeader"
    v-bind="fixedBlocks.pageHeader"
  />
  <BlockProductCategoryPriceOverview :productCategories="productCategories" />
  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>

<script setup lang="ts">
const { fetchPage, productCategories, fixedBlocks, seo, blocks } =
  usePricesPage();

const pageLoaded = await fetchPage();

if (pageLoaded) {
  await setPageSeo(seo.value);
}
</script>
