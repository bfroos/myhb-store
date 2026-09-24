import {
  calendlyEmbedUrl,
  isCalendlyUrl,
  withCalendlyLocale,
} from "~/lib/calendlyEmbedUrl";

/**
 * Das Buchungsfenster laedt, bevor jemand klickt — und wird dann
 * weiterverwendet, statt noch einmal zu laden (#141).
 *
 * Gemessen am 20.09.2026 auf der Live-Seite: Das iFrame haengt nach `load`
 * (~0,5 s) noch 10 bis ueber 40 Sekunden weiss im Dialog, weil Calendly im
 * iFrame erst danach zeichnet. Dieselbe URL als eigene Seite braucht rund eine
 * Sekunde — die Wartezeit entsteht also in dem, was Calendly nachlaedt.
 *
 * Deshalb zwei Schritte:
 *
 * 1. Beim Seitenaufbau haengt hier ein verborgener Rahmen mit *derselben* URL,
 *    die der Dialog spaeter anfordert. Waehrend die Seite gelesen wird, laedt
 *    und zeichnet Calendly darin fertig.
 * 2. Beim Klick wird genau dieser Rahmen ueber den Dialog gelegt
 *    (`attachBookingPrewarm`) statt ein zweiter erzeugt. Ein iFrame umzuhaengen
 *    laedt es neu — deshalb bleibt es, wo es ist, und wird nur positioniert.
 *    Der Besucher wartet damit gar nicht mehr.
 *
 * Passt der Rahmen nicht (andere URL, abgeschaltet, Standort erst im Dialog
 * gewaehlt), faellt der Dialog auf das normale Widget zurueck — schlechtester
 * Fall ist also der Zustand vor diesem Ticket.
 *
 * Abschalter: `NUXT_PUBLIC_BOOKING_PREWARM=off`. Das Vorwaermen laedt
 * calendly.com ohne Zutun des Besuchers — heute geschieht das erst beim Klick.
 * Wer das aus Einwilligungsgruenden nicht will, stellt es je Deployment ab,
 * ohne Code zu deployen.
 */
export type BookingPrewarmMode = "off" | "eager";

let frame: HTMLIFrameElement | null = null;
let huelle: HTMLDivElement | null = null;
let frameWindow: Window | null = null;
/** Seite, fuer die schon vorgewaermt wurde — je Seitenaufruf genau einmal. */
let warmedPath: string | null = null;
/** Wurde auf dieser Seite vorgewaermt? Faerbt die Messung im Feld. */
let wasPrewarmed = false;
/** Hat Calendly im verborgenen Rahmen schon gezeichnet? */
let hasRendered = false;
/** Liegt der Rahmen gerade sichtbar im Dialog? */
let isAttached = false;
let detachAufraeumen: (() => void) | null = null;

/**
 * Versteckt, aber gezeichnet.
 *
 * Der Rahmen steckt in voller Groesse in einem Kaestchen von einem Pixel, das
 * den Rest abschneidet. Gemessen am 20.09.2026: Ein so verstecktes und ein
 * daneben voll sichtbares iFrame derselben URL melden sich im selben Moment —
 * der Browser drosselt den versteckten also nicht. Ein Pixel ist die Variante
 * mit dem geringsten Risiko, je etwas zu verdecken oder abzufangen.
 */
/**
 * Calendly-Ereignisse, die bedeuten: Es steht eine Buchungsseite im Rahmen.
 * Alles andere (frueher Lebenszeichen, interne Meldungen) sagt nichts darueber,
 * ob schon etwas zu sehen ist.
 */
const RENDER_EREIGNISSE = new Set([
  "calendly.event_type_viewed",
  "calendly.profile_page_viewed",
  "calendly.date_and_time_selected",
]);

const HUELLE_VERSTECKT =
  "position:fixed;top:0;left:0;width:1px;height:1px;overflow:hidden;" +
  "pointer-events:none;z-index:-2147483647";

/**
 * Masse des vorgewaermten Rahmens: so gross wie der Dialog spaeter.
 * Fallbacks, weil ein Tab im Hintergrund 0 melden kann.
 */
