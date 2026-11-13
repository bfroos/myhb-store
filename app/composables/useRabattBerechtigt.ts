import { loadRaw } from "~/lib/attribution";
import { rabattBerechtigt } from "#shared/rabattBerechtigt";
import { ADS_NO_DISCOUNT, ADS_OFFER_AUTO_SPLIT, adsOfferCookieVariant, isAdsOfferBPath } from "#shared/adsOfferVariant";

/**
 * Darf dieser Besucher den 20-%-Neukundenrabatt sehen? (shared/rabattBerechtigt.ts)
 *
 * Auf dem Server und vor dem Mount immer false: Seiten werden gecacht, und
 * wer den Stempel nicht hat, darf den Knopf auch nicht kurz sehen. Nach dem
 * Mount zählen der gespeicherte Stempel und die Parameter der aktuellen URL
 * (das utm-persist-Plugin hat sie dann meist schon gespeichert, ohne
 * Einwilligung aber nur in der Sitzung).
 *
 * Google-A/B-Test (13.11.2026, myhb-app/myhb-os#1843): Auf go.* sieht die
 * Gruppe A (echter Pfad /standorte/..., Cookie nicht "b") den Rabatt auch
 * ohne Meta-Beruehrung. Gruppe B (/ab-beratung/...) nie.
 */
export function useRabattBerechtigt() {
  const berechtigt = useState<boolean>("myhb_rabatt_berechtigt", () => false);
  const { isAdsMode } = useSiteModeFlags();
  onMounted(() => {
    if (berechtigt.value) return;
    if (
      isAdsMode.value &&
      !ADS_NO_DISCOUNT &&
      ADS_OFFER_AUTO_SPLIT &&
      !isAdsOfferBPath(window.location.pathname) &&
      adsOfferCookieVariant(document.cookie) !== "b"
    ) {
      berechtigt.value = true;
      return;
    }
    const q = new URLSearchParams(window.location.search);
    berechtigt.value = rabattBerechtigt(loadRaw(), {
      utm_source: q.get("utm_source") ?? undefined,
      utm_medium: q.get("utm_medium") ?? undefined,
      fbclid: q.get("fbclid") ?? undefined,
    });
  });
  return berechtigt;
}
