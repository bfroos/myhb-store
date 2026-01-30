<template>
  <UiLayoutSectionBlock>
    <UiOrganismMediaCard
      :layout="OrganismMediaCardLayout.MEDIA_RIGHT"
      :full-height="layout === BlockPageHeaderLayout.SPLIT"
      :fixed-image-aspect-ratio="fixedImageAspectRatio"
      :is-media-video="media && isMediaVideo(media)"
      :card-settings="cardSettings"
    >
      <template #media>
        <UiAtomMediaPicture
          v-if="media && isMediaImage(media)"
          :media="media"
          :sources="{
            [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
            [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
          }"
        />
        <UiAtomMediaVideo
          v-else-if="media && isMediaVideo(media)"
          :media="media"
          :video-settings="videoSettings"
        />
      </template>
      <template #body>
        <div
          class="pageHeader"
          :class="{
            'pageHeader--split': layout === BlockPageHeaderLayout.SPLIT,
            'pageHeader--withoutImage': !media,
          }"
        >
          <h1 v-if="headline">{{ headline }}</h1>
          <p v-if="intro">{{ intro }}</p>
        </div>
      </template>
    </UiOrganismMediaCard>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockPageHeaderDto } from "~/lib/strapi/dto/components";
import {
  BlockPageHeaderLayout,
  ImageFormat,
  ImageBreakpoint,
} from "~/lib/strapi/dto/enums";
import { OrganismMediaCardLayout } from "~/lib/ui/enums";

const props = defineProps<BlockPageHeaderDto>();
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
.pageHeader h1 {
  font-size: var(--font-5xl);
  line-height: var(--line-5xl);
}
.pageHeader p {
  color: var(--color-text-light);
}

@media screen and (min-width: 900px) {
  .pageHeader {
    text-align: left;
  }

  .pageHeader--split {
    display: grid;
    gap: var(--space-1200);
  }

  .pageHeader--withoutImage.pageHeader--split {
    grid-template-columns: 1fr 1fr;
    row-gap: var(--space-1200);
  }

  .pageHeader p {
    display: flex;
    align-items: flex-end;
    height: 100%;
  }
}
</style>
