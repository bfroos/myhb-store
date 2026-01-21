<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <article class="treatmentPlan">
        <div class="treatmentPlan__body">
          <h2 v-if="headline">{{ headline }}</h2>
          <div v-if="content && content.length > 0">
            <UiLayoutRichText :blocks="content" />
          </div>
          <div v-if="additionalInfos && additionalInfos.length > 0">
            <UiMoleculeCollabsibleItem
              v-for="additionalInfo in additionalInfos"
              :key="additionalInfo.id"
              :id="additionalInfo.id"
              :title="additionalInfo.title"
              :content="additionalInfo.content"
              :default-open="additionalInfo.isOpenByDefault"
              tight-spacing
            />
          </div>
          <div v-if="links && links.length > 0">
            <UiMoleculeButtonGroup>
              <SharedButton
                v-for="link in links"
                :key="link.id"
                :button="link"
              />
            </UiMoleculeButtonGroup>
          </div>
        </div>
        <aside
          v-if="steps && steps.length > 0"
          class="treatmentPlan__example"
          :class="getColorThemeClass(cardSettings?.colorTheme as ColorTheme)"
        >
          <div>
            <h3 class="treatmentPlan__example__headline">{{ headline }}</h3>
            <div
              v-if="personaAge && personaTreatmentGoal"
              class="treatmentPlan__example__persona"
            >
              <UiAtomMediaPicture
                v-if="personaPhoto"
                :media="personaPhoto"
                :sources="{
                  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
                  [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
                }"
              />
              <dl v-if="personaAge || personaTreatmentGoal">
                <dt v-if="personaAge">{{ $t("blocks.treatmentPlan.age") }}</dt>
                <dd v-if="personaAge">{{ personaAge }}</dd>
                <dt v-if="personaTreatmentGoal">
                  {{ $t("blocks.treatmentPlan.treatmentGoal") }}
                </dt>
                <dd v-if="personaTreatmentGoal">{{ personaTreatmentGoal }}</dd>
              </dl>
            </div>
          </div>
          <ol
            class="treatmentPlan__example__steps"
            aria-label="Behandlungsplan Schritte"
          >
            <li
              v-for="(step, index) in steps"
              :key="step.week"
              class="treatmentPlan__example__step"
              :class="{
                'treatmentPlan__example__step--end-of-plan': !isStepType(step),
              }"
            >
              <div class="treatmentPlan__example__step__header">
                <h4
                  v-if="isStepType(step)"
                  class="treatmentPlan__example__step__title"
                >
                  {{ $t("blocks.treatmentPlan.week") }} {{ step.week }}
                </h4>
                <div
                  v-else
                  class="treatmentPlan__example__step__header__icon"
                  aria-hidden="true"
                >
                  <IconCheck
                    v-if="step.type === TreatmentPlanStepType.END_OF_PLAN"
                    size="1em"
                  />
                  <IconReload
                    v-else-if="
                      step.type === TreatmentPlanStepType.FOLLOW_UP_PLAN
                    "
                    size="1em"
                  />
                </div>
                <span
                  v-if="!isLastStep(index)"
                  class="treatmentPlan__example__step__line"
                />
              </div>
              <div class="treatmentPlan__example__step__content">
                <h4
                  v-if="step.type === TreatmentPlanStepType.END_OF_PLAN"
                  class="treatmentPlan__example__step__content__title"
                >
                  {{
                    step.endOfPlanText ??
                    $t("blocks.treatmentPlan.endOfPlanText")
                  }}
                </h4>
                <h4
                  v-else-if="step.type === TreatmentPlanStepType.FOLLOW_UP_PLAN"
                  class="treatmentPlan__example__step__content__title"
                >
                  {{
                    step.followUpPlanText ??
                    $t("blocks.treatmentPlan.followUpPlanText")
                  }}
                </h4>
                <ul
                  v-if="hasTreatments(step)"
                  class="treatmentPlan__example__step__treatments"
                >
                  <li v-for="(treatment, treatmentIndex) in step.treatments">
                    {{ treatment.name }}
                    <template v-if="!isLastTreatment(step, treatmentIndex)">
                      +&nbsp;
                    </template>
                  </li>
                </ul>
                <p
                  v-if="step.description"
                  class="treatmentPlan__example__step__description"
                >
                  {{ step.description }}
                </p>
              </div>
            </li>
          </ol>
        </aside>
      </article>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { IconCheck, IconReload } from "@tabler/icons-vue";
