/**
 * Strapi-Webhook: On-Demand-Revalidierung des ISR-Caches.
 *
 * Strapi schickt bei entry.publish / entry.update / entry.unpublish einen
 * Webhook hierher. Dieser Handler erneuert die betroffenen Pfade, damit
 * redaktionelle Aenderungen nicht erst mit Ablauf des ISR-Fensters sichtbar
 * werden (bei /karriere/** sind das laut nuxt.config.ts 12 Stunden).
 *
 * WAS DIESER HANDLER KANN - UND WAS NICHT
 *
 * Auf Vercel liegt der ISR-Cache in der Plattform, nicht in Nitros Storage.
 * Das Vercel-Preset uebersetzt die `isr`-routeRules aus nuxt.config.ts beim
 * Build in Prerender-Functions (.vercel/output/functions/<route>-isr.
 * prerender-config.json mit `expiration`); Nitros eigener Cache-Layer wird
 * dafuer gar nicht erst eingeschaltet - der greift nur bei `cache`- bzw.
 * `swr`-Rules, die es hier nicht gibt. `useStorage('cache:nitro')` sieht von
 * den ISR-Eintraegen also nichts, und die frueher hier stehende Variante
 * (Keys holen, per path-Substring filtern, loeschen) war wirkungslos - doppelt
 * sogar, denn Nitro escaped Cache-Keys mit /\W/g, ein Key enthaelt nie einen
 * Slash und `key.includes('/karriere/aerzte')` konnte nie treffen.
 *
 * Der einzige unterstuetzte Weg, einen ISR-Pfad gezielt zu erneuern, ist ein
 * GET oder HEAD auf genau diesen Pfad mit dem Header
 *
 *   x-prerender-revalidate: <bypassToken>
 *
 * Der Token kommt aus `nitro.vercel.config.bypassToken` in nuxt.config.ts und
 * muss als VERCEL_BYPASS_TOKEN in den Vercel-Projekt-Einstellungen liegen -
 * derselbe Wert zur Build- und zur Laufzeit, sonst weist Vercel den Header ab.
 * Siehe https://vercel.com/docs/frameworks/backend/nitro#on-demand-revalidation
 *
 * Grenzen, die dieser Handler bewusst nicht kaschiert:
 * - Ohne VERCEL_BYPASS_TOKEN gibt es keinen Weg, den Plattform-Cache zu
 *   erneuern. Dann antwortet der Handler mit 500 und nennt die Ursache, statt
 *   `revalidated: true` zu melden - genau das hat den Defekt jahrelang
 *   verdeckt.
 * - Ausserhalb von Vercel (nuxt dev, nuxt preview) gibt es kein ISR; der
 *   Handler meldet das und tut nichts.
 * - Der Strapi-Proxy (server/api/strapi/[...path].get.ts) cached zusaetzlich
 *   60s frisch / 240s stale in Nitro. Die neu gerenderte Seite kann also bis
 *   zu ~1 Minute hinter Strapi liegen. Das ist ein Minutenfenster statt zwoelf
 *   Stunden, aber es ist nicht null.
 * - Faellt der Localization-Lookup aus (Strapi nicht erreichbar), faellt der
 *   Handler auf den Slug des Webhooks in allen Sprachen zurueck und sagt das
 *   in der Antwort (localizationsResolved: false).
 *
 * Setup in Strapi:
 * Settings > Webhooks > Create
 * - URL: https://www.myhealthandbeauty.com/api/revalidate
 * - Events: entry.publish, entry.update, entry.unpublish
 * - Headers: { "x-webhook-secret": "YOUR_SECRET" }
 */

// Aus i18n.locales / i18n.strategy = "prefix_except_default" in nuxt.config.ts.
const LOCALES = ["de", "en", "tr", "ar", "fr", "nl"] as const;
const DEFAULT_LOCALE = "de";

