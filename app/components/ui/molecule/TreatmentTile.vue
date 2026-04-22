<template>
  <article class="treatment">
    <NuxtLinkLocale :to="path" class="treatment__card theme-light">
      <UiAtomMediaPicture
        v-if="image && isMediaImage(image)"
        :media="image"
        :sources="{
          [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
        }"
        class="treatment__picture"
        :alt="image.alternativeText || title || 'Behandlung'"
      />
      <div class="treatment__overlay">
        <div class="treatment__overlayContent">
          <h3>
            {{ title }}
          </h3>
          <p v-if="shortDescription">{{ shortDescription }}</p>
          <div class="treatment__overlayCTA">
            <UiAtomLabelButton v-if="priceLabel" :label="priceLabel">
              <UiAtomBaseButton
                icon-only
                size="sm"
                :to="path"
                :aria-label="$t('navigation.treatmentTile.goToTreatment')"
              >
                <IconArrowRight />
              </UiAtomBaseButton>
            </UiAtomLabelButton>
            <UiAtomBaseButton
              v-else
              icon-only
              size="sm"
              :to="path"
              :aria-label="$t('navigation.treatmentTile.goToTreatment')"
            >
              <IconArrowRight />
            </UiAtomBaseButton>
          </div>
        </div>
      </div>
    </NuxtLinkLocale>
    <div v-if="description" class="treatment__description">
      <p>{{ description }}</p>
    </div>
  </article>
</template>
<script setup lang="ts">
import { IconArrowRight } from "@tabler/icons-vue";
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";
import type { MoleculeTreatmentTile } from "~/lib/ui/types";

const props = defineProps<MoleculeTreatmentTile>();

const priceLabel = computed(() => {
  return formatPriceInEuro(props.priceInEuroCent ?? 0, {
    prefix: props.isStartingPrice
      ? $t("common.price.startingPrefix")
      : undefined,
  });
});
</script>
<style scoped>
.treatment__card {
  position: relative;
  display: flex;
  flex-direction: column;
  aspect-ratio: 4 / 5;
  border-radius: var(--border-radius-500);
  background: var(--color-black);
  overflow: hidden;
}

.treatment__picture > :deep(img) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.treatment__card:hover .treatment__picture > :deep(img) {
  transform: scale(1.05);
}

.treatment__description {
  margin: var(--space-400) 0 0 0;
  font-size: var(--font-xs);
  line-height: var(--line-xs);
  color: var(--color-text-muted);
}

.treatment__overlay,
.treatment__overlayContent,
.treatment__overlay::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.treatment__overlay {
  z-index: 1;
  cursor: pointer;
}

.treatment__overlayCTA {
  --color-text: var(--color-black);
  position: absolute;
  bottom: 0;
  right: 0;
  padding: var(--space-500);
}

.treatment__overlayContent {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  padding: var(--space-500);
  color: var(--color-white);
}

.treatment__overlayContent h3 {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-200);
}

.treatment__overlayContent p {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  opacity: 0.8;
}

.treatment__overlay::before {
  content: "";
  mask: linear-gradient(black 0%, black 20%, transparent 30%);
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.75) 0%,
    transparent 20%
  );
  backdrop-filter: blur(8px);
  pointer-events: auto;
}
</style>
