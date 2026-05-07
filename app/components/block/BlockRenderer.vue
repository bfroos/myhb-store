<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import type { StrapiBlock } from "~/lib/strapi/dto/types";

const props = defineProps<{
  blocks: StrapiBlock[];
}>();

const getBlockProps = (block: StrapiBlock) => {
  const { id, __component, ...props } = block;
  if (landingBlockKeys.has(__component)) {
    return Object.fromEntries(
      Object.entries(props).filter(([, value]) => value != null),
    );
  }
  return props;
};

const openBlockTarget = async (target?: { to?: string; href?: string } | null) => {
  const url = target?.to ?? target?.href;
  if (!url) return;

  if (/^https?:\/\//i.test(url)) {
    await navigateTo(url, { external: true, open: { target: "_blank" } });
    return;
  }

  await navigateTo(url);
};

const landingBlockKeys = new Set<string>([
  "blocks.landing-hero",
  "blocks.trust-bar",
  "blocks.quick-info",
  "blocks.before-after",
  "blocks.benefit-grid",
  "blocks.seo-collapsible",
  "blocks.doctor",
  "blocks.price-overview",
  "blocks.price-teaser",
  "blocks.faq-accordion",
  "blocks.local-section",
  "blocks.location-card",
  "blocks.final-cta",
  "blocks.mobile-sticky-cta",
  "blocks.landing-reviews",
  "blocks.press-logos",
  "blocks.guarantees",
  "blocks.awards",
  "blocks.live-counter",
  "blocks.promo-banner",
  "blocks.promo-strip",
  "blocks.promo-hero",
  "blocks.promo-floating-sticker",
]);

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
  "blocks.job-teasers": defineAsyncComponent(() => import("./JobTeasers.vue")),
  "blocks.location-map": defineAsyncComponent(
    () => import("./LocationMap.vue"),
  ),
  "blocks.location-teasers": defineAsyncComponent(
    () => import("./LocationTeasers.vue"),
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
  "blocks.landing-hero": defineAsyncComponent(() => import("./LandingHeroBlock.vue")),
  "blocks.trust-bar": defineAsyncComponent(() => import("./TrustBarBlock.vue")),
  "blocks.quick-info": defineAsyncComponent(() => import("./QuickInfoBlock.vue")),
  "blocks.before-after": defineAsyncComponent(() => import("./BeforeAfterBlock.vue")),
  "blocks.benefit-grid": defineAsyncComponent(() => import("./BenefitGridBlock.vue")),
  "blocks.seo-collapsible": defineAsyncComponent(() => import("./SeoCollapsibleBlock.vue")),
  "blocks.doctor": defineAsyncComponent(() => import("./DoctorBlock.vue")),
  "blocks.price-overview": defineAsyncComponent(() => import("./PriceOverviewBlock.vue")),
  "blocks.price-teaser": defineAsyncComponent(() => import("./PriceTeaserBlock.vue")),
  "blocks.faq-accordion": defineAsyncComponent(() => import("./FaqAccordionBlock.vue")),
  "blocks.local-section": defineAsyncComponent(() => import("./LocalSectionBlock.vue")),
  "blocks.location-card": defineAsyncComponent(() => import("./LocationCardBlock.vue")),
  "blocks.final-cta": defineAsyncComponent(() => import("./FinalCtaBlock.vue")),
  "blocks.mobile-sticky-cta": defineAsyncComponent(() => import("./MobileStickyCtaBlock.vue")),
  "blocks.landing-reviews": defineAsyncComponent(() => import("./LandingReviewsBlock.vue")),
  "blocks.press-logos": defineAsyncComponent(() => import("./PressLogosBlock.vue")),
  "blocks.guarantees": defineAsyncComponent(() => import("./GuaranteesBlock.vue")),
  "blocks.awards": defineAsyncComponent(() => import("./AwardsBlock.vue")),
  "blocks.live-counter": defineAsyncComponent(() => import("./LiveCounterBlock.vue")),
  "blocks.promo-banner": defineAsyncComponent(() => import("./PromoBannerBlock.vue")),
  "blocks.promo-strip": defineAsyncComponent(() => import("./PromoStripBlock.vue")),
  "blocks.promo-hero": defineAsyncComponent(() => import("./PromoHeroBlock.vue")),
  "blocks.promo-floating-sticker": defineAsyncComponent(() => import("./PromoFloatingStickerBlock.vue")),
  "blog.cta": defineAsyncComponent(() => import("../blog/CtaBlock.vue")),
  "blog.image": defineAsyncComponent(() => import("../blog/ImageBlock.vue")),
  "blog.newsletter": defineAsyncComponent(
    () => import("../blog/NewsletterBlock.vue"),
  ),
  "blog.text": defineAsyncComponent(() => import("../blog/TextBlock.vue")),
};
</script>

<template>
  <template v-for="(block, index) in blocks" :key="block.id">
    <UiLayoutSectionBlock v-if="landingBlockKeys.has(block.__component)">
      <component
        :is="registry[block.__component]"
        v-bind="getBlockProps(block)"
        :priority="index === 0"
        @primary="openBlockTarget((block as any).primaryCta)"
        @secondary="openBlockTarget((block as any).secondaryCta)"
        @cta="openBlockTarget((block as any).cta)"
        @book="openBlockTarget((block as any).bookingCta ?? (block as any).cta)"
      />
    </UiLayoutSectionBlock>
    <component
      v-else
      :is="registry[block.__component]"
      v-bind="getBlockProps(block)"
      :priority="index === 0"
    />
  </template>
</template>
