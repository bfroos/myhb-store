import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";

/**
 * Anfrage-Funnel als Modal auf OP-Seiten (Benjamin 23.10.2026, E28).
 *
 * Der Knopf "Kostenlose Analyse anfragen" fuehrte bisher auf eine eigene
 * Seite (/lp/op-anfrage). Jetzt oeffnet er den Funnel auf derselben Seite,
 * die OP der Seite ist schon gewaehlt. Die Anfrage geht wie auf der
 * Landingpage ueber /api/lead-anfrage ins Lead-Board der App.
 */
export function useOpAnfrageDialog() {
  const dialog = useDialog();

  function openOpAnfrage(behandlung: string | null) {
    dialog.open(
      defineAsyncComponent(() => import("~/components/ui/organism/OpAnfrageDialog.vue")),
      {
        data: { behandlung },
        props: {
          modal: true,
          draggable: false,
          dismissableMask: true,
          header: behandlung ? `Kostenlose Analyse: ${behandlung}` : "Kostenlose Analyse anfragen",
          style: { width: "560px", maxWidth: "96vw", maxHeight: "94dvh" },
        },
      },
    );
  }

  return { openOpAnfrage };
}
