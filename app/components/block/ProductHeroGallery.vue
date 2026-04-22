<template>
  <div class="productHero__gallery">
    <figure v-if="hasImages" class="productHero__gallery__main">
      <div class="productHero__gallery__image">
        <UiAtomMediaPicture
          v-if="currentImage"
          :key="currentImage.id"
          :media="currentImage"
          :sources="imageSources"
          :default-format="ImageFormat.MEDIUM"
          :priority="currentImageIndex === 0"
        />
      </div>
      <div v-if="hasMultipleImages" class="productHero__gallery__nav">
        <UiAtomBaseButton
          icon-only
          variant="tertiary"
          size="sm"
          :disabled="!canGoToPrevious"
          :aria-label="t('blocks.productHero.previousImage')"
          @click="goToPrevious"
        >
          <IconArrowLeft aria-hidden="true" />
        </UiAtomBaseButton>
        <UiAtomBaseButton
          icon-only
          variant="tertiary"
          size="sm"
          :disabled="!canGoToNext"
          :aria-label="t('blocks.productHero.nextImage')"
          @click="goToNext"
        >
          <IconArrowRight aria-hidden="true" />
        </UiAtomBaseButton>
      </div>
    </figure>
    <div v-else class="productHero__gallery__empty">
      <IconPhotoX size="20%" aria-hidden="true" />
    </div>
    <div v-if="hasMultipleImages" class="productHero__gallery__thumbnails">
      <button
        v-for="(image, index) in imageList"
        :key="image.id"
        type="button"
        class="productHero__gallery__thumb"
        :class="{
          'productHero__gallery__thumb--active': currentImageIndex === index,
        }"
        :aria-label="t('blocks.productHero.selectImage', { index: index + 1 })"
        :aria-current="currentImageIndex === index ? 'true' : undefined"
        @click="selectImage(index)"
      >
        <img
          :src="getThumbnailSrc(image)"
          :alt="image.alternativeText || image.caption || `Produktbild ${index + 1}`"
          loading="lazy"
          width="60"
          height="60"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconArrowLeft, IconArrowRight, IconPhotoX } from "@tabler/icons-vue";
import { ImageBreakpoint, ImageFormat } from "~/lib/strapi/dto/enums";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { getMediaUrl } from "~/utils/media";

const props = defineProps<{
  images?: StrapiMedia[];
}>();

const { t } = useI18n();

const currentImageIndex = ref(0);

const imageSources = {
  [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
};

const imageList = computed(() => props.images ?? []);

const hasImages = computed(() => imageList.value.length > 0);

const hasMultipleImages = computed(() => imageList.value.length > 1);

const currentImage = computed(
  () => imageList.value[currentImageIndex.value] ?? null,
);

const canGoToPrevious = computed(() => currentImageIndex.value > 0);

const canGoToNext = computed(
  () => currentImageIndex.value < imageList.value.length - 1,
);

function goToPrevious() {
  if (canGoToPrevious.value) currentImageIndex.value--;
}

function goToNext() {
  if (canGoToNext.value) currentImageIndex.value++;
}

function selectImage(index: number) {
  if (index >= 0 && index < imageList.value.length) {
    currentImageIndex.value = index;
  }
}

function getThumbnailSrc(image: StrapiMedia): string {
  return getMediaUrl(image, ImageFormat.THUMBNAIL) ?? image.url ?? "";
}
</script>

<style scoped>
.productHero__gallery {
  padding: var(--space-card-pad);
}

.productHero__gallery__main {
  position: relative;
  margin: 0;
}

.productHero__gallery__image,
.productHero__gallery__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  color: var(--color-text-muted);
}

.productHero__gallery__image :deep(picture) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.productHero__gallery__image :deep(img) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.productHero__gallery__nav {
  position: absolute;
  top: 50%;
  left: calc(var(--space-card-pad-sm) * -1);
  width: calc(100% + var(--space-card-pad-sm) * 2);
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.productHero__gallery__empty {
  flex-shrink: 0;
}

.productHero__gallery__thumbnails {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-300);
  margin: var(--space-400) 0 0;
  padding: var(--space-400) 0 0;
  overflow-x: auto;
}

.productHero__gallery__thumb {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--border-radius-200);
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.productHero__gallery__thumb:hover {
  border-color: var(--color-border);
}

.productHero__gallery__thumb:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}

.productHero__gallery__thumb--active {
  border-color: var(--color-primary);
}

.productHero__gallery__thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (min-width: 600px) {
  .productHero__gallery__nav {
    left: 0;
    width: 100%;
  }
}

@media (min-width: 900px) {
  .productHero__gallery {
    width: 50%;
  }

  .productHero__gallery__image,
  .productHero__gallery__empty {
    height: 400px;
  }

  .productHero__gallery__image {
    padding: 0 calc(var(--control-height-md) + var(--space-200));
  }

  .productHero__gallery__thumbnails {
    padding: var(--space-400);
  }
}
</style>
