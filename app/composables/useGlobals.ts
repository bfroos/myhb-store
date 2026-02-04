const DEFAULT_BRAND_NAME = "MY HEALTH AND BEAUTY";
const DEFAULT_BRAND_NAME_SHORT = "MY";

/**
 * Access global state that was loaded on app initialization
 * Returns the globals state that was set in the globals.ts plugin
 */
export type GlobalsState = {
  seo?: {
    titleSuffix?: string;
    titleSeparator?: string;
    defaultTitle?: string;
    defaultDescription?: string;
  };
  marketing: {
    fiveStarReviewsCount?: string;
    customersCount?: string;
  };
  brand: {
    name?: string;
    nameShort?: string;
  };
  ecommerce: {
    clubUrl?: string;
    couponUrl?: string;
    newsletterDiscountPercentage?: number | null;
  };
};

export function useGlobals() {
  const globals = useState<GlobalsState>("globals", () => ({
    seo: {},
    marketing: {},
    brand: {},
    ecommerce: {},
  }));

  return globals;
}

/**
 * Brand names with fallbacks from globals.
 * Use this instead of globals?.brand?.nameShort ?? "MY" to avoid repeating the default.
 */
export function useBrand() {
  const globals = useGlobals();
  const brandName = computed(
    () => globals.value?.brand?.name ?? DEFAULT_BRAND_NAME,
  );
  const brandNameShort = computed(
    () => globals.value?.brand?.nameShort ?? DEFAULT_BRAND_NAME_SHORT,
  );
  return { brandName, brandNameShort };
}
