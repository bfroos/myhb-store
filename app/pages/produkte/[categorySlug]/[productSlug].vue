<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
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
  breadcrumbItems,
} = useProductPage();

const config = useRuntimeConfig();
const route = useRoute();
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

// Canonical URL without variant query params.
const canonicalUrl = computed(() => {
  const base = ((config.public.publicUrl as string) || "").replace(/\/+$/, "");
  return `${base}${route.path}`;
});

useHead(() => ({
  link: [
    {
      rel: "canonical",
      href: canonicalUrl.value,
    },
  ],
}));

// Schema.org Product
const productSchema = computed(() =>
  buildProductSchema(product.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    currency: "EUR",
  }),
);

useSchemaOrg(productSchema);
</script>
