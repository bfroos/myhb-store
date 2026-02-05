<template>
  <UiLayoutSectionBlock v-if="hasAnyInformation">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <article
        class="details"
        :class="{
          'details--with-image': hasImage,
          'details--without-image': !hasImage,
        }"
      >
        <header class="details__header">
          <h2 class="details__title">{{ displayHeadline }}</h2>
        </header>
        <div class="details__body">
          <UiAtomMediaPicture
            v-if="hasImage"
            class="details__image"
            :media="image!"
            :sources="{
              [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
            }"
          />
          <dl class="details__list">
            <div
              v-for="field in detailFields"
              :key="field.key"
              :class="['details__field', `details__field--${field.key}`]"
            >
              <dt class="details__term">
                <span class="details__label">
                  <span class="details__icon" aria-hidden="true">
                    <component :is="field.icon" size="100%" stroke="1" />
                  </span>
                  <span>{{ field.label }}</span>
                </span>
              </dt>
              <dd class="details__value">
                {{ formatFieldValue(field.value) }}
              </dd>
            </div>
          </dl>
        </div>
      </article>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";
import {
  IconTag,
  IconClock,
  IconSunrise,
  IconPill,
  IconSunHigh,
  IconZzz,
  IconRepeat,
  IconSparkles2,
  IconHourglassLow,
  IconReportMedical,
} from "@tabler/icons-vue";
import type { BlockTreatmentDetailsDto } from "~/lib/strapi/dto/components";
import { isMediaImage } from "~/utils/media";
import { replacePlaceholderString } from "~/utils/placeholder";

const props = defineProps<BlockTreatmentDetailsDto>();
const { t } = useI18n();

const hasImage = computed(() => !!props.image && isMediaImage(props.image));

const displayHeadline = computed(() => {
  if (!props.treatment?.name) {
    return t("blocks.treatmentDetails.headline");
  }
  return `${props.treatment.name}: ${t("blocks.treatmentDetails.headline")}`;
});

const hasAnyInformation = computed(
  () =>
    !!(
      props.price ||
      props.duration ||
      props.effect ||
      props.initialResults ||
      props.finalResults ||
      props.effectDuration ||
      props.anesthesia ||
      props.medication ||
      props.aftercareSummary ||
      props.followUpTreatments
    ),
);

function formatFieldValue(value: string | undefined): string {
  const raw = value ?? "";
  if (!props.price) return raw || t("blocks.treatmentDetails.noInformation");

  const replaced =
    replacePlaceholderString(raw, [
      {
        placeholder: "{{ price }}",
        replacement: formatPriceInEuro(props.treatment?.priceInEuroCent ?? 0),
      },
    ]) ?? raw;

  return replaced || t("blocks.treatmentDetails.noInformation");
}

const detailFields = computed(() => [
  {
    key: "price",
    label: t("blocks.treatmentDetails.price"),
    value: props.price,
    icon: IconTag,
  },
  {
    key: "duration",
    label: t("blocks.treatmentDetails.duration"),
    value: props.duration,
    icon: IconClock,
  },
  {
    key: "effect",
    label: t("blocks.treatmentDetails.effect"),
    value: props.effect,
    icon: IconSparkles2,
  },
  {
    key: "initialResults",
    label: t("blocks.treatmentDetails.initialResults"),
    value: props.initialResults,
    icon: IconSunrise,
  },
  {
    key: "finalResults",
    label: t("blocks.treatmentDetails.finalResults"),
    value: props.finalResults,
    icon: IconSunHigh,
  },
  {
    key: "effectDuration",
    label: t("blocks.treatmentDetails.effectDuration"),
    value: props.effectDuration,
    icon: IconHourglassLow,
  },
  {
    key: "anesthesia",
    label: t("blocks.treatmentDetails.anesthesia"),
    value: props.anesthesia,
    icon: IconZzz,
  },
  {
    key: "medication",
    label: t("blocks.treatmentDetails.medication"),
    value: props.medication,
    icon: IconPill,
  },
  {
    key: "aftercareSummary",
    label: t("blocks.treatmentDetails.aftercareSummary"),
    value: props.aftercareSummary,
    icon: IconReportMedical,
  },
  {
    key: "followUpTreatments",
    label: t("blocks.treatmentDetails.followUpTreatments"),
    value: props.followUpTreatments,
    icon: IconRepeat,
  },
]);
</script>

