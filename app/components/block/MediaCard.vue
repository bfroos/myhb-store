<template>
  <UiLayoutSectionBlock>
    <UiOrganismMediaCard
      :card-settings="cardSettings"
      :layout="layout"
      :fixed-image-aspect-ratio="fixedImageAspectRatio"
      :content-alignment="contentAlignment"
      :media-alignment="mediaAlignment"
      :media-caption="mediaCaption"
      :caption-title="captionTitle"
      :caption-description="captionDescription"
      :is-media-video="media && isMediaVideo(media)"
    >
      <template #headline>
        <h2 v-if="headline" class="mediaCard__headline">{{ headline }}</h2>
      </template>
      <template #intro>
        <p v-if="intro" class="mediaCard__intro">{{ intro }}</p>
      </template>
      <template #content>
        <div v-if="content && content.length > 0" class="mediaCard__content">
          <UiLayoutRichText :blocks="content" />
        </div>
      </template>
      <template #media>
        <UiAtomMediaPicture
          v-if="media && isMediaImage(media)"
          :media="media"
          :sources="{
            [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
            [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
          }"
          class="mediaBentoBlock__image"
        />
        <UiAtomMediaVideo
          v-else-if="media && isMediaVideo(media)"
          :media="media"
          :video-settings="videoSettings"
        />
      </template>
      <template #links>
        <div class="mediaCard__links">
          <UiMoleculeButtonGroup v-if="links && links.length > 0">
            <SharedButton v-for="link in links" :key="link.id" :button="link" />
          </UiMoleculeButtonGroup>
        </div>
      </template>
    </UiOrganismMediaCard>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockMediaCardDto } from "~/lib/strapi/dto/components";
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";

const props = defineProps<BlockMediaCardDto>();
</script>
<style scoped>
.mediaCard__headline {
  margin: 0 0 var(--space-600);
}
.mediaCard__intro {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  padding: 0 0 var(--space-600);
  margin: 0 0 var(--space-600);
  border-bottom: 1px solid var(--color-border-mute);
}

.mediaCard__content {
  color: var(--color-text-light);
}

.mediaCard__links {
  margin-top: var(--space-600);
}
</style>
