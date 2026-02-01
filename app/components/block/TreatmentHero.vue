<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings" style="overflow: hidden">
      <div v-if="marqueeItems.length > 0" class="treatmentHero__marquee">
        <div class="treatmentHero__marquee__viewport">
          <div
            class="treatmentHero__marquee__track"
            :style="{ '--marquee-duration': `${marqueeDurationSeconds}s` }"
          >
            <template
              v-for="(item, idx) in marqueeTrackItems"
              :key="`m-${idx}`"
            >
              <span class="treatmentHero__marquee__item">{{ item }}</span>
              <span
                v-if="idx !== marqueeTrackItems.length - 1"
                class="treatmentHero__marquee__sep"
                aria-hidden="true"
              >
                <IconAsterisk size=".8em" />
              </span>
            </template>
          </div>
        </div>
      </div>
      <div
        class="treatmentHero"
        :class="{
          'treatmentHero--hasMarquee': marqueeItems.length > 0,
          'treatmentHero--hasReviews': showReviews,
        }"
      >
        <div v-if="cover && isMediaImage(cover)" class="treatmentHero__media">
          <UiAtomMediaPicture
            class="treatmentHero__media__image"
            :media="cover"
            :sources="{
              [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
              [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
            }"
          />
        </div>
        <div class="treatmentHero__body">
          <div class="treatmentHero__main">
            <div v-if="eyebrow" class="treatmentHero__eyebrow">
              {{ eyebrow }}
            </div>
            <h1 v-if="headline">
              <span v-if="headlinePrefix" class="treatmentHero__headlinePrefix">
                {{ headlinePrefix }}
              </span>
              {{ headline }}
              <span v-if="headlineSuffix" class="treatmentHero__headlineSuffix">
                {{ headlineSuffix }}
              </span>
            </h1>
            <b v-if="subline">{{ subline }}</b>
            <p v-if="text">{{ text }}</p>
            <div class="treatmentHero__cta">
              <div
                class="treatmentHero__cta__priceWrap"
                :class="{
                  'treatmentHero__cta__priceWrap--withPrice': !!priceLabel,
                }"
              >
                <b v-if="priceLabel">{{ priceLabel }}</b>
                <SharedButton
                  v-if="cta"
                  :button="cta"
                  :data="{ calendlyUrl: calendlyUrl }"
                  :button-props="{ size: 'lg', variant: 'primary' }"
                />
              </div>
              <div v-if="showGlobalDiscount">
                <SharedButton
                  :button="{
                    label: discountLabel,
                    method: SharedButtonMethod.ACTION,
                    action: SharedButtonAction.NEWSLETTER_SIGN_UP,
                  }"
                  :button-props="{ size: 'lg', variant: 'secondary' }"
                />
              </div>
            </div>
            <div class="treatmentHero__reviews">
              <UiMoleculeReviewsBadge
                v-if="showReviews"
                show-text
                :source="ReviewSource.GOOGLE"
                :rating="5"
              />
            </div>
          </div>
          <ul v-if="showCompanyLogos" class="treatmentHero__logos">
            <li>
              <ImageBildLogo class="logo" style="max-height: 30px" />
            </li>
            <li>
              <ImageWdrLogo class="logo" style="max-height: 18px" />
            </li>
            <li>
              <ImageTheSunLogo class="logo" style="max-height: 20px" />
            </li>
            <li>
              <ImageRtlLogo class="logo" style="max-height: 16px" />
            </li>
          </ul>
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import {
  ReviewSource,
  ImageFormat,
  ImageBreakpoint,
  SharedButtonMethod,
  SharedButtonAction,
} from "~/lib/strapi/dto/enums";
import type { BlockTreatmentHeroDto } from "~/lib/strapi/dto/components";
import { IconAsterisk } from "@tabler/icons-vue";

const props = defineProps<BlockTreatmentHeroDto>();
const globals = useGlobals();

const marqueeItems = computed(() => {
  const raw = (props.announcementText ?? "").trim();
  if (!raw) return [];
  return raw
    .split(/\*{3}/g)
    .map((s) => s.trim())
    .filter(Boolean);
});

const marqueeTrackItems = computed(() => {
  const items = marqueeItems.value;
  if (!items.length) return [];

  // We want the track to ALWAYS be wider than the viewport to ensure there are never any "gaps".
  // Without DOM measurement, we use a pragmatic heuristic: repeat the items
  // until a minimum text length is reached.
  const minChars = 180; // roughly: enough for "full width" in most layouts

  const base: string[] = [];
  let chars = 0;
  let guard = 0;
  while (chars < minChars && guard < 50) {
    for (const it of items) {
      base.push(it);
      chars += it.length + 3; // + Separator/Spacing roughly
      if (chars >= minChars) break;
    }
    guard++;
  }

  // For infinite scrolling: render Base 2x and then shift by -50%.
  return [...base, ...base];
});

const marqueeDurationSeconds = computed(() => {
  const items = marqueeTrackItems.value;
  if (!items.length) return 0;
  // TrackItems contains Base*2 → we want the duration to align with Base.
  const totalChars = Math.max(1, Math.round(items.join(" ").length / 2));
  // Rough duration based on text length, limited.
  const seconds = totalChars / 4; // ~4 chars/s (etwas langsamer)
  return Math.min(60, Math.max(16, Math.round(seconds)));
});