<style scoped>
.details {
  display: flex;
  flex-direction: column;
  gap: var(--space-card-figure-pad);
}

.details__header {
  padding: calc(var(--space-card-pad-sm) - var(--space-card-figure-pad));
  background-color: var(--card-color-bg);
  color: var(--color-text);
  text-align: center;
  border-radius: var(--border-radius-card-figure)
    var(--border-radius-card-figure) var(--border-radius-100)
    var(--border-radius-100);
}

.details__title {
  margin: 0;
}

.details__image {
  display: block;
  position: relative;
  aspect-ratio: 1 / 1;
  padding: var(--space-card-figure-pad);
}

.details__image :deep(img) {
  position: absolute;
  top: 0;
  left: var(--space-card-figure-pad);
  width: calc(100% - var(--space-card-figure-pad) * 2);
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-card-figure);
}

.details__list {
  display: contents;
}

.details__body > div,
.details__list > div {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  padding: var(--space-card-pad);
  border-color: var(--color-border-mute);
  border-style: solid;
}

.details__field {
  border-width: 0 0 1px 0;
}

.details__field:last-child {
  border-bottom-width: 0;
}

.details__label {
  display: flex;
  align-items: center;
  gap: var(--space-300);
}

.details__icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.details__term {
  font-weight: var(--font-bold);
}

.details__value {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

@media (min-width: 900px) {
  .details__body {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: repeat(4, max-content);
    grid-template-areas:
      "price duration effect"
      "medication image initialResults"
      "anesthesia image finalResults"
      "effectDuration aftercareSummary followUpTreatments";
  }

  .details__label {
    flex-direction: column;
    align-items: flex-start;
  }

  .details__icon {
    width: 48px;
    height: 48px;
  }

  .details__list {
    display: contents;
  }

  .details--without-image .details__body > div,
  .details--without-image .details__list > div {
    border-width: 1px 0 0 0;
  }

  .details--with-image .details__field--price {
    grid-area: price;
    border-width: 1px 1px 0 0;
  }

  .details--with-image .details__field--duration {
    grid-area: duration;
    border-width: 1px 1px 0 0;
  }

  .details--with-image .details__field--effect {
    grid-area: effect;
    border-width: 1px 0 0 0;
  }

  .details--with-image .details__field--initialResults {
    grid-area: initialResults;
    border-width: 1px 0 0 0;
  }

  .details--with-image .details__field--finalResults {
    grid-area: finalResults;
    border-width: 1px 0 0 0;
  }

  .details--with-image .details__field--effectDuration {
    grid-area: effectDuration;
    border-width: 1px 1px 0 0;
  }

  .details--with-image .details__field--anesthesia {
    grid-area: anesthesia;
    border-width: 1px 1px 0 0;
  }

  .details--with-image .details__field--medication {
    grid-area: medication;
    border-width: 1px 1px 0 0;
  }

  .details--with-image .details__field--aftercareSummary {
    grid-area: aftercareSummary;
    border-width: 1px 1px 0 0;
  }

  .details--with-image .details__field--followUpTreatments {
    grid-area: followUpTreatments;
    border-width: 1px 0 0 0;
  }

  .details__image {
    grid-area: image;
    border-width: 1px 1px 0 0;
    aspect-ratio: auto;
    width: 100%;
    height: 100%;
    border-top: 1px solid var(--color-border-mute);
  }

  .details__image :deep(img) {
    top: var(--space-card-figure-pad);
    height: calc(100% - var(--space-card-figure-pad) * 2);
  }
}
</style>
