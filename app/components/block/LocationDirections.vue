<template>
  <UiLayoutSectionBlock>
    <UiOrganismMediaCard
      :card-settings="cardSettings"
      :fixed-image-aspect-ratio="fixedImageAspectRatio"
      :media-caption="false"
      :layout="OrganismMediaCardLayout.MEDIA_RIGHT"
    >
      <template #media>
        <picture v-if="image && image.formats">
          <source
            v-if="getMediaUrl(image, ImageFormat.LARGE)"
            media="(min-width: 900px)"
            :srcset="getMediaUrl(image, ImageFormat.LARGE)"
          />
          <img
            :src="getMediaUrl(image, ImageFormat.SMALL)"
            loading="lazy"
            alt=""
          />
        </picture>
      </template>
      <template #headline>
        <h2>{{ headline }}</h2>
      </template>
      <template #content>
        <div v-if="content && content.length > 0" class="directionsCard__text">
          <UiLayoutRichText :blocks="content" />
        </div>
        <UiMoleculeCollabsibleItem
          v-if="walkDirections"
          :id="walkId"
          tight-spacing
        >
          <template #title>
            <IconWalk :size="24" />
            {{ $t("blocks.directions.walk") }}
          </template>
          <template #content>
            <div>{{ walkDirections }}</div>
          </template>
        </UiMoleculeCollabsibleItem>
        <UiMoleculeCollabsibleItem
          v-if="publicTransportDirections"
          :id="publicTransportId"
          tight-spacing
        >
          <template #title>
            <IconBus :size="24" />
            {{ $t("blocks.directions.publicTransport") }}
          </template>
          <template #content>
            <div>{{ publicTransportDirections }}</div>
          </template>
        </UiMoleculeCollabsibleItem>
        <UiMoleculeCollabsibleItem
          v-if="carDirections"
          :id="carId"
          tight-spacing
        >
          <template #title>
            <IconCar :size="24" />
            {{ $t("blocks.directions.car") }}
          </template>
          <template #content>
            <div>{{ carDirections }}</div>
          </template>
        </UiMoleculeCollabsibleItem>
      </template>
    </UiOrganismMediaCard>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockDirectionsDto } from "~/lib/strapi/dto/components";
import { IconWalk, IconBus, IconCar } from "@tabler/icons-vue";
import { ImageFormat } from "~/lib/strapi/dto/enums";
import { OrganismMediaCardLayout } from "~/lib/ui/enums";
import { useId } from "vue";

const props = defineProps<BlockDirectionsDto>();

const walkId = useId();
const publicTransportId = useId();
const carId = useId();
</script>

<style scoped>
h2 {
  margin: 0 0 var(--space-600);
}
.directionsCard__text {
  margin: var(--space-600) 0;
}
</style>
