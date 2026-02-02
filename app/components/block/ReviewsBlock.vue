<template>
  <UiLayoutSectionBlock v-if="reviews && reviews.length > 0">
    <UiLayoutCardSurface>
      <div
        class="reviewsCard"
        :class="getReviewsCountClass()"
        role="region"
        :aria-labelledby="headingId"
      >
        <div
          class="reviewsCard__header reviewsCard__header--static"
          :class="getThemeStyles(1)"
        >
          <h2 v-if="headline" :id="headingId">
            {{ headline || t("blocks.reviews.headline") }}
          </h2>
          <SharedButton
            :button="{
              label: $t('cta.bookAppointment'),
              method: SharedButtonMethod.ACTION,
              action: SharedButtonAction.APPOINTMENT_BOOKING,
            }"
          />
        </div>
        <div
          v-if="!isDesktop"
          class="reviewsCard__body reviewsCard__body--scroll"
        >
          <UiOrganismHorizontalScroll
            :style="{
              '--horizontalScroll-padding-x': 'var(--space-400)',
              '--horizontalScroll-padding-y': 'var(--space-card-pad-xs)',
            }"
          >
            <article
              v-for="(review, index) in reviews"
              :key="review.id ?? index"
              :class="getThemeStyles(index)"
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
        <div v-else class="reviewsCard__body reviewsCard__body--grid">
          <div
            class="reviewsCard__header reviewsCard__header--floating"
            :class="getThemeStyles(1)"
          >
            <h2 :id="headingId">
              {{ headline || t("blocks.reviews.headline") }}
            </h2>
            <div>
              <SharedButton
                :button="{
                  label: $t('cta.bookAppointment'),
                  method: SharedButtonMethod.ACTION,
                  action: SharedButtonAction.APPOINTMENT_BOOKING,
                }"
              />
            </div>
          </div>
          <article
            v-for="(review, index) in reviews"
            :key="review.id ?? index"
            :class="getThemeStyles(index)"
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
import { computed, useId, ref, onMounted, onUnmounted } from "vue";
import type { BlockReviewsDto } from "~/lib/strapi/dto/components";
const { t } = useI18n();
const props = defineProps<BlockReviewsDto>();

const headingId = useId();

const isDesktop = ref(false);

onMounted(() => {
  const mq = window.matchMedia("(min-width: 1200px)");
  isDesktop.value = mq.matches;
  const handler = (e: MediaQueryListEvent) => {
    isDesktop.value = e.matches;
  };
  mq.addEventListener("change", handler);
  onUnmounted(() => mq.removeEventListener("change", handler));
});

const reviews = computed(() => (props.reviews ?? []) as ReviewDto[]);

const getThemeStyles = (index: number) => {
  if (index % 2 === 0) {
    const theme = props.evenItemsTheme ?? ColorTheme.NEUTRAL;
    return {
      "theme-light": theme === ColorTheme.LIGHT,
      "theme-soft": theme === ColorTheme.SOFT,
      "theme-neutral": theme === ColorTheme.NEUTRAL,
      "theme-strong": theme === ColorTheme.STRONG,
    };
  } else {
    const theme = props.oddItemsTheme ?? ColorTheme.SOFT;
    return {
      "theme-light": theme === ColorTheme.LIGHT,
      "theme-soft": theme === ColorTheme.SOFT,
      "theme-neutral": theme === ColorTheme.NEUTRAL,
      "theme-strong": theme === ColorTheme.STRONG,
    };
  }
};

const getReviewsCountClass = () => {
  return `reviewsCard--count-${reviews.value.length}`;
};
</script>

<style scoped>
.reviewsCard {
  display: flex;
  flex-direction: column;
  gap: var(--space-card-figure-pad);
  padding: var(--space-card-figure-pad);
}

.reviewsCard__header {
  border-radius: var(--border-radius-card-figure)
    var(--border-radius-card-figure) var(--border-radius-100)
    var(--border-radius-100);
  padding: calc(var(--space-card-pad) - var(--space-card-figure-pad));
  background-color: var(--card-color-bg);
  color: var(--color-text);
}

.reviewsCard__body :deep(.horizontalScroll__container) {
  scroll-padding-left: var(--space-400);
  scroll-padding-right: var(--space-400);
}

.reviewsCard__body :deep(.horizontalScroll__container > *) {
  flex: 0 0 300px;
}

.reviewsCard__body--grid {
  flex-wrap: wrap;
  overflow-x: hidden;
  border-radius: var(--border-radius-card-figure);
}

.reviewsCard__body--grid > *:nth-child(-n + 3) {
  flex: 1 1 33%;
}

.reviewsCard__body--grid > *:first-child {
  border-radius: var(--border-radius-card-figure) var(--border-radius-100)
    var(--border-radius-100) var(--border-radius-100);
}

.reviewsCard__body--grid > *:nth-child(n + 4) {
  flex: 1 0 260px;
}

.reviewsCard__body article {
  display: flex;
  padding: calc(var(--space-card-pad-sm) - var(--space-card-figure-pad));
  background-color: var(--card-color-bg);
  border-radius: var(--border-radius-400);
  color: var(--color-text);
}

.reviewsCard__header--static h2 {
  margin: 0 0 var(--space-600);
}

.reviewsCard__header--floating {
  display: none;
}

@media screen and (min-width: 1200px) {
  .reviewsCard {
    display: block;
  }

  .reviewsCard__body {
    display: flex;
    gap: var(--space-card-figure-pad);
    border-radius: var(--border-radius-100) var(--border-radius-100)
      var(--border-radius-card-figure) var(--border-radius-card-figure);
  }

  .reviewsCard__header--floating {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .reviewsCard__header--static {
    display: none;
  }
}
</style>
