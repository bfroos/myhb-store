<template>
  <BlockProductHero
    v-if="fixedBlocks.productHero"
    v-bind="fixedBlocks.productHero"
  />
  <BlockTextContent
    v-if="fixedBlocks.textContent"
    v-bind="fixedBlocks.textContent"
  />
  <BlockTreatmentTeasers
    v-if="fixedBlocks.treatmentTeasers"
    v-bind="fixedBlocks.treatmentTeasers"
  />
  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>

<script setup lang="ts">
const {
  fetchProductPage,
  fixedBlocks,
  blocks,
  seo,
  categoryLocalizations,
  productLocalizations,
  product,
} = useProductPage();

const productPageLoaded = await fetchProductPage();

if (productPageLoaded) {
  usePageI18nParamsFromSources([
    {
      localizations: categoryLocalizations.value ?? [],
      key: "slug",
      paramName: "categorySlug",
    },
    {
      localizations: productLocalizations.value ?? [],
      key: "slug",
      paramName: "productSlug",
    },
  ]);
  await setPageSeo(seo.value);
}

// Schema.org Product
const config = useRuntimeConfig();
const route = useRoute();

const productSchema = computed(() =>
  buildProductSchema(product.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    currency: "EUR",
  }),
);

useSchemaOrg(productSchema);
</script>
