<template>
  <UiLayoutSectionBlock v-if="hasReviews">
    <UiLayoutCardSurface>
      <div
        class="reviews"
        :class="reviewsCountClass"
      >
        <header
          class="reviews__header reviews__header--static"
          :class="themeClass(1)"
        >
          <h2 v-if="displayHeadline" :id="headingId">{{ displayHeadline }}</h2>
          <SharedButton :button="ctaButton" />
        </header>
        <div v-if="!isDesktop" class="reviews__body reviews__body--scroll">
          <UiOrganismHorizontalScroll class="reviews__scroll">
            <article
              v-for="(review, index) in reviews"
              :key="review.id ?? index"
              :class="themeClass(index)"
            >
              <UiMoleculeReviewItem
                :author="review.author"
                :text="review.text"
                :rating="review.rating"
                :city="review.location?.address?.city"
                :location="review.location?.name"
                :address="review.location?.address"
                :source="review.source"
                :source-url="review.sourceUrl"
              />
            </article>
          </UiOrganismHorizontalScroll>
        </div>
        <div v-else class="reviews__body reviews__body--grid">
          <header
            class="reviews__header reviews__header--floating"
            :class="themeClass(1)"
          >
            <h2 :id="headingId">{{ displayHeadline }}</h2>
            <div>
              <SharedButton :button="ctaButton" />
            </div>
          </header>
          <article
            v-for="(review, index) in reviews"
            :key="review.id ?? index"
            :class="themeClass(index)"
          >
            <UiMoleculeReviewItem
              :author="review.author"
              :text="review.text"
              :rating="review.rating"
              :city="review.location?.address?.city"
              :location="review.location?.name"
              :address="review.location?.address"
              :source="review.source"
              :source-url="review.sourceUrl"
            />
          </article>
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import {
  ColorTheme,
  SharedButtonMethod,
  SharedButtonAction,
} from "~/lib/strapi/dto/enums";
import type { ReviewDto } from "~/lib/strapi/dto/collections";
import type { BlockReviewsDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockReviewsDto>();
const { t } = useI18n();
const headingId = useId();
const isDesktop = ref(false);

let mq: MediaQueryList | null = null;

function setDesktop(e?: MediaQueryListEvent) {
  isDesktop.value = e?.matches ?? mq?.matches ?? false;
}

onMounted(() => {
  mq = window.matchMedia("(min-width: 1200px)");
  setDesktop();
  mq.addEventListener("change", setDesktop);
});

onUnmounted(() => {
  mq?.removeEventListener("change", setDesktop);
});

const reviews = computed(() => (props.reviews ?? []) as ReviewDto[]);

const hasReviews = computed(() => reviews.value.length > 0);

const displayHeadline = computed(
  () => props.headline || t("blocks.reviews.headline"),
);

const reviewsCountClass = computed(
  () => `reviews--count-${reviews.value.length}`,
);

const ctaButton = computed(() => ({
  label: t("cta.bookAppointment"),
  method: SharedButtonMethod.ACTION,
  action: SharedButtonAction.APPOINTMENT_BOOKING,
}));

function themeClass(index: number) {
  const theme =
    index % 2 === 0
      ? props.evenItemsTheme ?? ColorTheme.NEUTRAL
      : props.oddItemsTheme ?? ColorTheme.SOFT;
  return {
    "theme-light": theme === ColorTheme.LIGHT,
    "theme-soft": theme === ColorTheme.SOFT,
    "theme-neutral": theme === ColorTheme.NEUTRAL,
    "theme-strong": theme === ColorTheme.STRONG,
  };
}
</script>

<style scoped>
.reviews {
  display: flex;
  flex-direction: column;
  gap: var(--space-card-figure-pad);
  padding: var(--space-card-figure-pad);
}

.reviews__header {
  padding: calc(var(--space-card-pad) - var(--space-card-figure-pad));
  background-color: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card-figure)
    var(--border-radius-card-figure) var(--border-radius-100)
    var(--border-radius-100);
}

.reviews__header--static h2 {
  margin: 0 0 var(--space-600);
}

.reviews__header--floating {
  display: none;
}

.reviews__scroll {
  --horizontalScroll-padding-x: var(--space-400);
  --horizontalScroll-padding-y: var(--space-card-pad-xs);
}

.reviews__body :deep(.horizontalScroll__container) {
  scroll-padding-inline: var(--space-400);
}

.reviews__body :deep(.horizontalScroll__container > *) {
  flex: 0 0 300px;
}

.reviews__body--grid {
  display: flex;
  flex-wrap: wrap;
  overflow-x: hidden;
  border-radius: var(--border-radius-card-figure);
}

.reviews__body--grid > *:nth-child(-n + 3) {
  flex: 1 1 33%;
}

.reviews__body--grid > *:first-child {
  border-radius: var(--border-radius-card-figure) var(--border-radius-100)
    var(--border-radius-100) var(--border-radius-100);
}

.reviews__body--grid > *:nth-child(n + 4) {
  flex: 1 0 260px;
}

.reviews__body article {
  display: flex;
  padding: calc(var(--space-card-pad-sm) - var(--space-card-figure-pad));
  background-color: var(--card-color-bg);
  border-radius: var(--border-radius-400);
  color: var(--color-text);
}

@media (min-width: 1200px) {
  .reviews {
    display: block;
  }

  .reviews__body {
    display: flex;
    gap: var(--space-card-figure-pad);
    border-radius: var(--border-radius-100) var(--border-radius-100)
      var(--border-radius-card-figure) var(--border-radius-card-figure);
  }

  .reviews__header--floating {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .reviews__header--static {
    display: none;
  }
}
</style>
