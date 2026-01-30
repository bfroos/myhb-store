<template>
  <video
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

// SSR-safe helper to determine the current zone origin for Cloudflare media transformations.
// Prefer the origin of the media URL itself (media CDN), then fall back to the request/window origin.
function getZoneOrigin(sourceUrl?: string): string | null {
  if (sourceUrl) {
    try {
      const mediaUrl = new URL(sourceUrl);
      if (mediaUrl.origin) return mediaUrl.origin;
    } catch {
      // If media URL is not absolute or invalid, fall back to request origin.
    }
  }

  try {
    const url = useRequestURL();
    if (url?.origin) return url.origin;
  } catch {
    // Ignore – useRequestURL might not be available in some edge cases.
  }

  // Client-side fallback.
  if (
    process.client &&
    typeof window !== "undefined" &&
    window.location?.origin
  ) {
    return window.location.origin;
  }

  return null;
}

// Cloudflare Media Transformations expects <SOURCE-VIDEO> to be a full URL in the path segment.
// If the source URL contains a query/hash (common for signed URLs), we must encode only the
// delimiters (`?` and `#`) so they don't become the transformation request's query/hash.
function encodeSourceForMediaTransform(sourceUrl: string): string {
  try {
    const u = new URL(sourceUrl);
    let out = `${u.origin}${u.pathname}`;

    // Keep query params intact, but move them into the path by encoding the delimiter.
    if (u.search) out += `%3F${u.search.slice(1)}`;

    // Same for fragment identifiers.
    if (u.hash) out += `%23${u.hash.slice(1)}`;

    return out;
  } catch {
    // If it's not an absolute URL, return as-is.
    return sourceUrl;
  }
}

// Build a Cloudflare media transformation URL for video delivery.
function buildTransformedVideoUrl(
  origin: string,
  sourceUrl: string,
  autoplay: boolean,
): string {
  const encodedSource = encodeSourceForMediaTransform(sourceUrl);

  const options = [
    "mode=video", // deliver H.264/AAC MP4
    "fit=scale-down", // avoid upscaling
    `audio=${autoplay ? "false" : "true"}`,
  ];

  return `${origin}/cdn-cgi/media/${options.join(",")}/${encodedSource}`;
}

// Build a Cloudflare media transformation URL for a poster frame.
function buildPosterUrl(origin: string, sourceUrl: string): string {
  const encodedSource = encodeSourceForMediaTransform(sourceUrl);

  const options = [
    "mode=frame",
    "time=0s",
    "format=jpg",
    "width=600",
    "fit=scale-down",
  ];

  return `${origin}/cdn-cgi/media/${options.join(",")}/${encodedSource}`;
}

const originalVideoUrl = computed(() => props.media?.url ?? "");
const zoneOrigin = computed(() => getZoneOrigin(originalVideoUrl.value));

const canUseTransformations = computed(
  () => !forceOriginal.value && !!zoneOrigin.value && !!originalVideoUrl.value,
);

const videoSrc = computed(() => {
  const src = originalVideoUrl.value;
  if (!src) return "";
  if (!canUseTransformations.value) return src;

  return buildTransformedVideoUrl(
    zoneOrigin.value as string,
    src,
    hasAutoplay.value,
  );
});

const posterSrc = computed<string | undefined>(() => {
  const src = originalVideoUrl.value;
  if (!src) return undefined;
  if (!canUseTransformations.value) return undefined;

  // If the poster transformation fails on first load, we will fall back by disabling transforms globally.
  return buildPosterUrl(zoneOrigin.value as string, src);
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
