<template>
  <picture>
    <template
      v-for="[breakpoint, format] in sources ? Object.entries(sources) : []"
      :key="breakpoint"
    >
      <source
        v-if="resolveMediaUrl(media, format)"
        :media="`(min-width: ${breakpoint})`"
        :srcset="resolveMediaUrl(media, format)"
      />
    </template>
    <img
      :src="resolveMediaUrl(media, defaultFormat ?? ImageFormat.SMALL)"
      :loading="loading ?? 'lazy'"
      :alt="alt ?? media.alternativeText ?? media.caption ?? ''"
    />
  </picture>
</template>
<script setup lang="ts">
import { getMediaUrl } from "~/utils/media";
import { ImageFormat } from "~/lib/strapi/dto/enums";
import type { AtomMediaPicture } from "~/lib/ui/types";

const props = defineProps<AtomMediaPicture>();

const config = useRuntimeConfig();
function resolveMediaUrl(
  media: AtomMediaPicture["media"],
  format: ImageFormat | undefined,
): string | undefined {
  if (format == null) return undefined;
  return getMediaUrl(media, format, config.public.mediaUrl);
}
</script>
