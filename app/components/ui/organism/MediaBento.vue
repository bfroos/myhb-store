<template>
  <div
    class="mediaBento"
    :class="{
      'mediaBento--mediaRight': layout === MediaBentoLayout.MEDIA_RIGHT,
      'mediaBento--hasSecondMedia': slots.secondMedia,
      'mediaBento--wihoutMedia': !slots.firstMedia && !slots.secondMedia,
      'mediaBento--withoutContent': !hasContent,
    }"
  >
    <UiLayoutCardSurface
      v-if="slots.firstMedia"
      :card-settings="mediaCardSettings"
    >
      <div class="mediaBento__media">
        <div class="mediaBento__media__container">
          <slot name="firstMedia" />
        </div>
      </div>
    </UiLayoutCardSurface>
    <UiLayoutCardSurface v-if="hasContent" :card-settings="cardSettings">
      <div class="mediaBento__body">
        <slot name="headline" />
        <slot name="intro" />
        <slot name="content" />
        <slot name="links" />
      </div>
    </UiLayoutCardSurface>
    <UiLayoutCardSurface
      v-if="slots.secondMedia"
      :card-settings="mediaCardSettings"
    >
      <div class="mediaBento__media">
        <div class="mediaBento__media__container">
          <slot name="secondMedia" />
        </div>
      </div>
    </UiLayoutCardSurface>
  </div>
</template>

<script setup lang="ts">
import { MediaBentoLayout, ColorTheme } from "~/lib/strapi/dto/enums";
import type { CardSettingsDto } from "~/lib/strapi/dto/components";

const slots = useSlots();

const props = defineProps<{
  layout: MediaBentoLayout;
  cardSettings?: CardSettingsDto;
}>();

const mediaCardSettings = computed(() => {
  if (props.cardSettings?.colorTheme === ColorTheme.SOFT) {
    return {
      ...props.cardSettings,
      colorTheme: ColorTheme.LIGHT,
    };
  }
  return props.cardSettings;
});

const hasContent = computed(() => {
  return slots.headline || slots.intro || hasRenderableSlot(slots.content);
});
</script>

<style scoped>
.mediaBento {
  display: flex;
  flex-direction: column;
  gap: var(--space-bento-gap);
}

.mediaBento__media {
  height: 100%;
  padding: var(--space-card-figure-pad);
}

.mediaBento__media__container {
  position: relative;
  width: 100%;
  height: 100%;
}

.mediaBento__media :deep(img),
.mediaBento__media :deep(video) {
  display: block;
  width: 100%;
  border-radius: var(--border-radius-card-figure);
  object-fit: cover;
  object-position: center;
}

.mediaBento__body {
  padding: var(--space-card-pad);
}

.mediaBento__body h2 {
  margin: 0 0 var(--space-400);
}

.mediaBento__subline {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  margin: 0 0 var(--space-400);
}

.mediaBento__content {
  color: var(--color-text-light);
}

@media screen and (min-width: 900px) {
  .mediaBento:not(.mediaBento--wihoutMedia) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .mediaBento__media__container {
    min-height: 300px;
  }

  .mediaBento__media__container :deep(img),
  .mediaBento__media__container :deep(video) {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
  }

  .mediaBento > div:nth-of-type(1) {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }
  .mediaBento > div:nth-of-type(2) {
    grid-column: 2 / 3;
    grid-row: 1 / 3;
  }
  .mediaBento--withoutContent > div:nth-of-type(1) {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
  }

  .mediaBento--mediaRight > div:nth-of-type(1) {
    grid-column: 2 / 3;
    grid-row: 1 / 3;
  }
  .mediaBento--mediaRight > div:nth-of-type(2) {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }
  .mediaBento--mediaRight.mediaBento--withoutContent > div:nth-of-type(1) {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
  }

  .mediaBento--hasSecondMedia > div:nth-of-type(1) {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }
  .mediaBento--hasSecondMedia > div:nth-of-type(2) {
    grid-column: 2 / 3;
    grid-row: 1 / 3;
  }
  .mediaBento--hasSecondMedia > div:nth-of-type(3) {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
  }
  .mediaBento--hasSecondMedia.mediaBento--withoutContent > div:nth-of-type(1) {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }
  .mediaBento--hasSecondMedia.mediaBento--withoutContent > div:nth-of-type(2) {
    grid-column: 2 / 3;
    grid-row: 1 / 3;
  }

  .mediaBento--hasSecondMedia.mediaBento--mediaRight > div:nth-of-type(1) {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }
  .mediaBento--hasSecondMedia.mediaBento--mediaRight > div:nth-of-type(2) {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }
  .mediaBento--hasSecondMedia.mediaBento--mediaRight > div:nth-of-type(3) {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
  }
  .mediaBento--hasSecondMedia.mediaBento--withoutContent.mediaBento--mediaRight
    > div:nth-of-type(1) {
    grid-column: 2 / 3;
    grid-row: 1 / 3;
  }
  .mediaBento--hasSecondMedia.mediaBento--withoutContent.mediaBento--mediaRight
    > div:nth-of-type(2) {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }
}
</style>
