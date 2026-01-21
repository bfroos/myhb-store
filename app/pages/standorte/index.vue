<template>
  <BaseAppHeader />
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <BlockLocationTeasers
    v-if="locations.open.length > 0"
    :headline="`${$t('locations.allLocations')} (${locations.open.length})`"
    :locations="locations.open"
    :show-filters="true"
  />
  <BlockLocationTeasers
    v-if="locations.openSoon.length > 0"
    :headline="$t('locations.upcomingOpening')"
    :locations="locations.openSoon"
    :card-settings="{ colorTheme: ColorTheme.NEUTRAL }"
  />
  <BlockLocationTeasers
    v-if="locations.comingSoon.length > 0"
    :headline="$t('locations.plannedLocations')"
    :locations="locations.comingSoon"
    :card-settings="{ colorTheme: ColorTheme.STRONG }"
  />

  <BlockRenderer v-if="blocks" :blocks="blocks" />
</template>
<script setup lang="ts">
import { ColorTheme } from "~/lib/strapi/dto/enums";

const { fetchWithLocations, locations, seo, blocks, breadcrumbItems } =
  useLocationsPage();

const pageLoaded = await fetchWithLocations();

if (pageLoaded) {
  await setPageSeo(seo.value);
}
</script>