function rahmenMasse(): string {
  const b = Math.min(600, window.innerWidth || 600) || 600;
  const h = Math.round((window.innerHeight || 900) * 0.98) || 900;
  return `width:${b}px;height:${h}px;border:0`;
}

/** Fuer die Messung: Lief auf dieser Seite ein Vorwaermen? */
export function bookingWasPrewarmed(): boolean {
  return wasPrewarmed;
}

/**
 * Stammt die Nachricht aus dem *verborgenen* Rahmen? Sonst wuerde sein
 * `profile_page_viewed` den Ladekreisel ueber dem echten Widget wegnehmen,
 * obwohl dort noch nichts steht (#124). Liegt der Rahmen sichtbar im Dialog,
 * ist er das echte Widget und seine Nachrichten zaehlen.
 */
export function isPrewarmSource(source: MessageEventSource | null): boolean {
  return !isAttached && !!frameWindow && source === frameWindow;
}

/** Steht im vorgewaermten Rahmen schon ein Kalender? */
export function prewarmHasRendered(): boolean {
  return hasRendered;
}

/** Passt der vorgewaermte Rahmen genau zu dieser Embed-URL? */
export function prewarmMatches(embedSrc: string): boolean {
  return !!frame && !isAttached && frame.src === embedSrc;
}

/** Raeumt den verborgenen Rahmen ab. `warmedPath` bleibt: nicht neu erzeugen. */
export function disposeBookingPrewarm() {
  detachAufraeumen?.();
  detachAufraeumen = null;
  isAttached = false;
  hasRendered = false;
  huelle?.remove();
  huelle = null;
  frame = null;
}

/**
 * Legt den vorgewaermten Rahmen ueber `target` und haelt ihn dort.
 *
 * Der Rahmen bleibt ein Kind von `document.body` — umgehaengt wuerde er neu
 * laden, und genau das soll dieser Weg vermeiden. Er wird nur auf die Flaeche
 * des Platzhalters gelegt und folgt ihr, solange der Dialog offen ist.
 *
 * `onSichtbar` meldet den Moment, in dem er wirklich ueber dem Dialog liegt —
 * erst dann darf der Ladekreisel weg. `onFehlschlag` meldet, dass es nicht
 * geklappt hat (der Platzhalter bekam in `GEDULD_MS` keine Flaeche); der
 * Aufrufer zeichnet dann das normale Widget.
 *
 * Gibt `false` zurueck, wenn es gar keinen passenden Rahmen gibt.
 */
const GEDULD_MS = 2000;

export function attachBookingPrewarm(
  target: HTMLElement,
  embedSrc: string,
  onSichtbar: () => void,
  onFehlschlag: () => void,
): boolean {
  if (!import.meta.client || !prewarmMatches(embedSrc) || !frame || !huelle)
    return false;
  const el = frame;
  const box = huelle;

  // Ueber dem Dialog, aber aus dessen eigener Ebene abgeleitet: eine feste
  // Riesenzahl wuerde spaeter jede andere Ebene ueberdecken.
  const dialog = target.closest<HTMLElement>(".p-dialog");
  const basis = Number.parseInt(
    (dialog && getComputedStyle(dialog).zIndex) || "",
    10,
  );
  const zIndex = Number.isFinite(basis) ? basis + 1 : 1200;

  let sichtbar = false;
  const positionieren = () => {
    const r = target.getBoundingClientRect();
    // Solange der Dialog aufzieht, hat der Platzhalter noch keine Flaeche.
    if (r.width === 0 || r.height === 0) return;
    box.style.cssText =
      `position:fixed;left:${r.left}px;top:${r.top}px;` +
      `width:${r.width}px;height:${r.height}px;` +
      `overflow:hidden;pointer-events:auto;z-index:${zIndex}`;
    el.style.cssText = "width:100%;height:100%;border:0";
    if (!sichtbar) {
      sichtbar = true;
      onSichtbar();
    }
  };

  isAttached = true;
  el.removeAttribute("aria-hidden");
  el.removeAttribute("tabindex");
  el.setAttribute("title", "Calendly");
  positionieren();

  // Drei Wege, weil keiner allein reicht: ResizeObserver und
  // requestAnimationFrame ruhen in einem Tab, der gerade nicht zeichnet — ein
  // Intervall laeuft auch dann. Der Timer hoert auf, sobald es sitzt.
  const ro = new ResizeObserver(positionieren);
  ro.observe(target);
  window.addEventListener("resize", positionieren);
  window.addEventListener("scroll", positionieren, true);
  const tick = setInterval(() => {
    positionieren();
    if (sichtbar) clearInterval(tick);
  }, 50);
  const aufgeben = setTimeout(() => {
    clearInterval(tick);
    if (sichtbar) return;
    // Nie sichtbar geworden: lieber der gewohnte Weg als ein leerer Dialog.
    detachAufraeumen?.();
    detachAufraeumen = null;
    isAttached = false;
    onFehlschlag();
  }, GEDULD_MS);

  detachAufraeumen = () => {
    clearInterval(tick);
    clearTimeout(aufgeben);
    ro.disconnect();
    window.removeEventListener("resize", positionieren);
    window.removeEventListener("scroll", positionieren, true);
    box.style.cssText = HUELLE_VERSTECKT;
    el.style.cssText = rahmenMasse();
  };
  return true;
}

