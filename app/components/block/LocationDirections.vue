<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiOrganismMediaCard
      :card-settings="cardSettings"
      :fixed-image-aspect-ratio="fixedImageAspectRatio"
      :media-caption="false"
      :layout="OrganismMediaCardLayout.MEDIA_RIGHT"
    >
      <template #media>
        <UiAtomMediaPicture
          v-if="hasImage"
          :media="image!"
          :sources="imageSources"
          :default-format="ImageFormat.SMALL"
        />
      </template>
      <template #headline>
        <h2 v-if="headline" class="directions__heading">{{ headline }}</h2>
      </template>
      <template #content>
        <div v-if="hasIntro" class="directions__intro">
          <UiLayoutRichText :blocks="content!" />
        </div>
        <UiMoleculeCollabsibleItem
          v-for="item in directionItems"
          :key="item.key"
          :id="item.id"
          tight-spacing
        >
          <template #title>
            <component :is="item.icon" :size="24" aria-hidden="true" />
            {{ t(item.titleKey) }}
          </template>
          <template #content>
            <UiLayoutRichText :blocks="item.content" />
          </template>
        </UiMoleculeCollabsibleItem>
      </template>
    </UiOrganismMediaCard>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { IconBus, IconCar, IconWalk } from "@tabler/icons-vue";
import { useId } from "vue";
import { ImageBreakpoint, ImageFormat } from "~/lib/strapi/dto/enums";
import { OrganismMediaCardLayout } from "~/lib/ui/enums";
import type { BlockDirectionsDto } from "~/lib/strapi/dto/components";
import type { StrapiRichText } from "~/lib/strapi/dto/types";
import { isMediaImage } from "~/utils/media";

const props = defineProps<BlockDirectionsDto>();
const { t } = useI18n();

const baseId = useId();

const imageSources = {
  [ImageBreakpoint.LARGE]: ImageFormat.LARGE,
};

const hasContent = computed(
  () =>
    !!props.headline ||
    (props.content?.length ?? 0) > 0 ||
    !!props.walkDirections?.length ||
    !!props.publicTransportDirections?.length ||
    !!props.carDirections?.length,
);

const hasImage = computed(() => !!props.image && isMediaImage(props.image));

const hasIntro = computed(() => (props.content?.length ?? 0) > 0);

type DirectionItem = {
  key: string;
  id: string;
  icon: typeof IconWalk;
  titleKey: string;
  content: StrapiRichText;
};

const directionItems = computed((): DirectionItem[] => {
  const items: DirectionItem[] = [];

  if (props.walkDirections?.length) {
    items.push({
      key: "walk",
      id: `${baseId}-walk`,
      icon: IconWalk,
      titleKey: "blocks.directions.walk",
      content: props.walkDirections,
    });
  }

  if (props.publicTransportDirections?.length) {
    items.push({
      key: "publicTransport",
      id: `${baseId}-publicTransport`,
      icon: IconBus,
      titleKey: "blocks.directions.publicTransport",
      content: props.publicTransportDirections,
    });
  }

  if (props.carDirections?.length) {
    items.push({
      key: "car",
      id: `${baseId}-car`,
      icon: IconCar,
      titleKey: "blocks.directions.car",
      content: props.carDirections,
    });
  }

  return items;
});
</script>

<style scoped>
.directions__heading {
  margin: 0 0 var(--space-600);
  font-size: var(--font-xl);
  line-height: var(--line-xl);
}

.directions__intro {
  margin: var(--space-600) 0;
}
</style>
