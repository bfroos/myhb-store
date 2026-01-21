<template>
  <UiLayoutSectionBlock v-if="treatmentPages && treatmentPages.length > 0">
    <UiOrganismTilesCard :card-settings="cardSettings">
      <template #header>
        <h2 v-if="headline">{{ headline }}</h2>
      </template>
      <UiMoleculeTreatmentTile
        v-for="treatmentPage in treatmentPages"
        :key="treatmentPage.id"
        :title="treatmentPage.teaser?.title || treatmentPage.name || ''"
        :shortDescription="getShortDescription(treatmentPage)"
        :description="getDescription(treatmentPage)"
        :image="treatmentPage.teaser?.image || treatmentPage.hero?.cover"
        :path="getPath(treatmentPage)"
        :priceInEuroCent="getPriceInEuroCent(treatmentPage)"
        :isStartingPrice="getIsStartingPrice(treatmentPage)"
      />
    </UiOrganismTilesCard>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockTreatmentTeasersDto } from "~/lib/strapi/dto/components";
import type { TreatmentPageDto } from "~/lib/strapi/dto/collections";

const props = defineProps<BlockTreatmentTeasersDto>();

function getShortDescription(
  treatmentPage: TreatmentPageDto
): string | undefined {
  if (props.showShortDescriptions)
    return treatmentPage.teaser?.shortDescription;
  return undefined;
}

function getDescription(treatmentPage: TreatmentPageDto): string | undefined {
  if (props.showDescriptions) return treatmentPage.teaser?.description;
  return undefined;
}

function getPriceInEuroCent(
  treatmentPage: TreatmentPageDto
): number | undefined {
  if (props.showPrices) return treatmentPage.treatment?.priceInEuroCent || 0;
  return undefined;
}

function getIsStartingPrice(
  treatmentPage: TreatmentPageDto
): boolean | undefined {
  if (props.showPrices) return treatmentPage.treatment?.isStartingPrice;
  return undefined;
}

function getPath(treatmentPage: TreatmentPageDto): string {
  if (props.locationPathKey) {
    return `/standorte/${props.locationPathKey}/${treatmentPage.pathKey}`;
  }
  return `/behandlungen/${treatmentPage.pathKey}`;
}
</script>
