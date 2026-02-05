<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <article
        class="textContent"
        :class="{
          'textContent--columns-2': columnCount === 2,
          'textContent--hasIntro': hasIntro,
        }"
      >
        <header v-if="headline" class="textContent__header">
          <h2 class="textContent__heading">{{ headline }}</h2>
        </header>
        <div class="textContent__body">
          <p v-if="intro" class="textContent__intro">{{ intro }}</p>
          <div class="textContent__content">
            <UiLayoutRichText :blocks="content ?? []" />
          </div>
        </div>
        <div v-if="hasLinks" class="textContent__links">
          <UiMoleculeButtonGroup>
            <SharedButton v-for="link in links" :key="link.id" :button="link" />
          </UiMoleculeButtonGroup>
        </div>
      </article>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockTextContentDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockTextContentDto>();

const hasContent = computed(
  () =>
    !!props.headline ||
    !!props.intro ||
    (props.content?.length ?? 0) > 0 ||
    (props.links?.length ?? 0) > 0,
);

const hasIntro = computed(() => !!props.intro);

const hasLinks = computed(() => (props.links?.length ?? 0) > 0);
</script>

<style scoped>
.textContent {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--space-card-pad);
}

.textContent__header {
  margin-bottom: var(--space-600);
}

.textContent__heading {
  margin: 0;
  font-size: var(--font-xl);
  line-height: var(--line-xl);
}

.textContent__intro {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  margin: 0 0 var(--space-600);
  padding-bottom: var(--space-600);
  border-bottom: 1px solid var(--color-border-mute);
}

.textContent__content {
  min-width: 0;
}

.textContent__links {
  margin-top: var(--space-600);
}

.textContent--columns-2.textContent--hasIntro .textContent__content {
  color: var(--color-text-light);
}

@media (min-width: 900px) {
  .textContent--columns-2 .textContent__content {
    column-count: 2;
    column-gap: var(--space-1000);
  }

  .textContent--columns-2.textContent--hasIntro .textContent__body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-1000);
  }

  .textContent--columns-2.textContent--hasIntro .textContent__content {
    column-count: 1;
  }

  .textContent--columns-2.textContent--hasIntro .textContent__intro {
    border-bottom: none;
  }
}
</style>
