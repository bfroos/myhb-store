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
</script>
