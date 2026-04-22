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
const { brandName } = useBrand();
const globals = useGlobals();

const websiteSchema = computed(() =>
  buildWebSiteSchema({
    publicUrl: (config.public.publicUrl as string) || "",
    path: "/",
    brandName: brandName.value,
    logoUrl: "https://www.myhealthandbeauty.com/favicon/favicon.svg",
  }),
);

const organizationSchema = computed(() =>
  buildOrganizationSchema({
    publicUrl: (config.public.publicUrl as string) || "",
    path: "/",
    brandName: brandName.value,
    logoUrl: "https://www.myhealthandbeauty.com/favicon/favicon.svg",
    description: globals.value?.seo?.defaultDescription ?? undefined,
  }),
);

useSchemaOrg(websiteSchema);
useSchemaOrg(organizationSchema);
</script>
