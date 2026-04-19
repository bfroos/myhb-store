<template>
  <UiLayoutSectionBlock v-if="hasItems">
    <div ref="teasersRoot" class="teasers">
      <UiOrganismTilesCard :card-settings="cardSettings">
        <template #header>
          <h2 v-if="headline" class="teasers__heading">{{ headline }}</h2>
          <div v-if="showTopCategoryFilter" class="teasers__filterArea">
            <UiMoleculeHorizontalFilterChips
              v-model="selectedTopCategoryKey"
              :items="topCategories"
              :all-label="t('blocks.treatmentTeasers.filter.all')"
            />
          </div>
        </template>
        <UiMoleculeTreatmentTile
          v-for="page in filteredTreatmentItems"
          :key="page.id"
          v-bind="getTileProps(page)"
        />
      </UiOrganismTilesCard>
    </div>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockTreatmentTeasersDto } from "~/lib/strapi/dto/components";
import type {
  TreatmentAdsPageDto,
  TreatmentPageDto,
} from "~/lib/strapi/dto/collections";
import type { MoleculeTreatmentTile } from "~/lib/ui/types";

const props = defineProps<BlockTreatmentTeasersDto>();
const { t, locale } = useI18n();
const selectedTopCategoryKey = ref<string | null>(null);
const teasersRoot = ref<HTMLElement | null>(null);

const treatmentItems = computed<Array<TreatmentPageDto | TreatmentAdsPageDto>>(
  () => props.treatmentAdsPages ?? props.treatmentPages ?? [],
);

const hasItems = computed(() => treatmentItems.value.length > 0);

type TreatmentItem = TreatmentPageDto | TreatmentAdsPageDto;

type TopCategory = {
  key: string;
  label: string;
};

const topCategories = computed<TopCategory[]>(() => {
  const collator = new Intl.Collator(locale.value);
  const categories = new Map<string, string>();

  treatmentItems.value.forEach((page) => {
    const key = getTopCategoryKey(page);
    if (!key) {
      return;
    }

    if (!categories.has(key)) {
      categories.set(key, getTopCategoryLabel(page, key));
    }
  });

  return Array.from(categories.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => collator.compare(a.label, b.label));
});

const showTopCategoryFilter = computed(
  () => !!props.showTopCategoryFilters && topCategories.value.length > 0,
);

const filteredTreatmentItems = computed<
  Array<TreatmentPageDto | TreatmentAdsPageDto>
>(() => {
  if (!selectedTopCategoryKey.value) {
    return treatmentItems.value;
  }

  return treatmentItems.value.filter((page) => {
    return getTopCategoryKey(page) === selectedTopCategoryKey.value;
  });
});

watch(topCategories, () => {
  if (
    selectedTopCategoryKey.value &&
    !topCategories.value.some(
      (category) => category.key === selectedTopCategoryKey.value,
    )
  ) {
    selectedTopCategoryKey.value = null;
  }
});

watch(selectedTopCategoryKey, async () => {
  await nextTick();
  resetTreatmentListScroll();
});

function resetTreatmentListScroll() {
  const scrollContainer = teasersRoot.value?.querySelector<HTMLElement>(
    ".tilesCard__body .horizontalScroll__container",
  );

  if (!scrollContainer) return;

  scrollContainer.scrollTo({
    left: 0,
    behavior: "auto",
  });
}

function getTopCategoryKey(page: TreatmentItem): string {
  return page.topCategory?.slug ?? page.ancestorSlugs?.[0] ?? page.slug ?? "";
}

function getTopCategoryLabel(page: TreatmentItem, fallbackKey: string): string {
  return page.topCategory?.name ?? page.name ?? fallbackKey;
}

function getTileProps(
  page: TreatmentPageDto | TreatmentAdsPageDto,
): MoleculeTreatmentTile {
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

.teasers__filterArea {
  margin: var(--space-400) 0;
}
</style>