/**
 * Seiten der pages-Collection, die nicht unter /p/<slug> haengen, sondern eine
 * feste Route haben. Die Pfade sind die aus i18n.pages in nuxt.config.ts - wer
 * dort etwas umbenennt, muss es hier nachziehen.
 */
const FIXED_PAGE_ROUTES: Record<string, string[]> = {
  // app/pages/karriere/aerzte.vue, Slug aus KARRIERE_AERZTE_SLUG (#101)
  "karriere-aerzte": [
    "/karriere/aerzte",
    "/en/careers/doctors",
    "/tr/kariyer/doktorlar",
    "/ar/masar-mihani/atibba",
    "/fr/carrieres/medecins",
    "/nl/carriere/artsen",
  ],
};

/** Slugs aus dem Webhook sind Fremddaten und landen in einer URL. */
const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/i;

function withLocalePrefix(locale: string, path: string): string {
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}

/** Alle Sprachfassungen der Startseite: /, /en, /tr, ... */
function homepagePaths(): string[] {
  return LOCALES.map((locale) =>
    locale === DEFAULT_LOCALE ? "/" : `/${locale}`,
  );
}

type PageLocalization = { locale: string; slug: string };

/**
 * Sprachfassungen eines pages-Eintrags aus Strapi holen.
 *
 * Noetig, weil die Slugs je Sprache abweichen duerfen: der Eintrag "impressum"
 * heisst auf Arabisch "afsah-qanuni" und auf Tuerkisch "kunye". Wer stur
 * /<locale>/p/<slug> bildet, revalidiert dort zwei Pfade, die es nicht gibt,
 * und laesst die beiden echten zwoelf Stunden alt stehen. Umgekehrt haben
 * mehrere Seiten gar keine Uebersetzungen.
 *
 * Der Lookup ist symmetrisch: egal aus welcher Sprache der Webhook kommt,
 * `localizations` enthaelt alle uebrigen Sprachen inklusive de.
 *
 * Bewusst direkt an Strapi, nicht ueber /api/strapi/**: dieser Proxy ist
 * Nitro-gecacht (60s), und ausgerechnet hier waere ein Sekunden alter Stand
 * das Problem. Nur die zwei gebrauchten Felder werden geladen.
 */
