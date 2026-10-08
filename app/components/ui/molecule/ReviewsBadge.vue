<template>
  <component
    :is="locationLink ? 'a' : 'div'"
    class="reviewsBadge"
    :class="{ 'reviewsBadge--link': !!locationLink }"
    :style="{ '--reviewsBadge-height': height }"
    :href="locationLink || undefined"
    :target="locationLink ? '_blank' : undefined"
    :rel="locationLink ? 'noopener noreferrer' : undefined"
    :aria-label="linkAriaLabel"
  >
    <div v-if="isResolvingLocalDecision" class="reviewsBadge__placeholder">
      <span class="reviewsBadge__placeholder-brand" aria-hidden="true" />
      <span class="reviewsBadge__placeholder-line" aria-hidden="true" />
    </div>
    <div v-else class="reviewsBadge__icons">
      <svg
        v-if="source === ReviewSource.GOOGLE"
        class="reviewsBadge__icons__brand"
        viewBox="0 0 26 26"
        aria-hidden="true"
        focusable="false"
      >
        <use href="#rb-google" />
      </svg>
      <IconMessageCircle
        v-else-if="source === ReviewSource.OTHER"
        class="reviewsBadge__icons__brand"
        aria-hidden="true"
        focusable="false"
      />
      <div
        v-if="showRatingCircle"
        class="reviewsBadge__icons__value"
        :aria-label="`${t('common.rating')}: ${ratingDisplay}`"
      >
        <svg
          class="reviewsBadge__icons__value-bg"
          viewBox="1.5 2.5 21 19"
          aria-hidden="true"
        >
          <use href="#rb-value-bg" />
        </svg>
        <span>{{ ratingDisplay }}</span>
      </div>

      <div class="reviewsBadge__icons__rating">
        <span>{{ reviewCountText }}</span>
        <div role="img" :aria-label="ratingAriaLabel">
          <!-- TSEO-13: Grafiken aus ReviewsBadgeSprite (app.vue) -->
          <svg
            v-for="i in stars.full"
            :key="`full-${i}`"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <use href="#rb-star" />
          </svg>
          <svg v-if="stars.half" key="half" viewBox="0 0 24 24" aria-hidden="true">
            <use href="#rb-star-half" />
          </svg>
          <svg
            v-for="i in stars.empty"
            :key="`empty-${i}`"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <use href="#rb-star-empty" />
          </svg>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import {
  IconMessageCircle,
} from "@tabler/icons-vue";
import { ReviewSource } from "~/lib/strapi/dto/enums";
import {
  getGoogleReviewAggregate,
  getGoogleReviewForPlace,
} from "~/utils/schemaLocation";

type StarDistribution = {
  full: number;
  half: boolean;
  empty: number;
};

const props = withDefaults(
  defineProps<{
    rating?: number;
    height?: string;
    source?: ReviewSource;
    googlePlaceId?: string;
    localRatingThreshold?: number;
    localMinReviews?: number;
    singleReview?: boolean;
    sourceUrl?: string;
  }>(),
  {
    source: ReviewSource.GOOGLE,
    height: "2rem",
    localRatingThreshold: 0,
    localMinReviews: 0,
  },
);

const { t } = useI18n();
const { formatInteger, localeIso } = useFormatInteger();
const globals = useGlobals();

const isLocationVariant = computed(() => !!props.googlePlaceId);

// Standort-Ratings kommen aus statischen, täglich per GitHub Action
// ("Update Google Ratings") aktualisierten Werten – siehe
// getGoogleReviewForPlace() in app/utils/schemaLocation.ts.
//
// Früher wurde hier bei JEDEM SSR-Render pro Standort /api/google-reviews
// aufgerufen, was die teure Google Places "Place Details (Enterprise)"-API
// getriggert hat (Hauptkostentreiber). Da die Werte sich praktisch nie
// innerhalb eines Tages ändern, greifen wir jetzt direkt auf die statischen
// Werte zu → 0 Google-API-Aufrufe pro Seitenaufruf.
const locationData = computed(() => getGoogleReviewForPlace(props.googlePlaceId));

// Es gibt keinen asynchronen Ladezustand mehr – Werte sind sofort verfügbar.
const isResolvingLocalDecision = computed(() => false);

const shouldUseLocalRating = computed(() => {
  if (!isLocationVariant.value) return false;

  const rating = locationData.value?.rating;
  const userRatingsTotal = locationData.value?.userRatingsTotal ?? 0;
  if (rating == null) return false;

  return (
    rating >= props.localRatingThreshold &&
    userRatingsTotal >= props.localMinReviews
  );
});

