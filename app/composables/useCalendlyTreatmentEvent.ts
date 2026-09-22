import { withCalendlyTreatmentEvent } from "~/lib/calendlyEmbedUrl";

/**
 * Termintyp-Deeplink fuer Calendly (#148) — vorerst nur im Ads-Deployment.
 *
 * Auf go.myhealthandbeauty.com landet der bezahlte Verkehr; dort wurde der
 * Umweg ueber die Terminart-Auswahl gefunden, und dort ist der A/B-Test
 * Calendly gegen App ohne Volumen (22.09.2026: 5 gegen 11 Klicks in sechs
 * Tagen). Auf www laeuft der Test mit 50 %; eine Verbesserung des Calendly-Arms
 * mitten im Test wuerde das Urteil am 29.09. (elanagency/myhb-os#271)
 * verzerren. Nach dem Urteil kann das Gate fallen — eine Zeile.
 */
export function useCalendlyTreatmentEvent() {
  const config = useRuntimeConfig();
  const aktiv = config.public.siteMode === "ads";

  function treatmentEventUrl(
    url: string | undefined,
    treatmentType: string | null | undefined,
  ): string | undefined {
    return aktiv ? withCalendlyTreatmentEvent(url, treatmentType) : url;
  }

  return { treatmentEventUrl, aktiv };
}
