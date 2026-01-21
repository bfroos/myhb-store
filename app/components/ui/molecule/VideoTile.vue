<template>
  <div class="videoTile" :class="{ 'videoTile--playing': isPlaying }">
    <video
      class="videoTile__video"
      ref="videoRef"
      :src="videoUrl"
      :aria-label="`${title} - ${subtitle}`"
      :title="`${title} - ${subtitle}`"
      :controls="isPlaying"
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
      <div class="videoTile__overlayIcon">
        <span aria-hidden="true">
          <IconPlayerPlayFilled size="24" />
        </span>
      </div>
    </button>
  </div>
</template>
<script setup lang="ts">
import { IconPlayerPlayFilled } from "@tabler/icons-vue";

const props = defineProps<{
  title?: string;
  subtitle?: string;
  video: string;
  isActive?: boolean;
}>();

const emit = defineEmits<{
  play: [];
  pause: [];
}>();

const isPlaying = ref(false);

const videoUrl = computed(() => `${props.video ?? ""}`);

const videoRef = ref<HTMLVideoElement | null>(null);

const handlePlay = () => {
  isPlaying.value = true;
  emit("play");
};

const handlePause = () => {
  isPlaying.value = false;
  emit("pause");
};

onMounted(() => {
  const video = videoRef.value;
  if (video) {
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
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
  }
);

const playVideo = async () => {
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

.videoTile__video {
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

.videoTile__overlayIcon {
  z-index: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-black);
  border-radius: 50%;
  color: var(--color-white);
}

.videoTile__overlay:hover .videoTile__overlayIcon {
  transform: translate(-50%, -50%) scale(1.1);
  transition: transform 0.1s ease-in-out;
}

.videoTile--playing .videoTile__overlay {
  display: none;
}
</style>
