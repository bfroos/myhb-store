<template>
  <slot v-if="!anchorKey" name="reviewer" :inline="false" />
  <template v-for="key in order" :key="key">
    <BlockRenderer
      v-if="key === 'blocks' && dynamicBlocks?.length"
      :blocks="dynamicBlocks"
    />
    <component
      v-else-if="BLOCK_MAP[key] && fixedBlocks?.[key]"
      :is="BLOCK_MAP[key]!.is"
      v-bind="{
        ...fixedBlocks[key],
        ...(BLOCK_MAP[key]!.props ?? {}),
        ...(BLOCK_MAP[key]!.id ? { id: BLOCK_MAP[key]!.id } : {}),
      }"
    >
      <template v-if="key === 'tableOfContents'" #default>
        <slot name="reviewer" :inline="true" />
      </template>
    </component>
    <slot
      v-if="key === anchorKey && key !== 'tableOfContents'"
      name="reviewer"
      :inline="false"
    />
  </template>
</template>

<script setup lang="ts">
import type { StrapiBlock } from "~/lib/strapi/dto/types";

const props = defineProps<{
  fixedBlocks?: Record<string, any>;
  dynamicBlocks?: StrapiBlock[];
  order: string[];
}>();

const anchorKey = computed(() => {
  const rendered = props.order.filter((key) =>
    key === "blocks"
      ? !!props.dynamicBlocks?.length
      : !!(BLOCK_MAP[key] && props.fixedBlocks?.[key]),
  );
  if (rendered.includes("tableOfContents")) return "tableOfContents";
  const heroIndex = rendered.indexOf("hero");
  return rendered[heroIndex + 1] ?? rendered[heroIndex] ?? null;
});

const BLOCK_MAP: Record<
  string,
  { is: unknown; id?: string; props?: Record<string, unknown> }
> = {
  hero: {
    is: resolveComponent("BlockTreatmentHero"),
    props: { showFloatingCta: true },
  },
  locationContact: { is: resolveComponent("BlockLocationContact") },
  aboutLocation: { is: resolveComponent("BlockMediaCard") },
  locationDirections: { is: resolveComponent("BlockLocationDirections") },
  tableOfContents: { is: resolveComponent("BlockTableOfContents") },
  about: { is: resolveComponent("BlockMediaBento"), id: "how-it-works" },
  reviews: { is: resolveComponent("BlockReviewsBlock"), id: "reviews" },
  treatmentDetails: {
    is: resolveComponent("BlockTreatmentDetails"),
    id: "treatment-details",
  },
  treatmentPlan: {
    is: resolveComponent("BlockTreatmentPlan"),
    id: "treatment-plan",
  },
  benefits: { is: resolveComponent("BlockBenefitsList"), id: "benefits" },
  suitability: {
    is: resolveComponent("BlockComparisonBlock"),
    id: "suitability",
  },
  medicalTeamHighlight: {
    is: resolveComponent("BlockEmployeeBlock"),
    id: "employee",
  },
  treatmentProcess: {
    is: resolveComponent("BlockProcessSteps"),
    id: "treatment-process-steps",
  },
  relatedTreatments: {
    is: resolveComponent("BlockTreatmentTeasers"),
    id: "related-treatments",
  },
  faq: { is: resolveComponent("BlockFaqBlock"), id: "faq" },
};
</script>
