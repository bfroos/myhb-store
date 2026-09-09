import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";
import type { TreatmentType } from "~/lib/strapi/dto/enums";
import {
  isAppBookingUrl,
  useAppBookingDialog,
  withAppTreatmentSlug,
} from "~/composables/useAppBookingDialog";

export function useCalendlyDialog() {
  const dialog = useDialog();
  const { t } = useI18n();
  const { openAppBookingDialog } = useAppBookingDialog();
  const { trackBookingClick } = useGoogleAnalytics();

  /**
   * @param appTreatmentSlug Behandlungs-Slug fuer den App-Deeplink
   *   (`?treatment=`). Wird an die App-Buchungs-URL gehaengt – auch an die des
   *   Standorts, den der Nutzer erst im Standort-Dialog auswaehlt. Bei
   *   Calendly-URLs bleibt er ohne Wirkung.
   */
  function openCalendlyDialog(
    url?: string,
    treatmentType?: TreatmentType,
    appTreatmentSlug?: string,
  ) {
    const bookingUrl = withAppTreatmentSlug(url, appTreatmentSlug) ?? url;
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
      { treatment_type: treatmentType },
    );

    // Migration path: if the location's booking URL points at the MY app,
    // open the in-app booking iframe instead of the Calendly widget. This lets
    // us switch locations from Calendly to the app one at a time simply by
    // changing the "Calendly URL" field in Strapi. Everything else (a
    // calendly.com URL, or no URL -> location search) keeps working as before.
    if (isAppBookingUrl(bookingUrl)) {
      openAppBookingDialog(t("cta.bookAppointment"), bookingUrl);
      return;
    }

    dialog.open(
      defineAsyncComponent(
        () => import("~/components/ui/organism/CalendlyDialog.vue"),
      ),
      {
        data: { url: bookingUrl, treatmentType, appTreatmentSlug },
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
