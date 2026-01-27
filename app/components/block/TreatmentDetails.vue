<template>
  <UiLayoutSectionBlock v-if="hasAnyInformation">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <article
        class="treatmentDetails"
        :class="{
          'treatmentDetails--withImage': image && isMediaImage(image),
          'treatmentDetails--withoutImage': !image || !isMediaImage(image),
        }"
      >
        <header class="treatmentDetails__header">
          <h2>{{ headline || fallBackHeadline }}</h2>
        </header>
        <div class="treatmentDetails__body">
          <UiAtomMediaPicture
            v-if="image && isMediaImage(image)"
            class="treatmentDetails__body__image"
            :media="image"
            :sources="{
              [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
            }"
          />
          <dl class="treatmentDetails__body__details">
            <div
              v-for="field in detailFields"
              :key="field.key"
              :class="[
                'treatmentDetails__body__field',
                `treatmentDetails__body__${field.key}`,
              ]"
            >
              <dt>
                <span class="treatmentDetails__body__field__label">
                  <span class="treatmentDetails__body__field__icon">
                    <component
                      :is="field.icon"
                      aria-hidden="true"
                      size="100%"
                      stroke="1"
                    />
                  </span>
                  <span>{{ field.label }}</span>
                </span>
              </dt>
              <dd>
                {{
                  replacePricePlaceholder(field.value ?? "") ||
                  $t(`blocks.treatmentDetails.noInformation`)
                }}
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

const props = defineProps<BlockTreatmentDetailsDto>();

const fallBackHeadline = computed(() => {
  if (!props.treatment?.name) return $t("blocks.treatmentDetails.headline");

  return props.treatment?.name + ": " + $t("blocks.treatmentDetails.headline");
});

const hasAnyInformation = computed(() => {
  return (
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
  );
});

function replacePricePlaceholder(value: string): string {
  if (!props.price) return value;

  return (
    replacePlaceholderString(value as string, [
      {
        placeholder: "{{ price }}",
        replacement: formatPriceInEuro(props.treatment?.priceInEuroCent ?? 0),
      },
    ]) ?? value
  );
}

const detailFields = computed(() => {
  const fields = [
    {
      key: "price",
      label: $t("blocks.treatmentDetails.price"),
      value: props.price,
      icon: IconTag,
    },
    {
      key: "duration",
      label: $t("blocks.treatmentDetails.duration"),
      value: props.duration,
      icon: IconClock,
    },
    {
      key: "effect",
      label: $t("blocks.treatmentDetails.effect"),
      value: props.effect,
      icon: IconSparkles2,
    },
    {
      key: "initialResults",
      label: $t("blocks.treatmentDetails.initialResults"),
      value: props.initialResults,
      icon: IconSunrise,
    },
    {
      key: "finalResults",
      label: $t("blocks.treatmentDetails.finalResults"),
      value: props.finalResults,
      icon: IconSunHigh,
    },
    {
      key: "effectDuration",
      label: $t("blocks.treatmentDetails.effectDuration"),
      value: props.effectDuration,
      icon: IconHourglassLow,
    },
    {
      key: "anesthesia",
      label: $t("blocks.treatmentDetails.anesthesia"),
      value: props.anesthesia,
      icon: IconZzz,
    },
    {
      key: "medication",
      label: $t("blocks.treatmentDetails.medication"),
      value: props.medication,
      icon: IconPill,
    },
    {
      key: "aftercareSummary",
      label: $t("blocks.treatmentDetails.aftercareSummary"),
      value: props.aftercareSummary,
      icon: IconReportMedical,
    },
    {
      key: "followUpTreatments",
      label: $t("blocks.treatmentDetails.followUpTreatments"),
      value: props.followUpTreatments,
      icon: IconRepeat,
    },
  ];

  return fields;
});
</script>
<style scoped>
.treatmentDetails {
  display: flex;
  flex-direction: column;
  gap: var(--space-card-figure-pad);
}

