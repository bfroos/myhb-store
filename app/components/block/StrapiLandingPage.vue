<template>
  <div v-if="landingPage" class="strapi-landing-page">
    <!-- Hero Section -->
    <div v-if="landingPage.heroHeadline" class="hero-section relative h-screen flex items-center justify-center overflow-hidden">
      <div v-if="landingPage.heroBackgroundImage" class="absolute inset-0">
        <img
          :src="landingPage.heroBackgroundImage"
          :alt="landingPage.heroHeadline"
          class="w-full h-full object-cover"
        />
        <div
          class="absolute inset-0"
          :style="{ backgroundColor: landingPage.heroOverlayColor || 'rgba(0,0,0,0.3)' }"
        />
      </div>
      <div class="relative z-10 text-center text-white px-4 max-w-2xl">
        <h1 class="text-5xl font-bold mb-4">{{ landingPage.heroHeadline }}</h1>
        <p v-if="landingPage.heroSubheadline" class="text-2xl mb-8 font-light">
          {{ landingPage.heroSubheadline }}
        </p>
        <a
          :href="landingPage.heroCtaLink || '/termin-buchen'"
          class="inline-block px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg transition"
        >
          {{ landingPage.heroCtaText || 'Termin Buchen' }}
        </a>
      </div>
    </div>

    <!-- Dynamic Blocks -->
    <BlockRenderer :blocks="landingPage.blocks" />

    <!-- Analytics Attributes -->
    <div class="hidden" :data-campaign-id="landingPage.googleAdsCampaignId || ''">
      <!-- Campaign tracking metadata -->
    </div>
  </div>
  <div v-else class="container mx-auto px-4 py-20 text-center">
    <p class="text-neutral-600">Landing page not found</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface LandingPageData {
  title: string;
  slug: string;
  variant: 'ads' | 'social' | 'default';
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  heroBackgroundImage?: string;
  heroOverlayColor?: string;
  blocks?: any[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    ogImage?: string;
  };
  googleAdsCampaignId?: string;
  socialMediaCampaignId?: string;
}

interface Props {
  slug: string;
}

const props = defineProps<Props>();
const landingPage = ref<LandingPageData | null>(null);
const { t } = useI18n();

onMounted(async () => {
  // Fetch from Strapi
  const { data, error } = await useStrapiFetch<any>(
    `/landing-pages?filters[slug][$eq]=${props.slug}&populate=*`
  );

  if (error.value) {
    console.error('Error fetching landing page:', error.value);
    return;
  }

  const pages = data.value?.data || [];
  if (pages.length > 0) {
    landingPage.value = pages[0];

    // Set SEO metadata
    if (landingPage.value.seo) {
      useHead({
        title: landingPage.value.seo.metaTitle,
        meta: [
          {
            name: 'description',
            content: landingPage.value.seo.metaDescription,
          },
          {
            name: 'keywords',
            content: landingPage.value.seo.keywords,
          },
          {
            property: 'og:image',
            content: landingPage.value.seo.ogImage,
          },
        ],
      });
    }

    // Track page view in Google Analytics if campaign ID exists
    if (landingPage.value.googleAdsCampaignId && window.gtag) {
      window.gtag('event', 'page_view', {
        campaign_id: landingPage.value.googleAdsCampaignId,
      });
    }
  }
});
</script>

<style scoped>
.strapi-landing-page {
  @apply w-full;
}

.hero-section {
  @apply -mt-16 pt-16; /* Offset header height */
}
</style>
