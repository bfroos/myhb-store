/**
 * Übergabe zwischen Calendly-Dialog und Dankesseite (elanagency/myhb-os#131).
 *
 * `booking_confirmed` feuerte bis 14.09.2026 nur im eingebetteten Calendly-
 * Widget (CalendlyDialog.vue, Nachricht `calendly.event_scheduled`). Gemessen
 * gegen die Datenbank sah das Ereignis damit nur 67–75 % der Buchungen:
 * Direktlinks auf calendly.com (Funnel, WhatsApp, E-Mail, Anzeigen) laufen
 * an unseren Seiten vorbei, und auch im Embed geht ein Teil der Nachrichten
 * verloren, weil Calendly nach der Bestätigung sofort auf die Dankesseite
 * weiterleitet.
 *
 * Die Dankesseite `/p/danke-fuer-deine-terminbuchung` erreicht dagegen jede
 * Buchung — Calendly hängt beim Redirect `invitee_uuid`, `event_type_uuid`,
 * `assigned_to` und die utm_* an (Option „Ereignisdetails übergeben").
 * Deshalb feuert `booking_confirmed` jetzt auch dort. Damit eine Buchung
 * trotzdem nur einmal zählt, merkt sich der Dialog hier, was er schon
 * gemeldet hat; die Dankesseite prüft den Eintrag, bevor sie feuert.
 *
 * Speicher: sessionStorage (überlebt den Redirect im selben Tab, ist für
 * gleich-origin iframes derselben Seite sichtbar), localStorage als
 * Rückfallebene. Beides ohne Personendaten — nur Calendly-IDs und Kontext.
 */

export const BOOKING_THANK_YOU_SLUGS = ["danke-fuer-deine-terminbuchung"] as const;

const HANDOFF_KEY = "myhb_calendly_booking";
const FIRED_KEY = "myhb_booking_confirmed_ids";
/** Wie lange eine Übergabe als „zu dieser Buchung gehörend" gilt. */
export const HANDOFF_TTL_MS = 30 * 60 * 1000;
const FIRED_MAX = 20;

export type CalendlyBookingHandoff = {
  /** Calendly-Invitee-UUID (letztes Segment der invitee.uri). */
  invitee_uuid?: string;
  location_slug?: string;
  treatment_type?: string;
  /** Variante des A/B-Splits (#100), damit sie den Redirect ueberlebt. */
  ab_variant?: "app" | "calendly";
  /** App-Arm, der mangels appBookingUrl auf Calendly zurueckfiel (#100). */
  ab_fallback?: boolean;
  /** Deployment der Zuweisung (ads|seo) — die Dankesseite liegt immer auf www. */
  ab_source?: "ads" | "seo";
  /** true, sobald der Dialog `booking_confirmed` dafür gepusht hat. */
  fired?: boolean;
  /** ISO-Zeitstempel des letzten Schreibvorgangs. */
  ts: string;
};

const storages = (): Storage[] => {
  if (typeof window === "undefined") return [];
  const out: Storage[] = [];
  try {
    if (window.sessionStorage) out.push(window.sessionStorage);
  } catch {}
  try {
    if (window.localStorage) out.push(window.localStorage);
  } catch {}
  return out;
};

const readJson = <T>(key: string): T | null => {
  for (const s of storages()) {
    try {
      const raw = s.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {}
  }
  return null;
};

const writeJson = (key: string, value: unknown) => {
  const raw = JSON.stringify(value);
  for (const s of storages()) {
    try {
      s.setItem(key, raw);
    } catch {}
  }
};

const removeKey = (key: string) => {
  for (const s of storages()) {
    try {
      s.removeItem(key);
    } catch {}
  }
};

/** `https://api.calendly.com/scheduled_events/<event>/invitees/<uuid>` → `<uuid>` */
export function inviteeUuidFromUri(uri?: string | null): string | undefined {
  if (!uri) return undefined;
  const m = /\/invitees\/([0-9a-f-]{8,})\/?$/i.exec(uri);
  if (m) return m[1];
  // Bereits eine nackte UUID?
  return /^[0-9a-f-]{8,}$/i.test(uri) ? uri : undefined;
}

export function readBookingHandoff(): CalendlyBookingHandoff | null {
  const h = readJson<CalendlyBookingHandoff>(HANDOFF_KEY);
  if (!h || !h.ts) return null;
  const age = Date.now() - new Date(h.ts).getTime();
  if (!Number.isFinite(age) || age < 0 || age > HANDOFF_TTL_MS) return null;
  return h;
}

/** Schreibt die Übergabe; vorhandene Felder bleiben erhalten, wenn nicht überschrieben. */
export function writeBookingHandoff(
  patch: Omit<CalendlyBookingHandoff, "ts">,
): CalendlyBookingHandoff {
  const prev = readBookingHandoff() ?? {};
  const next: CalendlyBookingHandoff = {
    ...prev,
    ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)),
    ts: new Date().toISOString(),
  };
  writeJson(HANDOFF_KEY, next);
  return next;
}

export function clearBookingHandoff() {
  removeKey(HANDOFF_KEY);
}

/** Buchungs-IDs, für die `booking_confirmed` in dieser Sitzung schon gefeuert hat. */
export function hasFiredBookingConfirmed(id: string): boolean {
  const list = readJson<string[]>(FIRED_KEY);
  return Array.isArray(list) && list.includes(id);
}

export function markBookingConfirmedFired(id: string) {
  const list = readJson<string[]>(FIRED_KEY);
  const next = (Array.isArray(list) ? list : []).filter((x) => x !== id);
  next.push(id);
  writeJson(FIRED_KEY, next.slice(-FIRED_MAX));
}
