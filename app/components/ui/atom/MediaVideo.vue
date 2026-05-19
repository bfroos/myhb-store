<template>
  <video
    class="mediaVideo"
    :src="videoSrc"
    :poster="posterSrc"
    :playsinline="normalizedVideoSettings?.playsInline"
    :autoplay="normalizedVideoSettings?.autoplay"
    :muted="!!normalizedVideoSettings?.autoplay"
    :loop="!!normalizedVideoSettings?.autoplay"
    :controls="!normalizedVideoSettings?.autoplay"
    :preload="videoPreloadAttr"
    @mouseenter="maybeEnableMetadataPreload"
    @focus="maybeEnableMetadataPreload"
    @error="onVideoError"
  />
</template>
<script setup lang="ts">
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import type { SharedVideoSettingsDto } from "~/lib/strapi/dto/components";
import {
  buildVideoPosterUrl,
  buildTransformedVideoUrl,
  getMediaZoneOrigin,
} from "~/utils/media";

const props = defineProps<{
  media: StrapiMedia;
  videoSettings?: SharedVideoSettingsDto;
}>();

const normalizedVideoSettings = computed<SharedVideoSettingsDto | undefined>(
  () => {
    const v = props.videoSettings as any;
    if (!v) return undefined;
    return Array.isArray(v) ? v[0] : v;
  },
);

// Track whether we should bypass Cloudflare media transformations and fall back to the original URL.
const forceOriginal = ref(false);

const hasAutoplay = computed<boolean>(
  () => !!normalizedVideoSettings.value?.autoplay,
);

const originalVideoUrl = computed(() => props.media?.url ?? "");

const canUseTransformations = computed(() => {
  if (forceOriginal.value) return false;
  const src = originalVideoUrl.value;
  if (!src) return false;
  return !!getMediaZoneOrigin(src);
});

const videoSrc = computed(() => {
  const src = originalVideoUrl.value;
  if (!src) return "";
  
  let finalSrc = src;
  if (canUseTransformations.value) {
    finalSrc = buildTransformedVideoUrl(src, { audio: !hasAutoplay.value });
  }
  
  // iOS Safari: Add #t=1 fragment to show frame at 1 second as poster fallback
  // This is a native browser feature that works without JavaScript
  if (finalSrc && !finalSrc.includes('#t=')) {
    return `${finalSrc}#t=1`;
  }
  
  return finalSrc;
});

const posterSrc = computed<string | undefined>(() => {
  const src = originalVideoUrl.value;
  if (!src) return undefined;
  if (!canUseTransformations.value) return undefined;

  return buildVideoPosterUrl(src);
});

function onVideoError() {
  // If the transformed video/poster fails (e.g. transformations disabled), fall back to the original URL.
  if (!forceOriginal.value) {
    forceOriginal.value = true;
  }
}

const videoPreloadAttr = computed<"none" | "metadata" | "auto">(() => {
  const vs = normalizedVideoSettings.value;

  if (vs?.autoplay) return "auto";

  // Always load metadata so the browser shows the first frame as preview.
  // Previously a Cloudflare poster frame was used, but Media Transformations
  // are not activated — so metadata preload is the next best thing.
  return "metadata";
});

function maybeEnableMetadataPreload(_event: Event) {
  // No-op: preload=metadata is always set now, nothing to do on hover.
}
</script>
<style scoped>
.mediaVideo {
  object-fit: contain;
  background: var(--color-black);
}

.mediaVideo:fullscreen,
.mediaVideo:-webkit-full-screen,
.mediaVideo:-moz-full-screen,
.mediaVideo:-ms-fullscreen {
  object-fit: contain;
  background: var(--color-black);
}
</style>
