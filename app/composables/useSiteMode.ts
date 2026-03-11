export type SiteMode = "seo" | "ads";

export function useSiteMode() {
  const config = useRuntimeConfig();

  return computed<SiteMode>(() => {
    const raw = config.public.siteMode;
    if (raw === "ads") {
      return raw;
    }

    return "seo";
  });
}

export function useSiteModeFlags() {
  const siteMode = useSiteMode();

  const isAdsMode = computed(() => siteMode.value === "ads");
  const isSeoMode = computed(() => siteMode.value === "seo");

  return {
    siteMode,
    isAdsMode,
    isSeoMode,
  };
}


