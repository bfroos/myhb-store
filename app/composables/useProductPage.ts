import type { LocalizationDto, StrapiBlock } from "~/lib/strapi/dto/types";
import type { TreatmentPageDto } from "~/lib/strapi/dto/collections";
import { mapProductPageBlocks } from "~/lib/strapi/mapper/mapProductPageBlocks";
import type { BreadcrumbItem } from "~/lib/ui/types";

export function useProductPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const categoryLocalizations = ref<LocalizationDto[]>([]);
  const productLocalizations = ref<LocalizationDto[]>([]);
  const product = ref<any | null>(null);
  const category = ref<any | null>(null);
  const productPage = ref<any | null>(null);
  const blocks = ref<StrapiBlock[]>([]);
  const cheapestVariantPrice = ref<number>(0);

  const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    {
      title: t("navigation.secondary.prices"),
      to: "/preise",
    },
    {
      title: product.value?.name,
    },
  ]);

  async function fetchProductPage(): Promise<boolean> {
    const route = useRoute();
    const productSlug = route.params.productSlug as string;

    const { data, error } = await useStrapiFetch<any>(
      `/product-pages/${productSlug}`,
      {
        query: {
          locale: currentLocale,
        },
        fetchOptions: {
          key: `product-page:${currentLocale}:${productSlug}`,
        },
      },
    );

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    if (!data.value?.data) {
      throw handleNotFound(t);
    }

    product.value = data.value.data.product;
    productPage.value = data.value.data.productPage;
    blocks.value = (data.value.data.productPage?.blocks ?? []) as StrapiBlock[];
    cheapestVariantPrice.value = data.value.data.cheapestVariantPrice ?? 0;

    // Extract category from product.category
    if (product.value?.category) {
      category.value = product.value.category;
      categoryLocalizations.value = (product.value.category.localizations ??
        []) as LocalizationDto[];
    }

    productLocalizations.value = product.value?.localizations ?? [];

    return true;
  }

  const metaTitle = computed(
    () =>
      `${product.value?.manufacturer?.name} ${product.value?.name} ${t(
        "common.price.startingPrefix",
      )} ${formatPriceInEuro(cheapestVariantPrice.value ?? 0)}`,
  );

  const metaDescription = computed(() => {
    // const variants =
    //   product.value?.variants &&
    //   product.value?.variants.some((variant: any) => variant.volume)
    //     ? product.value?.variants
    //         .map(
    //           (variant: any) =>
    //             `${variant.volume.quantity} ${variant.volume.unit}`
    //         )
    //         .join(", ")
    //     : "";

    return `${t("pages.product.seo.description", {
      name: product.value?.name,
      manufacturer: product.value?.manufacturer?.name,
      // variants,
      price: formatPriceInEuro(cheapestVariantPrice.value ?? 0),
    })}`;
  });

  const seo = computed(() => ({
    metaTitle: metaTitle.value,
    metaDescription: metaDescription.value,
  }));

  const fixedBlocks = computed(() => mapProductPageBlocks(product.value));

  return {
    fetchProductPage,
    productPage,
    fixedBlocks,
    blocks,
    product,
    category,
    categoryLocalizations,
    productLocalizations,
    breadcrumbItems,
    seo,
  };
}
