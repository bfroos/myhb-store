import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";
import type { TreatmentType } from "~/lib/strapi/dto/enums";
import {
  isAppBookingUrl,
  useAppBookingDialog,
} from "~/composables/useAppBookingDialog";

export function useCalendlyDialog() {
  const dialog = useDialog();
  const { t } = useI18n();
  const { openAppBookingDialog } = useAppBookingDialog();

  function openCalendlyDialog(url?: string, treatmentType?: TreatmentType) {
    // Migration path: if the location's booking URL points at the MY app,
    // open the in-app booking iframe instead of the Calendly widget. This lets
    // us switch locations from Calendly to the app one at a time simply by
    // changing the "Calendly URL" field in Strapi. Everything else (a
    // calendly.com URL, or no URL -> location search) keeps working as before.
    if (isAppBookingUrl(url)) {
      openAppBookingDialog(t("cta.bookAppointment"), url);
      return;
    }

    dialog.open(
      defineAsyncComponent(
        () => import("~/components/ui/organism/CalendlyDialog.vue"),
      ),
      {
        data: { url, treatmentType },
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
