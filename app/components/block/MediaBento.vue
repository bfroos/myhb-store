<template>
  <UiLayoutSectionBlock v-if="showBlock">
    <UiOrganismMediaBento
      :card-settings="cardSettings"
      :layout="layout ?? MediaBentoLayout.MEDIA_LEFT"
      :media-item-alignment="
        mediaItemAlignment ?? MediaBentoMediaItemAlignment.HORIZONTAL
      "
    >
      <template v-if="mediaItems && mediaItems.length > 0" #firstMedia>
        <UiAtomMediaPicture
          v-if="mediaItems[0] && isMediaImage(mediaItems[0])"
          :media="mediaItems[0]"
          :sources="{
            [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
            [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
          }"
          class="mediaBentoBlock__image"
        />
        <UiAtomMediaVideo
          v-else-if="mediaItems[0] && isMediaVideo(mediaItems[0])"
          :media="mediaItems[0]"
          :video-settings="videoSettings"
        />
      </template>
      <template #headline>
        <h2 v-if="headline" class="mediaBento__headline">{{ headline }}</h2>
      </template>
      <template #intro>
        <p v-if="intro" class="mediaBento__intro">{{ intro }}</p>
      </template>
      <template #content>
        <div v-if="content && content.length > 0" class="mediaBento__content">
          <UiLayoutRichText :blocks="content ?? []" />
        </div>
      </template>
      <template #links>
        <div v-if="links && links.length > 0" class="mediaBento__links">
          <UiMoleculeButtonGroup>
            <SharedButton v-for="link in links" :key="link.id" :button="link" />
          </UiMoleculeButtonGroup>
        </div>
        <div v-if="showReviewsBadge" class="mediaBento__globalReviewsBadge">
          <UiMoleculeReviewsBadge
            show-text
            :source="ReviewSource.GOOGLE"
            :rating="5"
          />
        </div>
      </template>
      <template
        v-if="
          mediaItems && mediaItems.length > 1 && mediaItems[1] && mediaItems[1]
        "
        #secondMedia
      >
        <UiAtomMediaPicture
          v-if="mediaItems[1] && isMediaImage(mediaItems[1])"
          :media="mediaItems[1]"
          :sources="{
            [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
            [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
          }"
          class="mediaBentoBlock__image"
        />
        <UiAtomMediaVideo
          v-else-if="mediaItems[1] && isMediaVideo(mediaItems[1])"
          :media="mediaItems[1]"
          :video-settings="videoSettings"
        />
      </template>
    </UiOrganismMediaBento>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  MediaBentoLayout,
  ImageFormat,
  ImageBreakpoint,
  MediaBentoMediaItemAlignment,
  ReviewSource,
} from "~/lib/strapi/dto/enums";
import type { BlockMediaBentoDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockMediaBentoDto>();

const showBlock = computed(() => {
  return (
    (props.mediaItems && props.mediaItems.length > 0) ||
    props.headline ||
    props.intro ||
    props.content
  );
});
</script>

<style scoped>
.mediaBentoBlock__image {
  display: block;
}

.mediaBento__headline {
  margin: 0 0 var(--space-600);
}
.mediaBento__intro {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  padding: 0 0 var(--space-600);
  margin: 0 0 var(--space-600);
  border-bottom: 1px solid var(--color-border-mute);
}

.mediaBento__content {
  color: var(--color-text-light);
}

.mediaBento__links,
.mediaBento__globalReviewsBadge {
  margin-top: var(--space-600);
}

@media screen and (min-width: 900px) {
  .mediaBentoBlock__image :deep(img:last-child) {
    display: block;
  }
  .mediaBentoBlock__image :deep(img:first-child) {
    display: none;
  }
}
</style>
