<template>
  <div
    class="videoTile"
    :class="{ 'videoTile--playing': isPlaying }"
    ref="tileRef"
  >
    <video
      v-if="isVideoLoaded || showVideoDirectly"
      class="videoTile__video"
      ref="videoRef"
      :src="videoUrl"
      :poster="lazyPosterUrl"
      :aria-label="`${title} - ${subtitle}`"
      :controls="isPlaying"
      :muted="!isPlaying"
      preload="metadata"
    />
    <img
      v-else-if="lazyPosterUrl"
      class="videoTile__poster"
      :src="lazyPosterUrl"
      :alt="`${title} - ${subtitle}`"
    />
    <div
      v-if="!isPlaying"
      class="videoTile__overlay"
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
    </div>
  </div>
</template>
<script setup lang="ts">
import { IconPlayerPlay } from "@tabler/icons-vue";
// buildVideoPosterUrl removed — Cloudflare Media Transformations not active

// Pre-generated poster mapping (loaded on demand)
const videoPosterMapping = ref<Record<string, string>>({});
const mappingLoaded = ref(false);

// Load mapping file from public directory
const loadPosterMapping = async () => {
  if (mappingLoaded.value) return;
  try {
    const response = await fetch('/posters/video-poster-mapping.json');
    if (response.ok) {
      videoPosterMapping.value = await response.json();
      mappingLoaded.value = true;
    }
  } catch (error) {
    console.warn('Could not load video poster mapping:', error);
    mappingLoaded.value = true; // Don't retry
  }
};

const props = defineProps<{
  title?: string;
  subtitle?: string;
  video: string;
  poster?: string;
  isActive?: boolean;
}>();

// Helper to extract video ID from URL
const getVideoIdFromUrl = (url: string): string | null => {
  // Strapi media URLs typically have /uploads/filename_hash_id.ext
  // or contain the file ID in the URL structure
  const match = url.match(/\/(\d+)\//); // Match /123/ pattern
  return match ? match[1] : null;
};

const emit = defineEmits<{
  play: [];
  pause: [];
}>();

const isPlaying = ref(false);
const isVideoLoaded = ref(false);
const isInViewport = ref(false);
const generatedPoster = ref<string>("");

const videoUrl = computed(() => props.video ?? "");

const posterUrl = computed(() => {
  // Priority 1: Explicit poster prop
  if (props.poster) return props.poster;
  
  // Priority 2: Pre-generated poster from build-time script
  const videoId = getVideoIdFromUrl(props.video);
  if (videoId && videoPosterMapping.value[videoId]) {
    return videoPosterMapping.value[videoId];
  }
  
  // Priority 3: Client-generated poster from first frame
  if (generatedPoster.value) return generatedPoster.value;
  
  // buildVideoPosterUrl returns "" when Cloudflare Media Transformations are disabled
  return "";
});

// Lazy poster URL - only set when component enters viewport
const lazyPosterUrl = computed(() =>
  isInViewport.value ? posterUrl.value : "",
);

// If no poster is available, show the video element directly (browser renders first frame)
const showVideoDirectly = computed(() => !posterUrl.value && isInViewport.value && !isPlaying.value);

const videoRef = ref<HTMLVideoElement | null>(null);
const tileRef = ref<HTMLElement | null>(null);

// Generate poster from video frame using Canvas API
const generatePosterFromFirstFrame = () => {
  const video = videoRef.value;
  if (!video || generatedPoster.value || props.poster) return;

  try {
    // Seek to 1 second to avoid black intro frames
    video.currentTime = 1.0;
    
    // Wait for seek to complete, then capture frame
    const captureFrame = () => {
      video.pause();

      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw frame at 1 second onto canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to Data URL (base64 JPEG)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      generatedPoster.value = dataUrl;
      
      // Manually set poster attribute on video element (for reactive update)
      video.poster = dataUrl;
      
      // Reset to start for potential playback
      video.currentTime = 0;
      
      // Remove event listener
      video.removeEventListener('seeked', captureFrame);
    };
    
    // Capture frame after seek completes
    video.addEventListener('seeked', captureFrame, { once: true });
  } catch (error) {
    console.error('Failed to generate poster from video frame:', error);
  }
};

// Native IntersectionObserver for true lazy loading
let observer: IntersectionObserver | null = null;

onMounted(() => {
  // Load poster mapping on mount
  loadPosterMapping();
  
  if (!tileRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        isInViewport.value = true;
        observer?.disconnect();
      }
    },
    { rootMargin: "200px" },
  );

  observer.observe(tileRef.value);
});

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
    oldVideo.removeEventListener("loadeddata", generatePosterFromFirstFrame);
  }
  if (newVideo) {
    newVideo.addEventListener("play", handlePlay);
    newVideo.addEventListener("pause", handlePause);
    // Generate poster when first frame is loaded
    newVideo.addEventListener("loadeddata", generatePosterFromFirstFrame);
    
    // If video already loaded before listener was attached, generate poster now
    if (newVideo.readyState >= 2) {
      // readyState 2 = HAVE_CURRENT_DATA (first frame available)
      generatePosterFromFirstFrame();
    }
  }
});

onUnmounted(() => {
  const video = videoRef.value;
  if (video) {
    video.removeEventListener("play", handlePlay);
    video.removeEventListener("pause", handlePause);
    video.removeEventListener("loadeddata", generatePosterFromFirstFrame);
  }
  observer?.disconnect();
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
  object-position: center;
}

.videoTile__poster {
  object-fit: cover;
}

.videoTile__video {
  object-fit: contain;
  background: var(--color-black);
}

.videoTile__video:fullscreen,
.videoTile__video:-webkit-full-screen,
.videoTile__video:-moz-full-screen,
.videoTile__video:-ms-fullscreen {
  object-fit: contain;
  background: var(--color-black);
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
