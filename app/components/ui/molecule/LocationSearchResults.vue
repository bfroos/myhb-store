<template>
  <ul v-if="hasItems" class="results" role="list">
    <li
      v-for="location in locations"
      :key="location.id"
      class="results__item theme-light"
    >
      <UiMoleculeLocationItem
        :item="location"
        main-information="location"
        :on-book="onBook ? () => onBook!(location) : undefined"
        :on-before-navigate="onNavigate"
        v-bind="locationItemProps"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { MoleculeLocationItem } from "~/lib/ui/types";

const props = defineProps<{
  locations: MoleculeLocationItem[];
  locationItemProps?: Partial<MoleculeLocationItem>;
  onBook?: (location: MoleculeLocationItem) => void;
  onNavigate?: () => void;
}>();

const hasItems = computed(() => (props.locations?.length ?? 0) > 0);
</script>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  list-style: none;
  padding: 0;
  margin: 0;
}

.results__item {
  border-radius: var(--border-radius-400);
}
</style>
