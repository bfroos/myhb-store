<template>
  <template v-for="key in order" :key="key">
    <BlockRenderer
      v-if="key === 'blocks' && remainingDynamicBlocks.length"
      :blocks="remainingDynamicBlocks"
    />
    <BlockRenderer
      v-else-if="dynamicBlockAt(key)"
      :blocks="[dynamicBlockAt(key)!]"
    />
    <component
      v-else-if="BLOCK_MAP[key] && fixedBlocks?.[key]"
      :is="BLOCK_MAP[key]!.is"
      v-bind="{
        ...fixedBlocks[key],
        ...(BLOCK_MAP[key]!.props ?? {}),
        ...(BLOCK_MAP[key]!.id ? { id: BLOCK_MAP[key]!.id } : {}),
      }"
    />
  </template>
</template>

<script setup lang="ts">
import type { StrapiBlock } from "~/lib/strapi/dto/types";

const props = defineProps<{
  fixedBlocks?: Record<string, any>;
  dynamicBlocks?: StrapiBlock[];
  order: string[];
  hiddenBlocks?: unknown;
}>();

function dynamicBlockIndex(key: unknown): number | null {
  const match = typeof key === "string" ? /^dynamicBlock(\d+)$/.exec(key) : null;
  return match ? Number(match[1]) - 1 : null;
}

function dynamicBlockAt(key: string): StrapiBlock | undefined {
  const index = dynamicBlockIndex(key);
  return index === null ? undefined : props.dynamicBlocks?.[index];
}

const remainingDynamicBlocks = computed(() => {
  const taken = new Set(
    [...props.order, ...(Array.isArray(props.hiddenBlocks) ? props.hiddenBlocks : [])]
      .map(dynamicBlockIndex)
      .filter((index): index is number => index !== null),
  );
  return (props.dynamicBlocks ?? []).filter((_, index) => !taken.has(index));
});

const BLOCK_MAP: Record<
  string,
  { is: unknown; id?: string; props?: Record<string, unknown> }
> = {
  hero: {
    is: resolveComponent("BlockTreatmentHero"),
    props: { showFloatingCta: true },
  },
  locationContact: {
    is: resolveComponent("BlockLocationContact"),
    // Ziel von "Standort" im go.-Menue (#184).
    id: "standort",
  },
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
