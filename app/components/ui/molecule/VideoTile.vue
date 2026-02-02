<template>
  <div class="videoTile" :class="{ 'videoTile--playing': isPlaying }">
    <video
      v-if="isVideoLoaded"
      class="videoTile__video"
      ref="videoRef"
      :src="videoUrl"
      :poster="posterUrl"
      :aria-label="`${title} - ${subtitle}`"
      :controls="isPlaying"
    />
    <img
      v-else
      class="videoTile__poster"
      :src="posterUrl"
      :alt="`${title} - ${subtitle}`"
      loading="lazy"
    />
    <button
      v-if="!isPlaying"
      class="videoTile__overlay"
      type="button"
      :aria-label="`Video abspielen: ${title} - ${subtitle}`"
      @click="playVideo"
    >
      <div class="videoTile__overlayContent">
        <h3 v-if="title">{{ title }}</h3>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div class="videoTile__cta theme-light">
        <UiAtomBaseButton @click="playVideo" size="sm">
          <template #prefix>
            <IconPlayerPlay />
          </template>
          {{ $t("cta.watch") }}
        </UiAtomBaseButton>
      </div>
    </button>
  </div>
</template>
<script setup lang="ts">
import { IconPlayerPlay } from "@tabler/icons-vue";
import { buildVideoPosterUrl } from "~/utils/media";

const props = defineProps<{
  title?: string;
  subtitle?: string;
  video: string;
  poster?: string;
  isActive?: boolean;
}>();

const emit = defineEmits<{
  play: [];
  pause: [];
}>();

const isPlaying = ref(false);
const isVideoLoaded = ref(false);

const videoUrl = computed(() => props.video ?? "");

const posterUrl = computed(() => {
  if (props.poster) return props.poster;
  if (!props.video) return "";
  return buildVideoPosterUrl(props.video);
});

const videoRef = ref<HTMLVideoElement | null>(null);

const handlePlay = () => {
  isPlaying.value = true;
  emit("play");
};

const handlePause = () => {
  isPlaying.value = false;
  emit("pause");
};

watch(videoRef, (newVideo, oldVideo) => {
  if (oldVideo) {
    oldVideo.removeEventListener("play", handlePlay);
    oldVideo.removeEventListener("pause", handlePause);
  }
  if (newVideo) {
    newVideo.addEventListener("play", handlePlay);
    newVideo.addEventListener("pause", handlePause);
  }
});

onUnmounted(() => {
  const video = videoRef.value;
  if (video) {
    video.removeEventListener("play", handlePlay);
    video.removeEventListener("pause", handlePause);
  }
});

defineExpose({
  pause: () => {
    if (videoRef.value && isPlaying.value) {
      videoRef.value.pause();
    }
  },
});

watch(
  () => props.isActive,
  (newValue) => {
    if (!newValue && isPlaying.value && videoRef.value) {
      videoRef.value.pause();
    }
  },
);

const playVideo = async () => {
  if (!isVideoLoaded.value) {
    isVideoLoaded.value = true;
    await nextTick();
  }

  if (videoRef.value) {
    try {
      await videoRef.value.play();
    } catch (error) {
      console.error("Fehler beim Abspielen des Videos:", error);
    }
  }
};
</script>
<style scoped>
.videoTile {
  position: relative;
  display: flex;
  flex-direction: column;
  aspect-ratio: 3 / 5;
  border-radius: var(--border-radius-500);
  overflow: hidden;
}

.videoTile__video,
.videoTile__poster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.videoTile__overlay,
.videoTile__overlayContent,
.videoTile__overlay::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.videoTile__overlay {
  display: block;
  z-index: 1;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.videoTile__overlay:focus-visible {
  outline: 2px solid var(--color-white);
  outline-offset: -2px;
}

.videoTile__overlayContent {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  padding: var(--space-500);
  color: var(--color-white);
}

.videoTile__overlayContent h3 {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
}

.videoTile__overlayContent p {
  margin: var(--space-200) 0 0 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.videoTile__overlay::before {
  content: "";
  mask: linear-gradient(black 0%, black 20%, transparent 30%);
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.75) 0%,
    transparent 20%
  );
  backdrop-filter: blur(8px);
  pointer-events: auto;
}

.videoTile__cta {
  z-index: 1;
  position: absolute;
  left: 50%;
  bottom: var(--space-400);
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none !important;
}

.videoTile--playing .videoTile__overlay {
  display: none;
}
</style>
