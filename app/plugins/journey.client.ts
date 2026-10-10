/**
 * Kontaktpunkte bis zur Buchung (myhb-app/myhb-os#1088).
 *
 * utm-persist.client.ts haelt nur den ersten und den letzten Kontakt. Dieses
 * Plugin fuehrt daneben die ganze Liste im Cookie `myhb_journey` auf
 * `.myhealthandbeauty.com` (Format in lib/journey.ts, max. 20 Eintraege,
 * 90 Tage): jeder Seitenaufruf mit Kampagnen-Signal (utm_*, Klick-ID) oder
 * externem Referrer ist ein Kontakt. Interne Navigation und Neuladen
 * derselben Anzeige innerhalb von 30 Minuten zaehlen nicht.
 *
 * Kein Server-Aufruf pro Seite. Gesendet wird einmal, wenn sich das
 * Buchungsfenster oeffnet ($sendJourney, useAppBookingDialog); die Reise-ID
 * geht als `jid=` an die App, die sie nach der Buchung an den Termin haengt.
 *
 * Einwilligung: Cookie und Senden nur mit Cookiebot-Einwilligung fuer
 * Statistik oder Marketing. Bis zur Antwort liegt der Kontakt nur im
 * Arbeitsspeicher der Seite; nach „Ablehnen" wird nichts geschrieben und eine
 * alte Liste geloescht. Cookiebot raeumt bei der Antwort nicht klassifizierte
 * Cookies ab (siehe utm-persist v1.7) — deshalb wird nach jeder Antwort aus
 * der Kopie im Arbeitsspeicher zurueckgeschrieben.
 */
import {
  JOURNEY_COOKIE,
  MAX_AGE_DAYS,
  appendTouch,
  fitCookie,
  isJourneyId,
  parseJourney,
  sameSignal,
  siteOf,
  toWire,
  touchFromLocation,
  type Journey,
} from "~/lib/journey";

const ENDPUNKT = "https://forgsirmbzkxbblepscr.supabase.co/functions/v1/track-journey";
const GLEICHER_KONTAKT_MS = 30 * 60 * 1000;

export default defineNuxtPlugin(() => {
  const leer = { journeyId: (): string | null => null, sendJourney: (): void => undefined };
  if (import.meta.server) return { provide: leer };

  const COOKIE_DOMAIN = (() => {
    const parts = window.location.hostname.split(".");
    return parts.length >= 2 ? "." + parts.slice(-2).join(".") : window.location.hostname;
  })();

  const einwilligung = (): "ja" | "nein" | "offen" => {
    const cb = (window as any).Cookiebot;
    if (!cb?.consent || !cb.hasResponse) return "offen";
    return cb.consent.statistics || cb.consent.marketing ? "ja" : "nein";
  };

  const leseCookie = (): Journey | null => {
    const m = document.cookie.match("(^|;)\\s*" + JOURNEY_COOKIE + "\\s*=\\s*([^;]+)");
    if (!m) return null;
    try {
      return parseJourney(decodeURIComponent(m.pop() as string));
    } catch {
      return null;
    }
  };

  const schreibeCookie = (j: Journey) => {
    const ablauf = new Date(Date.now() + MAX_AGE_DAYS * 864e5).toUTCString();
    document.cookie =
      `${JOURNEY_COOKIE}=${encodeURIComponent(JSON.stringify(fitCookie(j)))};expires=${ablauf}` +
      `;path=/;domain=${COOKIE_DOMAIN};SameSite=Lax;Secure`;
  };

  const loescheCookie = () => {
    document.cookie = `${JOURNEY_COOKIE}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${COOKIE_DOMAIN}`;
  };

  const neueId = (): string | null => {
    try {
      return crypto.randomUUID();
    } catch {
      return null;
    }
  };

  // Kontakt dieses Seitenaufrufs — sofort ermitteln, bevor eine SPA-Navigation
  // die URL aendert.
  const kontakt = touchFromLocation(
    window.location.search,
    window.location.pathname,
    document.referrer,
    siteOf(window.location.hostname),
    Date.now(),
    window.location.hostname,
  );

  let kopie: Journey | null = null;
  let eingetragen = false;

  /** Liste laden, den Kontakt dieses Aufrufs einmal anhaengen, zurueckschreiben. */
  const abgleichen = (): void => {
    const stand = einwilligung();
    if (stand === "nein") {
      kopie = null;
      if (leseCookie()) loescheCookie();
      return;
    }
    if (stand === "offen") return;
    let reise = leseCookie() ?? kopie;
    if (!reise) {
      if (!kontakt) return;
      const id = neueId();
      if (!id) return;
      reise = { id, t: [] };
    }
    if (kontakt && !eingetragen) {
      const letzter = reise.t[reise.t.length - 1];
      const doppelt = letzter && sameSignal(letzter, kontakt) && kontakt.ts - letzter.ts < GLEICHER_KONTAKT_MS;
      if (!doppelt) reise = appendTouch(reise, kontakt);
      eingetragen = true;
    }
    kopie = reise;
    schreibeCookie(reise);
  };

  const nachAntwort = () => {
    abgleichen();
    // Cookiebot raeumt nicht immer synchron zum Ereignis.
    for (const ms of [300, 1500]) window.setTimeout(abgleichen, ms);
  };
  for (const ev of ["CookiebotOnConsentReady", "CookiebotOnAccept", "CookiebotOnDecline"]) {
    window.addEventListener(ev, nachAntwort);
  }
  abgleichen();

  let gesendet = false;

  return {
    provide: {
      /** Reise-ID fuer `jid=`, nur mit Einwilligung. */
      journeyId: (): string | null => {
        if (einwilligung() !== "ja") return null;
        abgleichen();
        const id = kopie?.id ?? null;
        return isJourneyId(id) ? id : null;
      },
      /** Liste einmal je Seitenaufruf an track-journey; die App verknuepft spaeter. */
      sendJourney: (): void => {
        if (gesendet || einwilligung() !== "ja") return;
        abgleichen();
        if (!kopie || kopie.t.length === 0) return;
        gesendet = true;
        try {
          void fetch(ENDPUNKT, {
            method: "POST",
            keepalive: true,
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ journey_id: kopie.id, touchpoints: kopie.t.map(toWire) }),
          }).catch(() => undefined);
        } catch {
          // Tracking darf nie werfen.
        }
      },
    },
  };
});
