/**
 * Catch-all for the locales the site no longer publishes (tr, ar, fr, nl).
 *
 * Every URL those locales had in the sitemap gets an exact entry in
 * server/assets/redirects.json, mapped to its real German counterpart via the
 * hreflang alternates the sitemap already advertised. This middleware is the
 * safety net underneath that list: Google indexed URLs we no longer emit, old
 * inbound links, and anything an editor unpublished before the switch. Without
 * it those paths would 404 once the locales leave nuxt.config.
 *
 * Deliberately coarse — it maps only the section prefix, because slugs were
 * localised (/fr/traitements/perfusions has no /behandlungen/perfusions). A
 * section index that exists beats a deep link that 404s.
 *
 * Filename matters: Nitro orders middleware alphabetically, and "redirects"
 * sorts before "retired-locales", so the exact per-URL rules always win.
 */

const RETIRED_LOCALES = new Set(["tr", "ar", "fr", "nl"]);

// Second path segment (the localised section) -> German section index.
const SECTION_TO_GERMAN: Record<string, string> = {
  // Behandlungen
  traitements: "/behandlungen",
  behandelingen: "/behandlungen",
  tedaviler: "/behandlungen",
  ilajat: "/behandlungen",
  // Standorte
  lieux: "/standorte",
  locaties: "/standorte",
  konumlar: "/standorte",
  mawaqea: "/standorte",
  // Produkte
  produits: "/produkte",
  producten: "/produkte",
  urunler: "/produkte",
  muntajat: "/produkte",
  // Blog
  blog: "/blog",
  mudawwana: "/blog",
  // Ärzte
  medecins: "/aerzte",
  artsen: "/aerzte",
  doktorlar: "/aerzte",
  atibba: "/aerzte",
  // Karriere
  carrieres: "/karriere",
  carriere: "/karriere",
  kariyer: "/karriere",
  "masar-mihani": "/karriere",
  // Preise
  prix: "/preise",
  prijzen: "/preise",
  fiyatlar: "/preise",
  asaar: "/preise",
  // Über uns
  "a-propos": "/ueber-uns",
  "over-ons": "/ueber-uns",
  hakkimizda: "/ueber-uns",
  "man-nahnu": "/ueber-uns",
};

const SKIP_PREFIXES = ["/_nuxt", "/__nuxt", "/api"];

export default defineEventHandler(async (event) => {
  const method = event.method || "GET";
  if (method !== "GET" && method !== "HEAD") return;

  const config = useRuntimeConfig();
  if (config.public.siteMode === "ads") return;

  const { pathname, search } = getRequestURL(event);
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return;

  const locale = segments[0] as string;
  if (!RETIRED_LOCALES.has(locale)) return;

  const section = segments[1];
  const target = (section && SECTION_TO_GERMAN[section]) || "/";

  return sendRedirect(event, `${target}${search || ""}`, 301);
});
