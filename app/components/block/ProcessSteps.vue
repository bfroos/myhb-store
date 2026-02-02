<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <article class="processSteps">
        <header class="processSteps__header">
          <h2 v-if="headline">{{ headline }}</h2>
          <UiLayoutRichText
            v-if="content && content.length > 0"
            :blocks="content"
          />
          <UiMoleculeButtonGroup v-if="links && links.length > 0">
            <SharedButton v-for="link in links" :key="link.id" :button="link" />
          </UiMoleculeButtonGroup>
        </header>
        <ol v-if="steps && steps.length > 0" class="processSteps__items">
          <li
            v-for="step in steps"
            :key="step.heading"
            class="processSteps__item"
          >
            <div class="processSteps__itemImage">
              <UiAtomMediaPicture
                v-if="step.image && isMediaImage(step.image)"
                :media="step.image"
                :sources="{
                  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
                }"
              />
            </div>
            <div>
              <h3>{{ step.heading }}</h3>
              <p>{{ step.text }}</p>
            </div>
          </li>
        </ol>
      </article>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockProcessStepsDto } from "~/lib/strapi/dto/components";
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";

const props = defineProps<BlockProcessStepsDto>();
</script>
<style scoped>
.processSteps {
  display: flex;
  flex-direction: column;
}

.processSteps__header {
  padding: var(--space-card-pad);
  background-color: var(--color-gray-200);
  border-radius: var(--border-radius-card) var(--border-radius-card) 0 0;
}

.processSteps__header h2 {
  font-size: var(--font-xl);
  line-height: var(--line-xl);
  margin-bottom: var(--space-600);
}

.processSteps__itemImage {
  position: relative;
}

.processSteps__items {
  counter-reset: step;
  list-style: none;
  padding: 0;
  margin: 0;
}

.processSteps__item {
  border-top: 1px solid var(--color-border-mute);
  padding: var(--space-card-pad);
  counter-increment: step;
}

.processSteps__item :deep(picture) img {
  aspect-ratio: 5 / 3;
  width: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: var(--border-radius-500);
}

.processSteps__itemImage {
  margin: var(--space-400);
}

.processSteps__itemImage::before {
  content: counter(step, decimal);
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  background-color: var(--color-black);
  color: var(--color-white);
  border-radius: 50%;
}

.processSteps__item h3 {
  margin: 0 0 var(--space-200);
}

.processSteps__item p {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

@media screen and (min-width: 900px) {
  .processSteps__header {
    border-radius: var(--border-radius-card) 0 0 var(--border-radius-card);
  }

  .processSteps {
    flex-direction: row;
  }

  .processSteps__header {
    flex: 1;
  }

  .processSteps__items {
    flex: 2;
  }

  .processSteps__item {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: var(--space-600);
    align-items: center;
  }

  .processSteps__item :deep(picture) img {
    aspect-ratio: 5 / 4;
  }
}
</style>
