<template>
  <BlockRenderer v-if="topBlocks" :blocks="topBlocks" />
  <BlockProductCategoryPriceOverview :productCategories="shownCategories" />
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
const { isAdsMode } = useSiteModeFlags();
// go.: keine Schoenheits-OPs anbieten (Benjamin, 29.09.2026) - deren
// Seiten gibt es im Ads-Baum auch nicht (z. B. Lidstraffung lief auf 404).
const shownCategories = computed(() =>
  isAdsMode.value
    ? (productCategories.value ?? []).filter(
        (c: { slug?: string }) => !/^schoenheit/.test(c?.slug ?? ""),
      )
    : productCategories.value,
);
const priceListSchema = computed(() =>
  buildPriceListSchema(
    shownCategories.value,
    (config.public.publicUrl as string) || "",
    { omitOffers: isAdsMode.value },
  ),
);
useSchemaOrg(priceListSchema);
</script>
