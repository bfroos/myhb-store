<template>
  <div class="productHero__images">
    <div v-if="imageList && imageList.length > 0" class="productHero__images__main">
      <div class="productHero__images__image">
        <UiAtomMediaPicture
          v-if="currentImage"
          :key="currentImage.id"
          :media="currentImage"
          :sources="{ [ImageBreakpoint.LARGE]: ImageFormat.LARGE }"
          :default-format="ImageFormat.MEDIUM"
        />
      </div>
      <div v-if="hasMultipleImages" class="productHero__images__navigation">
        <UiAtomBaseButton
          icon-only
          variant="tertiary"
          size="sm"
          :disabled="!canGoToPrevious"
          :aria-label="$t('blocks.productHero.previousImage')"
          @click.native="goToPreviousImage"
        >
          <IconArrowLeft />
        </UiAtomBaseButton>
        <UiAtomBaseButton
          icon-only
          variant="tertiary"
          size="sm"
          :disabled="!canGoToNext"
          :aria-label="$t('blocks.productHero.nextImage')"
          @click.native="goToNextImage"
        >
          <IconArrowRight />
        </UiAtomBaseButton>
      </div>
    </div>
    <div v-else class="productHero__images__noImage">
      <IconPhotoX size="20%" />
    </div>
    <div v-if="hasMultipleImages" class="productHero__images__thumbnails">
      <button
        v-for="(image, index) in imageList"
        :key="image.id"
        class="productHero__images__thumbnail"
        :class="{
          'productHero__images__thumbnail--active': currentImageIndex === index,
        }"
        :aria-label="$t('blocks.productHero.selectImage', { index: index + 1 })"
        @click="selectImage(index)"
      >
        <img
          :src="getMediaUrl(image, ImageFormat.THUMBNAIL) ?? image.url"
          alt=""
          loading="lazy"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getMediaUrl } from "~/utils/media";
import { ImageBreakpoint, ImageFormat } from "~/lib/strapi/dto/enums";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { IconPhotoX, IconArrowLeft, IconArrowRight } from "@tabler/icons-vue";

const props = defineProps<{
  images?: StrapiMedia[];
}>();

const currentImageIndex = ref(0);

const imageList = computed(() => props.images ?? []);

const currentImage = computed(() => {
  if (!imageList.value || imageList.value.length === 0) return null;
  return imageList.value[currentImageIndex.value] ?? null;
});

const hasMultipleImages = computed(() => {
  return imageList.value && imageList.value.length > 1;
});

const canGoToPrevious = computed(() => {
  return currentImageIndex.value > 0;
});

const canGoToNext = computed(() => {
  return currentImageIndex.value < imageList.value.length - 1;
});

function goToPreviousImage() {
  if (canGoToPrevious.value) {
    currentImageIndex.value--;
  }
}

function goToNextImage() {
  if (canGoToNext.value) {
    currentImageIndex.value++;
  }
}

function selectImage(index: number) {
  const imgArray = imageList.value;
  if (!imgArray) return;

  if (index >= 0 && index < imgArray.length) {
    currentImageIndex.value = index;
  }
}
</script>

<style scoped>
.productHero__images {
  padding: var(--space-card-pad);
}

.productHero__images__main {
  position: relative;
}

.productHero__images__image picture,
.productHero__images__noImage {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  color: var(--color-text-muted);
}

.productHero__images__image :deep(img) {
  height: inherit;
}

.productHero__images__navigation {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--space-400);
}

.productHero__images__thumbnails {
  display: flex;
  gap: var(--space-300);
  margin: var(--space-400) 0 0;
  padding: var(--space-400) var(--space-card-pad);
  overflow-x: auto;
  border-top: 1px solid var(--color-border-mute);
}

.productHero__images__thumbnail {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: var(--border-radius-200);
  padding: 0;
  background: transparent;
  cursor: pointer;
  transition: border-color 0.2s;
  overflow: hidden;
}

.productHero__images__thumbnail:hover {
  border-color: var(--color-border);
}

.productHero__images__thumbnail--active {
  border-color: var(--color-primary);
}

.productHero__images__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media screen and (min-width: 900px) {
  .productHero__images {
    width: 50%;
  }

  .productHero__images__image picture,
  .productHero__images__noImage {
    height: 400px;
  }

  .productHero__images__thumbnails {
    padding: var(--space-400);
  }
}
</style>
