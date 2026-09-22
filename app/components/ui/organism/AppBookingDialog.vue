<template>
  <div v-if="params.url" class="appBookingDialog__embed">
    <iframe
      :src="params.url"
      class="appBookingDialog"
      title="Termin buchen"
      allow="clipboard-write; payment"
      loading="eager"
      @load="onIframeLoad"
    />
    <UiMoleculeBookingEmbedStatus :ready="appReady" :url="params.url" />
  </div>
</template>
<script setup lang="ts">
import { APP_BOOKING_URL } from "~/composables/useAppBookingDialog";

const dialogRef = inject("dialogRef") as any;
const params = ref<any>({});
const { trackEvent } = useGoogleAnalytics();

/**
 * Die App meldet den Abbruch der Buchung ("Abbrechen" nach Rückfrage) per
 * postMessage an die einbettende Seite. Wir schließen den Dialog, sodass der
 * Besucher auf der Seite bleibt, von der er gebucht hat.
 *
 * Die Bestätigung zurück in den iFrame ist nötig: ohne sie navigiert die App
 * als Fallback das Top-Fenster auf die Website (für den Fall, dass sie in
 * einem älteren Website-Build ohne diesen Listener steckt). Schema:
 * docs/DEEPLINKS.md in elanagency/myhb-os (#61/#66).
 */
const BOOKING_CANCELLED_MESSAGE = "myhb:booking-cancelled";
const BOOKING_CANCEL_HANDLED_MESSAGE = "myhb:booking-cancel-handled";
/**
 * Die App meldet, sobald der Buchungsschritt gezeichnet ist. Ohne diese
 * Meldung stand hier je nach Netz mehrere Sekunden ein weisses Feld — der
 * Bugreport "das Termin-buchen-Fenster oeffnet sich nicht im Modal"
 * (16.09.2026).
 */
const BOOKING_READY_MESSAGE = "myhb:booking-ready";
const APP_ORIGIN = new URL(APP_BOOKING_URL).origin;

/**
 * Notbremse fuer App-Staende ohne `myhb:booking-ready`: Das `load`-Ereignis
 * sagt nur, dass das Dokument da ist, die App zeichnet danach noch. Ein kurzer
 * Nachlauf ist besser als ein Ladekringel, der ueber der fertigen Buchung
 * stehen bleibt.
 */
const LOAD_GRACE_MS = 2000;

const appReady = ref(false);
let graceTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Messung zu elanagency/myhb-os#205, Abbruch "Klick -> App geladen".
 *
 * GA4 sieht den Klick auf der Website und `booking_start` in der App, aber
 * nichts dazwischen: Wie lange hat das Laden gedauert, und wie viele haben den
 * Dialog zugemacht, bevor die App ueberhaupt gezeichnet hatte? Dieselben zwei
 * Ereignisse wie am Calendly-Dialog (#141), mit `booking_type: "app"`:
 *
 *   booking_embed_ready    einmal je Dialog, sobald die App sich meldet
 *                          (event_label "ready") oder der Nachlauf greift
 *                          ("load_grace" -- dann weiss niemand, ob sie steht)
 *   booking_dialog_closed  beim Schliessen; event_label "ready"/"not_ready",
 *                          dialog_open_ms seit dem Klick
 *
 * Die Uhr startet beim Klick (`openedAt` aus useAppBookingDialog), nicht beim
 * Einhaengen des iFrames.
 */
const openedAt = computed<number | null>(() =>
  typeof params.value?.openedAt === "number" ? params.value.openedAt : null,
);
function messkontext() {
  return {
    booking_type: "app",
    ab_variant: params.value?.abVariant,
    ab_bypass: params.value?.abBypass ? true : undefined,
  };
}
function sinceOpen(): number | undefined {
  return openedAt.value === null
    ? undefined
    : Math.round(performance.now() - openedAt.value);
}
function setReady(quelle: "ready" | "load_grace") {
  if (appReady.value) return;
  appReady.value = true;
  if (graceTimer) clearTimeout(graceTimer);
  trackEvent("booking_embed_ready", {
    ...messkontext(),
    event_label: quelle,
    embed_ready_ms: sinceOpen(),
    embed_prewarmed: false,
  });
}

function onIframeLoad() {
  if (appReady.value || graceTimer) return;
  graceTimer = setTimeout(() => setReady("load_grace"), LOAD_GRACE_MS);
}

function handleAppMessage(event: MessageEvent) {
  if (event.origin !== APP_ORIGIN) return;
  const type =
    typeof event.data === "string" ? event.data : (event.data as any)?.type;
  if (type === BOOKING_READY_MESSAGE) {
    setReady("ready");
    return;
  }
  if (type !== BOOKING_CANCELLED_MESSAGE) return;
  try {
    (event.source as Window | null)?.postMessage(
      { type: BOOKING_CANCEL_HANDLED_MESSAGE },
      APP_ORIGIN,
    );
  } catch {
    // Der iFrame ist schon weg – der Dialog wird trotzdem geschlossen.
  }
  dialogRef?.value?.close();
}

onMounted(() => {
  params.value = dialogRef.value.data;
  window.addEventListener("message", handleAppMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", handleAppMessage);
  if (graceTimer) clearTimeout(graceTimer);
  // Auch nach einer fertigen Buchung schliesst jemand den Dialog -- dann mit
  // "ready". Die interessante Zahl ist der Anteil "not_ready": zu, bevor die
  // App stand.
  trackEvent("booking_dialog_closed", {
    ...messkontext(),
    event_label: appReady.value ? "ready" : "not_ready",
    dialog_open_ms: sinceOpen(),
  });
});
</script>
<style scoped>
.appBookingDialog__embed {
  position: relative;
  width: 100%;
  height: 100%;
}

.appBookingDialog {
  width: 100% !important;
  height: 100% !important;
  border: 0;
  display: block;
  overflow: hidden;
}
</style>
