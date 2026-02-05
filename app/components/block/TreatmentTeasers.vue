<template>
  <UiLayoutSectionBlock v-if="hasItems">
    <div class="teasers">
      <UiOrganismTilesCard :card-settings="cardSettings">
        <template #header>
          <h2 v-if="headline" class="teasers__heading">{{ headline }}</h2>
        </template>
        <UiMoleculeTreatmentTile
          v-for="page in treatmentPages"
          :key="page.id"
          v-bind="getTileProps(page)"
        />
      </UiOrganismTilesCard>
    </div>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockTreatmentTeasersDto } from "~/lib/strapi/dto/components";
import type { TreatmentPageDto } from "~/lib/strapi/dto/collections";
import type { MoleculeTreatmentTile } from "~/lib/ui/types";

const props = defineProps<BlockTreatmentTeasersDto>();

const hasItems = computed(() => (props.treatmentPages?.length ?? 0) > 0);

function getTileProps(page: TreatmentPageDto): MoleculeTreatmentTile {
  return {
    title: page.teaser?.title ?? page.name ?? "",
    shortDescription: props.showShortDescriptions
      ? page.teaser?.shortDescription
      : undefined,
    description: props.showDescriptions ? page.teaser?.description : undefined,
    image: page.teaser?.image ?? page.hero?.cover,
    path: props.locationPathKey
      ? `/standorte/${props.locationPathKey}/${page.pathKey}`
      : `/behandlungen/${page.pathKey}`,
    priceInEuroCent: props.showPrices
      ? page.treatment?.priceInEuroCent ?? 0
      : undefined,
    isStartingPrice: props.showPrices
      ? page.treatment?.isStartingPrice
      : undefined,
  };
}
</script>

<style scoped>
.teasers__heading {
  margin: 0;
}
</style>