const priceLabel = computed(() => {
  if (!props.showPrice) return "";
  const price =
    props.treatment?.priceInEuroCent ||
    props.treatment?.cheapestPriceInEuroCent;
  const isStarting = props.treatment?.isStartingPrice;
  return formatPriceInEuro(price as number, {
    prefix: isStarting ? $t("common.price.startingPrefix") : undefined,
  });
});

const discountLabel = computed(() => {
  const pct = globals.value?.ecommerce?.newsletterDiscountPercentage;
  return $t("blocks.treatmentHero.discountCta", { pct });
});
</script>

<style scoped>
.treatmentHero {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.treatmentHero__media {
  aspect-ratio: 5 / 3;
  flex: 1 1 50%;
  padding: var(--space-card-figure-pad) var(--space-card-figure-pad) 0;
}

.treatmentHero__media__image {
  position: relative;
  display: block;
  height: 100%;
}

.treatmentHero__media__image :deep(img) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: var(--border-radius-card-figure);
}

.treatmentHero__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  flex: 1 1 50%;
  min-width: 0;
}

.treatmentHero__marquee {
  margin: var(--space-card-figure-pad) var(--space-card-figure-pad) 0
    var(--space-card-figure-pad);
  padding: var(--space-300) 0;
  background: linear-gradient(to right, #f6eef6, #fff5f1);
  border-radius: var(--border-radius-card-figure)
    var(--border-radius-card-figure) var(--border-radius-200)
    var(--border-radius-200);
  overflow: hidden;
}

.treatmentHero__marquee__viewport {
  min-width: 0;
  width: 100%;
  overflow: hidden;
}

.treatmentHero__marquee__track {
  display: inline-flex;
  align-items: center;
  gap: var(--space-300);
  flex-shrink: 0;
  width: max-content;
  line-height: 1;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-gray-900);
  white-space: nowrap;
  will-change: transform;
  animation: treatmentHeroMarquee var(--marquee-duration, 20s) linear infinite;
}

.treatmentHero__marquee__item,
.treatmentHero__marquee__sep {
  flex: 0 0 auto;
}

.treatmentHero__marquee__sep {
  opacity: 0.6;
}

@keyframes treatmentHeroMarquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .treatmentHero__marquee__track {
    animation: none;
    transform: none;
  }
  .treatmentHero__marquee__viewport {
    overflow-x: auto;
  }
}

.treatmentHero__main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  gap: var(--space-500);
  padding: var(--space-card-pad) var(--space-card-pad);
  text-align: center;
}

.treatmentHero__main h1 {
  max-width: 18ch;
  margin-top: var(--space-400);
}

.treatmentHero__headlinePrefix,
.treatmentHero__headlineSuffix {
  display: block;
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-400);
}

.treatmentHero__headlineSuffix {
  margin: var(--space-400) 0 0;
}

.treatmentHero__main > p {
  max-width: 48ch;
  color: var(--color-text-light);
}

.treatmentHero__eyebrow {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
}

.treatmentHero__cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
}

.treatmentHero__cta__priceWrap {
  display: contents;
}

.treatmentHero__cta__priceWrap--withPrice {
  display: inline-flex;
  align-items: center;
  gap: var(--space-200);
  padding: var(--space-200);
  background: var(--color-black);
  border-radius: 999px;
  --button-primary-color-bg: var(--color-white);
  --button-primary-color-bg-hover: var(--color-gray-200);
  --button-primary-color-text: var(--color-black);
}

.card--strong .treatmentHero__cta__priceWrap--withPrice {
  background: var(--color-gray-800);
}

.treatmentHero__cta__priceWrap--withPrice > b {
  padding: 0 var(--space-300) 0 var(--space-400);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-white);
}

.treatmentHero__reviews {
  margin-top: var(--space-200);
}

.treatmentHero__logos {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--space-600);
  row-gap: var(--space-400);
  margin: 0 var(--space-card-pad);
  padding: var(--space-card-pad) 0;
  color: var(--color-text-light);
  border-top: var(--color-border-mute) 1px solid;
}

.treatmentHero__logos svg {
  height: 40px;
  max-height: 40px;
}

.treatmentHero--hasMarquee .treatmentHero__media__image :deep(img) {
  border-radius: var(--border-radius-200) var(--border-radius-200)
    var(--border-radius-card-figure) var(--border-radius-card-figure);
}

.treatmentHero--hasReviews .treatmentHero__main h1 {
  margin-top: var(--space-800);
}

.treatmentHero--hasReviews .treatmentHero__eyebrow + h1 {
  margin-top: 0;
}

@media screen and (min-width: 900px) {
  .treatmentHero {
    flex-direction: row;
  }

  .treatmentHero__media {
    order: 2;
    padding: var(--space-card-figure-pad) var(--space-card-figure-pad)
      var(--space-card-figure-pad) 0;
  }

  .treatmentHero__body {
    order: 1;
  }

  .treatmentHero__logos {
    gap: var(--space-800);
    row-gap: var(--space-600);
  }

  .treatmentHero__marquee {
    border-radius: var(--border-radius-card-figure)
      var(--border-radius-card-figure) var(--border-radius-200)
      var(--border-radius-200);
  }

  .treatmentHero--hasMarquee .treatmentHero__media__image :deep(img) {
    border-radius: var(--border-radius-200) var(--border-radius-200)
      var(--border-radius-card-figure) var(--border-radius-card-figure);
  }
}
</style>
