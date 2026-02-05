<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiOrganismMediaCard
      :card-settings="cardSettings"
      :layout="OrganismMediaCardLayout.MEDIA_RIGHT"
      :full-height="isSplitLayout"
      :fixed-image-aspect-ratio="fixedImageAspectRatio"
      :is-media-video="hasVideo"
    >
      <template #media>
        <UiAtomMediaPicture
          v-if="hasImage"
          :media="media!"
          :sources="imageSources"
          priority
        />
        <UiAtomMediaVideo
          v-else-if="hasVideo"
          :media="media!"
          :video-settings="videoSettings"
        />
      </template>
      <template #body>
        <header
          class="pageHeader"
          :class="{
            'pageHeader--split': isSplitLayout,
            'pageHeader--noMedia': !hasMedia,
          }"
        >
          <h1 v-if="headline" class="pageHeader__title">{{ headline }}</h1>
          <p v-if="intro" class="pageHeader__intro">{{ intro }}</p>
        </header>
      </template>
    </UiOrganismMediaCard>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import {
  BlockPageHeaderLayout,
  ImageBreakpoint,
  ImageFormat,
} from "~/lib/strapi/dto/enums";
import { OrganismMediaCardLayout } from "~/lib/ui/enums";
import type { BlockPageHeaderDto } from "~/lib/strapi/dto/components";
import { isMediaImage, isMediaVideo } from "~/utils/media";

const props = withDefaults(defineProps<BlockPageHeaderDto>(), {
  layout: () => BlockPageHeaderLayout.COMPACT,
});

const imageSources = {
  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
  [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
};

const hasContent = computed(() => !!props.headline || !!props.intro);

const hasMedia = computed(
  () =>
    !!props.media && (isMediaImage(props.media) || isMediaVideo(props.media)),
);

const hasImage = computed(() => !!props.media && isMediaImage(props.media));

const hasVideo = computed(() => !!props.media && isMediaVideo(props.media));

const isSplitLayout = computed(
  () => props.layout === BlockPageHeaderLayout.SPLIT,
);
</script>

<style scoped>
.pageHeader {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-600);
  height: 100%;
  text-align: center;
}

.pageHeader__title {
  margin: 0;
  font-size: var(--font-5xl);
  line-height: var(--line-5xl);
}

.pageHeader__intro {
  margin: 0;
  color: var(--color-text-light);
}

@media (min-width: 900px) {
  .pageHeader {
    text-align: left;
  }

  .pageHeader--split {
    display: grid;
    gap: var(--space-1200);
  }

  .pageHeader--noMedia.pageHeader--split {
    grid-template-columns: 1fr 1fr;
    row-gap: var(--space-1200);
  }

  .pageHeader__intro {
    display: flex;
    align-items: flex-end;
    height: 100%;
  }
}
</style>
