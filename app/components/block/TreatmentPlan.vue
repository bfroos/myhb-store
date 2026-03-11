<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <article class="plan">
        <div class="plan__body">
          <h2 v-if="headline" class="plan__title">{{ headline }}</h2>
          <div v-if="hasContent" class="plan__content">
            <UiLayoutRichText :blocks="content!" />
          </div>
          <div v-if="hasAdditionalInfos" class="plan__collapsibles">
            <UiMoleculeCollabsibleItem
              v-for="item in additionalInfos"
              :key="item.id"
              :id="item.id"
              :title="item.title"
              :content="item.content"
              :default-open="item.isOpenByDefault"
              tight-spacing
            />
          </div>
          <div v-if="hasLinks" class="plan__links">
            <UiMoleculeButtonGroup>
              <SharedButton
                v-for="link in links"
                :key="link.id"
                :button="link"
              />
            </UiMoleculeButtonGroup>
          </div>
        </div>
        <aside v-if="hasSteps" class="plan__example">
          <div class="plan__example-inner">
            <h3 class="plan__example-title">{{ headline }}</h3>
            <div v-if="hasPersona" class="plan__persona">
              <UiAtomMediaPicture
                v-if="personaPhoto"
                :media="personaPhoto"
                :sources="personaImageSources"
              />
              <dl
                v-if="personaAge ?? personaTreatmentGoal"
                class="plan__persona-dl"
              >
                <template v-if="personaAge">
                  <dt>{{ t("blocks.treatmentPlan.age") }}</dt>
                  <dd>{{ personaAge }}</dd>
                </template>
                <template v-if="personaTreatmentGoal">
                  <dt>{{ t("blocks.treatmentPlan.treatmentGoal") }}</dt>
                  <dd>{{ personaTreatmentGoal }}</dd>
                </template>
              </dl>
            </div>
          </div>
          <ol
            class="plan__steps"
            role="list"
            :aria-label="t('blocks.treatmentPlan.stepsAriaLabel')"
          >
            <li
              v-for="(step, index) in steps"
              :key="step.week ?? index"
              class="plan__step"
              :class="{
                'plan__step--end': !isStepType(step),
              }"
            >
              <div class="plan__step-header">
                <h4 v-if="isStepType(step)" class="plan__step-title">
                  {{ t("blocks.treatmentPlan.week") }} {{ step.week }}
                </h4>
                <div v-else class="plan__step-icon" aria-hidden="true">
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
                  class="plan__step-line"
                  aria-hidden="true"
                />
              </div>
              <div class="plan__step-content">
                <h4
                  v-if="step.type === TreatmentPlanStepType.END_OF_PLAN"
                  class="plan__step-heading"
                >
                  {{
                    step.endOfPlanText ??
                    t("blocks.treatmentPlan.endOfPlanText")
                  }}
                </h4>
                <h4
                  v-else-if="step.type === TreatmentPlanStepType.FOLLOW_UP_PLAN"
                  class="plan__step-heading"
                >
                  {{
                    step.followUpPlanText ??
                    t("blocks.treatmentPlan.followUpPlanText")
                  }}
                </h4>
                <ul
                  v-if="hasTreatments(step)"
                  class="plan__treatments"
                  role="list"
                >
                  <li
                    v-for="(treatment, ti) in step.treatments"
                    :key="treatment.label"
                  >
                    <NuxtLinkLocale
                      v-if="getTreatmentLinkPath(treatment)"
                      :to="getTreatmentLinkPath(treatment)"
                    >
                      {{ treatment.label }}
                    </NuxtLinkLocale>
                    <template v-else>{{ treatment.label }}</template>
                    <template v-if="!isLastTreatment(step, ti)">
                      +&nbsp;</template
                    >
                  </li>
                </ul>
                <p v-if="step.description" class="plan__step-desc">
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

const props = defineProps<BlockTreatmentPlanDto>();
const { t } = useI18n();

const hasContent = computed(() => (props.content?.length ?? 0) > 0);