// Conversion-Audit #80: Der globale Badge zeigte nur "1.538+ 5-Sterne" ohne
// Note. Die gewichtete Durchschnittsnote aller Standorte (Google, täglich
// aktualisiert) ist belegbar und wird im globalen Fall als Note angezeigt.
const aggregateData = computed(() =>
  isLocationVariant.value || props.source !== ReviewSource.GOOGLE
    ? null
    : getGoogleReviewAggregate(),
);

const effectiveRating = computed(() => {
  if (shouldUseLocalRating.value && locationData.value?.rating != null) {
    return locationData.value.rating;
  }
  if (aggregateData.value) return aggregateData.value.rating;
  return props.rating ?? 0;
});

const normalizedRating = computed(() => {
  const value = effectiveRating.value;
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(5, value));
});

function getStarDistribution(rating: number): StarDistribution {
  const floor = Math.floor(rating);
  const decimal = rating - floor;

  if (decimal >= 0.75) {
    const full = Math.ceil(rating);
    return { full, half: false, empty: 5 - full };
  }

  if (decimal >= 0.25) {
    return { full: floor, half: true, empty: 5 - floor - 1 };
  }

  return { full: floor, half: false, empty: 5 - floor };
}

const stars = computed<StarDistribution>(() =>
  getStarDistribution(normalizedRating.value),
);

const ratingDisplay = computed(() => {
  return normalizedRating.value.toLocaleString(localeIso.value, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
});

const showRatingCircle = computed(
  () =>
    (shouldUseLocalRating.value && locationData.value != null) ||
    (!props.singleReview && aggregateData.value != null),
);

const reviewCountText = computed(() => {
  if (props.singleReview) {
    return t("common.review");
  }

  if (shouldUseLocalRating.value) {
    const count = locationData.value?.userRatingsTotal ?? 0;
    return t("common.reviewsCount", { count: formatInteger(count) });
  }

  const count = Number(globals.value?.marketing?.fiveStarReviewsCount ?? 0);
  return `${formatInteger(count)}+ ${t("common.five-star")}`;
});

const locationLink = computed(
  () =>
    props.sourceUrl ??
    (shouldUseLocalRating.value ? locationData.value?.placeUrl : null) ??
    null,
);

const linkAriaLabel = computed(() => {
  const sourceName = (props.source ?? ReviewSource.GOOGLE)
    .toString()
    .toLowerCase();
  return t("common.reviewLinkLabel", { source: sourceName });
});

const ratingAriaLabel = computed(
  () => `${t("common.rating")}: ${normalizedRating.value.toFixed(1)}/5`,
);
</script>

<style scoped>
.reviewsBadge {
  display: inline-flex;
  flex-direction: column;
  text-decoration: none;
  gap: var(--space-200);
  font-size: var(--reviewsBadge-height, 2rem);
}

.reviewsBadge--link {
  cursor: pointer;
  transition: transform 0.2s;
}

.reviewsBadge--link:hover {
  transform: scale(1.025);
}

.reviewsBadge__icons {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-200);
}

.reviewsBadge__placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-200);
}

.reviewsBadge__placeholder-brand {
  width: 1em;
  height: 1em;
  border-radius: 999px;
  background: var(--color-gray-200);
  animation: reviews-badge-pulse 1.1s ease-in-out infinite;
}

.reviewsBadge__placeholder-line {
  width: 4.8em;
  height: 0.75em;
  border-radius: 999px;
  background: var(--color-gray-200);
  animation: reviews-badge-pulse 1.1s ease-in-out infinite;
}

.reviewsBadge__icons__brand {
  height: 1em;
  width: 1em;
  flex-shrink: 0;
}

.reviewsBadge__icons__brand :deep(svg) {
  display: block;
  height: 100%;
  width: 100%;
}

.reviewsBadge__icons__value {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2em;
  height: 1.2em;
  font-weight: var(--font-bold);
}

.reviewsBadge__icons__value-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.reviewsBadge__icons__value > span {
  font-size: 0.38em;
  line-height: 1;
  color: var(--color-text-light);
  position: relative;
  z-index: 1;
}

.reviewsBadge__icons__rating {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.075em;
  height: 100%;
}

.reviewsBadge__icons__rating > span {
  font-size: 0.4em;
  line-height: 1;
  text-transform: uppercase;
  color: var(--color-text-light);
  font-weight: var(--font-bold);
}

.reviewsBadge__icons__rating > div {
  display: inline-flex;
  gap: 0.05em;
}

.reviewsBadge__icons__rating > div > :deep(svg) {
  height: 0.45em;
  width: 0.45em;
  color: var(--color-text-light);
}

@keyframes reviews-badge-pulse {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 0.85;
  }
}
</style>
