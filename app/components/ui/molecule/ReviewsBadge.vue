<template>
  <div class="reviewsBadge" :style="{ '--reviewsBadge-height': height }">
    <div class="reviewsBadge__symbol">
      <svg
        v-if="source === ReviewSource.GOOGLE"
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
      <IconMessageCircle v-else-if="source === ReviewSource.OTHER" />
      <span class="reviewsBadge__label">{{ $t("common.reviews") }}</span>
      <div
        class="reviewsBadge__rating"
        role="img"
        :aria-label="ratingAriaLabel"
      >
        <IconStarFilled
          v-for="i in rating || 0"
          :key="i"
          size="1em"
          aria-hidden="true"
          focusable="false"
        />
        <IconStar
          v-for="i in 5 - (rating ?? 0)"
          :key="i"
          size="1em"
          aria-hidden="true"
          focusable="false"
        />
      </div>
    </div>
    <span
      v-if="showText"
      class="reviewsBadge__text"
      :aria-label="fiveStarAriaLabel"
    >
      {{ globals.marketing?.fiveStarReviewsCount }} <br />{{
        $t("common.five-star")
      }}
    </span>
  </div>
</template>
<script setup lang="ts">
import { IconStarFilled, IconStar, IconMessageCircle } from "@tabler/icons-vue";
import { ReviewSource } from "~/lib/strapi/dto/enums";

const props = defineProps<{
  rating?: number;
  showText?: boolean;
  height?: string;
  source?: ReviewSource;
}>();

const { t } = useI18n();
const globals = useGlobals();

const normalizedRating = computed(() => {
  const value = props.rating ?? 0;
  const safe = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(5, safe));
});

const ratingAriaLabel = computed(
  () => `${t("common.reviews")}: ${normalizedRating.value}/5`
);
const fiveStarAriaLabel = computed(
  () =>
    `${globals.value?.marketing?.fiveStarReviewsCount} ${t(
      "common.five-star"
    )} ${t("common.reviews")}`
);
</script>
<style scoped>
.reviewsBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-500);
  text-align: left;
  font-size: var(--reviewsBadge-height, 2rem);
  font-weight: var(--font-bold);
}
.reviewsBadge__symbol {
  display: inline-grid;
  grid-template-columns: max-content 1fr;
  grid-template-rows: 0.5em 0.5em;
  grid-template-areas:
    "badge text"
    "badge rating";
  align-items: center;
  column-gap: 0.175em;
  row-gap: 0.075em;
  color: var(--color-text-light);
}
.reviewsBadge__symbol > svg {
  height: 1em;
  width: 1em;
  grid-area: badge;
}
.reviewsBadge__label {
  font-size: 0.375em;
  line-height: 1;
  grid-area: text;
  text-transform: uppercase;
}
.reviewsBadge__symbol .reviewsBadge__rating {
  grid-area: rating;
  font-size: 0.4375em;
  line-height: 1;
}
.reviewsBadge__text {
  font-size: 0.375em;
  line-height: 1.25;
  color: var(--color-text-light);
}
</style>
