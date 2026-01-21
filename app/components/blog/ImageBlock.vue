<template>
  <div
    class="imageBlock"
    :class="{
      'imageBlock--fixedImageAspectRatio': fixedImageAspectRatio,
      'imageBlock--imageJustify-left': imageJustify === ImageJustify.LEFT,
      'imageBlock--imageJustify-right': imageJustify === ImageJustify.RIGHT,
    }"
  >
    <UiAtomMediaPicture
      :media="image"
      :sources="{
        [ImageBreakpoint.MEDIUM]: ImageFormat.LARGE,
        [ImageBreakpoint.SMALL]: ImageFormat.MEDIUM,
      }"
    />
  </div>
</template>
<script setup lang="ts">
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";
import type { StrapiMedia } from "~/lib/strapi/dto/types";

enum ImageJustify {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

const props = defineProps<{
  fixedImageAspectRatio?: boolean;
  image: StrapiMedia;
  imageJustify?: ImageJustify;
}>();
</script>

<style scoped>
.imageBlock {
  display: flex;
  justify-content: center;
  margin: 2em 0;
}

.imageBlock > picture {
  position: relative;
  display: flex;
  align-items: center;
  aspect-ratio: 5/3;
}

.imageBlock :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-200);
}

.imageBlock--fixedImageAspectRatio > picture {
  aspect-ratio: auto;
}

.imageBlock--fixedImageAspectRatio :deep(img) {
  width: auto;
  max-width: 80%;
}

.imageBlock--imageJustify-right {
  justify-content: flex-end;
}
.imageBlock--imageJustify-left {
  justify-content: flex-start;
}

@media screen and (min-width: 1100px) {
  .imageBlock {
    margin: 2em calc(var(--space-card-pad) * -1);
  }
}
</style>
