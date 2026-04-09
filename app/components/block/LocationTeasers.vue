<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiOrganismLocationsCard
      :headline="headline"
      :show-filters="showFilter"
      :card-settings="cardSettings"
      :selected-federal-state="selectedFederalState"
      :available-federal-states="availableFederalStates"
      :filtered-items-count="filteredLocations.length"
      @update:federal-state="selectedFederalState = $event"
    >
      <UiMoleculeLocationItem
        v-for="location in filteredLocations"
        :key="location.slug"
        :item="location"
        :to="buildLocationPath(location)"
        main-information="city"
        show-building-image
        :on-book="() => handleLocationBook(location)"
      />
    </UiOrganismLocationsCard>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockLocationTeasersDto } from "~/lib/strapi/dto/components";
import type { LocationDto } from "~/lib/strapi/dto/collections";

const props = defineProps<BlockLocationTeasersDto>();
const { openCalendlyDialog } = useCalendlyDialog();

const selectedFederalState = ref<string | null>(null);

const hasContent = computed(
  () => !!props.headline || (props.locations?.length ?? 0) > 0,
);

const availableFederalStates = computed(() => {
  if (!props.locations?.length) return [];
  const states = new Set<string>();
  props.locations.forEach((loc) => {
    if (loc.city?.federalState) states.add(loc.city.federalState);
  });
  return Array.from(states).sort();
});

const showFilter = computed(
  () =>
    !!props.showFilters &&
    (props.locations?.length ?? 0) > 1 &&
    availableFederalStates.value.length > 0,
);

const filteredLocations = computed(() => {
  if (!props.locations) return [];
  if (!selectedFederalState.value) return props.locations;
  return props.locations.filter(
    (loc) => loc.city?.federalState === selectedFederalState.value,
  );
});

function buildLocationPath(location: LocationDto): string {
  if (!props.treatmentPathKey) {
    return `/standorte/${location.city.slug}/${location.slug}`;
  }

  return `/standorte/${location.city.slug}/${location.slug}/${props.treatmentPathKey}`;
}

function handleLocationBook(location: LocationDto) {
  openCalendlyDialog(location.calendlyUrl);
}
</script>
