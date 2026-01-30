<template>
  <UiLayoutSectionBlock>
    <UiOrganismMediaCard
      :card-settings="cardSettings"
      :layout="OrganismMediaCardLayout.MEDIA_LEFT"
    >
      <template #media>
        <UiAtomMediaPicture
          v-if="media && isMediaImage(media)"
          :media="media"
          :sources="{
            [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
            [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
          }"
        />
        <UiAtomMediaVideo
          v-else-if="media && isMediaVideo(media)"
          :media="media"
          :video-settings="videoSettings"
        />
      </template>
      <template #headline>
        <h2 v-if="headline">{{ headline }}</h2>
      </template>
      <template #content>
        <ul v-if="items && items.length > 0" class="benefitsList__items">
          <li v-for="item in items" :key="item.heading">
            <UiLayoutIconWrapper
              v-if="item.icon && item.icon.iconData"
              :size="40"
            >
              <g v-html="item.icon?.iconData ?? ''" />
            </UiLayoutIconWrapper>
            <IconCircleCheck
              v-else
              :size="40"
              stroke="1.5"
              class="benefitsList__items__icon"
              aria-hidden="true"
            />
            <div>
              <h3 v-if="item.heading">{{ item.heading }}</h3>
              <UiLayoutRichText :blocks="item.content" />
            </div>
          </li>
        </ul>
      </template>
      <template #links>
        <div v-if="links && links.length > 0" class="benefitsList__links">
          <UiMoleculeButtonGroup>
            <SharedButton v-for="link in links" :key="link.id" :button="link" />
          </UiMoleculeButtonGroup>
        </div>
      </template>
    </UiOrganismMediaCard>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";
import type { BlockBenefitsListDto } from "~/lib/strapi/dto/components";
import { IconCircleCheck } from "@tabler/icons-vue";
import { OrganismMediaCardLayout } from "~/lib/ui/enums";

const props = defineProps<BlockBenefitsListDto>();
</script>
<style scoped>
.benefitsList__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  margin: var(--space-600) 0 0;
  font-size: var(--font-lg);
  line-height: var(--line-lg);
}

.benefitsList__items > li {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--space-400);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.benefitsList__items h3 {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  margin: 6px 0 var(--space-200);
}

.benefitsList__links {
  margin-top: var(--space-600);
}
</style>
