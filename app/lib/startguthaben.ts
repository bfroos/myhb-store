/**
 * Startguthaben im Browser (shared/startguthaben.ts, myhb-app/myhb-os#2188):
 * liest `?gh=` der aktuellen Seite, merkt einen gueltigen Wert in der Sitzung
 * und gibt ihn nur auf /aktion/<slug> zurueck. Auf dem Server immer `null`
 * (ISR: die Seite wird ohne Query gerendert, siehe nuxt.config.ts).
 */
import {
  startguthabenFuerSeite,
  startguthabenOffer,
  type StartguthabenBetrag,
} from "#shared/startguthaben";

export function aktuellesStartguthaben(): StartguthabenBetrag | null {
  if (typeof window === "undefined") return null;
  let speicher: Storage | null = null;
  try {
    speicher = window.sessionStorage;
  } catch {}
  return startguthabenFuerSeite(window.location.pathname, window.location.search, speicher);
}

/** `gh50` / `gh100` fuer die App-Buchungs-URL, sonst `undefined`. */
export function aktuellesStartguthabenOffer(): string | undefined {
  const betrag = aktuellesStartguthaben();
  return betrag ? startguthabenOffer(betrag) : undefined;
}