const hasAdditionalInfos = computed(
  () => (props.additionalInfos?.length ?? 0) > 0,
);

const hasLinks = computed(() => (props.links?.length ?? 0) > 0);

const hasSteps = computed(() => (props.steps?.length ?? 0) > 0);

const hasPersona = computed(
  () => props.personaAge != null && !!props.personaTreatmentGoal,
);

const personaImageSources = {
  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
  [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
};

function isStepType(step: TreatmentPlanStepDto): boolean {
  return step.type === TreatmentPlanStepType.STEP;
}

function isLastStep(index: number): boolean {
  return index === (props.steps?.length ?? 0) - 1;
}

function isLastTreatment(step: TreatmentPlanStepDto, index: number): boolean {
  return index === (step.treatments?.length ?? 0) - 1;
}

function hasTreatments(step: TreatmentPlanStepDto): boolean {
  return (step.treatments?.length ?? 0) > 0;
}

function getTreatmentLinkPath(
  treatment: NonNullable<TreatmentPlanStepDto["treatments"]>[number],
): string | undefined {
  const pathKey =
    treatment.treatmentAdsPage?.pathKey ?? treatment.treatmentPage?.pathKey;

  return pathKey ? `/behandlungen/${pathKey}` : undefined;
}
</script>

<style scoped>
.plan__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
  padding: var(--space-card-pad);
}

.plan__title {
  margin: 0;
}

.plan__example {
  padding: var(--space-card-pad);
  margin-bottom: var(--space-card-figure-pad);
  margin-left: var(--space-card-figure-pad);
  margin-right: var(--space-card-figure-pad);
  background-color: var(--color-gray-50);
  border-radius: var(--border-radius-card-figure);
}

.theme-strong .plan__example,
.theme-neutral .plan__example {
  background-color: var(--color-gray-900);
}

.theme-soft .plan__example {
  background-color: var(--color-gray-50);
}

.plan__example-title {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-600);
}

.plan__persona {
  display: flex;
  gap: var(--space-500);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  margin-top: var(--space-600);
  margin-bottom: var(--space-600);
  padding-bottom: var(--space-600);
  border-bottom: 1px solid var(--color-border-light);
}

.plan__persona-dl {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
}

.plan__persona-dl dt {
  font-weight: var(--font-bold);
  color: var(--color-text-light);
}

.plan__persona-dl dd:not(:last-of-type) {
  margin-bottom: var(--space-200);
}

.plan__persona :deep(picture),
.plan__persona :deep(picture) > img {
  width: 88px;
  height: 88px;
  border-radius: var(--border-radius-300);
  object-fit: cover;
}

.plan__steps {
  list-style: none;
  margin: 0;
  padding: 0;
}

.plan__step {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: var(--space-500);
}

.plan__step-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.plan__step-header > h4 {
  width: 100%;
  padding: var(--space-200) var(--space-300);
  background: var(--color-black);
  color: var(--color-white);
  border-radius: var(--border-radius-300);
  font-size: var(--font-xs);
  line-height: var(--line-xs);
  font-weight: var(--font-bold);
  text-align: center;
}

.plan__step-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-black);
  color: var(--color-white);
}

.plan__step-line {
  width: 2px;
  height: 100%;
  flex: 1;
  background: var(--color-black);
}

.plan__step-heading {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-300);
}

.plan__treatments {
  display: flex;
  flex-wrap: wrap;
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-300);
  list-style: none;
  padding: 0;
}

.plan__treatments a {
  text-decoration: underline;
}

.plan__treatments a:hover {
  text-decoration: none;
}

.plan__step-desc {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
  margin: 0 0 var(--space-600);
}

.plan__step--end .plan__step-line {
  display: none;
}

.plan__step--end .plan__step-desc {
  margin: 0;
}

@media (min-width: 900px) {
  .plan {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .plan__example {
    margin: var(--space-card-figure-pad);
    margin-right: 0;
  }
}
</style>
