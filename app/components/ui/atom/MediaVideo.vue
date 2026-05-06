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
  if (!canUseTransformations.value) return src;

  return buildTransformedVideoUrl(src, { audio: !hasAutoplay.value });
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
  const wantsPreload = vs?.preload === true;

  if (vs?.autoplay) return wantsPreload ? "auto" : "metadata";

  return wantsPreload ? "metadata" : "none";
});

function maybeEnableMetadataPreload(event: Event) {
  const vs = normalizedVideoSettings.value;
  if (vs?.autoplay) return;
  if (vs?.preload !== false) return;

  const el = event.target as HTMLVideoElement | null;
  if (!el) return;
  el.preload = "metadata";
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
