import {
  isKontoLinkEnabled,
  kontoLinkUrl,
  type KontoLinkOrt,
} from "#shared/kontoLink";

/**
 * Link „Mein Konto" zur Kunden-App (#282). Nur auf www. (SEO-Modus) und nur,
 * wenn `NUXT_PUBLIC_KONTO_LINK` eingeschaltet ist, siehe shared/kontoLink.ts.
 */
export function useKontoLink() {
  const config = useRuntimeConfig();
  const { isAdsMode } = useSiteModeFlags();
  const { trackEvent } = useGoogleAnalytics();

  const enabled = computed(
    () => !isAdsMode.value && isKontoLinkEnabled(config.public.kontoLink),
  );

  const href = (ort: KontoLinkOrt) => kontoLinkUrl(ort);

  // Bestehendes Datenschicht-Muster (useGoogleAnalytics), kein neues Script.
  const trackClick = (ort: KontoLinkOrt) =>
    trackEvent("click_konto_link", {
      event_category: "engagement",
      cta_location: ort,
    });

  return { enabled, href, trackClick };
}
