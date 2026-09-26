<template>
  <UiLayoutSectionBlock v-if="hasSlides">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="gallery">
        <header v-if="headline || intro" class="gallery__header">
          <h2 v-if="headline" class="gallery__heading">{{ headline }}</h2>
          <p v-if="intro" class="gallery__intro">{{ intro }}</p>
        </header>

        <div
          v-if="isSlider"
          class="slider"
          role="group"
          aria-roledescription="carousel"
          :aria-label="headline || t('blocks.gallery.lightboxLabel')"
          tabindex="0"
          @keydown="onSliderKeydown"
        >
          <div class="slider__stage">
            <ul
              ref="trackEl"
              class="slider__track"
              role="list"
              @scroll.passive="onTrackScroll"
              @scrollend="releaseScrollTarget"
              @pointerdown="releaseScrollTarget"
              @wheel.passive="releaseScrollTarget"
            >
              <li
                v-for="(slide, index) in slides"
                :key="slide.id"
                class="slider__slide"
                role="group"
                aria-roledescription="slide"
                :aria-label="t('blocks.gallery.slideLabel', { index: index + 1, total: slides.length })"
              >
                <div class="frames" :class="{ 'frames--pair': slide.frames.length > 1 }">
                  <figure v-for="(frame, frameIndex) in slide.frames" :key="frameIndex" class="frame">
                    <button
                      type="button"
                      class="frame__open"
                      :class="`ratio--${aspectRatio}`"
                      :tabindex="index === activeIndex ? 0 : -1"
                      :aria-label="t('blocks.gallery.openImage', { index: offsets[index]! + frameIndex + 1 })"
                      @click="open(index, frameIndex)"
                    >
                      <UiAtomMediaPicture
                        :media="frame.media"
                        :default-format="slide.frames.length > 1 ? ImageFormat.MEDIUM : ImageFormat.LARGE"
                        :priority="priority && index === 0 && frameIndex === 0"
                      />
                    </button>
                    <span v-if="frame.label" class="frame__label">{{ frame.label }}</span>
                  </figure>
                </div>
                <p v-if="showCaptions && slide.caption" class="gallery__caption">
                  {{ slide.caption }}
                </p>
              </li>
            </ul>

            <template v-if="hasMultiple">
              <UiAtomBaseButton
                icon-only
                variant="tertiary"
                size="sm"
                class="slider__arrow slider__arrow--prev"
                :aria-label="t('blocks.gallery.previousImage')"
                @click="stepSlider(-1)"
              >
                <IconArrowLeft aria-hidden="true" />
              </UiAtomBaseButton>
              <UiAtomBaseButton
                icon-only
                variant="tertiary"
                size="sm"
                class="slider__arrow slider__arrow--next"
                :aria-label="t('blocks.gallery.nextImage')"
                @click="stepSlider(1)"
              >
                <IconArrowRight aria-hidden="true" />
              </UiAtomBaseButton>
              <span class="slider__counter" aria-live="polite">
                {{ t("blocks.gallery.counter", { current: activeIndex + 1, total: slides.length }) }}
              </span>
            </template>
          </div>

          <ul v-if="hasMultiple" ref="thumbsEl" class="slider__thumbs" role="list">
            <li v-for="(slide, index) in slides" :key="slide.id">
              <button
                type="button"
                class="slider__thumb"
                :class="{ 'slider__thumb--active': index === activeIndex }"
                :aria-label="t('blocks.gallery.selectImage', { index: index + 1 })"
                :aria-current="index === activeIndex ? 'true' : undefined"
                @click="goTo(index)"
              >
                <img
                  :src="getThumbnailSrc(slide.frames[slide.frames.length - 1]!.media)"
                  :alt="slide.frames[slide.frames.length - 1]!.media.alternativeText || ''"
                  loading="lazy"
                  width="72"
                  height="72"
                />
              </button>
            </li>
          </ul>
        </div>

        <ul
          v-else
          class="gallery__grid"
          :class="[`gallery__grid--${columns}`, { 'gallery__grid--pairs': isPairs }]"
          role="list"
        >
          <li v-for="(slide, index) in slides" :key="slide.id" class="gallery__item">
            <div class="frames" :class="{ 'frames--pair': slide.frames.length > 1 }">
              <figure v-for="(frame, frameIndex) in slide.frames" :key="frameIndex" class="frame">
                <button
                  type="button"
                  class="frame__open frame__open--zoom"
                  :class="`ratio--${aspectRatio}`"
                  :aria-label="t('blocks.gallery.openImage', { index: offsets[index]! + frameIndex + 1 })"
                  @click="open(index, frameIndex)"
                >
                  <UiAtomMediaPicture
                    :media="frame.media"
                    :default-format="ImageFormat.SMALL"
                    :sources="thumbSources"
                    :priority="priority && index === 0 && frameIndex === 0"
                  />
                </button>
                <span v-if="frame.label" class="frame__label">{{ frame.label }}</span>
              </figure>
            </div>
            <p v-if="showCaptions && slide.caption" class="gallery__caption">
              {{ slide.caption }}
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
            {{ t("blocks.gallery.counter", { current: lightboxIndex + 1, total: lightboxFrames.length }) }}
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

        <figure
          class="lightbox__figure"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <UiAtomMediaPicture
            v-if="activeFrame"
            :key="`${lightboxIndex}`"
            :media="activeFrame.media"
            :default-format="ImageFormat.LARGE"
            priority
            class="lightbox__image"
          />
          <figcaption v-if="lightboxCaption" class="lightbox__caption">
            {{ lightboxCaption }}
          </figcaption>
        </figure>

        <div v-if="lightboxFrames.length > 1" class="lightbox__nav">
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
import { getMediaUrl } from "~/utils/media";