export function useBookingPrewarm() {
  const config = useRuntimeConfig();
  const route = useRoute();
  const { locale } = useI18n();
  const { $decorateBookingUrl } = useNuxtApp();
  const mode: BookingPrewarmMode =
    config.public.bookingPrewarm === "off" ? "off" : "eager";

  /**
   * Die iFrame-URL, die der Dialog fuer diese Buchungs-URL anfordern wird.
   * Vorwaermen und Dialog muessen dieselbe Zeichenkette benutzen, sonst ist es
   * fuer den Cache ein anderes Dokument.
   */
  function bookingEmbedSrc(url: string): string {
    return calendlyEmbedUrl(
      withCalendlyLocale($decorateBookingUrl(url), locale.value),
    );
  }

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

    const box = document.createElement("div");
    box.style.cssText = HUELLE_VERSTECKT;
    box.dataset.myhbPrewarmBox = "1";

    const el = document.createElement("iframe");
    // In voller Groesse, damit Calendly gleich das Layout aufbaut, das der
    // Dialog spaeter zeigt — das Sichtbarmachen loest dann kein neues aus.
    el.style.cssText = rahmenMasse();
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("tabindex", "-1");
    el.setAttribute("title", "");
    // utm-persist.client.ts schreibt Calendly-iFrames die Kampagnenwerte in die
    // src. Hier stehen sie schon drin; ohne die Markierung wuerde der Rahmen
    // neu geladen und das Vorwaermen finge von vorne an.
    el.dataset.myhbDecorated = "1";
    el.dataset.myhbPrewarm = "1";
    el.src = bookingEmbedSrc(url as string);
    box.appendChild(el);
    document.body.appendChild(box);
    huelle = box;
    frame = el;
    frameWindow = el.contentWindow;
    hasRendered = false;

    // Calendly meldet sich selbst, sobald es eine Seite zeigt. Erst ab da lohnt
    // das Wiederverwenden: Der Dialog darf den Ladekreisel nur weglassen, wenn
    // im Rahmen wirklich schon etwas steht.
    const merken = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com") return;
      if (frameWindow && e.source !== frameWindow) return;
      const name = (e.data as { event?: unknown } | null)?.event;
      if (typeof name !== "string") return;
      // #141, 23.09.2026: Vorher zaehlte JEDE Nachricht mit `event`-Feld als
      // "gezeichnet". Calendly meldet aber frueh, dass die Seite da ist,
      // bevor der Kalender steht — der Dialog hielt sich dann fuer fertig und
      // nahm Kreisel UND Notausgang weg, waehrend das Feld noch weiss war.
      // Nur die Ereignisse zaehlen, die eine sichtbare Buchungsseite meinen.
      if (!RENDER_EREIGNISSE.has(name)) return;
      hasRendered = true;
      window.removeEventListener("message", merken);
    };
    window.addEventListener("message", merken);
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

  return { mode, bookingEmbedSrc, prewarmBooking, prewarmBookingWhenIdle };
}
