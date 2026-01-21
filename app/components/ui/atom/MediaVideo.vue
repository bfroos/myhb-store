<template>
  <video
    :src="media?.url"
    :playsinline="normalizedVideoSettings?.playsInline"
    :autoplay="normalizedVideoSettings?.autoplay"
    :muted="!!normalizedVideoSettings?.autoplay"
    :loop="!!normalizedVideoSettings?.autoplay"
    :controls="!normalizedVideoSettings?.autoplay"
    :preload="videoPreloadAttr"
    @mouseenter="maybeEnableMetadataPreload"
    @focus="maybeEnableMetadataPreload"
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
  }
);

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
