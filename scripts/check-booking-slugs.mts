/**
 * Prueft, ob die appBookingUrl in Strapi auf existierende Standorte der App zeigt.
 *
 * Aufruf: npm run check:booking-slugs
 *
 * Hintergrund (#100): Die App loest `?location=` strikt ueber `venues.url_slug`
 * auf. Ein unbekannter Slug scheitert dort NICHT laut — bei frischer Sitzung
 * landet die Besucherin in der Standortauswahl, bei bereits gemerktem Standort
 * bucht sie am falschen Standort weiter. Die Slugs sind ausserdem nicht aus den
 * Standortnamen ableitbar (`koeln-aracden`, `aachen-aquiz-plaza`,
 * `leipzig-hoefe`, `moenchen-minto`), also raet frueher oder spaeter jemand.
 *
 * Dieses Skript liest beide Seiten und vergleicht sie:
 *   - Strapi: oeffentliche Content-API, kein Token noetig.
 *   - App: Supabase-REST mit dem oeffentlichen Publishable Key.
 *
 * Der Key steht in myhb-os/.env als VITE_SUPABASE_PUBLISHABLE_KEY und ist
 * oeffentlich (er steckt im ausgelieferten App-Bundle). Uebergabe:
 *
 *   SUPABASE_PUBLISHABLE_KEY=... npm run check:booking-slugs
 *
 * Ohne Key laeuft nur die Strapi-Seite; das Skript sagt dann, was es nicht
 * pruefen konnte, und faellt nicht durch.
 */

const STRAPI =
  process.env.NUXT_PUBLIC_STRAPI_URL ??
  "https://striking-bear-e5a15ddc94.strapiapp.com";
const SUPABASE =
  process.env.SUPABASE_URL ?? "https://forgsirmbzkxbblepscr.supabase.co";
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

type Location = {
  slug: string;
  name?: string;
  calendlyUrl?: string | null;
  appBookingUrl?: string | null;
  isBookingAllowed?: boolean;
};
type Venue = { name: string; url_slug: string | null; status: string };

let failed = 0;
let warned = 0;

function fail(msg: string) {
  failed++;
  console.log(`FEHLER   ${msg}`);
}
function warn(msg: string) {
  warned++;
  console.log(`HINWEIS  ${msg}`);
}
function ok(msg: string) {
  console.log(`ok       ${msg}`);
}

/** Der Standort-Teil aus `…/book-appointment?location=<slug>`. */
function locationParam(url: string): string | undefined {
  try {
    return new URL(url).searchParams.get("location") ?? undefined;
  } catch {
    return undefined;
  }
}

const locRes = await fetch(
  `${STRAPI}/api/locations?pagination%5BpageSize%5D=100`,
);
if (!locRes.ok) {
  console.error(`Strapi antwortet ${locRes.status}`);
  process.exit(2);
}
const locations: Location[] = (await locRes.json()).data ?? [];

let venues: Venue[] | undefined;
if (KEY) {
  const vRes = await fetch(
    `${SUPABASE}/rest/v1/venues?select=name,url_slug,status`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } },
  );
  if (vRes.ok) {
    venues = await vRes.json();
  } else {
    warn(`Venues der App nicht lesbar (HTTP ${vRes.status}) — nur Strapi geprueft.`);
  }
} else {
  warn("SUPABASE_PUBLISHABLE_KEY fehlt — der Abgleich mit der App entfaellt.");
}

const bySlug = new Map((venues ?? []).map((v) => [v.url_slug ?? "", v]));
const buchbar = locations.filter((l) => l.isBookingAllowed !== false);

console.log(
  `\n${locations.length} Standorte in Strapi, davon ${buchbar.length} buchbar` +
    (venues ? `; ${venues.length} Venues in der App.\n` : ".\n"),
);

// 1. Jede appBookingUrl muss auf ein existierendes Venue zeigen.
for (const l of locations) {
  if (!l.appBookingUrl) continue;
  const slug = locationParam(l.appBookingUrl);
  if (!slug) {
    fail(`${l.slug}: appBookingUrl ohne ?location= — ${l.appBookingUrl}`);
    continue;
  }
  if (!venues) continue;
  const venue = bySlug.get(slug);
  if (!venue) {
    fail(
      `${l.slug}: ?location=${slug} gibt es in der App nicht. ` +
        `Die App ignoriert das still und bucht ggf. am zuvor gemerkten Standort.`,
    );
  } else if (venue.status !== "active") {
    fail(`${l.slug}: Venue ${slug} ist nicht aktiv (status=${venue.status}).`);
  } else {
    ok(`${l.slug} -> ${slug} (${venue.name})`);
  }
}

// 2. Buchbare Standorte ohne appBookingUrl landen im App-Arm im Fallback.
for (const l of buchbar) {
  if (l.appBookingUrl) continue;
  if (!l.calendlyUrl) continue;
  warn(
    `${l.slug}: keine appBookingUrl — im App-Arm des Splits faellt der Standort ` +
      `mit ab_fallback=true auf Calendly zurueck.`,
  );
}

// 3. Venues der App, auf die kein Standort zeigt.
if (venues) {
  const genutzt = new Set(
    locations
      .map((l) => (l.appBookingUrl ? locationParam(l.appBookingUrl) : undefined))
      .filter(Boolean),
  );
  for (const v of venues) {
    if (v.status === "active" && v.url_slug && !genutzt.has(v.url_slug)) {
      warn(`App-Venue ${v.url_slug} (${v.name}) wird von keinem Standort verlinkt.`);
    }
  }
}

console.log(
  failed === 0
    ? `\nKeine kaputten Slugs.${warned ? ` ${warned} Hinweis(e).` : ""}`
    : `\n${failed} kaputte(r) Slug(s), ${warned} Hinweis(e).`,
);
process.exit(failed === 0 ? 0 : 1);
