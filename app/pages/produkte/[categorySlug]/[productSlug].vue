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
import { buildVideoObjectSchema } from "~/utils/schemaVideo";

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
  await setPageSeo(seo.value, product.value?.images?.[0] ?? null);
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

// Schema.org VideoObject (für Product Videos)
const videoSchema = computed(() => {
  const videos = product.value?.videos;
  if (!videos || videos.length === 0) {
    return null;
  }

  const builtVideos = videos.map((video: any) =>
    buildVideoObjectSchema({
      media: video,
      name: video.name || `${product.value?.name || "Product"} Video`,
      description: video.description || product.value?.description || "Product video",
      uploadDate: video.uploadedAt || new Date().toISOString(),
      duration: video.duration,
      embedUrl: video.embedUrl,
    }),
  ).filter((v): v is Record<string, unknown> => v !== null);

  if (builtVideos.length === 0) return null;
  if (builtVideos.length === 1) return builtVideos[0];

  // Multiple videos: wrap in WebPage collection
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${product.value?.name || "Product"} Videos`,
    url: route.path,
    video: builtVideos,
  };
});

useSchemaOrg(productSchema);
useSchemaOrg(videoSchema);
</script>
