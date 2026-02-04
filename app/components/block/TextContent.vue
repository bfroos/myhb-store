<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="textContent" :class="classList">
        <h2 v-if="headline">{{ headline }}</h2>
        <div class="textContent__body">
          <p v-if="intro" class="textContent__intro">{{ intro }}</p>
          <div class="textContent__content">
            <UiLayoutRichText :blocks="content" />
          </div>
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

const props = defineProps<BlockTextContentDto>();

const classList = computed(() => {
  return {
    "textContent--columnCount-2": props.columnCount === 2,
    "textContent--withIntro": props.intro,
  };
});
</script>
<style scoped>
.textContent {
  padding: var(--space-card-pad);
}

.textContent > h2 {
  margin-bottom: var(--space-600);
}

.textContent__intro {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  padding: 0 0 var(--space-600);
  margin: 0 0 var(--space-600);
  border-bottom: 1px solid var(--color-border-mute);
}

.textContent--columnCount-2.textContent--withIntro .textContent__content {
  color: var(--color-text-light);
}

@media (min-width: 900px) {
  .textContent--columnCount-2 .textContent__content {
    column-count: 2;
    column-gap: var(--space-1000);
  }

  .textContent--columnCount-2.textContent--withIntro .textContent__body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: var(--space-1000);
  }

  .textContent--columnCount-2.textContent--withIntro .textContent__content {
    column-count: 1;
  }

  .textContent--columnCount-2.textContent--withIntro .textContent__intro {
    border: none;
  }
}
</style>
