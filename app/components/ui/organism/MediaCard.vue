<template>
  <UiLayoutCardSurface :card-settings="cardSettings">
    <div
      class="mediaCard"
      :class="[
        {
          'mediaCard--mediaRight':
            layout === OrganismMediaCardLayout.MEDIA_RIGHT,
        },
        { 'mediaCard--fixedImageAspectRatio': fixedImageAspectRatio },
        {
          'mediaCard--contentAlignment-top':
            contentAlignment === OrganismMediaCardContentAlignment.TOP,
        },
        {
          'mediaCard--contentAlignment-center':
            contentAlignment === OrganismMediaCardContentAlignment.CENTER,
        },
        {
          'mediaCard--contentAlignment-bottom':
            contentAlignment === OrganismMediaCardContentAlignment.BOTTOM,
        },
        {
          'mediaCard--mediaAlignment-top':
            mediaAlignment === OrganismMediaCardMediaAlignment.TOP,
        },
        {
          'mediaCard--mediaAlignment-center':
            mediaAlignment === OrganismMediaCardMediaAlignment.CENTER,
        },
        {
          'mediaCard--mediaAlignment-bottom':
            mediaAlignment === OrganismMediaCardMediaAlignment.BOTTOM,
        },
        { 'mediaCard--isMediaVideo': isMediaVideo },
      ]"
    >
      <div v-if="hasMedia" class="mediaCard__media">
        <div class="mediaCard__media__container">
          <slot name="media" />
          <div
            v-if="mediaCaption && (captionTitle || captionDescription)"
            class="mediaCard__media__caption"
          >
            <div class="mediaCard__media__caption__content">
              <strong>{{ captionTitle }}</strong>
              <p>{{ captionDescription }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="mediaCard__body">
        <div
          class="mediaCard__bodyInner"
          :class="{ 'mediaCard__bodyInner--fullHeight': fullHeight }"
        >
          <slot name="body" />
          <slot name="headline" />
          <slot name="intro" />
          <slot name="content" />
          <slot name="links" />
        </div>
      </div>
    </div>
  </UiLayoutCardSurface>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";
import {
  OrganismMediaCardLayout,
  OrganismMediaCardContentAlignment,
  OrganismMediaCardMediaAlignment,
} from "~/lib/ui/enums";
import type { OrganismMediaCard } from "~/lib/ui/types";

const props = withDefaults(defineProps<OrganismMediaCard>(), {
  layout: OrganismMediaCardLayout.MEDIA_LEFT,
  contentAlignment: OrganismMediaCardContentAlignment.CENTER,
  mediaAlignment: OrganismMediaCardMediaAlignment.TOP,
  isMediaVideo: false,
  fullHeight: false,
});

const slots = useSlots();

const hasMedia = computed(() => {
  return hasRenderableSlot(slots.media);
});
</script>

<style scoped>
.mediaCard {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.mediaCard__media {
  display: flex;
  flex-direction: column;
  aspect-ratio: 1/ 1;
  max-height: 40vh;
  flex: 1;
  width: 100%;
  padding: var(--space-card-figure-pad) var(--space-card-figure-pad) 0;
}

.mediaCard__media__container {
  position: relative;
  height: 100%;
}

.mediaCard__media__container :deep(img),
.mediaCard__media__container :deep(video) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-position: center;
  border-radius: var(--border-radius-card-figure);
}

.mediaCard__media__container :deep(img) {
  object-fit: cover;
}

.mediaCard__media__container :deep(video) {
  object-fit: contain;
  background: var(--color-black);
}

.mediaCard__media__caption {
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  width: 100%;
  font-size: var(--font-xs);
  line-height: var(--line-xs);
  padding: var(--space-200);
}

.mediaCard__media__caption__content {
  background: linear-gradient(to right, rgba(255, 255, 255, 0.5), transparent);
  padding: var(--space-300) var(--space-400);
  border-radius: var(--border-radius-200) var(--border-radius-200)
    var(--border-radius-700) var(--border-radius-700);
  color: var(--color-black);
}

.mediaCard__body {
  display: flex;
  flex-direction: column;
  padding: var(--space-card-pad);
}

.mediaCard__bodyInner--fullHeight {
  height: 100%;
}

.mediaCard--fixedImageAspectRatio .mediaCard__media {
  aspect-ratio: auto;
  max-height: none;
}

.mediaCard--fixedImageAspectRatio .mediaCard__media__container {
  height: auto;
}

.mediaCard--fixedImageAspectRatio .mediaCard__media__container :deep(img),
.mediaCard--fixedImageAspectRatio .mediaCard__media__container :deep(video) {
  position: relative;
  height: auto;
  border-radius: var(--border-radius-card-figure);
}

.mediaCard--isMediaVideo .mediaCard__media__caption {
  display: none;
}

@media screen and (min-width: 900px) {
  .mediaCard {
    flex-direction: row;
  }
  .mediaCard__media {
    flex: 1 0 50%;
    aspect-ratio: auto;
    max-height: none;
    padding: var(--space-card-figure-pad) 0 var(--space-card-figure-pad)
      var(--space-card-figure-pad);
  }

  .mediaCard__body {
    flex: 1 0 50%;
    flex-shrink: 0;
  }

  .mediaCard--fixedImageAspectRatio .mediaCard__media {
    padding: var(--space-card-pad-xs);
  }

  .mediaCard--fixedImageAspectRatio .mediaCard__media__container :deep(img),
  .mediaCard--fixedImageAspectRatio .mediaCard__media__container :deep(video) {
    border-radius: var(--border-radius-200);
  }

  .mediaCard--fixedImageAspectRatio.mediaCard--contentAlignment-top
    .mediaCard__body,
  .mediaCard--fixedImageAspectRatio.mediaCard--mediaAlignment-top
    .mediaCard__media {
    justify-content: flex-start;
  }
  .mediaCard--fixedImageAspectRatio.mediaCard--contentAlignment-center
    .mediaCard__body,
  .mediaCard--fixedImageAspectRatio.mediaCard--mediaAlignment-center
    .mediaCard__media {
    justify-content: center;
  }
  .mediaCard--fixedImageAspectRatio.mediaCard--contentAlignment-bottom
    .mediaCard__body,
  .mediaCard--fixedImageAspectRatio.mediaCard--mediaAlignment-bottom
    .mediaCard__media {
    justify-content: flex-end;
  }

  .mediaCard--mediaRight {
    flex-direction: row-reverse;
  }

  .mediaCard--mediaRight .mediaCard__body {
    padding: var(--space-card-pad);
  }

  .mediaCard--mediaRight .mediaCard__media {
    padding: var(--space-card-figure-pad) var(--space-card-figure-pad)
      var(--space-card-figure-pad) 0;
  }

  .mediaCard--mediaRight.mediaCard--fixedImageAspectRatio .mediaCard__media {
    padding: var(--space-card-pad-xs);
  }
}
</style>
