<template>
  <UiLayoutSectionBlock v-if="hasImages">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="gallery">
        <header v-if="headline || intro" class="gallery__header">
          <h2 v-if="headline" class="gallery__heading">{{ headline }}</h2>
          <p v-if="intro" class="gallery__intro">{{ intro }}</p>
        </header>

        <ul class="gallery__grid" :class="`gallery__grid--${columns}`" role="list">
          <li v-for="(image, index) in imageList" :key="image.id" class="gallery__item">
            <button
              type="button"
              class="gallery__thumb"
              :class="`gallery__thumb--${aspectRatio}`"
              :aria-label="t('blocks.gallery.openImage', { index: index + 1 })"
              @click="open(index)"
            >
              <UiAtomMediaPicture
                :media="image"
                :default-format="ImageFormat.SMALL"
                :sources="thumbSources"
                :priority="priority && index === 0"
              />
            </button>
            <p v-if="showCaptions && captionOf(image)" class="gallery__caption">
              {{ captionOf(image) }}
            </p>
          </li>
        </ul>
      </div>
    </UiLayoutCardSurface>

    <Teleport to="body">
      <div
        v-if="lightboxIndex !== null"
        ref="lightboxEl"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="t('blocks.gallery.lightboxLabel')"
        tabindex="-1"
        @click.self="close"
      >
        <div class="lightbox__bar">
          <span class="lightbox__counter">
            {{ t("blocks.gallery.counter", { current: lightboxIndex + 1, total: imageList.length }) }}
          </span>
          <UiAtomBaseButton
            icon-only
            variant="tertiary"
            size="sm"
            :aria-label="t('blocks.gallery.close')"
            @click="close"
          >
            <IconX aria-hidden="true" />
          </UiAtomBaseButton>
        </div>

        <figure class="lightbox__figure">
          <UiAtomMediaPicture
            v-if="activeImage"
            :key="activeImage.id"
            :media="activeImage"
            :default-format="ImageFormat.LARGE"
            priority
            class="lightbox__image"
          />
          <figcaption v-if="captionOf(activeImage)" class="lightbox__caption">
            {{ captionOf(activeImage) }}
          </figcaption>
        </figure>

        <div v-if="hasMultiple" class="lightbox__nav">
          <UiAtomBaseButton
            icon-only
            variant="tertiary"
            size="sm"
            :aria-label="t('blocks.gallery.previousImage')"
            @click="step(-1)"
          >
            <IconArrowLeft aria-hidden="true" />
          </UiAtomBaseButton>
          <UiAtomBaseButton
            icon-only
            variant="tertiary"
            size="sm"
            :aria-label="t('blocks.gallery.nextImage')"
            @click="step(1)"
          >
            <IconArrowRight aria-hidden="true" />
          </UiAtomBaseButton>
        </div>
      </div>
    </Teleport>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { IconArrowLeft, IconArrowRight, IconX } from "@tabler/icons-vue";
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";
import type { BlockGalleryDto } from "~/lib/strapi/dto/components";
import type { StrapiMedia } from "~/lib/strapi/dto/types";

const props = defineProps<BlockGalleryDto & { priority?: boolean }>();

const { t } = useI18n();

const thumbSources = {
  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
};

const imageList = computed(() => props.images ?? []);
const hasImages = computed(() => imageList.value.length > 0);
const hasMultiple = computed(() => imageList.value.length > 1);

const lightboxIndex = ref<number | null>(null);
const lightboxEl = ref<HTMLElement | null>(null);

const activeImage = computed(() =>
  lightboxIndex.value === null ? null : (imageList.value[lightboxIndex.value] ?? null),
);

function captionOf(image?: StrapiMedia | null): string {
  return image?.caption || image?.alternativeText || "";
}

function open(index: number) {
  lightboxIndex.value = index;
}

function close() {
  lightboxIndex.value = null;
}

// Wraps, so the arrows never dead-end on the first or last image.
function step(delta: number) {
  if (lightboxIndex.value === null) return;
  const total = imageList.value.length;
  lightboxIndex.value = (lightboxIndex.value + delta + total) % total;
}

// Bound to the document rather than the dialog: anything that steals focus
// while the overlay is open would otherwise silently kill Esc and the arrows.
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    close();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    step(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    step(1);
  }
}

// The overlay covers the page, so the body behind it must not scroll.
watch(lightboxIndex, async (value) => {
  if (!import.meta.client) return;

  if (value === null) {
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    return;
  }

  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", onKeydown);
  await nextTick();
  lightboxEl.value?.focus();
});

onBeforeUnmount(() => {
  if (!import.meta.client) return;
  document.body.style.overflow = "";
  document.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
.gallery {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.gallery__header {
  padding: var(--space-card-pad);
  border-bottom: 1px solid var(--color-border-mute);
  color: var(--color-text);
}

.gallery__heading {
  margin: 0;
}

.gallery__intro {
  margin: var(--space-400) 0 0;
  color: var(--color-text-light);
}

.gallery__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-400);
  margin: 0;
  padding: var(--space-card-pad);
  list-style: none;
}

.gallery__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  min-width: 0;
}

.gallery__thumb {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  border-radius: var(--border-radius-card-figure);
  background: transparent;
  cursor: zoom-in;
  overflow: hidden;
}

.gallery__thumb:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}

.gallery__thumb :deep(picture) {
  display: block;
  width: 100%;
  height: 100%;
}

.gallery__thumb :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.gallery__thumb:hover :deep(img) {
  transform: scale(1.04);
}

.gallery__thumb--1-1 { aspect-ratio: 1 / 1; }
.gallery__thumb--4-3 { aspect-ratio: 4 / 3; }
.gallery__thumb--3-4 { aspect-ratio: 3 / 4; }
.gallery__thumb--16-9 { aspect-ratio: 16 / 9; }

.gallery__thumb--original {
  aspect-ratio: auto;
}

.gallery__thumb--original :deep(img) {
  height: auto;
  object-fit: contain;
}

.gallery__caption {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

@media (min-width: 600px) {
  .gallery__grid--2,
  .gallery__grid--3,
  .gallery__grid--4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .gallery__grid--3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .gallery__grid--4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
  padding: var(--space-500);
  background: rgb(0 0 0 / 0.85);
}

.lightbox:focus {
  outline: none;
}

.lightbox__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-400);
  width: 100%;
  max-width: 1100px;
  color: var(--color-text-on-dark, #fff);
}

.lightbox__counter {
  font-size: var(--font-sm);
}

.lightbox__figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-300);
  margin: 0;
  min-height: 0;
}

.lightbox__image :deep(img) {
  display: block;
  max-width: min(1100px, 92vw);
  max-height: 74vh;
  width: auto;
  height: auto;
  object-fit: contain;
}

.lightbox__caption {
  max-width: min(1100px, 92vw);
  color: var(--color-text-on-dark, #fff);
  font-size: var(--font-sm);
  text-align: center;
}

.lightbox__nav {
  display: flex;
  align-items: center;
  gap: var(--space-500);
}
</style>
