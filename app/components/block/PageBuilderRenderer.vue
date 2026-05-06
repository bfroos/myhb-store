<script setup lang="ts">
/**
 * Renders a Page Builder template (Puck JSON) using the existing Vue block components.
 *
 * The Puck data structure:
 * { content: [{ type: "FunnelHero", props: { headline: "…", … } }], root: {}, zones: {} }
 *
 * We convert each item to the StrapiBlock shape the existing BlockRenderer expects:
 * { __component: "blocks.funnel-hero", id: <index>, …props }
 */
import type { StrapiBlock } from "~/lib/strapi/dto/types";

const props = defineProps<{
  templateJson: { content: Array<{ type: string; props: Record<string, unknown> }>; root?: unknown; zones?: unknown } | null;
}>();

// Map Puck component type → Strapi __component key used in BlockRenderer
const TYPE_MAP: Record<string, string> = {
  UrgencyBanner: "blocks.urgency-banner",
  FunnelHero: "blocks.funnel-hero",
  SocialProofTicker: "blocks.social-proof-ticker",
  RiskReversal: "blocks.risk-reversal",
  AppointmentAvailability: "blocks.appointment-availability",
  PageHeader: "blocks.page-header",
  TextContent: "blocks.text-content",
  BenefitsList: "blocks.benefits-list",
  ProcessSteps: "blocks.process-steps",
  TrustGrid: "blocks.trust-grid",
  ComparisonBlock: "blocks.comparison-block",
  HighlightsStrip: "blocks.highlights-strip",
  TableOfContents: "blocks.table-of-contents",
  MediaBento: "blocks.media-bento",
  MediaCard: "blocks.media-card",
  Stories: "blocks.stories",
  TreatmentHero: "blocks.treatment-hero",
  TreatmentDetails: "blocks.treatment-details",
  TreatmentTeasers: "blocks.treatment-teasers",
  TreatmentPlan: "blocks.treatment-plan",
  Reviews: "blocks.reviews",
  Employee: "blocks.employee",
  EmployeeList: "blocks.employee-list",
  LocationMap: "blocks.location-map",
  LocationContact: "blocks.location-contact",
  LocationTeasers: "blocks.location-teasers",
  Faq: "blocks.faq",
  MyClub: "blocks.my-club",
  JobTeasers: "blocks.job-teasers",
  ProductCategoryPriceOverview: "blocks.product-category-price-overview",
};

const blocks = computed<StrapiBlock[]>(() => {
  if (!props.templateJson?.content) return [];
  return props.templateJson.content
    .filter((item) => TYPE_MAP[item.type])
    .map((item, index) => ({
      id: index,
      __component: TYPE_MAP[item.type],
      ...item.props,
    })) as StrapiBlock[];
});
</script>

<template>
  <BlockRenderer v-if="blocks.length" :blocks="blocks" />
</template>
