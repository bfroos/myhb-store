<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div
        class="textContent"
        :class="{ 'textContent--columnCount-2': columnCount === 2 }"
      >
        <h2 v-if="headline">{{ headline }}</h2>
        <p v-if="intro">{{ intro }}</p>
        <div class="textContent__content">
          <UiLayoutRichText :blocks="content" />
        </div>
        <UiMoleculeButtonGroup v-if="links && links.length > 0">
          <SharedButton v-for="link in links" :key="link.id" :button="link" />
        </UiMoleculeButtonGroup>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockTextContentDto } from "~/lib/strapi/dto/components";

defineProps<BlockTextContentDto>();
</script>
<style scoped>
.textContent {
  padding: var(--space-card-pad);
}
.textContent > h2 {
  margin-bottom: var(--space-600);
}

@media (min-width: 900px) {
  .textContent--columnCount-2 .textContent__content {
    column-count: 2;
    column-gap: var(--space-1000);
  }
}
</style>