import type {
  BlockTreatmentPlanDto,
  TreatmentPlanStepDto,
} from "~/lib/strapi/dto/components";
import {
  TreatmentPlanStepType,
  ImageFormat,
  ImageBreakpoint,
} from "~/lib/strapi/dto/enums";
import { ColorTheme } from "~/lib/strapi/dto/enums";

const props = defineProps<BlockTreatmentPlanDto>();

const isStepType = (step: TreatmentPlanStepDto): boolean => {
  return step.type === TreatmentPlanStepType.STEP;
};

const isLastStep = (index: number): boolean => {
  if (!props.steps) return false;
  return index === props.steps.length - 1;
};

const isLastTreatment = (
  step: TreatmentPlanStepDto,
  treatmentIndex: number,
): boolean => {
  if (!step.treatments) return false;
  return treatmentIndex === step.treatments.length - 1;
};

const hasTreatments = (step: TreatmentPlanStepDto): boolean => {
  return !!step.treatments && step.treatments.length > 0;
};

const getColorThemeClass = (colorTheme: ColorTheme) => {
  return `theme-${colorTheme}`;
};
</script>

<style scoped>
.treatmentPlan__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
  padding: var(--space-card-pad);
}

.treatmentPlan__example {
  padding: var(--space-card-pad);
  margin: 0 var(--space-card-figure-pad) var(--space-card-figure-pad);
  background-color: var(--color-gray-50);
  border-radius: var(--border-radius-card-figure);
}

.treatmentPlan__example__headline {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-600);
}

.treatmentPlan__example__persona {
  display: flex;
  gap: var(--space-500);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  border-bottom: 1px solid var(--color-border-light);
  padding: 0 0 var(--space-600);
  margin: var(--space-600) 0;
}

.treatmentPlan__example__persona > dl {
  gap: var(--space-400);
  row-gap: var(--space-200);
}

.treatmentPlan__example__persona > dl > dt {
  font-weight: var(--font-bold);
  color: var(--color-text-light);
}

.treatmentPlan__example__persona > dl > dd:not(:last-of-type) {
  margin: 0 0 var(--space-200);
}

.treatmentPlan__example__persona > :deep(picture),
.treatmentPlan__example__persona > :deep(picture) > img {
  width: 88px;
  height: 88px;
  border-radius: var(--border-radius-300);
  object-fit: cover;
}

.treatmentPlan__example__step {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: var(--space-500);
}

.treatmentPlan__example__step__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.treatmentPlan__example__step__header > h4 {
  width: 100%;
  background: var(--color-black);
  color: var(--color-white);
  padding: var(--space-200) var(--space-300);
  border-radius: var(--border-radius-300);
  font-size: var(--font-xs);
  line-height: var(--line-xs);
  font-weight: var(--font-bold);
  text-align: center;
}

.treatmentPlan__example__step__header__icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-black);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
}

.treatmentPlan__example__step__line {
  width: 2px;
  background: var(--color-black);
  height: 100%;
  flex: 1;
}

.treatmentPlan__example__step__title {
  width: 100%;
}

.treatmentPlan__example__step__content__title {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-300);
}

.treatmentPlan__example__step__treatments {
  display: flex;
  flex-wrap: wrap;
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-300);
}

.treatmentPlan__example__step__content > p {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
  margin: 0 0 var(--space-600);
}

.treatmentPlan__example__step--end-of-plan
  > .treatmentPlan__example__step__header
  > .treatmentPlan__example__step__line {
  display: none;
}

.treatmentPlan__example__step--end-of-plan
  > .treatmentPlan__example__step__content
  > p {
  margin: 0;
}

.card--strong .treatmentPlan__example {
  background-color: var(--color-gray-900);
}

.card--neutral .treatmentPlan__example {
  background-color: var(--color-gray-900);
}

.card--soft .treatmentPlan__example {
  background-color: var(--color-gray-50);
}

@media screen and (min-width: 900px) {
  .treatmentPlan {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .treatmentPlan__example {
    margin: var(--space-card-figure-pad) var(--space-card-figure-pad)
      var(--space-card-figure-pad) 0;
  }
}
</style>
