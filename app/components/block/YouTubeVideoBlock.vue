<template>
  <UiLayoutSectionBlock v-if="hasVideo">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <section class="youTubeVideoBlock">
        <header v-if="headline || intro" class="youTubeVideoBlock__header">
          <h2 v-if="headline" class="youTubeVideoBlock__heading">
            {{ headline }}
          </h2>
          <p v-if="intro" class="youTubeVideoBlock__intro">{{ intro }}</p>
        </header>
        <UiAtomYouTubeEmbed
          :video-url="videoUrl"
          :poster="poster"
          :title="headline"
          :aspect-ratio="aspectRatio"
        />
      </section>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockYoutubeVideoDto } from "~/lib/strapi/dto/components";
import { parseYouTubeUrl } from "~/utils/youtube";

const props = defineProps<BlockYoutubeVideoDto>();

const hasVideo = computed(() => !!parseYouTubeUrl(props.videoUrl));
</script>

<style scoped>
.youTubeVideoBlock {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--space-card-pad);
}

.youTubeVideoBlock__header {
  margin-bottom: var(--space-600);
}

.youTubeVideoBlock__heading {
  margin: 0;
  font-size: var(--font-4xl);
  line-height: var(--line-4xl);
}

.youTubeVideoBlock__intro {
  margin: var(--space-300) 0 0;
  font-size: var(--font-lg);
  line-height: var(--line-lg);
}
</style>
