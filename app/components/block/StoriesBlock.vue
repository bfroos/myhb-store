<template>
  <UiLayoutSectionBlock v-if="stories && stories.length > 0">
    <UiOrganismTilesCard :card-settings="cardSettings">
      <template #header>
        <h2 v-if="headline">{{ headline }}</h2>
      </template>
      <UiMoleculeVideoTile
        v-for="story in stories"
        :key="story.id"
        :ref="(el) => setVideoRef(story.id, el)"
        :title="story.title"
        :subtitle="story.subtitle"
        :video="story.video.url"
        :is-active="activeVideoId === story.id"
        @play="handleVideoPlay(story.id)"
      />
    </UiOrganismTilesCard>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockStoriesDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockStoriesDto>();

const activeVideoId = ref<string | number | null>(null);
const videoRefs = ref<Map<string | number, { pause: () => void }>>(new Map());

const setVideoRef = (storyId: string | number, el: any) => {
  if (el) {
    videoRefs.value.set(storyId, el);
  }
};

const handleVideoPlay = (videoId: string | number) => {
  // First set the active video, so the new video gets isActive = true
  // and is not paused by the watcher in VideoTile
  activeVideoId.value = videoId;

  // Then pause all other videos
  nextTick(() => {
    videoRefs.value.forEach((video, id) => {
      if (id !== videoId && video && typeof video.pause === "function") {
        video.pause();
      }
    });
  });
};
</script>
