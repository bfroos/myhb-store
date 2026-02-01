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
    grouponUrl?: string;
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
