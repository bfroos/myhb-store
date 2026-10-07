<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <BlockRenderer v-if="topBlocks && topBlocks.length > 0" :blocks="topBlocks" />
  <BlockLocationTeasers
    v-if="locations.open.length > 0"
    :headline="`${$t('locations.city.allLocations', { city: cityName })} (${
      locations.open.length
    })`"
    :locations="locations.open"
  />
  <BlockLocationTeasers
    v-if="locations.openSoon.length > 0"
    :headline="$t('locations.city.upcomingOpening', { city: cityName })"
    :locations="locations.openSoon"
    :card-settings="{ colorTheme: ColorTheme.NEUTRAL }"
  />
  <BlockLocationTeasers
    v-if="locations.comingSoon.length > 0"
    :headline="$t('locations.city.plannedLocations', { city: cityName })"
    :locations="locations.comingSoon"
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
