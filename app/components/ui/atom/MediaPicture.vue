<template>
  <picture v-if="imgSrc">
    <source
      v-for="source in sortedSources"
      :key="source.breakpoint"
      :media="`(min-width: ${source.breakpoint})`"
      :srcset="source.url"
      type="image/webp"
    />
    <img
      :src="imgSrc"
      :width="imgDimensions?.width"
      :height="imgDimensions?.height"
      :loading="loading ?? 'lazy'"
      decoding="async"
      :alt="alt ?? media.alternativeText ?? media.caption ?? ''"
      class="media-picture__img"
    />
  </picture>
</template>
<script setup lang="ts">
import { getMediaUrl, IMAGE_SIZE_PRESETS } from "~/utils/media";
import { ImageFormat } from "~/lib/strapi/dto/enums";
import type { AtomMediaPicture } from "~/lib/ui/types";
import type { StrapiMediaFormat } from "~/lib/strapi/dto/types";

const props = defineProps<AtomMediaPicture>();

const imgSrc = computed(() =>
  getMediaUrl(props.media, props.defaultFormat ?? ImageFormat.SMALL),
);

const sortedSources = computed(() => {
  if (!props.sources) return [];

  return Object.entries(props.sources)
    .map(([breakpoint, format]) => ({
      breakpoint,
      breakpointValue: parseInt(breakpoint, 10) || 0,
      format: format as ImageFormat,
      url: getMediaUrl(props.media, format as ImageFormat),
    }))
    .filter((s) => s.url != null)
    .sort((a, b) => b.breakpointValue - a.breakpointValue);
});

const imgDimensions = computed(() => {
  if (props.width != null && props.height != null) {
    return { width: props.width, height: props.height };
  }
  if (props.media.width != null && props.media.height != null) {
    return { width: props.media.width, height: props.media.height };
  }
  return getImageDimensions(
    props.media,
    props.defaultFormat ?? ImageFormat.SMALL,
  );
});

function getImageDimensions(
  media: AtomMediaPicture["media"],
  format: ImageFormat,
): { width: number; height: number } | undefined {
  if (!media?.mime?.startsWith("image/")) return undefined;

  const presetWidth = IMAGE_SIZE_PRESETS[format]?.width ?? 460;
  const aspectRatio = getAspectRatioFromMedia(media, format);

  if (aspectRatio == null) return undefined;

  return {
    width: presetWidth,
    height: Math.round(presetWidth / aspectRatio),
  };
}

function getAspectRatioFromMedia(
  media: AtomMediaPicture["media"],
  format: ImageFormat,
): number | undefined {
  const formatKey = format.toLowerCase();
  const fmt = media.formats?.[formatKey] as StrapiMediaFormat | undefined;
  if (fmt?.width && fmt?.height) {
    return fmt.width / fmt.height;
  }

  const fallback =
    media.formats?.large ?? media.formats?.medium ?? media.formats?.small;
  if (fallback?.width && fallback?.height) {
    return fallback.width / fallback.height;
  }

  const m = media as { width?: number; height?: number };
  if (m.width && m.height) return m.width / m.height;

  return undefined;
}
</script>
<style scoped>
.media-picture__img {
  max-width: 100%;
  height: auto;
  display: block;
}
</style>
