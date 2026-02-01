<template>
  <ul class="locationFinderSearchResults">
    <li v-for="location in locations" :key="location.id" class="theme-light">
      <UiMoleculeLocationItem :item="location" main-information="location" />
    </li>
  </ul>
</template>
<script setup lang="ts">
import type { MoleculeLocationItem } from "~/lib/ui/types";

const props = defineProps<{
  locations: MoleculeLocationItem[];
}>();
</script>
<style scoped>
.locationFinderSearchResults {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.locationFinderSearchResults > li {
  border-radius: var(--border-radius-400);
}
</style>
