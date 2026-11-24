import {
  appUrl,
  isClubSeitenEnabled,
  type ClubLinkOrt,
} from "#shared/clubSeiten";

/**
 * Seiten /club und /beauty-sparbuch, siehe shared/clubSeiten.ts. Nur auf www.
 * (nicht go.) und nur mit eingeschaltetem `NUXT_PUBLIC_CLUB_SEITEN`.
 */
export function useClubSeiten() {
  const config = useRuntimeConfig();
  const { isAdsMode } = useSiteModeFlags();
  const { trackEvent } = useGoogleAnalytics();

  const enabled = computed(
    () => !isAdsMode.value && isClubSeitenEnabled(config.public.clubSeiten),
  );

  // Benjamin 24.11.2026: erst das Treueprogramm, das Sparbuch spaeter. Die Seite
  // /beauty-sparbuch und alle Verweise darauf haengen zusaetzlich an
  // NUXT_PUBLIC_SPARBUCH_SEITE.
  const sparbuch = computed(
    () => enabled.value && isClubSeitenEnabled(config.public.sparbuchSeite),
  );

  const trackClick = (ort: ClubLinkOrt, ziel: "club" | "sparbuch" | "app") =>
    trackEvent("click_club_link", {
      event_category: "engagement",
      cta_location: ort,
      cta_target: ziel,
    });

  return { enabled, sparbuch, appUrl, trackClick };
}
