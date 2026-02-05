<template>
  <UiLayoutSectionBlock>
    <UiOrganismMediaCard
      :card-settings="cardSettings"
      :layout="OrganismMediaCardLayout.MEDIA_LEFT"
    >
      <template #media>
        <UiAtomMediaPicture
          v-if="hasImage"
          :media="media!"
          :sources="imageSources"
        />
        <UiAtomMediaVideo
          v-else-if="hasVideo"
          :media="media!"
          :video-settings="videoSettings"
        />
      </template>
      <template #headline>
        <h2 v-if="headline" class="benefits__title">{{ headline }}</h2>
      </template>
      <template #content>
        <ul v-if="hasItems" class="benefits__list" role="list">
          <li
            v-for="(item, index) in items"
            :key="item.heading ?? index"
            class="benefits__item"
          >
            <UiLayoutIconWrapper
              v-if="item.icon?.iconData"
              :size="40"
              class="benefits__icon"
            >
              <g v-html="item.icon.iconData" />
            </UiLayoutIconWrapper>
            <IconCircleCheck
              v-else
              :size="40"
              stroke="1.5"
              class="benefits__icon"
              aria-hidden="true"
            />
            <div class="benefits__content">
              <h3 v-if="item.heading" class="benefits__heading">
                {{ item.heading }}
              </h3>
              <UiLayoutRichText :blocks="item.content ?? []" />
            </div>
          </li>
        </ul>
      </template>
      <template #links>
        <div v-if="hasLinks" class="benefits__links">
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
import { isMediaImage, isMediaVideo } from "~/utils/media";

const props = defineProps<BlockBenefitsListDto>();

const hasImage = computed(() => !!props.media && isMediaImage(props.media));

const hasVideo = computed(() => !!props.media && isMediaVideo(props.media));

const hasItems = computed(() => (props.items?.length ?? 0) > 0);

const hasLinks = computed(() => (props.links?.length ?? 0) > 0);

const imageSources = {
  [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
  [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
};
</script>

<style scoped>
.benefits__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  margin-top: var(--space-600);
  font-size: var(--font-lg);
  line-height: var(--line-lg);
}

.benefits__item {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--space-400);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.benefits__icon {
  flex-shrink: 0;
}

.benefits__heading {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  margin: 0 0 var(--space-200);
}

.benefits__links {
  margin-top: var(--space-600);
}
</style>
