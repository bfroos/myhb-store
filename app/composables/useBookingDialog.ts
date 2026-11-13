import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";
import type { TreatmentType } from "~/lib/strapi/dto/enums";
import {
  isAppBookingUrl,
  useAppBookingDialog,
  withAppTreatmentSlug,
} from "~/composables/useAppBookingDialog";
import type { BookingTreatmentContext } from "~/lib/bookingTreatmentContext";
import { offerValue, priceFromLabel } from "~/lib/checkoutAttempt";
import type { BookingPrefill } from "~/lib/bookingPrefill";

/**
 * Zweiter Buchungsweg desselben Standorts (#97) plus sein Slug fuer den
 * Tracking-Kontext.
 */
export type BookingAlternatives = {
  appBookingUrl?: string;
  locationSlug?: string;
};

/**
 * Woher der Dialog kommt. `offer` gesetzt = Buchung nach „20 % Rabatt
 * sichern": Der Dialog oeffnet ohne eigenen Klick direkt nach der Anmeldung.
 */
export type BookingDialogOptions = {
  offer?: string;
  /**
   * go. Variante A (02.10.2026): Buchung kommt aus dem Rabatt-Dialog (nach
   * der Anmeldung, nach gescheiterter Anmeldung oder ueber "ohne Code direkt
   * Termin buchen"). Geht als `via_modal: true` an `click_booking`.
   */
  viaModal?: boolean;
  /**
   * 07.10.2026: Lead aus dem Rabatt-Dialog (`leadToken`), damit die App die
   * Daten nicht ein zweites Mal abfragt. Nie ins Tracking (lib/bookingPrefill.ts).
   */
  prefill?: BookingPrefill;
  /** Termin-Knopf aus dem Rabatt-Fenster (myhb-app/myhb-os#1030), nur App. */
  termin?: { date: string; time: string };
};

export function useBookingDialog() {
  const dialog = useDialog();
  const { t } = useI18n();
  const { openAppBookingDialog } = useAppBookingDialog();
  const { trackBookingClick } = useGoogleAnalytics();
  const { resolveBooking } = useBookingAbTest();

  /**
   * Oeffnet die Buchung: mit App-URL des Standorts direkt den App-Dialog,
   * sonst die Standortsuche (BookingLocationDialog), in der der Besucher
   * seinen Standort waehlt.
   *
   * @param appTreatmentSlug Behandlungs-Slug fuer den App-Deeplink
   *   (`?treatment=`). Haengt auch an der App-URL des Standorts, den der
   *   Nutzer erst in der Standortsuche auswaehlt.
   * @param alternatives App-Buchungs-URL des Standorts und sein Slug.
   * @param treatmentContext Name und Preis der Behandlung, von deren Seite der
   *   Dialog geoeffnet wurde (#78). Steht als Kontextzeile im Dialogkopf und
   *   geht als `treatment_context` (true/false) an `click_booking`.
   */
  function openBookingDialog(
    treatmentType?: TreatmentType,
    appTreatmentSlug?: string,
    alternatives?: BookingAlternatives,
    treatmentContext?: BookingTreatmentContext,
    options?: BookingDialogOptions,
  ) {
    const { url: targetUrl, abVariant, abFallback, abSource } = resolveBooking({
      appBookingUrl: alternatives?.appBookingUrl,
    });
    const appUrl = isAppBookingUrl(targetUrl)
      ? (withAppTreatmentSlug(targetUrl, appTreatmentSlug) ?? targetUrl)
      : undefined;
    const offer = options?.offer;
    const viaModal = !!options?.viaModal;
    const clickType = appUrl ? "app" : "location_search";
    // Seitenpreis fuer Meta „Schedule mit Wert" (#400 in myhb-os); im
    // Rabattweg der Neukundenpreis (−20 %).
    const bookingValue = offerValue(
      treatmentContext?.value ?? priceFromLabel(treatmentContext?.priceLabel),
      offer,
    );
    // Rabattweg ohne Standort: Die Standortsuche oeffnet von selbst nach der
    // Anmeldung, der Buchungsversuch (`click_booking` = Meta InitiateCheckout)
    // beginnt erst mit der Standortwahl — BookingLocationDialog holt ihn dort
    // nach. Sonst stand InitiateCheckout direkt hinter der Anmeldung.
    const deferCheckout = !!offer && clickType === "location_search";
    if (!deferCheckout) {
      trackBookingClick(clickType, {
        treatment_type: treatmentType,
        location_slug: alternatives?.locationSlug,
        ab_variant: abVariant,
        ab_fallback: abFallback,
        ab_source: abSource,
        // #78: trennt in der Wochenauswertung (elanagency/myhb-os#271) die
        // Klicks mit Kontextzeile von denen ohne.
        treatment_context: !!treatmentContext,
        booking_value: bookingValue,
        offer,
        via_modal: viaModal || undefined,
      });
    }

    if (appUrl) {
      openAppBookingDialog(t("cta.bookAppointment"), appUrl, {
        abVariant,
        abSource,
        treatmentContext,
        offer,
        lead: options?.prefill?.leadToken,
        termin: options?.termin,
      });
      return;
    }

    dialog.open(
      defineAsyncComponent(
        () => import("~/components/ui/organism/BookingLocationDialog.vue"),
      ),
      {
        data: {
          treatmentType,
          appTreatmentSlug,
          treatmentContext,
          abVariant,
          abFallback,
          abSource,
          offer,
          viaModal,
          prefill: options?.prefill,
          deferCheckout,
          bookingValue,
          openedAt: import.meta.client ? performance.now() : undefined,
        },
        props: {
          modal: true,
          draggable: false,
          header: t("dialogs.locationSearch.header"),
          style: {
            width: "600px",
            height: "98svh",
            maxHeight: "98svh",
            margin: "0",
            padding: "0",
          },
          contentStyle: {
            height: "100%",
            padding: "0",
          },
          breakpoints: {
            "960px": "100vw",
            "640px": "100vw",
          },
        },
      },
    );
  }

  return { openBookingDialog };
}
