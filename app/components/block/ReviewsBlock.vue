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
        </div>
        <div class="reviewsCard__body" tabindex="0">
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
import { computed, useId } from "vue";
import type { BlockReviewsDto } from "~/lib/strapi/dto/components";
const { t } = useI18n();
const props = defineProps<BlockReviewsDto>();

const headingId = useId();

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
  padding: calc(var(--space-card-pad-sm) - var(--space-card-figure-pad));
  background-color: var(--card-color-bg);
  color: var(--color-text);
}
.reviewsCard__body {
  display: flex;
  gap: var(--space-card-figure-pad);
  border-radius: var(--border-radius-100) var(--border-radius-100)
    var(--border-radius-card-figure) var(--border-radius-card-figure);

  overflow-x: scroll;

  scroll-snap-type: x mandatory;
}
.reviewsCard__body article {
  display: flex;
  flex: 0 0 300px;
  padding: calc(var(--space-card-pad-sm) - var(--space-card-figure-pad));
  background-color: var(--card-color-bg);
  color: var(--color-text);
  scroll-snap-align: start;
}

.reviewsCard__header--floating {
  display: none;
}

@media screen and (min-width: 900px) {
  .reviewsCard {
    display: grid;
    grid-template-columns: 2fr 5fr;
  }
  .reviewsCard__header {
    border-radius: var(--border-radius-card-figure) var(--border-radius-100)
      var(--border-radius-100) var(--border-radius-card-figure);
  }
  .reviewsCard__body {
    border-radius: var(--border-radius-100) var(--border-radius-card-figure)
      var(--border-radius-card-figure) var(--border-radius-100);
  }
}

@media screen and (min-width: 1200px) {
  .reviewsCard {
    display: block;
  }
  .reviewsCard__body {
    flex-wrap: wrap;
    border-radius: var(--border-radius-card-figure);
    overflow-x: hidden;
  }
  .reviewsCard__header--floating {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .reviewsCard__header--static {
    display: none;
  }
  .reviewsCard__body > *:nth-child(-n + 3) {
    flex: 1 1 33%;
  }
  .reviewsCard__body > *:first-child {
    border-radius: var(--border-radius-card-figure) var(--border-radius-100)
      var(--border-radius-100) var(--border-radius-100);
  }
  .reviewsCard__body > *:nth-child(n + 4) {
    flex: 1 0 260px;
  }
}
</style>
