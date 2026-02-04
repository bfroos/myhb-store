<template>
  <UiLayoutSectionBlock>
    <div class="myClub">
      <UiLayoutCardSurface :card-settings="clubCardSettings">
        <div class="myClub__club">
          <h2 class="myClub__club__header">
            <ImageAppLogo />
            <span class="sr-only">MY</span>
            <span>Club</span>
          </h2>
          <UiLayoutRichText v-if="clubContent" :blocks="clubContent" />
          <UiAtomBaseButton
            :href="globals?.ecommerce?.clubUrl"
            size="lg"
            as="a"
            target="_blank"
            wide
            v-if="globals?.ecommerce?.clubUrl"
          >
            {{ $t("cta.joinMyClub") }}
          </UiAtomBaseButton>
          <ul class="myClub___benefits">
            <li v-for="benefit in clubBenefits" :key="benefit.id">
              <UiLayoutIconWrapper :size="30" :stroke-width="1.5">
                <g v-html="benefit.icon?.iconData ?? ''" />
              </UiLayoutIconWrapper>
              <span>{{ benefit.text }}</span>
            </li>
          </ul>
        </div>
      </UiLayoutCardSurface>
      <UiLayoutCardSurface :card-settings="grouponCardSettings">
        <div class="myClub__groupon">
          <h2>{{ headline }}</h2>
          <div class="myClub__groupon__grid">
            <div
              v-if="grouponImage && isMediaImage(grouponImage)"
              class="myClub__groupon__image"
            >
              <UiAtomMediaPicture
                :media="grouponImage"
                :sources="{
                  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
                  [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
                }"
              />
            </div>
            <div class="myClub__groupon__content">
              <UiLayoutRichText
                v-if="grouponContent"
                :blocks="grouponContent"
              />
              <UiAtomBaseButton
                full-width
                as="a"
                size="lg"
                :href="globals?.ecommerce?.couponUrl"
                v-if="globals?.ecommerce?.couponUrl"
                target="_blank"
              >
                {{ $t("cta.shopGroupon") }}
              </UiAtomBaseButton>
            </div>
          </div>
        </div>
      </UiLayoutCardSurface>
    </div>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";
import type { BlockMyClubDto } from "~/lib/strapi/dto/components";

defineProps<BlockMyClubDto>();

const globals = useGlobals();
</script>
<style scoped>
.myClub {
  display: flex;
  flex-direction: column;
  gap: var(--space-bento-gap);
}

.myClub__club {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: var(--space-400);
  height: 100%;
  padding: var(--space-card-pad);
  text-align: center;
}

.myClub__club__header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
  text-transform: uppercase;
  font-size: var(--font-4xl);
  line-height: var(--line-4xl);
  font-weight: var(--font-regular);
}

.myClub__club__header span {
  border-left: 1px solid var(--color-black);
  padding-left: var(--space-400);
}

.myClub__club__header svg {
  height: 2.5rem;
}

.myClub__groupon {
  padding: var(--space-card-pad);
}
.myClub__groupon h2 {
  margin-bottom: var(--space-card-pad);
}

.myClub__groupon__grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-card-pad);
}

.myClub__groupon__image {
  flex: 2 0 160px;
}

.myClub__groupon__image :deep(img) {
  max-width: 100%;
  border-radius: var(--border-radius-600);
}

.myClub__groupon__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  flex: 3 0 300px;
}

.myClub___benefits {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
  margin-top: var(--space-400);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.myClub___benefits > li {
  display: inline-flex;
  align-items: center;
  gap: var(--space-200);
}

@media screen and (min-width: 1100px) {
  .myClub {
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: var(--space-bento-gap);
  }
}
</style>
