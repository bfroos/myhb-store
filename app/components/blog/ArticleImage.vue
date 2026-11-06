<template>
  <!-- Ratgeber-Layout (myhb-os#418): Bild im Artikeltext aus shared/blogBilder.json -->
  <figure class="bai">
    <UiAtomMediaPicture
      :media="(bild as any)"
      :alt="bild.alt"
      :default-format="ImageFormat.MEDIUM"
      :sources="{ [ImageBreakpoint.MEDIUM]: ImageFormat.LARGE }"
    />
  </figure>
</template>

<script setup lang="ts">
import { ImageBreakpoint, ImageFormat } from "~/lib/strapi/dto/enums";
import type { BlogBild } from "#shared/blogBilder";

defineProps<{ bild: BlogBild }>();
</script>

<style scoped>
.bai {
  margin: 2em 0;
}
.bai :deep(picture) {
  display: block;
  aspect-ratio: 16 / 10;
}
.bai :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-card, 24px);
}
</style>
