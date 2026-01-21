<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="productHero">
        <BlockProductHeroDetails
          :manufacturer-name="manufacturerName"
          :product-name="productName"
          :variants="variants"
          :current-variant="currentVariant"
          @set-current-variant="setCurrentVariant"
        />
        <BlockProductHeroGallery :current-variant="currentVariant" />
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockProductHeroDto } from "~/lib/strapi/dto/components";
import type { ProductVariantDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockProductHeroDto>();

const route = useRoute();
const router = useRouter();

const activeVariants = computed(() => {
  return props.variants.filter((v) => v.isActive);
});

const currentVariant = ref<ProductVariantDto | null>(
  activeVariants.value[0] ?? null
);

onMounted(() => {
  syncVariantFromRoute();
});

watch(
  () => route.hash,
  () => {
    syncVariantFromRoute();
  }
);

function findVariantByAnchor(anchor: string): ProductVariantDto | null {
  return activeVariants.value.find((v) => v.slug === anchor) ?? null;
}

function pickInitialVariant(): ProductVariantDto | null {
  if (!activeVariants.value || activeVariants.value.length === 0) return null;
  return (
    activeVariants.value.find((v) => v.isActive) ??
    activeVariants.value[0] ??
    null
  );
}

function applyHashToVariant(hash: string): boolean {
  const anchor = hash.replace(/^#/, "");
  if (!anchor) return false;
  const v = findVariantByAnchor(anchor);
  if (!v) return false;
  currentVariant.value = v;
  return true;
}

function syncVariantFromRoute(): void {
  if (applyHashToVariant(route.hash)) return;
  if (!currentVariant.value) {
    currentVariant.value = pickInitialVariant();
  }
}

function setCurrentVariant(variant: ProductVariantDto): void {
  currentVariant.value = variant;
  router.push(`#${variant.slug}`);
}
</script>
<style scoped>
.productHero {
  display: flex;
  flex-direction: column-reverse;
  gap: 0;
}

@media screen and (min-width: 900px) {
  .productHero {
    flex-direction: row-reverse;
  }
}
</style>
