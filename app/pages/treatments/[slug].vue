<template>
  <div v-if="pageData" class="treatment-page">
    <!-- If it's a landing page ads or social variant, render specialized component -->
    <LandingPageAds v-if="pageData.variant === 'ads'" />
    <LandingPageSocial v-else-if="pageData.variant === 'social'" />
    <!-- Otherwise, render as standard treatment page -->
    <BlockRenderer v-else :blocks="pageData.blocks" />
  </div>
  <div v-else class="container mx-auto px-4 py-20 text-center">
    <p class="text-neutral-600">{{ t('common.loading') }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

definePageMeta({ layout: 'default' });

const { t } = useI18n();
const route = useRoute();
const pageData = ref<any>(null);

const slug = route.params.slug as string;

// Fetch treatment or landing page data from Strapi
const { data, error } = await useStrapiFetch<any>(
  `/treatments/by-slug/${slug}`,
  {
    query: {
      locale: useI18n().locale.value,
    },
    fetchOptions: {
      key: `treatment:${useI18n().locale.value}:${slug}`,
    },
  },
);

if (error.value) {
  throw handleFetchError(error.value, t);
}

const treatment = data.value?.data;
if (!treatment) {
  throw handleNotFound(t);
}

// Map Strapi data to page component
pageData.value = {
  variant: treatment.variant || 'default', // 'ads', 'social', or 'default'
  blocks: treatment.blocks || [],
  seo: treatment.seo || null,
};

// Set SEO
await setPageSeo(pageData.value.seo);
</script>

<style scoped>
.treatment-page {
  @apply w-full;
}
</style>
