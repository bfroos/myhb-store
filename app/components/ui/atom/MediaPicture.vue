<template>
  <picture>
    <template
      v-for="[breakpoint, format] in sources ? Object.entries(sources) : []"
      :key="breakpoint"
    >
      <source
        v-if="getMediaUrl(media, format)"
        :media="`(min-width: ${breakpoint})`"
        :srcset="getMediaUrl(media, format)"
      />
    </template>
    <img
      :src="getMediaUrl(media, defaultFormat ?? ImageFormat.SMALL)"
      :loading="loading ?? 'lazy'"
      :alt="alt ?? media.alternativeText ?? media.caption ?? ''"
    />
  </picture>
</template>
<script setup lang="ts">
import { ImageFormat } from "~/lib/strapi/dto/enums";
import type { AtomMediaPicture } from "~/lib/ui/types";

const props = defineProps<AtomMediaPicture>();
</script>
