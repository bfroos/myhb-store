export type TreatmentPageMenuItem = {
  id: number;
  name: string;
  slug: string;
  pathKey: string;
  children: TreatmentPageMenuItem[];
};

export type ProductCategoryMenuItem = {
  id: number;
  name: string;
  slug: string;
  children: ProductCategoryMenuItem[];
};

type MenuResponse = {
  data: {
    "treatment-pages"?: TreatmentPageMenuItem[];
    "product-categories"?: ProductCategoryMenuItem[];
  };
};

export function useMenu(types: string | string[] = "treatment-pages") {
  const { locale, fallbackLocale } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;

  const typesString = Array.isArray(types) ? types.join(",") : types;
  const cacheKey = `menu-${currentLocale}-${typesString}`;

  const { data, error, pending, refresh } = useStrapiFetch<MenuResponse>(
    "/menu",
    {
      query: {
        locale: currentLocale,
        types: typesString,
      },
      fetchOptions: {
        key: cacheKey,
      },
    },
  );

  // Computed properties for easy access
  const treatmentPages = computed(
    () => data.value?.data?.["treatment-pages"] || [],
  );

  const productCategories = computed(
    () => data.value?.data?.["product-categories"] || [],
  );

  return {
    data,
    error,
    pending,
    refresh,
    treatmentPages,
    productCategories,
  };
}
