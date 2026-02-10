<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiOrganismMediaCard
      :card-settings="cardSettings"
      :layout="layout"
      :fixed-image-aspect-ratio="fixedImageAspectRatio"
      :content-alignment="contentAlignment"
      :media-alignment="mediaAlignment"
      :media-caption="mediaCaption"
      :caption-title="captionTitle"
      :caption-description="captionDescription"
      :is-media-video="hasVideo"
    >
      <template #headline>
        <h2 v-if="headline" class="mediaCard__heading">{{ headline }}</h2>
      </template>
      <template #intro>
        <p v-if="intro" class="mediaCard__intro">{{ intro }}</p>
      </template>
      <template #content>
        <div v-if="hasContentBlocks" class="mediaCard__content">
          <UiLayoutRichText :blocks="content!" />
        </div>
      </template>
      <template #media>
        <UiAtomMediaPicture
          v-if="hasImage"
          :media="media!"
          :sources="imageSources"
          class="mediaCard__image"
        />
        <UiAtomMediaVideo
          v-else-if="hasVideo"
          :media="media!"
          :video-settings="videoSettings"
        />
      </template>
      <template #links>
        <div v-if="hasLinks" class="mediaCard__links">
          <UiMoleculeButtonGroup>
            <SharedButton v-for="link in links" :key="link.id" :button="link" />
          </UiMoleculeButtonGroup>
        </div>
      </template>
    </UiOrganismMediaCard>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";
import type { BlockMediaCardDto } from "~/lib/strapi/dto/components";
import { isMediaImage, isMediaVideo } from "~/utils/media";

const props = defineProps<BlockMediaCardDto>();

const imageSources = {
  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
};

const hasContent = computed(
  () =>
    !!props.headline ||
    !!props.intro ||
    (props.content?.length ?? 0) > 0 ||
    !!props.media ||
    (props.links?.length ?? 0) > 0,
);

const hasImage = computed(() => !!props.media && isMediaImage(props.media));

const hasVideo = computed(() => !!props.media && isMediaVideo(props.media));

const hasContentBlocks = computed(() => (props.content?.length ?? 0) > 0);

const hasLinks = computed(() => (props.links?.length ?? 0) > 0);
</script>

<style scoped>
.mediaCard__heading {
  margin: 0 0 var(--space-600);
  font-size: var(--font-xl);
  line-height: var(--line-xl);
}

.mediaCard__image {
  aspect-ratio: 3 / 2;
}

.mediaCard__intro {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  margin: 0 0 var(--space-600);
  padding-bottom: var(--space-600);
  border-bottom: 1px solid var(--color-border-mute);
}

.mediaCard__content {
  color: var(--color-text-light);
}

.mediaCard__links {
  margin-top: var(--space-600);
}
</style>
