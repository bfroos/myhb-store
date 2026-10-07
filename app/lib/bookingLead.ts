/**
 * Vorbefuellung der App-Buchung nach dem Rabatt-Dialog (07.10.2026).
 *
 * Die App (app.myhealthandbeauty.com/book-appointment) nimmt keine E-Mail oder
 * Handynummer im Klartext aus der URL, sondern nur `?lead=<token>`: Sie holt
 * die Daten zum Token ueber die Edge Function `get-funnel-lead` (myhb-os #38).
 * Den Token legt `create-website-lead` an (myhb-os, kurzlebig, ratenbegrenzt).
 *
 * Datenschutz: E-Mail und Telefon gehen nur im Koerper dieses einen POST an
 * die eigene Supabase-Instanz — nie in eine URL, nie in dataLayer/GTM, nie in
 * Storage. In die App-URL kommt nur der Token, und auch der nicht in ein
 * `href`, das das Klick-Tracking (#155) als `link_url` mitschreibt (siehe
 * AppBookingDialog/BookingEmbedStatus).
 *
 * Alles hier ist best effort: Kommt kein Token (Function noch nicht
 * ausgerollt, Netz, Ratenlimit, Zeitlimit), oeffnet die Buchung wie bisher
 * ohne Vorbefuellung.
 *
 * Laeuft mit `npm run test:unit` (keine Nuxt-Importe).
 */

export const LEAD_ENDPUNKT =
  "https://forgsirmbzkxbblepscr.supabase.co/functions/v1/create-website-lead";

/** Laenger soll niemand auf die Buchung warten, nur weil der Token fehlt. */
export const LEAD_TIMEOUT_MS = 2500;

const TOKEN = /^[A-Za-z0-9]{16,128}$/;
const APP_HOST = "app.myhealthandbeauty.com";

export function isLeadToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN.test(value);
}

/**
 * Legt den Lead an und liefert den Token — oder `undefined`, nie einen Fehler.
 * Ohne E-Mail und ohne Telefon wird gar nicht erst gefragt.
 *
 * Als "simple request" (Content-Type text/plain, keine eigenen Header), damit
 * der Browser keinen CORS-Preflight vorschaltet — wie lib/firstPartyFunnel.
 */
export async function createBookingLead(
  daten: { email?: string | null; phone?: string | null },
  opts: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<string | undefined> {
  const email = daten.email?.trim() || undefined;
  const phone = daten.phone?.trim() || undefined;
  if (!email && !phone) return undefined;
  const fetchImpl = opts.fetchImpl ?? (globalThis.fetch as typeof fetch | undefined);
  if (!fetchImpl) return undefined;

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : undefined;
  const timer = setTimeout(
    () => controller?.abort(),
    opts.timeoutMs ?? LEAD_TIMEOUT_MS,
  );
  try {
    const res = await fetchImpl(LEAD_ENDPUNKT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ email, phone }),
      signal: controller?.signal,
      credentials: "omit",
    });
    if (!res.ok) return undefined;
    const body = (await res.json().catch(() => null)) as { token?: unknown } | null;
    return isLeadToken(body?.token) ? body!.token as string : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Haengt `lead=<token>` an eine App-Buchungs-URL. Andere URLs (Calendly) und
 * fehlende/ungueltige Tokens: unveraendert. Ein vorhandenes `lead` bleibt.
 */
export function withLeadToken(url: string, token?: string | null): string {
  if (!isLeadToken(token)) return url;
  try {
    const u = new URL(url);
    if (u.hostname !== APP_HOST) return url;
    if (!u.searchParams.has("lead")) u.searchParams.set("lead", token);
    return u.toString();
  } catch {
    return url;
  }
}

/** Dieselbe URL ohne Token — fuer Links, deren `href` getrackt wird. */
export function withoutLeadToken(url: string): string {
  try {
    const u = new URL(url);
    if (!u.searchParams.has("lead")) return url;
    u.searchParams.delete("lead");
    return u.toString();
  } catch {
    return url;
  }
}
