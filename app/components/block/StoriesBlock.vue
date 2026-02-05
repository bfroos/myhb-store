<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <div class="stories">
      <UiOrganismTilesCard :card-settings="cardSettings">
        <template #header>
          <h2 v-if="headline" class="stories__heading">{{ headline }}</h2>
        </template>
        <UiMoleculeVideoTile
          v-for="story in validStories"
          :key="story.id"
          :ref="(el) => setVideoRef(story.id, el)"
          :title="story.title"
          :subtitle="story.subtitle"
          :video="getVideoUrl(story)"
          :is-active="activeVideoId === story.id"
          @play="handleVideoPlay(story.id)"
        />
      </UiOrganismTilesCard>
    </div>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockStoriesDto } from "~/lib/strapi/dto/components";
import type { StoryDto } from "~/lib/strapi/dto/collections";

const props = defineProps<BlockStoriesDto>();

const activeVideoId = ref<string | number | null>(null);
const videoRefs = ref<Map<string | number, { pause: () => void }>>(new Map());

const hasContent = computed(() => (props.stories?.length ?? 0) > 0);

const validStories = computed(() =>
  (props.stories ?? []).filter((s) => s.video?.url),
);

function getVideoUrl(story: StoryDto): string {
  return story.video?.url ?? "";
}

function setVideoRef(storyId: string | number, el: unknown): void {
  const instance = el as { pause?: () => void } | null;
  if (instance?.pause) {
    videoRefs.value.set(storyId, { pause: instance.pause });
  } else {
    videoRefs.value.delete(storyId);
  }
}

function handleVideoPlay(videoId: string | number): void {
  activeVideoId.value = videoId;

  nextTick(() => {
    videoRefs.value.forEach((video, id) => {
      if (id !== videoId && video?.pause) {
        video.pause();
      }
    });
  });
}
</script>

<style scoped>
.stories__heading {
  margin: 0;
}
</style>
