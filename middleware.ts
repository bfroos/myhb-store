/**
 * Vercel Routing Middleware: Query bei Weiterleitungen erhalten.
 *
 * Alle Weiterleitungen der Seite (redirects.json/Strapi, Koeln-Konsolidierung,
 * Standortseiten in anderen Sprachen, Schraegstrich am Ende, /blog/p/1 ...)
 * entstehen in der Nitro-Funktion hinter dem ISR-Cache. Diese Funktion sieht
 * die Query nicht (Vercel reicht sie an ISR-Funktionen nicht durch, und seit
 * TSEO-03 steht sie auch nicht im Cache-Key). Gemessen am 07.10.2026: jede
 * Weiterleitung verlor sie, auch go. .../botox?gclid=... -> .../muskelrelaxans
 * ohne gclid. Damit ging bei Anzeigenklicks auf alte Adressen die Zuordnung
 * verloren.
 *
 * Diese Middleware laeuft vor dem Cache und sieht die volle URL. Nur bei
 * GET/HEAD mit Query fragt sie per HEAD (ohne Query, also aus dem Cache) nach,
 * ob der Pfad weiterleitet. Wenn ja und das Ziel auf derselben Domain liegt,
 * antwortet sie mit derselben Weiterleitung plus der Original-Query (Werte im
 * Ziel gewinnen). Alles andere geht unveraendert weiter.
 */
import { next } from "@vercel/functions";

export const config = {
  runtime: "nodejs",
  // Assets, API und Vercel-interne Pfade nie.
  matcher: ["/((?!_nuxt/|__nuxt|_fonts/|_ipx/|_vercel|api/|favicon).*)"],
};

/**
 * Ergebnis je Pfad fuer einige Minuten merken. Ohne das kostete jeder
 * Anzeigenklick (immer mit gclid) einen zusaetzlichen Pruef-Request:
 * Preview 07.10. Median 254 ms statt 100 ms. Anzeigen landen fast immer auf
 * denselben wenigen Seiten, also faellt die Pruefung praktisch nur beim
 * ersten Klick je Instanz an. Weiterleitungen aendern sich selten; nach
 * einem Deploy startet ohnehin eine neue Instanz.
 */
const TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 2000;
type Probe = { at: number; status: number; location: string | null };
const probes = new Map<string, Probe>();

function remember(key: string, probe: Probe) {
  if (probes.size >= MAX_ENTRIES) {
    // Aeltesten Eintrag verwerfen (Map behaelt die Einfuegereihenfolge).
    const oldest = probes.keys().next().value;
    if (oldest !== undefined) probes.delete(oldest);
  }
  probes.set(key, probe);
}

/** Markiert den eigenen Pruef-Request, damit er nicht hier landet. */
const PROBE_HEADER = "x-myhb-redirect-probe";
const REDIRECT = new Set([301, 302, 303, 307, 308]);

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  if (!url.search || url.search === "?") return next();
  if (request.method !== "GET" && request.method !== "HEAD") return next();
  if (request.headers.get(PROBE_HEADER)) return next();
  // Dateien (robots.txt, sitemap.xml, Bilder) leiten nicht weiter.
  if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) return next();

  const key = `${url.host}${url.pathname}`;
  let probe = probes.get(key);
  if (!probe || Date.now() - probe.at > TTL_MS) {
    try {
      const res = await fetch(new URL(url.pathname, url.origin), {
        method: "HEAD",
        redirect: "manual",
        headers: {
          [PROBE_HEADER]: "1",
          // Preview-Deployments sind geschuetzt; das Login-Cookie muss mit.
          cookie: request.headers.get("cookie") ?? "",
          "user-agent": request.headers.get("user-agent") ?? "",
        },
      });
      probe = {
        at: Date.now(),
        status: res.status,
        location: res.headers.get("location"),
      };
      // Nur eindeutige Antworten merken, keine Fehler oder Checkpoints.
      if (res.status < 400) remember(key, probe);
    } catch {
      return next();
    }
  }

  const location = probe.location;
  if (!REDIRECT.has(probe.status) || !location) return next();

  const target = new URL(location, url.origin);
  // Nur eigene Weiterleitungen, nie z. B. das Vercel-Login einer Preview.
  if (target.origin !== url.origin) return next();

  for (const [name, value] of url.searchParams) {
    if (!target.searchParams.has(name)) target.searchParams.append(name, value);
  }

  return new Response(null, {
    status: probe.status,
    headers: {
      location: `${target.pathname}${target.search}${target.hash}`,
      "cache-control": "private, no-store",
      "x-myhb-query-kept": "1",
    },
  });
}