.treatmentDetails__header {
  padding: calc(var(--space-card-pad-sm) - var(--space-card-figure-pad));
  border-radius: var(--border-radius-card-figure)
    var(--border-radius-card-figure) var(--border-radius-100)
    var(--border-radius-100);
  background-color: var(--card-color-bg);
  color: var(--color-text);
  text-align: center;
}

.treatmentDetails__body__image {
  display: block;
  position: relative;
  aspect-ratio: 1/1;
}

.treatmentDetails__body__image :deep(img) {
  position: absolute;
  top: 0;
  left: var(--space-card-figure-pad);
  width: calc(100% - var(--space-card-figure-pad) * 2);
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-card-figure);
}

.treatmentDetails__body__details {
  display: contents;
}

.treatmentDetails__body > div,
.treatmentDetails__body__details > div {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  padding: var(--space-card-pad);
  border-color: var(--color-border-mute);
  border-style: solid;
}

.treatmentDetails__body__image {
  padding: var(--space-card-figure-pad);
}

.treatmentDetails__body__field {
  border-width: 0 0 1px 0;
}

.treatmentDetails__body__field__label {
  display: flex;
  align-items: center;
  gap: var(--space-300);
}

.treatmentDetails__body__field__icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.treatmentDetails__body__field dt {
  font-weight: bold;
}

.treatmentDetails__body__field dd {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

@media screen and (min-width: 900px) {
  .treatmentDetails__body {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: repeat(4, max-content);
    grid-template-areas:
      "price duration effect"
      "medication image initialResults"
      "anesthesia image finalResults"
      "effectDuration aftercareSummary followUpTreatments";
  }

  .treatmentDetails__body__field__label {
    flex-direction: column;
    align-items: flex-start;
  }

  .treatmentDetails__body__field__icon {
    width: 48px;
    height: 48px;
  }

  .treatmentDetails__body__details {
    display: contents;
  }

  .treatmentDetails--withoutImage .treatmentDetails__body__details > div,
  .treatmentDetails--withoutImage .treatmentDetails__body > div {
    border-width: 0;
  }
  .treatmentDetails--withoutImage .treatmentDetails__body__details > div,
  .treatmentDetails--withoutImage .treatmentDetails__body > div {
    border-width: 1px 0 0 0;
  }

  .teatmentDetails--withImage .treatmentDetails__body__price {
    grid-area: price;
    border-width: 1px 1px 0 0;
  }

  .teatmentDetails--withImage .treatmentDetails__body__duration {
    grid-area: duration;
    border-width: 1px 1px 0 0;
  }

  .teatmentDetails--withImage .treatmentDetails__body__effect {
    grid-area: effect;
    border-width: 1px 0 0 0;
  }

  .teatmentDetails--withImage .treatmentDetails__body__initialResults {
    grid-area: initialResults;
    border-width: 1px 0 0 0;
  }

  .teatmentDetails--withImage .treatmentDetails__body__finalResults {
    grid-area: finalResults;
    border-width: 1px 0 0 0;
  }

  .teatmentDetails--withImage .treatmentDetails__body__effectDuration {
    grid-area: effectDuration;
    border-width: 1px 1px 0 0;
  }

  .teatmentDetails--withImage .treatmentDetails__body__anesthesia {
    grid-area: anesthesia;
    border-width: 1px 1px 0 0;
  }

  .teatmentDetails--withImage .treatmentDetails__body__medication {
    grid-area: medication;
    border-width: 1px 1px 0 0;
  }

  .teatmentDetails--withImage .treatmentDetails__body__aftercareSummary {
    grid-area: aftercareSummary;
    border-width: 1px 1px 0 0;
  }

  .teatmentDetails--withImage .treatmentDetails__body__followUpTreatments {
    grid-area: followUpTreatments;
    border-width: 1px 0 0 0;
  }

  .treatmentDetails__body__image {
    grid-area: image;
    border-width: 1px 1px 0 0;
    aspect-ratio: auto;
    width: 100%;
    height: 100%;
    border-top: 1px solid var(--color-border-mute);
  }

  .treatmentDetails__body__image :deep(img) {
    top: var(--space-card-figure-pad);
    height: calc(100% - var(--space-card-figure-pad) * 2);
  }
}
</style>
