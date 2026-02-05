<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="steps">
        <header class="steps__header">
          <h2 v-if="headline" class="steps__heading">{{ headline }}</h2>
          <div v-if="hasContentBlocks" class="steps__intro">
            <UiLayoutRichText :blocks="content!" />
          </div>
          <div v-if="hasLinks" class="steps__links">
            <UiMoleculeButtonGroup>
              <SharedButton
                v-for="link in links"
                :key="link.id"
                :button="link"
              />
            </UiMoleculeButtonGroup>
          </div>
        </header>
        <ol v-if="hasSteps" class="steps__list" role="list">
          <li
            v-for="(step, index) in steps"
            :key="step.heading ?? index"
            class="steps__item"
          >
            <figure class="steps__figure">
              <UiAtomMediaPicture
                v-if="step.image && isMediaImage(step.image)"
                :media="step.image"
                :sources="imageSources"
                class="steps__image"
              />
              <span class="steps__badge" aria-hidden="true">
                {{ index + 1 }}
              </span>
            </figure>
            <div class="steps__body">
              <h3 v-if="step.heading" class="steps__title">
                {{ step.heading }}
              </h3>
              <p v-if="step.text" class="steps__text">{{ step.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";
import type { BlockProcessStepsDto } from "~/lib/strapi/dto/components";
import { isMediaImage } from "~/utils/media";

const props = defineProps<BlockProcessStepsDto>();

const imageSources = {
  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
};

const hasContent = computed(
  () =>
    !!props.headline ||
    (props.content?.length ?? 0) > 0 ||
    (props.links?.length ?? 0) > 0 ||
    (props.steps?.length ?? 0) > 0,
);

const hasContentBlocks = computed(() => (props.content?.length ?? 0) > 0);

const hasLinks = computed(() => (props.links?.length ?? 0) > 0);

const hasSteps = computed(() => (props.steps?.length ?? 0) > 0);
</script>

<style scoped>
.steps {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.steps__header {
  padding: var(--space-card-pad);
  background-color: var(--color-gray-200);
  border-radius: var(--border-radius-card) var(--border-radius-card) 0 0;
}

.steps__heading {
  font-size: var(--font-xl);
  line-height: var(--line-xl);
  margin: 0 0 var(--space-600);
}

.steps__intro {
  margin-bottom: var(--space-600);
}

.steps__intro:last-child {
  margin-bottom: 0;
}

.steps__links {
  margin-top: var(--space-600);
}

.steps__list {
  counter-reset: none;
  list-style: none;
  padding: 0;
  margin: 0;
}

.steps__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
  padding: var(--space-card-pad);
  border-top: 1px solid var(--color-border-mute);
}

.steps__figure {
  position: relative;
  margin: var(--space-400);
}

.steps__image {
  display: block;
  width: 100%;
  aspect-ratio: 5 / 3;
  border-radius: var(--border-radius-500);
}

.steps__image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: inherit;
}

.steps__badge {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  transform: translate(-50%, -50%);
  background-color: var(--color-black);
  color: var(--color-white);
  font-weight: 600;
  font-size: var(--font-sm);
  border-radius: 50%;
}

.steps__title {
  margin: 0 0 var(--space-200);
}

.steps__text {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

@media (min-width: 900px) {
  .steps {
    flex-direction: row;
  }

  .steps__header {
    flex: 1 1 33%;
    border-radius: var(--border-radius-card) 0 0 var(--border-radius-card);
  }

  .steps__list {
    flex: 2 1 67%;
  }

  .steps__item {
    flex-direction: row;
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: var(--space-600);
    align-items: center;
  }

  .steps__image :deep(img),
  .steps__image {
    aspect-ratio: 5 / 4;
  }
}
</style>
