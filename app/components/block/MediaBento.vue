<template>
  <UiLayoutSectionBlock v-if="showBlock">
    <UiOrganismMediaBento
      :card-settings="cardSettings"
      :layout="effectiveLayout"
      :media-item-alignment="effectiveAlignment"
    >
      <template v-if="firstMedia" #firstMedia>
        <UiAtomMediaPicture
          v-if="isMediaImage(firstMedia)"
          :media="firstMedia"
          :sources="imageSources"
          class="bento__image"
        />
        <UiAtomMediaVideo
          v-else-if="isMediaVideo(firstMedia)"
          :media="firstMedia"
          :video-settings="videoSettings"
        />
      </template>
      <template #headline>
        <h2 v-if="headline" class="bento__headline">{{ headline }}</h2>
      </template>
      <template #intro>
        <p v-if="intro" class="bento__intro">{{ intro }}</p>
      </template>
      <template #content>
        <div v-if="hasContent" class="bento__content">
          <UiLayoutRichText :blocks="content ?? []" />
        </div>
      </template>
      <template #links>
        <div v-if="hasLinks" class="bento__links">
          <UiMoleculeButtonGroup>
            <SharedButton v-for="link in links" :key="link.id" :button="link" />
          </UiMoleculeButtonGroup>
        </div>
        <UiMoleculeReviewsBadge
          v-if="showReviewsBadge"
          :source="ReviewSource.GOOGLE"
          :rating="5"
          class="bento__reviews"
        />
      </template>
      <template v-if="secondMedia" #secondMedia>
        <UiAtomMediaPicture
          v-if="isMediaImage(secondMedia)"
          :media="secondMedia"
          :sources="imageSources"
          class="bento__image"
        />
        <UiAtomMediaVideo
          v-else-if="isMediaVideo(secondMedia)"
          :media="secondMedia"
          :video-settings="videoSettings"
        />
      </template>
    </UiOrganismMediaBento>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import {
  MediaBentoLayout,
  ImageFormat,
  ImageBreakpoint,
  MediaBentoMediaItemAlignment,
  ReviewSource,
} from "~/lib/strapi/dto/enums";
import type { BlockMediaBentoDto } from "~/lib/strapi/dto/components";
import { isMediaImage, isMediaVideo } from "~/utils/media";

const props = defineProps<BlockMediaBentoDto>();

const effectiveLayout = computed(
  () => props.layout ?? MediaBentoLayout.MEDIA_LEFT,
);

const effectiveAlignment = computed(
  () => props.mediaItemAlignment ?? MediaBentoMediaItemAlignment.HORIZONTAL,
);

const firstMedia = computed(() => props.mediaItems?.[0] ?? null);

const secondMedia = computed(() => props.mediaItems?.[1] ?? null);

const hasContent = computed(() => (props.content?.length ?? 0) > 0);

const hasLinks = computed(() => (props.links?.length ?? 0) > 0);

const showBlock = computed(
  () =>
    (props.mediaItems?.length ?? 0) > 0 ||
    !!props.headline ||
    !!props.intro ||
    (props.content?.length ?? 0) > 0,
);

const imageSources = {
  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
};
</script>

<style scoped>
.bento__image {
  display: block;
}

.bento__headline {
  margin: 0 0 var(--space-600);
}

.bento__intro {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  margin: 0 0 var(--space-600);
  padding-bottom: var(--space-600);
  border-bottom: 1px solid var(--color-border-mute);
}

.bento__content {
  color: var(--color-text-light);
}

.bento__links,
.bento__reviews {
  margin-top: var(--space-600);
}

@media (min-width: 900px) {
  .bento__image :deep(img:last-child) {
    display: block;
  }
  .bento__image :deep(img:first-child) {
    display: none;
  }
}
</style>
