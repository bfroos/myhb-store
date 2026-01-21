<template>
  <UiLayoutSectionBlock>
    <UiOrganismLocationsCard
      :headline="headline"
      :show-filters="showFilters"
      :card-settings="cardSettings"
      :selected-federal-state="selectedFederalState"
      :available-federal-states="availableFederalStates"
      :filtered-items-count="filteredLocationsItems.length"
      @update:federal-state="selectedFederalState = $event"
    >
      <UiMoleculeLocationItem
        v-for="location in filteredLocationsItems"
        :key="location.slug"
        :item="location"
        :on-book="() => handleBookClick(location)"
      />
    </UiOrganismLocationsCard>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";
import type { BlockLocationTeasersDto } from "~/lib/strapi/dto/components";
import type { LocationDto } from "~/lib/strapi/dto/collections";
import { computed, ref } from "vue";

const props = defineProps<BlockLocationTeasersDto>();

const { t } = useI18n();

const dialog = useDialog();

const handleBookClick = (location: LocationDto) => {
  dialog.open(
    defineAsyncComponent(
      () => import("~/components/ui/organism/CalendlyDialog.vue"),
    ),
    {
      data: {
        url: location.calendlyUrl,
      },
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
};

const selectedFederalState = ref<string | null>(null);

const availableFederalStates = computed(() => {
  if (!props.locations) return [];

  const states = new Set<string>();
  props.locations.forEach((location) => {
    if (location.city?.federalState) {
      states.add(location.city.federalState);
    }
  });

  return Array.from(states).sort();
});

const filteredLocationsItems = computed(() => {
  if (!props.locations) return [];

  if (!selectedFederalState.value) {
    return props.locations;
  }

  return props.locations.filter(
    (location) => location.city?.federalState === selectedFederalState.value,
  );
});
</script>
