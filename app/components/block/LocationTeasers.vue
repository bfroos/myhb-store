<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiOrganismLocationsCard
      :headline="headline"
      :heading-level="headingLevel"
      :show-filters="showFilter"
      :card-settings="cardSettings"
      :selected-federal-state="selectedFederalState"
      :available-federal-states="availableFederalStates"
      :filtered-items-count="filteredLocations.length"
      @update:federal-state="selectedFederalState = $event"
    >
      <UiMoleculeLocationItem
        v-for="location in filteredLocations"
        :key="buildLocationPath(location)"
        :item="location"
        :to="buildLocationPath(location)"
        main-information="city"
        :treatment-name="treatmentName"
        show-building-image
        :on-book="() => handleLocationBook(location)"
      />
    </UiOrganismLocationsCard>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockLocationTeasersDto } from "~/lib/strapi/dto/components";
import type { LocationDto } from "~/lib/strapi/dto/collections";
import {
  locationTeaserPath,
  uniqueTeaserLocations,
} from "#shared/locationTeaserLinks";

const props = defineProps<
  BlockLocationTeasersDto & {
    /** Nicht aus Strapi (D-02): Behandlungsname fuer die Kacheltitel. */
    treatmentName?: string;
  }
>();
const { openCalendlyDialog } = useCalendlyDialog();
const { seitenBehandlung } = useSeitenBehandlung();

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

// D-02: jeder Standort nur einmal, nur mit gueltiger Ziel-URL.
const uniqueLocations = computed(() => uniqueTeaserLocations(props.locations));

const filteredLocations = computed(() => {
  if (!selectedFederalState.value) return uniqueLocations.value;
  return uniqueLocations.value.filter(
    (loc) => loc.city?.federalState === selectedFederalState.value,
  );
});

function buildLocationPath(location: LocationDto): string {
  // uniqueTeaserLocations laesst nur Standorte mit Stadt- und Standort-Slug durch.
  return locationTeaserPath(location, props.treatmentPathKey) as string;
}

function handleLocationBook(location: LocationDto) {
  // #97/#100: zweiter Buchungsweg des Standorts; der Split entscheidet beim
  // Klick, sofern der Standort dafuer freigegeben ist.
  // #78: Auf einer Behandlungsseite reist die Behandlung mit — Behandlungstyp,
  // App-Deeplink (#66) und Kontextzeile im Dialogkopf.
  const seite = seitenBehandlung.value;
  openCalendlyDialog(
    location.calendlyUrl,
    seite?.treatmentType,
    seite?.appTreatmentSlug,
    { appBookingUrl: location.appBookingUrl, locationSlug: location.slug },
    seite?.kontext,
  );
}
</script>
