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

const organizationSchema = computed(() =>
  buildOrganizationSchema({
    publicUrl: (config.public.publicUrl as string) || "",
    path: "/",
    brandName: brandName.value,
    logoUrl,
    description: globals.value?.seo?.defaultDescription ?? undefined,
  }),
);

useSchemaOrg(websiteSchema);
useSchemaOrg(organizationSchema);
</script>