type Frame = { media: StrapiMedia; label?: string };
type Slide = { id: string | number; frames: Frame[]; caption: string };

const props = defineProps<BlockGalleryDto & { priority?: boolean }>();

const { t } = useI18n();

const thumbSources = {
  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
};

function captionOf(image?: StrapiMedia | null): string {
  return image?.caption || image?.alternativeText || "";
}

const pairItems = computed(() =>
  (props.items ?? []).filter((item) => item.before && item.after),
);

const isPairs = computed(() => props.mode === "before-after" && pairItems.value.length > 0);

const slides = computed<Slide[]>(() => {
  if (isPairs.value) {
    return pairItems.value.map((item) => ({
      id: item.id,
      frames: [
        { media: item.before!, label: t("blocks.gallery.before") },
        { media: item.after!, label: t("blocks.gallery.after") },
      ],
      caption: item.caption ?? "",
    }));
  }
  return (props.images ?? []).map((image) => ({
    id: image.id,
    frames: [{ media: image }],
    caption: captionOf(image),
  }));
});

const hasSlides = computed(() => slides.value.length > 0);
const hasMultiple = computed(() => slides.value.length > 1);
const isSlider = computed(() => props.layout === "slider");

const offsets = computed(() => {
  let total = 0;
  return slides.value.map((slide) => {
    const start = total;
    total += slide.frames.length;
    return start;
  });
});

const lightboxFrames = computed(() =>
  slides.value.flatMap((slide, slideIndex) =>
    slide.frames.map((frame) => ({ ...frame, slideIndex, caption: slide.caption })),
  ),
);

const activeIndex = ref(0);
const trackEl = ref<HTMLElement | null>(null);
const thumbsEl = ref<HTMLElement | null>(null);

const lightboxIndex = ref<number | null>(null);
const lightboxEl = ref<HTMLElement | null>(null);

const activeFrame = computed(() =>
  lightboxIndex.value === null ? null : (lightboxFrames.value[lightboxIndex.value] ?? null),
);

const lightboxCaption = computed(() => {
  const frame = activeFrame.value;
  if (!frame) return "";
  const text = isPairs.value ? frame.caption : captionOf(frame.media);
  return [frame.label, text].filter(Boolean).join(" · ");
});

function open(slideIndex: number, frameIndex = 0) {
  lightboxIndex.value = (offsets.value[slideIndex] ?? 0) + frameIndex;
}

function close() {
  const last = activeFrame.value?.slideIndex ?? null;
  lightboxIndex.value = null;
  if (isSlider.value && last !== null) {
    nextTick(() => goTo(last, false));
  }
}

function getThumbnailSrc(image: StrapiMedia): string {
  return getMediaUrl(image, ImageFormat.THUMBNAIL) ?? image.url ?? "";
}

function goTo(index: number, smooth = true) {
  const slide = trackEl.value?.children[index] as HTMLElement | undefined;
  if (!slide) return;
  activeIndex.value = index;
  if (indexAtScroll() !== index) pinScrollTarget(index);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  slide.scrollIntoView({
    behavior: smooth && !reduced ? "smooth" : "auto",
    inline: "start",
    block: "nearest",
  });
}

function stepSlider(delta: number) {
  const total = slides.value.length;
  goTo((activeIndex.value + delta + total) % total);
}

function onSliderKeydown(event: KeyboardEvent) {
  if (!hasMultiple.value) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    stepSlider(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    stepSlider(1);
  } else if (event.key === "Home") {
    event.preventDefault();
    goTo(0);
  } else if (event.key === "End") {
    event.preventDefault();
    goTo(slides.value.length - 1);
  }
}

