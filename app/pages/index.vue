<template>
  <BlockRenderer v-if="blocks && blocks.length > 0" :blocks="blocks" />
  <BlockLocationTeasers
    v-if="homepageLocations.length > 0"
    :headline="$t('locations.discoverLocations')"
    :locations="homepageLocations"
    :show-filters="true"
  />
</template>

<script setup lang="ts">
const { fetchHomepage, seo, blocks } = useHomepage();
const { fetchWithLocations, locations } = useLocationsPage();
const homepageLocations = computed(() => locations.value.open ?? []);

const homepageLoaded = await fetchHomepage();
await fetchWithLocations();

if (homepageLoaded) {
  await setPageSeo(seo.value);
}

// Schema.org WebSite + Organization (Homepage only)
const config = useRuntimeConfig();
const appConfig = useAppConfig();
const { brandName } = useBrand();
const globals = useGlobals();
const { isAdsMode } = useSiteModeFlags();

const logoUrl = appConfig.seo?.organization?.logo?.url
  ? `${config.public.publicUrl}${appConfig.seo.organization.logo.url}`
  : appConfig.seo?.organization?.logo?.fallback;

const websiteSchema = computed(() =>
  buildWebSiteSchema({
    publicUrl: (config.public.publicUrl as string) || "",
    path: "/",
    brandName: brandName.value,
    logoUrl,
  }),
);


useSchemaOrg(websiteSchema);

// #308: FAQPage aus dem FAQ-Block der Startseite (sichtbare Fragen)
const homeFaqSchema = computed(() => {
  const faq = (blocks.value ?? []).find((b: any) => b?.__component === "blocks.faq") as any;
  if (!faq || isAdsMode.value) return null;
  const items = [...(faq.faqs ?? []), ...(faq.faqSets ?? []).flatMap((set: any) => set?.faqs ?? [])];
  return items.length ? buildFaqPageSchema(items) : null;
});
useSchemaOrg(homeFaqSchema);
</script>
