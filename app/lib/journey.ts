/**
 * Kontaktpunkte bis zur Buchung (myhb-app/myhb-os#1088) — das Format.
 *
 * Kopie von src/lib/journeyFormat.ts in myhb-app/myhb-os; die App liest, was
 * diese Website schreibt. Bei Format-Aenderungen beide Stellen anfassen.
 *
 * Diese Website (plugins/journey.client.ts) fuehrt im Cookie
 * `myhb_journey` auf `.myhealthandbeauty.com` eine kurze Liste der Kontakte:
 * jeder Sitzungsstart mit Kampagnen-Signal (utm_*, Klick-ID) oder neuem
 * externem Referrer. Kurze Schluessel, weil ein Cookie nur ~4 KB fasst:
 *
 *   { "id": "<uuid>", "t": [ { "ts": <ms>, "s": "www"|"go"|"app",
 *       "src", "med", "cmp", "trm", "cnt", "ck", "lp", "ref" }, … ] }
 *
 * Bei Format-Aenderungen beide Repos anfassen.
 *
 * Eigenes Modul ohne Importe, damit `npm run test:unit` es laden kann.
 */

export const JOURNEY_COOKIE = "myhb_journey";
export const MAX_TOUCHES = 20;
export const MAX_AGE_DAYS = 90;

export const CLICK_KINDS = ["gclid", "gbraid", "wbraid", "fbclid", "ttclid", "msclkid"] as const;
export type ClickKind = (typeof CLICK_KINDS)[number];

const UTM = { utm_source: "src", utm_medium: "med", utm_campaign: "cmp", utm_term: "trm", utm_content: "cnt" } as const;

export type Site = "www" | "go" | "app" | "other";

/** Ein Kontakt im Cookie-Format. */
export interface JourneyTouch {
  ts: number;
  s: Site;
  src?: string;
  med?: string;
  cmp?: string;
  trm?: string;
  cnt?: string;
  ck?: ClickKind;
  lp?: string;
  ref?: string;
}

export interface Journey {
  id: string;
  t: JourneyTouch[];
}

/** Ein Kontakt so, wie track-journey ihn erwartet. */
export interface WireTouch {
  ts: string;
  site: Site;
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  click_kind?: ClickKind;
  landing?: string;
  referrer?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isJourneyId = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

const kurz = (v: string | null | undefined, max: number): string | undefined => {
  const t = (v ?? "").trim();
  return t ? t.slice(0, max) : undefined;
};

const SITES: readonly Site[] = ["www", "go", "app", "other"];

/** Cookie-Wert defensiv lesen; Unbrauchbares faellt weg. */
export const parseJourney = (raw: string | null | undefined, now = Date.now()): Journey | null => {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as { id?: unknown; t?: unknown };
    if (!isJourneyId(p.id)) return null;
    const grenze = now - MAX_AGE_DAYS * 864e5;
    const t = (Array.isArray(p.t) ? p.t : [])
      .filter((k): k is JourneyTouch =>
        !!k && typeof k === "object" && typeof (k as JourneyTouch).ts === "number"
        && SITES.includes((k as JourneyTouch).s))
      .filter((k) => k.ts >= grenze);
    return { id: p.id, t };
  } catch {
    return null;
  }
};

/** Host ohne www., oder undefined bei eigenen Seiten und Unlesbarem. */
export const externalReferrerHost = (
  referrer: string | null | undefined,
  ownHost?: string,
  ownDomain = "myhealthandbeauty.com",
): string | undefined => {
  if (!referrer) return undefined;
  try {
    const roh = new URL(referrer).hostname;
    if (ownHost && roh === ownHost) return undefined;
    const host = roh.replace(/^www\./, "");
    if (host === ownDomain || host.endsWith(`.${ownDomain}`)) return undefined;
    return host.slice(0, 120);
  } catch {
    return undefined;
  }
};

/**
 * Kontakt aus URL und Referrer, oder null, wenn der Aufruf kein neues Signal
 * traegt (interne Navigation, Direktaufruf ohne Parameter).
 */
export const touchFromLocation = (
  search: string,
  pathname: string,
  referrer: string | null | undefined,
  site: Site,
  now = Date.now(),
  ownHost?: string,
): JourneyTouch | null => {
  const q = new URLSearchParams(search);
  const touch: JourneyTouch = { ts: now, s: site };
  for (const [param, key] of Object.entries(UTM)) {
    const v = kurz(q.get(param), 150);
    if (v) touch[key] = v;
  }
  const ck = CLICK_KINDS.find((k) => q.get(k));
  if (ck) touch.ck = ck;
  const ref = externalReferrerHost(referrer, ownHost);
  if (ref) touch.ref = ref;
  if (!touch.src && !touch.ck && !touch.ref) return null;
  touch.lp = kurz(pathname, 120);
  return touch;
};

/** Dasselbe Signal (Quelle, Medium, Kampagne, Klick-Art, Referrer)? */
export const sameSignal = (a: JourneyTouch, b: JourneyTouch): boolean =>
  a.src === b.src && a.med === b.med && a.cmp === b.cmp && a.ck === b.ck && a.ref === b.ref;

/**
 * Kontakt anhaengen. Hoechstens MAX_TOUCHES; wird es mehr, faellt der
 * zweitaelteste weg — der erste Kontakt bleibt immer stehen.
 */
export const appendTouch = (journey: Journey, touch: JourneyTouch): Journey => {
  const t = [...journey.t, touch];
  while (t.length > MAX_TOUCHES) t.splice(1, 1);
  return { id: journey.id, t };
};

export const toWire = (k: JourneyTouch): WireTouch => ({
  ts: new Date(k.ts).toISOString(),
  site: k.s,
  source: k.src,
  medium: k.med,
  campaign: k.cmp,
  term: k.trm,
  content: k.cnt,
  click_kind: k.ck,
  landing: k.lp,
  referrer: k.ref,
});

/** Bytes, die das Cookie hoechstens belegen soll (Grenze je Cookie ~4 KB). */
export const MAX_COOKIE_BYTES = 3500;

/**
 * Liste so weit kuerzen, dass sie ins Cookie passt. Wie bei appendTouch faellt
 * der zweitaelteste Kontakt zuerst weg; der erste bleibt.
 */
export const fitCookie = (journey: Journey): Journey => {
  const t = [...journey.t];
  const laenge = () => encodeURIComponent(JSON.stringify({ id: journey.id, t })).length;
  while (t.length > 1 && laenge() > MAX_COOKIE_BYTES) t.splice(1, 1);
  return { id: journey.id, t };
};

/** www oder go — Vorschau-Hosts zaehlen als other. */
export const siteOf = (hostname: string): Site => {
  if (hostname.startsWith("go.")) return "go";
  if (hostname === "myhealthandbeauty.com" || hostname.startsWith("www.")) return "www";
  return "other";
};
