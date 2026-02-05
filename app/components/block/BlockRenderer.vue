<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import type { StrapiBlock } from "~/lib/strapi/dto/types";

const props = defineProps<{
  blocks: StrapiBlock[];
}>();

const getBlockProps = (block: StrapiBlock) => {
  const { id, __component, ...props } = block;
  return props;
};

const registry: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  "blocks.benefits-list": defineAsyncComponent(
    () => import("./BenefitsList.vue"),
  ),
  "blocks.comparison-block": defineAsyncComponent(
    () => import("./ComparisonBlock.vue"),
  ),
  "blocks.directions": defineAsyncComponent(
    () => import("./LocationDirections.vue"),
  ),
  "blocks.employee": defineAsyncComponent(() => import("./EmployeeBlock.vue")),
  "blocks.employee-list": defineAsyncComponent(
    () => import("./EmployeeList.vue"),
  ),
  "blocks.faq": defineAsyncComponent(() => import("./FaqBlock.vue")),
  "blocks.highlights-strip": defineAsyncComponent(
    () => import("./HighlightsStrip.vue"),
  ),
  "blocks.location-map": defineAsyncComponent(
    () => import("./LocationMap.vue"),
  ),
  "blocks.media-bento": defineAsyncComponent(() => import("./MediaBento.vue")),
  "blocks.media-card": defineAsyncComponent(() => import("./MediaCard.vue")),
  "blocks.my-club": defineAsyncComponent(() => import("./MyClub.vue")),
  "blocks.page-header": defineAsyncComponent(() => import("./PageHeader.vue")),
  "blocks.process-steps": defineAsyncComponent(
    () => import("./ProcessSteps.vue"),
  ),
  "blocks.product-category-price-overview": defineAsyncComponent(
    () => import("./ProductCategoryPriceOverview.vue"),
  ),
  "blocks.reviews": defineAsyncComponent(() => import("./ReviewsBlock.vue")),
  "blocks.stories": defineAsyncComponent(() => import("./StoriesBlock.vue")),
  "blocks.table-of-contents": defineAsyncComponent(
    () => import("./TableOfContents.vue"),
  ),
  "blocks.text-content": defineAsyncComponent(
    () => import("./TextContent.vue"),
  ),
  "blocks.treatment-details": defineAsyncComponent(
    () => import("./TreatmentDetails.vue"),
  ),
  "blocks.treatment-hero": defineAsyncComponent(
    () => import("./TreatmentHero.vue"),
  ),
  "blocks.treatment-plan": defineAsyncComponent(
    () => import("./TreatmentPlan.vue"),
  ),
  "blocks.treatment-teasers": defineAsyncComponent(
    () => import("./TreatmentTeasers.vue"),
  ),
  "blocks.location-contact": defineAsyncComponent(
    () => import("./LocationContact.vue"),
  ),
  "blocks.trust-grid": defineAsyncComponent(() => import("./TrustGrid.vue")),
  "blog.cta": defineAsyncComponent(() => import("../blog/CtaBlock.vue")),
  "blog.image": defineAsyncComponent(() => import("../blog/ImageBlock.vue")),
  "blog.newsletter": defineAsyncComponent(
    () => import("../blog/NewsletterBlock.vue"),
  ),
  "blog.text": defineAsyncComponent(() => import("../blog/TextBlock.vue")),
};
</script>

<template>
  <component
    v-for="block in blocks"
    :key="block.id"
    :is="registry[block.__component]"
    v-bind="getBlockProps(block)"
  />
</template>
