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
        <BlockProductHeroGallery :images="images" />
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
  activeVariants.value[0] ?? null,
);

onMounted(() => {
  syncVariantFromRoute();
});

watch([() => route.hash, () => route.query.v], () => {
  syncVariantFromRoute();
});

function findVariantBySlug(slug: string): ProductVariantDto | null {
  return activeVariants.value.find((v) => v.slug === slug) ?? null;
}

function pickInitialVariant(): ProductVariantDto | null {
  if (!activeVariants.value || activeVariants.value.length === 0) return null;
  return (
    activeVariants.value.find((v) => v.isActive) ??
    activeVariants.value[0] ??
    null
  );
}

function applyVariantFromQuery(): boolean {
  const raw = route.query.v;
  const variantSlug = Array.isArray(raw) ? raw[0] : raw;
  if (!variantSlug || typeof variantSlug !== "string") return false;
  const v = findVariantBySlug(variantSlug);
  if (!v) return false;
  currentVariant.value = v;
  return true;
}

function applyVariantFromHash(hash: string): boolean {
  const anchor = hash.replace(/^#/, "");
  if (!anchor) return false;
  const v = findVariantBySlug(anchor);
  if (!v) return false;
  currentVariant.value = v;
  return true;
}

function syncVariantFromRoute(): void {
  if (applyVariantFromQuery()) return;
  if (applyVariantFromHash(route.hash)) return;
  if (!currentVariant.value) {
    currentVariant.value = pickInitialVariant();
  }
}

function setCurrentVariant(variant: ProductVariantDto): void {
  currentVariant.value = variant;
  router.push({
    query: { ...route.query, v: variant.slug },
    hash: "",
  });
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
