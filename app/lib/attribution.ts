/**
 * T6 Set B — Quellenstempel (Wire-Format).
 *
 * Liest den Attributionsspeicher, den plugins/utm-persist.client.ts pflegt
 * (Key "myhb_attribution" in sessionStorage/localStorage/Cookie), und baut
 * daraus das Wire-Format fuer Webhook-Bodies. Dasselbe Format nutzen
 * Newsletter-Anmeldung (#13), Referral-Landingpage (#13) und der
 * Calendly-Intake (#24), damit n8n/touchpoints/identities ein einziges
 * Feldvokabular sehen:
 *
 *   attribution.first / attribution.last:
 *     utm_source, utm_medium, utm_campaign, utm_term, utm_content,
 *     click_id ("gclid:..." | "fbclid:..." | "ttclid:..."),
 *     ts (ISO), landing_page, referrer
 *
 * Lesen ist hier bewusst dupliziert statt aus dem Plugin importiert — das
 * Plugin bleibt unangetastet (laeuft produktiv). Bei Format-Aenderungen
 * beide Stellen anfassen.
 */

export const ATTRIBUTION_KEY = "myhb_attribution";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

type RawTouch = Partial<
  Record<(typeof UTM_KEYS)[number] | "gclid" | "fbclid" | "ttclid", string>
> & {
  _ts?: string;
  _lp?: string;
  _ref?: string;
};
type RawStore = { first?: RawTouch; last?: RawTouch };

export type WireTouch = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  click_id?: string;
  ts?: string;
  landing_page?: string;
  referrer?: string;
};
export type WireAttribution = { first?: WireTouch; last?: WireTouch };

function getCookie(name: string): string | null {
  const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return m ? decodeURIComponent(m.pop() as string) : null;
}

function loadRaw(): RawStore | null {
  if (import.meta.server) return null;
  let raw: string | null = null;
  try {
    raw =
      sessionStorage.getItem(ATTRIBUTION_KEY) ||
      localStorage.getItem(ATTRIBUTION_KEY);
  } catch {}
  if (!raw) raw = getCookie(ATTRIBUTION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // Migration vom flachen v1.0-Format (siehe utm-persist.client.ts)
    if (parsed && !parsed.first && !parsed.last && (parsed.utm_source || parsed._ts)) {
      return { first: parsed as RawTouch, last: parsed as RawTouch };
    }
    return parsed as RawStore;
  } catch {
    return null;
  }
}

/** Klick-ID im touchpoints-Format: "gclid:..." | "fbclid:..." | "ttclid:..." */
export function clickIdOf(t: RawTouch | null | undefined): string | null {
  if (!t) return null;
  if (t.gclid) return `gclid:${t.gclid}`;
  if (t.fbclid) return `fbclid:${t.fbclid}`;
  if (t.ttclid) return `ttclid:${t.ttclid}`;
  return null;
}

function toWire(t: RawTouch | undefined): WireTouch | undefined {
  if (!t) return undefined;
  const w: WireTouch = {};
  for (const k of UTM_KEYS) {
    if (t[k]) w[k] = t[k];
  }
  const cid = clickIdOf(t);
  if (cid) w.click_id = cid;
  if (t._ts) w.ts = t._ts;
  if (t._lp) w.landing_page = t._lp;
  if (t._ref) w.referrer = t._ref;
  return Object.keys(w).length ? w : undefined;
}

/** Attribution im Wire-Format; null, wenn nichts erfasst wurde. */
export function readWireAttribution(): WireAttribution | null {
  const raw = loadRaw();
  if (!raw) return null;
  const out: WireAttribution = {};
  const first = toWire(raw.first);
  const last = toWire(raw.last);
  if (first) out.first = first;
  if (last) out.last = last;
  return out.first || out.last ? out : null;
}
