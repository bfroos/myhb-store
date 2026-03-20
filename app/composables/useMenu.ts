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

export function useMenu(
  types: MaybeRefOrGetter<string | string[]> = "treatment-pages",
) {
  const { locale, fallbackLocale } = useI18n();

  const query = computed(() => ({
    locale: (locale.value || fallbackLocale.value) as string,
    types: (() => {
      const resolvedTypes = toValue(types);
      return Array.isArray(resolvedTypes)
        ? resolvedTypes.join(",")
        : resolvedTypes;
    })(),
  }));

  const { data, error, pending, refresh } = useStrapiFetch<MenuResponse>(
    "/menu",
    {
      query,
    },
  );

  const sortMenuByName = <T extends { name: string; children?: T[] }>(
    items: T[],
    sortLocale: string,
  ): T[] =>
    [...items]
      .sort((a, b) => a.name.localeCompare(b.name, sortLocale))
      .map((item) => ({
        ...item,
        children: item.children?.length
          ? sortMenuByName(item.children, sortLocale)
          : item.children,
      }));

  const treatmentPages = computed(() => {
    const items = data.value?.data?.["treatment-pages"] ?? [];
    return sortMenuByName(items, locale.value || fallbackLocale.value || "de");
  });
  const productCategories = computed(() => {
    const items = data.value?.data?.["product-categories"] ?? [];
    return sortMenuByName(items, locale.value || fallbackLocale.value || "de");
  });

  return {
    data,
    error,
    pending,
    refresh,
    treatmentPages,
    productCategories,
  };
}
