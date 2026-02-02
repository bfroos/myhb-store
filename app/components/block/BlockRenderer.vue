<script setup lang="ts">
import TreatmentHero from "./TreatmentHero.vue";
import LocationMap from "./LocationMap.vue";
import ReviewsBlock from "./ReviewsBlock.vue";
import StoriesBlock from "./StoriesBlock.vue";
import EmployeeBlock from "./EmployeeBlock.vue";
import EmployeeList from "./EmployeeList.vue";
import MediaCard from "./MediaCard.vue";
import TrustGrid from "./TrustGrid.vue";
import MediaBento from "./MediaBento.vue";
import MyClub from "./MyClub.vue";
import TreatmentTeasers from "./TreatmentTeasers.vue";
import FaqBlock from "./FaqBlock.vue";
import HighlightsStrip from "./HighlightsStrip.vue";
import PageHeader from "./PageHeader.vue";
import ProcessSteps from "./ProcessSteps.vue";
import ProductCategoryPriceOverview from "./ProductCategoryPriceOverview.vue";
import TextContent from "./TextContent.vue";
import LocationContact from "./LocationContact.vue";
import LocationDirections from "./LocationDirections.vue";
import TreatmentDetails from "./TreatmentDetails.vue";
import ComparisonBlock from "./ComparisonBlock.vue";
import TreatmentPlan from "./TreatmentPlan.vue";
import BenefitsList from "./BenefitsList.vue";
import TableOfContents from "./TableOfContents.vue";
import type { StrapiBlock } from "~/lib/strapi/dto/types";
import TextBlock from "../blog/TextBlock.vue";
import ImageBlock from "../blog/ImageBlock.vue";
import NewsletterBlock from "../blog/NewsletterBlock.vue";
import CtaBlock from "../blog/CtaBlock.vue";

const props = defineProps<{
  blocks: StrapiBlock[];
}>();

const getBlockProps = (block: StrapiBlock) => {
  const { id, __component, ...props } = block;
  return props;
};

const registry: Record<string, any> = {
  "blocks.benefits-list": BenefitsList,
  "blocks.comparison-block": ComparisonBlock,
  "blocks.directions": LocationDirections,
  "blocks.employee": EmployeeBlock,
  "blocks.employee-list": EmployeeList,
  "blocks.faq": FaqBlock,
  "blocks.highlights-strip": HighlightsStrip,
  "blocks.location-map": LocationMap,
  "blocks.media-bento": MediaBento,
  "blocks.media-card": MediaCard,
  "blocks.my-club": MyClub,
  "blocks.page-header": PageHeader,
  "blocks.process-steps": ProcessSteps,
  "blocks.product-category-price-overview": ProductCategoryPriceOverview,
  "blocks.reviews": ReviewsBlock,
  "blocks.stories": StoriesBlock,
  "blocks.table-of-contents": TableOfContents,
  "blocks.text-content": TextContent,
  "blocks.treatment-details": TreatmentDetails,
  "blocks.treatment-hero": TreatmentHero,
  "blocks.treatment-plan": TreatmentPlan,
  "blocks.treatment-teasers": TreatmentTeasers,
  "blocks.location-contact": LocationContact,
  "blocks.trust-grid": TrustGrid,
  "blog.cta": CtaBlock,
  "blog.image": ImageBlock,
  "blog.newsletter": NewsletterBlock,
  "blog.text": TextBlock,
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
