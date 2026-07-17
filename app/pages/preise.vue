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

// Schema.org ItemList (Service + Offer) for the treatment prices
const config = useRuntimeConfig();
const priceListSchema = computed(() =>
  buildPriceListSchema(
    productCategories.value,
    (config.public.publicUrl as string) || "",
  ),
);
useSchemaOrg(priceListSchema);
</script>
