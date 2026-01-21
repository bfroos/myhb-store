<template>
  <UiLayoutCardSurface :card-settings="cardSettings">
    <div class="locationsCard__header">
      <h2>{{ headline }}</h2>
      <div
        v-if="
          showFilters &&
          availableFederalStates &&
          availableFederalStates.length > 0
        "
        class="locationsCard__filter"
      >
        <Select
          v-model="selectedState"
          :options="federalStateOptions"
          option-label="label"
          option-value="value"
          :placeholder="$t('blocks.locationTeasers.filter.placeholder')"
          size="small"
          class="locationsCard__filter-select"
          :aria-label="$t('blocks.locationTeasers.filter.label')"
        />
      </div>
    </div>
    <div class="locationsCard__body">
      <UiOrganismHorizontalScroll
        :key="`locations-scroll-${filteredItemsCount}-${selectedFederalState}`"
        :style="{
          '--horizontalScroll-padding-x': 'var(--space-card-pad)',
          '--horizontalScroll-padding-y': 'var(--space-card-pad)',
        }"
      >
        <slot />
      </UiOrganismHorizontalScroll>
    </div>
  </UiLayoutCardSurface>
</template>
<script setup lang="ts">
import type { CardSettingsDto } from "~/lib/strapi/dto/components";
import { computed } from "vue";
import Select from "primevue/select";

const props = defineProps<{
  headline?: string;
  cardSettings?: CardSettingsDto;
  selectedFederalState?: string | null;
  availableFederalStates?: string[];
  filteredItemsCount?: number;
  showFilters?: boolean;
}>();

const emit = defineEmits<{
  "update:federal-state": [value: string | null];
}>();

const federalStateLabels: Record<string, string> = {
  "baden-wuerttemberg": $t("common.federalState.baden-wuerttemberg"),
  bavaria: $t("common.federalState.bavaria"),
  berlin: $t("common.federalState.berlin"),
  brandenburg: $t("common.federalState.brandenburg"),
  bremen: $t("common.federalState.bremen"),
  hamburg: $t("common.federalState.hamburg"),
  hesse: $t("common.federalState.hesse"),
  "mecklenburg-western-pomerania": $t(
    "common.federalState.mecklenburg-western-pomerania"
  ),
  "lower-saxony": $t("common.federalState.lower-saxony"),
  "north-rhine-westphalia": $t("common.federalState.north-rhine-westphalia"),
  "rhineland-palatinate": $t("common.federalState.rhineland-palatinate"),
  saarland: $t("common.federalState.saarland"),
  saxony: $t("common.federalState.saxony"),
  "saxony-anhalt": $t("common.federalState.saxony-anhalt"),
  "schleswig-holstein": $t("common.federalState.schleswig-holstein"),
  thuringia: $t("common.federalState.thuringia"),
};

const federalStateOptions = computed(() => {
  const options: Array<{ label: string; value: string | null }> = [
    { label: $t("blocks.locationTeasers.filter.all"), value: null },
  ];

  if (props.availableFederalStates) {
    props.availableFederalStates.forEach((state) => {
      options.push({
        label: federalStateLabels[state] || state,
        value: state as string,
      });
    });
  }

  return options;
});

const selectedState = computed({
  get: () => props.selectedFederalState ?? null,
  set: (value: string | null) => {
    emit("update:federal-state", value);
  },
});
</script>
<style scoped>
.locationsCard__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-600);
  column-gap: var(--space-800);
  padding: var(--space-card-pad) var(--space-card-pad) 0;
}

.locationsCard__filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-300);
}

.locationsCard__filter-label {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text);
  white-space: nowrap;
}

.locationsCard__filter-select {
  min-width: 200px;
}

.locationsCard__body {
  padding: 0;
}
.locationsCard__body :deep(.horizontalScroll__container) {
  scroll-padding-left: var(--space-card-pad);
  scroll-padding-right: var(--space-card-pad);
}
.locationsCard__body :deep(.horizontalScroll__container > *) {
  flex: 0 0 280px;
}

@media screen and (min-width: 900px) {
  .locationsCard__body :deep(.horizontalScroll__container > *) {
    flex: 0 0 330px;
  }
}
</style>
