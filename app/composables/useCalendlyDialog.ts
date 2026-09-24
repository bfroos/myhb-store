import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";
import type { TreatmentType } from "~/lib/strapi/dto/enums";
import {
  isAppBookingUrl,
  useAppBookingDialog,
  withAppTreatmentSlug,
} from "~/composables/useAppBookingDialog";
import { disposeBookingPrewarm } from "~/composables/useBookingPrewarm";
import type { BookingTreatmentContext } from "~/lib/bookingTreatmentContext";

/**
 * Zweiter Buchungsweg desselben Standorts (#97) plus sein Slug fuer den
 * Tracking-Kontext.
 */
export type BookingAlternatives = {
  appBookingUrl?: string;
  locationSlug?: string;
};

export function useCalendlyDialog() {
  const dialog = useDialog();
  const { t } = useI18n();
  const { openAppBookingDialog } = useAppBookingDialog();
  const { trackBookingClick } = useGoogleAnalytics();
  const { resolveBooking } = useBookingAbTest();

  /**
   * @param appTreatmentSlug Behandlungs-Slug fuer den App-Deeplink
   *   (`?treatment=`). Wird an die App-Buchungs-URL gehaengt – auch an die des
   *   Standorts, den der Nutzer erst im Standort-Dialog auswaehlt. Bei
   *   Calendly-URLs bleibt er ohne Wirkung.
   * @param alternatives Zweite Buchungs-URL des Standorts und sein Slug. Ohne
   *   zugewiesenen Bucket (kein Ads-Deployment, keine Einwilligung, Split aus)
   *   bleibt es bei `url`.
   * @param treatmentContext Name und Preis der Behandlung, von deren Seite der
   *   Dialog geoeffnet wurde (#78). Steht als Kontextzeile im Dialogkopf und
   *   geht als `treatment_context` (true/false) an `click_booking`.
   */
  function openCalendlyDialog(
    url?: string,
    treatmentType?: TreatmentType,
    appTreatmentSlug?: string,
    alternatives?: BookingAlternatives,
    treatmentContext?: BookingTreatmentContext,
  ) {
    // #100: Der Bucket steht schon seit dem Seitenaufruf fest
    // (plugins/ab-split.client.ts); hier wird er angewendet, weil jetzt der
    // Standort und damit die zweite URL bekannt ist.
    const { url: targetUrl, abVariant, abFallback, abSource } = resolveBooking({
      calendlyUrl: url,
      appBookingUrl: alternatives?.appBookingUrl,
    });
    const bookingUrl =
      withAppTreatmentSlug(targetUrl, appTreatmentSlug) ?? targetUrl;
    // Conversion-Audit #67: booking_type war fest "calendly". Jetzt wird das
    // System getrackt, das tatsaechlich oeffnet. Ohne URL oeffnet zuerst die
    // Standortsuche; der konkrete Standort wird dann im Dialog getrackt
    // (trackBookingLocationSelected).
    trackBookingClick(
      isAppBookingUrl(bookingUrl)
        ? "app"
        : bookingUrl
          ? "calendly"
          : "location_search",
      {
        treatment_type: treatmentType,
        location_slug: alternatives?.locationSlug,
        ab_variant: abVariant,
        ab_fallback: abFallback,
        ab_source: abSource,
        // #78: trennt in der Wochenauswertung (elanagency/myhb-os#271) die
        // Klicks mit Kontextzeile von denen ohne.
        treatment_context: !!treatmentContext,
      },
    );

    // Migration path: if the location's booking URL points at the MY app,
    // open the in-app booking iframe instead of the Calendly widget. This lets
    // us switch locations from Calendly to the app one at a time simply by
    // changing the "Calendly URL" field in Strapi. Everything else (a
    // calendly.com URL, or no URL -> location search) keeps working as before.
    if (isAppBookingUrl(bookingUrl)) {
      // #141: Fuer die App-Buchung ist der vorgewaermte Calendly-Rahmen wertlos.
      disposeBookingPrewarm();
      openAppBookingDialog(t("cta.bookAppointment"), bookingUrl, {
        abVariant,
        treatmentContext,
      });
      return;
    }

    // #141: Der vorgewaermte Rahmen wird hier *nicht* abgeraeumt — der Dialog
    // legt ihn sichtbar ueber sich, statt ein zweites Mal zu laden. Passt er
    // nicht zur URL, raeumt der Dialog ihn selbst ab.
    dialog.open(
      defineAsyncComponent(
        () => import("~/components/ui/organism/CalendlyDialog.vue"),
      ),
      {
        data: {
          url: bookingUrl,
          treatmentType,
          appTreatmentSlug,
          treatmentContext,
          abVariant,
          abFallback,
          abSource,
          // #141: Ab hier laeuft die Uhr, die `booking_embed_ready` misst —
          // der Klick ist der Moment, den das Ticket abnimmt, nicht das
          // Einhaengen des Widgets ein paar Hundert Millisekunden spaeter.
          openedAt: import.meta.client ? performance.now() : undefined,
        },
        props: {
          modal: true,
          draggable: false,
          header: t("dialogs.calendly.header"),
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

  return { openCalendlyDialog };
}
