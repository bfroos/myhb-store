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
        main-information="city"
        show-building-image
        :on-book="() => openCalendlyDialog(location)"
      />
    </UiOrganismLocationsCard>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";
import type { BlockLocationTeasersDto } from "~/lib/strapi/dto/components";
import type { LocationDto } from "~/lib/strapi/dto/collections";

const props = defineProps<BlockLocationTeasersDto>();
const { t } = useI18n();
const dialog = useDialog();

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

function openCalendlyDialog(location: LocationDto) {
  dialog.open(
    defineAsyncComponent(
      () => import("~/components/ui/organism/CalendlyDialog.vue"),
    ),
    {
      data: { url: location.calendlyUrl },
      props: {
        modal: true,
        draggable: false,
        header: t("dialogs.calendly.header"),
        style: {
          width: "600px",
          height: "90svh",
          maxHeight: "98svh",
          margin: "0",
          padding: "0",
        },
        contentStyle: {
          height: "100%",
          padding: "0",
        },
        breakpoints: {
          "960px": "100vw",
          "640px": "100vw",
        },
      },
    },
  );
}
</script>
