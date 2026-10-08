<template>
  <slot v-if="!anchorKey" name="reviewer" :inline="false" />
  <template v-for="key in order" :key="key">
    <BlockRenderer
      v-if="key === 'blocks' && remainingDynamicBlocks.length"
      :blocks="remainingDynamicBlocks"
      :anchor-of="dynamicAnchorOf"
    />
    <BlockRenderer
      v-else-if="dynamicBlockAt(key)"
      :blocks="[dynamicBlockAt(key)!]"
      :anchor-of="dynamicAnchorOf"
    />
    <component
      v-else-if="BLOCK_MAP[key] && fixedBlocks?.[key]"
      :is="BLOCK_MAP[key]!.is"
      v-bind="{
        ...fixedBlocks[key],
        ...(BLOCK_MAP[key]!.props ?? {}),
        ...(BLOCK_MAP[key]!.id ? { id: BLOCK_MAP[key]!.id } : {}),
        ...(key === 'tableOfContents' ? { index: tocIndex } : {}),
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
import type { SharedKeyValueDto } from "~/lib/strapi/dto/components";

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

const TOC_EXCLUDED_DYNAMIC_BLOCKS = new Set([
  "blocks.landing-hero",
  "blocks.promo-hero",
  "blocks.promo-banner",
  "blocks.promo-strip",
  "blocks.promo-floating-sticker",
  "blocks.mobile-sticky-cta",
  "blocks.final-cta",
]);

function dynamicTocLabel(block: StrapiBlock): string | undefined {
  if (TOC_EXCLUDED_DYNAMIC_BLOCKS.has(block.__component)) return;
  const headline = (block as any).headline;
  return typeof headline === "string" && headline.trim() ? headline : undefined;
}

function dynamicAnchorOf(block: StrapiBlock): string | undefined {
  if (!dynamicTocLabel(block)) return;
  return `${block.__component.replace(/^blocks\./, "")}-${block.id}`;
}

const tocIndex = computed<SharedKeyValueDto[]>(() => {
  const mapperIndex: SharedKeyValueDto[] =
    props.fixedBlocks?.tableOfContents?.index ?? [];
  const items: SharedKeyValueDto[] = [];

  for (const key of props.order) {
    if (key === "blocks" || dynamicBlockAt(key)) {
      const dynamic = key === "blocks" ? remainingDynamicBlocks.value : [dynamicBlockAt(key)!];
      for (const block of dynamic) {
        const anchor = dynamicAnchorOf(block);
        if (anchor) items.push({ key: anchor, value: dynamicTocLabel(block)! });
      }
      continue;
    }

    const id = BLOCK_MAP[key]?.id;
    const block = props.fixedBlocks?.[key];
    if (!id || !block) continue;

    const entries = mapperIndex.filter((entry) => entry.key === id);
    if (entries.length) {
      items.push(...entries);
    } else if (typeof block.headline === "string" && block.headline.trim()) {
      items.push({ key: id, value: block.headline });
    }
  }

  return items;
});

const anchorKey = computed(() => {
  const rendered = props.order.filter((key) =>
    key === "blocks"
      ? remainingDynamicBlocks.value.length > 0
      : !!dynamicBlockAt(key) || !!(BLOCK_MAP[key] && props.fixedBlocks?.[key]),
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
  locationContact: {
    is: resolveComponent("BlockLocationContact"),
    // Ziel von "Standort" im go.-Menue (#184).
    id: "standort",
  },
  aboutLocation: { is: resolveComponent("BlockMediaCard"), id: "about-location" },
  locationDirections: {
    is: resolveComponent("BlockLocationDirections"),
    id: "location-directions",
  },
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