let scrollFrame = 0;
let scrollTarget: number | null = null;
let scrollTargetTimer: ReturnType<typeof setTimeout> | undefined;

function indexAtScroll(): number {
  const track = trackEl.value;
  if (!track || !track.clientWidth) return 0;
  const index = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
  return Math.min(Math.max(index, 0), slides.value.length - 1);
}

function releaseScrollTarget() {
  scrollTarget = null;
  clearTimeout(scrollTargetTimer);
  activeIndex.value = indexAtScroll();
}

function pinScrollTarget(index: number) {
  scrollTarget = index;
  clearTimeout(scrollTargetTimer);
  scrollTargetTimer = setTimeout(() => {
    scrollTarget = null;
  }, 1000);
}

function onTrackScroll() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    const index = indexAtScroll();
    if (scrollTarget !== null) {
      if (index === scrollTarget) scrollTarget = null;
      return;
    }
    activeIndex.value = index;
  });
}

watch(activeIndex, (index) => {
  const thumb = thumbsEl.value?.children[index] as HTMLElement | undefined;
  thumb?.scrollIntoView({ inline: "nearest", block: "nearest" });
});

let touchStartX: number | null = null;

function onTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0]?.clientX ?? null;
}

function onTouchEnd(event: TouchEvent) {
  if (touchStartX === null) return;
  const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
  touchStartX = null;
  if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1);
}

// Wraps, so the arrows never dead-end on the first or last image.
function step(delta: number) {
  if (lightboxIndex.value === null) return;
  const total = lightboxFrames.value.length;
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
  cancelAnimationFrame(scrollFrame);
  clearTimeout(scrollTargetTimer);
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

.frames {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-200);
}

.frames--pair {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.frame {
  position: relative;
  margin: 0;
  min-width: 0;
}

.frame__open {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  border-radius: var(--border-radius-card-figure);
  background: transparent;
  cursor: zoom-in;
  overflow: hidden;
}

.frame__open:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: -2px;
}

.frame__open :deep(picture) {
  display: block;
  width: 100%;
  height: 100%;
}

.frame__open :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.frame__open--zoom:hover :deep(img) {
  transform: scale(1.04);
}

.ratio--1-1 { aspect-ratio: 1 / 1; }
.ratio--4-3 { aspect-ratio: 4 / 3; }
.ratio--3-4 { aspect-ratio: 3 / 4; }
.ratio--16-9 { aspect-ratio: 16 / 9; }

.ratio--original {
  aspect-ratio: auto;
}

.ratio--original :deep(img) {
  height: auto;
  object-fit: contain;
}

.frame__label {
  position: absolute;
  inset-block-end: var(--space-200);
  inset-inline-start: var(--space-200);
  padding: var(--space-100) var(--space-300);
  border-radius: 999px;
  background: rgb(0 0 0 / 0.6);
  color: #fff;
  font-size: var(--font-sm);
  line-height: 1.2;
  pointer-events: none;
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
  .gallery__grid--3:not(.gallery__grid--pairs) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .gallery__grid--4:not(.gallery__grid--pairs) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.slider {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  padding: var(--space-card-pad);
}

.slider:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: -2px;
}

.slider__stage {
  position: relative;
}

.slider__track {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
  border-radius: var(--border-radius-card-figure);
}

.slider__track::-webkit-scrollbar {
  display: none;
}

.slider__slide {
  flex: 0 0 100%;
  min-width: 0;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
}

.slider__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgb(255 255 255 / 0.85);
}

.slider__arrow--prev {
  inset-inline-start: var(--space-300);
}

.slider__arrow--next {
  inset-inline-end: var(--space-300);
}

.slider__arrow:dir(rtl) svg {
  transform: scaleX(-1);
}

.slider__counter {
  position: absolute;
  inset-block-start: var(--space-300);
  inset-inline-end: var(--space-300);
  padding: var(--space-100) var(--space-300);
  border-radius: 999px;
  background: rgb(0 0 0 / 0.6);
  color: #fff;
  font-size: var(--font-sm);
  pointer-events: none;
}

.slider__thumbs {
  display: flex;
  gap: var(--space-200);
  margin: 0;
  padding: 0 0 var(--space-100);
  list-style: none;
  overflow-x: auto;
  scrollbar-width: thin;
}

.slider__thumbs li {
  flex: 0 0 auto;
}

.slider__thumb {
  display: block;
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--border-radius-card-figure);
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.slider__thumb:hover,
.slider__thumb:focus-visible,
.slider__thumb--active {
  opacity: 1;
}

.slider__thumb--active {
  border-color: var(--color-text);
}

.slider__thumb:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}

.slider__thumb img {
  display: block;
  width: 72px;
  height: 72px;
  object-fit: cover;
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
