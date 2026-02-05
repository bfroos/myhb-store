<template>
  <UiLayoutSectionBlock v-if="hasContent">
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
import type {
  BlockProductHeroDto,
  ProductVariantDto,
} from "~/lib/strapi/dto/components";

const props = defineProps<BlockProductHeroDto>();

const route = useRoute();
const router = useRouter();

const activeVariants = computed(() => props.variants.filter((v) => v.isActive));

const currentVariant = ref<ProductVariantDto | null>(
  activeVariants.value[0] ?? null,
);

const hasContent = computed(
  () => !!props.productName && (props.variants?.length ?? 0) > 0,
);

onMounted(() => syncVariantFromRoute());

watch([() => route.hash, () => route.query.v], syncVariantFromRoute);

function findVariantBySlug(slug: string): ProductVariantDto | null {
  return activeVariants.value.find((v) => v.slug === slug) ?? null;
}

function getVariantSlugFromRoute(): string | null {
  const fromQuery = route.query.v;
  const raw = Array.isArray(fromQuery) ? fromQuery[0] : fromQuery;
  if (raw && typeof raw === "string") return raw;

  const hash = route.hash.replace(/^#/, "");
  return hash || null;
}

function syncVariantFromRoute(): void {
  const slug = getVariantSlugFromRoute();
  if (slug) {
    const variant = findVariantBySlug(slug);
    if (variant) {
      currentVariant.value = variant;
      return;
    }
  }

  if (!currentVariant.value) {
    currentVariant.value = activeVariants.value[0] ?? null;
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
  width: 100%;
}

.productHero > * {
  min-width: 0;
}

@media (min-width: 900px) {
  .productHero {
    flex-direction: row-reverse;
  }
}
</style>
