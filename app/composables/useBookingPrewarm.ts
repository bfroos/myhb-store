import { calendlyEmbedUrl, isCalendlyUrl } from "~/lib/calendlyEmbedUrl";

/**
 * Das Buchungsfenster laedt, bevor jemand klickt (#141).
 *
 * Gemessen am 20.09.2026: Das iFrame haengt nach `load` (~0,5 s) noch 10 bis
 * ueber 40 Sekunden weiss im Dialog, weil Calendly im iFrame erst danach
 * zeichnet. Derselbe Aufruf ein zweites Mal im selben Browser braucht ein bis
 * drei Sekunden — der Unterschied ist der Browser-Cache von calendly.com, und
 * der laesst sich vor dem Klick fuellen.
 *
 * Deshalb haengt hier beim Seitenaufbau ein verborgenes iFrame mit *derselben*
 * URL, die der Dialog spaeter anfordert. Es laedt Calendlys Skripte, Stile und
 * Schriften in den Cache; der Klick trifft dann den warmen Fall.
 *
 * Grenzen, die bewusst so sind:
 * - Genau ein vorgewaermtes iFrame je Seitenaufruf. Zwei gleichzeitige
 *   Calendly-Rahmen nehmen sich gegenseitig Bandbreite weg — das Gegenteil des
 *   Ziels.
 * - Beim Oeffnen des Dialogs wird es abgeraeumt (`disposeBookingPrewarm`), aus
 *   demselben Grund: Ab da zaehlt nur noch das sichtbare iFrame.
 * - Nachrichten des verborgenen Rahmens duerfen den Ladezustand des Dialogs
 *   nicht aufheben; `isPrewarmSource` erkennt sie.
 *
 * Abschalter: `NUXT_PUBLIC_BOOKING_PREWARM=off`. Das Vorwaermen laedt
 * calendly.com ohne Zutun des Besuchers — heute geschieht das erst beim Klick.
 * Wer das aus Einwilligungsgruenden nicht will, stellt es je Deployment ab,
 * ohne Deploy von Code.
 */
export type BookingPrewarmMode = "off" | "eager";

let frame: HTMLIFrameElement | null = null;
let frameWindow: Window | null = null;
/** Seite, fuer die schon vorgewaermt wurde — je Seitenaufruf genau einmal. */
let warmedPath: string | null = null;
/** Wurde auf dieser Seite vorgewaermt? Faerbt die Messung im Feld. */
let wasPrewarmed = false;

/** Fuer die Messung: Lief auf dieser Seite ein Vorwaermen? */
export function bookingWasPrewarmed(): boolean {
  return wasPrewarmed;
}

/**
 * Stammt die Nachricht aus dem verborgenen Rahmen? Sonst wuerde sein
 * `profile_page_viewed` den Ladekreisel ueber dem echten Widget wegnehmen,
 * obwohl dort noch nichts steht (#124).
 */
export function isPrewarmSource(source: MessageEventSource | null): boolean {
  return !!frameWindow && source === frameWindow;
}

/**
 * Raeumt den verborgenen Rahmen ab.
 *
 * `frameWindow` bleibt stehen, damit Nachrichten, die schon unterwegs waren,
 * weiterhin als Vorwaermung erkannt werden — und `warmedPath` auch: Auf
 * derselben Seite soll nach dem Abraeumen kein neuer Rahmen entstehen.
 */
export function disposeBookingPrewarm() {
  frame?.remove();
  frame = null;
}

export function useBookingPrewarm() {
  const config = useRuntimeConfig();
  const route = useRoute();
  const { $decorateBookingUrl } = useNuxtApp();
  const mode: BookingPrewarmMode =
    config.public.bookingPrewarm === "off" ? "off" : "eager";

  /** Waermt die Buchungs-URL vor. Der zweite Aufruf je Seite tut nichts. */
  function prewarmBooking(url?: string | null) {
    if (!import.meta.client || mode === "off") return;
    // Nur Calendly: Die App-Buchung ist unsere eigene Domain und faellt nicht
    // durch diese Wartezeit auf (E2).
    if (!isCalendlyUrl(url)) return;
    // Je Seite genau einmal — eine Seite hat mehrere Buchungsknoepfe, und ein
    // zweiter Rahmen naehme dem ersten die Bandbreite weg. Beim Wechsel auf
    // eine andere Seite (SPA) faellt die Sperre.
    if (warmedPath === route.path) return;
    warmedPath = route.path;
    disposeBookingPrewarm();
    wasPrewarmed = true;
    const src = calendlyEmbedUrl($decorateBookingUrl(url as string));

    const el = document.createElement("iframe");
    // Ausserhalb des Sichtfelds statt `display:none`: Ein nicht gerenderter
    // Rahmen darf vom Browser uebersprungen werden, ein verschobener nicht.
    el.style.cssText =
      "position:fixed;top:0;left:-10000px;width:360px;height:640px;border:0;opacity:0;pointer-events:none";
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("tabindex", "-1");
    el.setAttribute("title", "");
    // utm-persist.client.ts schreibt Calendly-iFrames die Kampagnenwerte in die
    // src. Hier stehen sie schon drin; ohne die Markierung wuerde der Rahmen
    // neu geladen und das Vorwaermen finge von vorne an.
    el.dataset.myhbDecorated = "1";
    el.dataset.myhbPrewarm = "1";
    el.src = src;
    document.body.appendChild(el);
    frame = el;
    frameWindow = el.contentWindow;
  }

  /** Startet das Vorwaermen, sobald die Seite nichts Wichtigeres zu tun hat. */
  function prewarmBookingWhenIdle(url?: string | null) {
    if (!import.meta.client || mode === "off" || !isCalendlyUrl(url)) return;
    onNuxtReady(() => {
      const start = () => prewarmBooking(url);
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(start, { timeout: 2000 });
      } else {
        setTimeout(start, 500);
      }
    });
  }

  return { mode, prewarmBooking, prewarmBookingWhenIdle };
}
