import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";

export function useCalendlyDialog() {
  const dialog = useDialog();
  const { t } = useI18n();

  function openCalendlyDialog(url?: string) {
    dialog.open(
      defineAsyncComponent(
        () => import("~/components/ui/organism/CalendlyDialog.vue"),
      ),
      {
        data: { url },
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
