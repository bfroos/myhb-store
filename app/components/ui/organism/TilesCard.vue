<template>
  <UiLayoutCardSurface :card-settings="cardSettings">
    <div v-if="hasRenderableSlot(slots.header)" class="tilesCard__header">
      <slot name="header" />
    </div>
    <div class="tilesCard__body">
      <UiOrganismHorizontalScroll
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

const props = defineProps<{
  cardSettings?: CardSettingsDto;
}>();

const slots = useSlots();
</script>
<style scoped>
.tilesCard__header {
  padding: var(--space-card-pad) var(--space-card-pad) 0;
}
.tilesCard__body {
  padding: 0;
}
.tilesCard__body :deep(.horizontalScroll__container) {
  scroll-padding-left: var(--space-card-pad);
  scroll-padding-right: var(--space-card-pad);
}
.tilesCard__body :deep(.horizontalScroll__container > *) {
  flex: 0 0 260px;
}
</style>
