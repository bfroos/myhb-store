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
    <div class="reviewsBadge__icons">
      <svg
        v-if="source === ReviewSource.GOOGLE"
        class="reviewsBadge__icons__brand"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 26 26"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M25.154 13.125a14.75 14.75 0 0 0-.233-2.625H12.834v4.97h6.907c-.303 1.598-1.213 2.952-2.578 3.862v3.232h4.165c2.427-2.24 3.827-5.53 3.827-9.438z"
          fill="#4285f4"
        />
        <path
          d="M12.834 25.667c3.465 0 6.37-1.143 8.493-3.103l-4.165-3.232c-1.143.77-2.602 1.237-4.328 1.237-3.337 0-6.172-2.252-7.187-5.285h-4.27v3.313c2.112 4.188 6.44 7.07 11.457 7.07z"
          fill="#34a853"
        />
        <path
          d="M5.647 15.271a7.69 7.69 0 0 1-.408-2.438 7.69 7.69 0 0 1 .408-2.438V7.081h-4.27C.502 8.808 0 10.756 0 12.833s.502 4.025 1.377 5.752l3.325-2.59.945-.723z"
          fill="#fbbc05"
        />
        <path
          d="M12.834 5.11c1.89 0 3.57.653 4.912 1.913l3.675-3.675C19.192 1.272 16.299 0 12.834 0 7.817 0 3.489 2.882 1.377 7.082l4.27 3.313c1.015-3.033 3.85-5.285 7.187-5.285z"
          fill="#ea4335"
        />
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
          xmlns="http://www.w3.org/2000/svg"
          viewBox="1.5 2.5 21 19"
          aria-hidden="true"
          fill="none"
          stroke="var(--color-text-light)"
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1"
          />
        </svg>
        <span>{{ ratingDisplay }}</span>
      </div>

      <div class="reviewsBadge__icons__rating">
        <span>{{ reviewCountText }}</span>
        <div role="img" :aria-label="ratingAriaLabel">
          <IconStarFilled
            v-for="i in stars.full"
            :key="`full-${i}`"
            aria-hidden="true"
          />
          <IconStarHalfFilled v-if="stars.half" key="half" aria-hidden="true" />
          <IconStar
            v-for="i in stars.empty"
            :key="`empty-${i}`"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import {
  IconStarFilled,
  IconStarHalfFilled,
  IconStar,
  IconMessageCircle,
} from "@tabler/icons-vue";
import { ReviewSource } from "~/lib/strapi/dto/enums";

type GoogleReviewsResponse = {
  placeId: string;
  placeName: string | null;
  placeUrl: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
};

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
    singleReview?: boolean;
    sourceUrl?: string;
  }>(),
  {
    source: ReviewSource.GOOGLE,
    height: "2rem",
  },
);

const { t, locale } = useI18n();
const { formatInteger, localeIso } = useFormatInteger();
const globals = useGlobals();

const isLocationVariant = computed(() => !!props.googlePlaceId);

const asyncDataKey = computed(() => {
  if (!props.googlePlaceId) return null;
  return `google-reviews:${props.googlePlaceId}:${locale.value}`;
});

const { data: locationFetchData } =
  await useAsyncData<GoogleReviewsResponse | null>(
    () => asyncDataKey.value ?? "google-reviews:none",
    async () => {
      if (!props.googlePlaceId) return null;
      try {
        return await $fetch<GoogleReviewsResponse>("/api/google-reviews", {
          query: {
            placeId: props.googlePlaceId,
            language: locale.value,
          },
        });
      } catch {
        return null;
      }
    },
    {
      watch: [() => props.googlePlaceId, () => locale.value],
    },
  );

const locationData = computed(() => {
  const data = locationFetchData.value;
  if (!data) return null;
  return {
    rating: data.rating,
    userRatingsTotal: data.userRatingsTotal,
    placeUrl: data.placeUrl,
  };
});

const effectiveRating = computed(() => {
  if (isLocationVariant.value && locationData.value?.rating != null) {
    return locationData.value.rating;
  }
  return props.rating ?? (isLocationVariant.value ? 5 : 0);
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
  () => isLocationVariant.value && locationData.value != null,
);

const reviewCountText = computed(() => {
  if (props.singleReview) {
    return t("common.review");
  }

  if (isLocationVariant.value) {
    const count = locationData.value?.userRatingsTotal ?? 0;
    return t("common.reviewsCount", { count: formatInteger(count) });
  }

  const count = Number(globals.value?.marketing?.fiveStarReviewsCount ?? 0);
  return `${formatInteger(count)}+ ${t("common.five-star")}`;
});

const locationLink = computed(
  () => props.sourceUrl ?? locationData.value?.placeUrl ?? null,
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
</style>
