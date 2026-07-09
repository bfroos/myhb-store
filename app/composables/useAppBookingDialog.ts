import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";

/**
 * URL of the in-app booking flow (MY Health & Beauty app).
 * Opened inside a modal iframe as an alternative to the Calendly dialog.
 */
export const APP_BOOKING_URL =
  "https://app.myhealthandbeauty.com/book-appointment";

export function useAppBookingDialog() {
  const dialog = useDialog();

  function openAppBookingDialog(header?: string, url: string = APP_BOOKING_URL) {
    dialog.open(
      defineAsyncComponent(
        () => import("~/components/ui/organism/AppBookingDialog.vue"),
      ),
      {
        data: { url },
        props: {
          modal: true,
          draggable: false,
          header: header || "Termin buchen",
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

  return { openAppBookingDialog };
}
