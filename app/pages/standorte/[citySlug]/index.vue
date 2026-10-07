<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <BlockRenderer v-if="topBlocks && topBlocks.length > 0" :blocks="topBlocks" />
  <BlockLocationTeasers
    v-if="locations.open.length > 0"
    :headline="`${$t('locations.city.allLocations', { city: cityName })} (${
      locations.open.length
    })`"
    :locations="locations.open"
    :heading-level="firstTeaser === 'open' ? 1 : 2"
  />
  <BlockLocationTeasers
    v-if="locations.openSoon.length > 0"
    :headline="$t('locations.city.upcomingOpening', { city: cityName })"
    :locations="locations.openSoon"
    :heading-level="firstTeaser === 'openSoon' ? 1 : 2"
    :card-settings="{ colorTheme: ColorTheme.NEUTRAL }"
  />
  <BlockLocationTeasers
    v-if="locations.comingSoon.length > 0"
    :headline="$t('locations.city.plannedLocations', { city: cityName })"
    :locations="locations.comingSoon"
    :heading-level="firstTeaser === 'comingSoon' ? 1 : 2"
    :card-settings="{ colorTheme: ColorTheme.STRONG }"
  />
  <BlockRenderer
    v-if="bottomBlocks && bottomBlocks.length > 0"
    :blocks="bottomBlocks"
  />
</template>
<script setup lang="ts">
import { ColorTheme } from "~/lib/strapi/dto/enums";

const {
  fetchWithLocations,
  locations,
  cityName,
  localizations,
  breadcrumbItems,
  topBlocks,
  bottomBlocks,
  seo,
} = useCityPage();

// TSEO-14: Stadtseiten hatten keine H1. Die Ueberschrift des ersten
// sichtbaren Filialblocks wird es (oben steht in Strapi bei keiner Stadt
// etwas, das eine eigene H1 mitbringt).
const firstTeaser = computed(() =>
  topBlocks.value?.length
    ? null
    : locations.value.open.length > 0
    ? "open"
    : locations.value.openSoon.length > 0
      ? "openSoon"
      : "comingSoon",
);

const cityLoaded = await fetchWithLocations();

if (cityLoaded) {
  // TSEO-01: Standortseiten nur auf Deutsch, hreflang nur de + x-default.
  usePageI18nParamsFromSources(
    [{ localizations: localizations.value ?? [], key: "slug", paramName: "citySlug" }],
    { hreflangLocales: ["de"] },
  );
  await setPageSeo(seo.value);
}
</script>