async function fetchPageLocalizations(
  strapiUrl: string,
  slug: string,
  locale: string,
): Promise<PageLocalization[] | null> {
  try {
    const url = new URL(`${strapiUrl.replace(/\/+$/, "")}/api/pages`);
    url.searchParams.set("filters[slug][$eq]", slug);
    url.searchParams.set("locale", locale);
    url.searchParams.set("fields[0]", "slug");
    url.searchParams.set("fields[1]", "locale");
    url.searchParams.set("populate[localizations][fields][0]", "slug");
    url.searchParams.set("populate[localizations][fields][1]", "locale");

    const response = await globalThis.fetch(url, {
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      console.warn(
        `[revalidate] Localization lookup failed: HTTP ${response.status}`,
      );
      return null;
    }

    const payload: any = await response.json();
    const entry = payload?.data?.[0];
    if (!entry?.slug || !entry?.locale) {
      console.warn(`[revalidate] No page found for ${locale}:${slug}`);
      return null;
    }

    const found: PageLocalization[] = [
      { locale: entry.locale, slug: entry.slug },
      ...(Array.isArray(entry.localizations) ? entry.localizations : [])
        .filter((l: any) => l?.locale && l?.slug)
        .map((l: any) => ({ locale: l.locale, slug: l.slug })),
    ];

    // Strapi-Antworten sind Fremddaten und landen gleich in einer URL.
    return found.filter(
      (l) =>
        (LOCALES as readonly string[]).includes(l.locale) &&
        SAFE_SLUG.test(l.slug),
    );
  } catch (err) {
    console.warn("[revalidate] Localization lookup failed:", err);
    return null;
  }
}

/**
 * Pfade eines pages-Eintrags.
 *
 * Drei Quellen, zusammengefasst und dedupliziert:
 * 1. die aufgeloesten Sprachfassungen - die kanonischen URLs,
 * 2. der DEUTSCHE Slug unter jedem Sprachpraefix. Der Strapi-Proxy faellt fuer
 *    fehlende Uebersetzungen auf Deutsch zurueck, /en/p/<de-slug> rendert also
 *    auch ohne englische Fassung und liegt dann im ISR-Cache. Sechs
 *    HEAD-Requests mehr sind billiger als eine Seite, die eine Stunde alt
 *    bleibt. Nur der deutsche Slug, denn nur auf ihn faellt der Proxy zurueck -
 *    /p/kunye gaebe es nicht.
 * 3. die feste Route, falls einer der Slugs eine hat.
 *
 * Dadurch ist das Ergebnis unabhaengig davon, aus welcher Sprache der Webhook
 * kam: die tuerkische Fassung von "impressum" liefert dieselbe Pfadmenge wie
 * die deutsche.
 */
function generalPagePaths(
  slug: string,
  localizations: PageLocalization[] | null,
): string[] {
  const all = localizations ?? [{ locale: DEFAULT_LOCALE, slug }];
  const germanSlug =
    all.find((l) => l.locale === DEFAULT_LOCALE)?.slug ?? slug;
  const slugs = new Set([slug, ...all.map((l) => l.slug)]);

  return [
    ...all.map((l) => withLocalePrefix(l.locale, `/p/${l.slug}`)),
    ...LOCALES.map((locale) => withLocalePrefix(locale, `/p/${germanSlug}`)),
    ...[...slugs].flatMap((s) => FIXED_PAGE_ROUTES[s] ?? []),
  ];
}

/**
 * Ein Pfad, ein HEAD-Request mit dem Revalidate-Header. Vercel rendert die
 * Prerender-Function neu und legt das Ergebnis in den ISR-Cache; der naechste
 * Besucher bekommt den frischen Stand. HEAD reicht dafuer und spart den Body.
 */
async function revalidatePath(
  origin: string,
  path: string,
  bypassToken: string,
) {
  try {
    const response = await globalThis.fetch(new URL(path, origin), {
      method: "HEAD",
      headers: { "x-prerender-revalidate": bypassToken },
      redirect: "manual",
    });

    // Vercel meldet ueber x-vercel-cache, wie der Request behandelt wurde;
    // REVALIDATED ist der Beleg, dass der Header akzeptiert wurde.
    const cacheStatus = response.headers.get("x-vercel-cache") ?? "unknown";
    const success = response.ok || response.status === 404;

    if (success) {
      console.log(
        `[revalidate] ✓ ${path} (${response.status}, x-vercel-cache: ${cacheStatus})`,
      );
    } else {
      console.error(
        `[revalidate] ✗ ${path} (${response.status}, x-vercel-cache: ${cacheStatus})`,
      );
    }

    return { path, success, status: response.status, cacheStatus };
  } catch (err) {
    console.error(`[revalidate] ✗ ${path}:`, err);
    return { path, success: false, error: String(err) };
  }
}

export default defineEventHandler(async (event) => {
  try {
    // 1. Webhook-Secret pruefen
    const secret = getHeader(event, "x-webhook-secret");
    const expectedSecret = process.env.STRAPI_WEBHOOK_SECRET;

    if (!expectedSecret) {
      console.warn("[revalidate] STRAPI_WEBHOOK_SECRET not configured");
      throw createError({
        statusCode: 500,
        statusMessage: "STRAPI_WEBHOOK_SECRET not configured",
      });
    }

    if (secret !== expectedSecret) {
      console.warn("[revalidate] Invalid webhook secret");
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid webhook secret",
      });
    }

    // 2. Payload lesen
    const body = await readBody(event);
    const { model, entry } = body;

    if (!model || !entry) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing model or entry in webhook payload",
      });
    }

    console.log(
      `[revalidate] Received webhook for ${model}:${entry.documentId}`,
    );

    // 3. Betroffene Pfade bestimmen
    const pathsToRevalidate: string[] = [];
    // Nur fuer api::page.page gesetzt; null = Lookup fehlgeschlagen, die
    // Sprachpfade sind dann geraten statt aufgeloest.
    let localizationsResolved: boolean | undefined;

    switch (model) {
      case "api::page.page": {
        const slug = typeof entry.slug === "string" ? entry.slug : "";

        if (!SAFE_SLUG.test(slug)) {
          console.warn(`[revalidate] Unusable slug for ${model}: ${slug}`);
          return { revalidated: false, info: "Missing or unusable slug" };
        }

        if (slug === "homepage") {
          pathsToRevalidate.push(...homepagePaths());
          break;
        }

        const strapiUrl = useRuntimeConfig(event).public.strapiUrl;
        const localizations = strapiUrl
          ? await fetchPageLocalizations(
              strapiUrl,
              slug,
              typeof entry.locale === "string" ? entry.locale : DEFAULT_LOCALE,
            )
          : null;

        localizationsResolved = localizations !== null;
        if (!localizationsResolved) {
          console.warn(
            `[revalidate] Falling back to the webhook slug for every locale: ${slug}`,
          );
        }

        pathsToRevalidate.push(...generalPagePaths(slug, localizations));
        break;
      }

      // Ungeprueft uebernommen: /products/<slug> und /blog/<slug> stammen aus
      // der urspruenglichen Fassung. /products/** existiert in diesem Projekt
      // gar nicht (die Route heisst /produkte/[categorySlug]/[productSlug]),
      // und die Sprachpfade fehlen bei beiden. Wer product/article wirklich
      // revalidieren will, muss die Pfade hier erst richtigstellen.
      case "api::product.product":
        if (entry.slug && SAFE_SLUG.test(entry.slug)) {
          pathsToRevalidate.push(`/products/${entry.slug}`);
        }
        pathsToRevalidate.push("/products");
        break;

      case "api::article.article":
        if (entry.slug && SAFE_SLUG.test(entry.slug)) {
          pathsToRevalidate.push(`/blog/${entry.slug}`);
        }
        pathsToRevalidate.push("/blog");
        break;

      default:
        console.log(`[revalidate] No revalidation rules for model: ${model}`);
        return { revalidated: false, info: "No matching revalidation rules" };
    }

    const paths = [...new Set(pathsToRevalidate)];

    // 4. Voraussetzungen pruefen - lieber laut scheitern als still nichts tun
    if (!process.env.VERCEL) {
      console.warn(
        "[revalidate] Not running on Vercel - no ISR cache to revalidate",
      );
      return {
        revalidated: false,
        info: "Not running on Vercel; ISR only exists in the Vercel deployment",
        model,
        documentId: entry.documentId,
        paths,
      };
    }

    const bypassToken = process.env.VERCEL_BYPASS_TOKEN;
    if (!bypassToken) {
      console.error(
        "[revalidate] VERCEL_BYPASS_TOKEN not configured - cannot revalidate",
      );
      throw createError({
        statusCode: 500,
        statusMessage:
          "VERCEL_BYPASS_TOKEN not configured; on-demand ISR revalidation is impossible",
      });
    }

    // 5. Revalidieren. Der Request geht bewusst ueber den Origin, unter dem der
    // Webhook ankommt: Vercel revalidiert genau die Domain, auf der man den
    // Header schickt. globalThis.fetch statt $fetch, damit der Request wirklich
    // durch Vercels CDN laeuft und nicht Nitro-intern kurzgeschlossen wird.
    const origin = getRequestURL(event).origin;
    const results = await Promise.all(
      paths.map((path) => revalidatePath(origin, path, bypassToken)),
    );

    return {
      revalidated: results.some((result) => result.success),
      model,
      documentId: entry.documentId,
      ...(localizationsResolved === undefined ? {} : { localizationsResolved }),
      paths: results,
    };
  } catch (error: any) {
    console.error("[revalidate] Error:", error);
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || "Revalidation failed",
    });
  }
});
