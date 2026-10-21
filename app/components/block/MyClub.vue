<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <div class="myClub">
      <UiLayoutCardSurface :card-settings="clubCardSettings">
        <section class="myClub__club">
          <h2 class="myClub__club-heading">
            <ImageAppLogo class="myClub__club-logo" aria-hidden="true" />
            <span class="sr-only">{{ brandNameShort }}</span>
            <span class="myClub__club-label">Club</span>
          </h2>
          <div v-if="hasClubContent" class="myClub__club-content">
            <UiLayoutRichText :blocks="clubContent!" />
          </div>
          <template v-if="clubSeiten.enabled.value">
            <UiAtomBaseButton
              as="nuxt-link-locale"
              to="/club"
              size="lg"
              wide
              @click="clubSeiten.trackClick('myclub-block', 'club')"
            >
              {{ t("cta.joinMyClub", { brandNameShort }) }}
            </UiAtomBaseButton>
            <NuxtLinkLocale
              to="/beauty-sparbuch"
              class="myClub__sparbuch"
              @click="clubSeiten.trackClick('myclub-block', 'sparbuch')"
            >
              {{ t("navigation.secondary.beautySparbuch") }} →
            </NuxtLinkLocale>
          </template>
          <UiAtomBaseButton
            v-else-if="clubUrl"
            :href="clubUrl"
            size="lg"
            as="a"
            target="_blank"
            wide
          >
            {{ t("cta.joinMyClub", { brandNameShort }) }}
          </UiAtomBaseButton>
          <ul v-if="hasBenefits" class="myClub__benefits" role="list">
            <li
              v-for="(benefit, index) in clubBenefits"
              :key="benefit.id ?? index"
              class="myClub__benefit"
            >
              <UiLayoutIconWrapper
                v-if="benefit.icon?.iconData"
                :size="30"
                :stroke-width="1.5"
                class="myClub__benefit-icon"
              >
                <g v-html="benefit.icon.iconData" />
              </UiLayoutIconWrapper>
              <span class="myClub__benefit-text">{{ benefit.text }}</span>
            </li>
          </ul>
        </section>
      </UiLayoutCardSurface>
      <UiLayoutCardSurface :card-settings="grouponCardSettings">
        <section class="myClub__groupon">
          <h2 v-if="headline" class="myClub__groupon-heading">
            {{ headline }}
          </h2>
          <div class="myClub__groupon-grid">
            <div v-if="hasGrouponImage" class="myClub__groupon-image">
              <UiAtomMediaPicture :media="grouponImage!" />
            </div>
            <div class="myClub__groupon-content">
              <div v-if="hasGrouponContent">
                <UiLayoutRichText :blocks="grouponContent!" />
              </div>
              <UiAtomBaseButton
                v-if="grouponUrl"
                full-width
                as="a"
                size="lg"
                :href="grouponUrl"
                target="_blank"
              >
                {{ t("cta.shopGroupon") }}
              </UiAtomBaseButton>
            </div>
          </div>
        </section>
      </UiLayoutCardSurface>
    </div>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { ImageBreakpoint, ImageFormat } from "~/lib/strapi/dto/enums";
import type { BlockMyClubDto } from "~/lib/strapi/dto/components";
import { isMediaImage } from "~/utils/media";

const props = defineProps<BlockMyClubDto>();
const { t } = useI18n();
const globals = useGlobals();
const { brandNameShort } = useBrand();

const clubUrl = computed(() => globals.value?.ecommerce?.clubUrl ?? null);
// Seiten /club und /beauty-sparbuch, hinter NUXT_PUBLIC_CLUB_SEITEN.
const clubSeiten = useClubSeiten();
const grouponUrl = computed(() => globals.value?.ecommerce?.couponUrl ?? null);

const hasContent = computed(
  () =>
    !!props.clubContent?.length ||
    (props.clubBenefits?.length ?? 0) > 0 ||
    !!props.headline ||
    !!props.grouponContent?.length ||
    !!props.grouponImage ||
    !!clubUrl.value ||
    !!grouponUrl.value,
);

const hasClubContent = computed(() => (props.clubContent?.length ?? 0) > 0);
const hasBenefits = computed(() => (props.clubBenefits?.length ?? 0) > 0);
const hasGrouponContent = computed(
  () => (props.grouponContent?.length ?? 0) > 0,
);
const hasGrouponImage = computed(
  () => !!props.grouponImage && isMediaImage(props.grouponImage),
);
</script>

<style scoped>
.myClub__sparbuch {
  color: inherit;
  font-weight: var(--font-bold);
  text-align: center;
}

.myClub {
  display: flex;
  flex-direction: column;
  gap: var(--space-bento-gap);
  width: 100%;
}

.myClub__club {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
  height: 100%;
  padding: var(--space-card-pad);
  text-align: center;
}

.myClub__club-heading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
  margin: 0;
  font-size: var(--font-4xl);
  line-height: var(--line-4xl);
  font-weight: var(--font-regular);
  text-transform: uppercase;
}

.myClub__club-logo {
  height: 2.5rem;
}

.myClub__club-label {
  border-left: 1px solid var(--color-black);
  padding-left: var(--space-400);
}

.myClub__club-content {
  min-width: 0;
}

.myClub__benefits {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
  margin: var(--space-400) 0 0;
  padding: 0;
  list-style: none;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.myClub__benefit {
  display: inline-flex;
  align-items: center;
  gap: var(--space-200);
}

.myClub__groupon {
  padding: var(--space-card-pad);
}

.myClub__groupon-heading {
  margin: 0 0 var(--space-card-pad);
  font-size: var(--font-4xl);
  line-height: var(--line-4xl);
}

.myClub__groupon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-card-pad);
}

.myClub__groupon-image {
  flex: 2 0 160px;
  min-width: 0;
}

.myClub__groupon-image :deep(img) {
  max-width: 100%;
  border-radius: var(--border-radius-600);
}

.myClub__groupon-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  flex: 3 0 300px;
  max-width: 100%;
  min-width: 0;
}

@media (min-width: 1100px) {
  .myClub {
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: var(--space-bento-gap);
  }
}
</style>
