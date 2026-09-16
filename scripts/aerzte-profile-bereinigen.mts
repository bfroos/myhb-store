/**
 * Zwei einmalige Aufraeumarbeiten an den Arzt-Profilen in Strapi.
 *
 * 1. TESTEINTRAG VERSTECKEN: "Frau Dr. Weber" (slug `employee`) ist ein
 *    Demo-Datensatz und oeffentlich sichtbar. hideFromPublic=true laesst die
 *    Profilseite 404 geben (useDoctorPage.ts) und nimmt sie aus der Sitemap.
 *    Bewusst verstecken statt loeschen -- ein Demo-Eintrag ist an anderen
 *    Stellen als Referenz verlinkt, und Verstecken ist umkehrbar.
 *
 * 2. DOPPELPROFIL ZUSAMMENLEGEN: "DR. Avin" und "Dr. Mohammad" sind dieselbe
 *    Person. Belege: beide am Standort Aquis Plaza Aachen, der Text im
 *    Mohammad-Profil spricht durchgehend von "sie" bei Rolle "Arzt", und in der
 *    App-Datenbank gibt es genau eine Aerztin "Avin Mohammad".
 *
 *    Der Mohammad-Eintrag bleibt bestehen, weil er den Inhalt traegt:
 *    aboutText, Behandlungsschwerpunkte, eine Google-Bewertung und vier
 *    Uebersetzungen (en/ar/tr/nl). Der Avin-Eintrag hat nur ein Foto und
 *    existiert bloss auf Deutsch -- das Foto wandert herueber, der Eintrag
 *    wird versteckt und per 301 auf den zusammengelegten geleitet.
 *
 *    Angezeigt wird danach "Avin Mohammad" (so steht der Name auch in der App)
 *    unter /aerzte/avin-mohammad. Der volle Name statt nur "Avin" vermeidet
 *    ausserdem eine Slug-Kollision mit dem versteckten Eintrag.
 *
 * REIHENFOLGE: erst scripts/aerzte-titel-bereinigen.mts laufen lassen, dann
 * dieses hier. Es liest den jeweils aktuellen Slug, funktioniert also vorher
 * wie nachher; entstehen dabei Ketten (dr-mohammad -> mohammad ->
 * avin-mohammad), loest die Middleware sie auf (MAX_REDIRECT_HOPS = 5).
 *
 * Aufruf (Trockenlauf, liest oeffentlich, aendert nichts):
 *   npx tsx scripts/aerzte-profile-bereinigen.mts
 *
 * Aufruf (schreibt):
 *   STRAPI_TOKEN=... npx tsx scripts/aerzte-profile-bereinigen.mts --apply
 */

const STRAPI_URL = (
  process.env.NUXT_PUBLIC_STRAPI_URL ??
  "https://striking-bear-e5a15ddc94.strapiapp.com"
).replace(/\/+$/, "");

const TOKEN = process.env.STRAPI_TOKEN ?? "";
const APPLY = process.argv.includes("--apply");

const LOCALES = ["de", "en", "ar", "tr", "fr", "nl"] as const;
type Locale = (typeof LOCALES)[number];

/** Muss zu "aerzte/[slug]" in nuxt.config.ts passen (prefix_except_default). */
const SEKTION: Record<Locale, string> = {
  de: "/aerzte",
  en: "/en/doctors",
  tr: "/tr/doktorlar",
  ar: "/ar/atibba",
  fr: "/fr/medecins",
  nl: "/nl/artsen",
};

const WEBER = "xdpohp2yjfsc2b4vzyj10b9j"; // "Frau Dr. Weber", slug `employee`
const AVIN = "chqhyaef92c00903wpb3m1l1"; // nur Foto, nur Deutsch -> wird versteckt
const MOHAMMAD = "tcpcy0qyyyz92td7j1pewlpj"; // traegt den Inhalt -> bleibt

const ZIEL = {
  firstName: "Avin",
  lastName: "Mohammad",
  slug: "avin-mohammad",
  /** Der aboutText spricht von "sie"; die Rolle stand faelschlich auf "Arzt ". */
  roleDe: "Ärztin",
};

type Employee = {
  documentId: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  slug: string | null;
  hideFromPublic: boolean | null;
  photo?: { id: number; url: string } | null;
  locale?: string;
};

async function strapi<T>(
  path: string,
  init: RequestInit = {},
  withToken = true,
): Promise<T> {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(withToken && TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(
      `${init.method ?? "GET"} ${path} -> ${res.status} ${await res.text()}`,
    );
  }
  return (await res.json()) as T;
}

/**
 * Der Einzelabruf /api/employees/:documentId ist oeffentlich gesperrt (403),
 * deshalb die Liste je Sprache und daraus der gesuchte Eintrag. Der Cache
 * wird nach jedem Schreiben verworfen, damit die Gegenprobe frisch liest.
 */
const listenCache = new Map<string, Employee[]>();

async function ladeListe(locale: Locale, withToken: boolean): Promise<Employee[]> {
  const key = `${locale}:${withToken}`;
  const bekannt = listenCache.get(key);
  if (bekannt) return bekannt;

  const { data } = await strapi<{ data: Employee[] }>(
    `/api/employees?pagination[pageSize]=200&locale=${locale}` +
      `&fields[0]=firstName&fields[1]=lastName&fields[2]=role&fields[3]=slug` +
      `&fields[4]=hideFromPublic&populate[photo][fields][0]=url`,
    {},
    withToken,
  );
  const liste = data.map((e) => ({ ...e, locale }));
  listenCache.set(key, liste);
  return liste;
}

/**
 * Eintrag in einer Sprache holen -- null, wenn es ihn dort nicht gibt.
 * Ein Lesefehler ist etwas anderes als ein fehlender Eintrag und wird
 * durchgereicht: sonst sieht ein abgelehnter Token aus wie "nicht vorhanden".
 */
async function lade(
  documentId: string,
  locale: Locale,
  withToken = true,
): Promise<Employee | null> {
  const liste = await ladeListe(locale, withToken);
  return liste.find((e) => e.documentId === documentId) ?? null;
}

async function schreibe(
  documentId: string,
  locale: string,
  data: Record<string, unknown>,
): Promise<void> {
  await strapi(`/api/employees/${documentId}?locale=${locale}&status=published`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
  listenCache.clear();
}

/** Legt den 301 an, falls er fehlt. Gibt zurueck, ob er neu ist. */
async function redirect(von: string, nach: string): Promise<"neu" | "vorhanden"> {
  if (von === nach) return "vorhanden";
  const vorhanden = await strapi<{ data: Array<{ documentId: string }> }>(
    `/api/redirects?filters[from][$eq]=${encodeURIComponent(von)}&fields[0]=from`,
  );
  if (vorhanden.data.length > 0) return "vorhanden";

  const angelegt = await strapi<{ data: { documentId: string } }>(
    `/api/redirects`,
    {
      method: "POST",
      body: JSON.stringify({ data: { from: von, to: nach, code: 301 } }),
    },
  );
  try {
    await strapi(`/api/redirects/${angelegt.data.documentId}?status=published`, {
      method: "PUT",
      body: JSON.stringify({ data: {} }),
    });
  } catch {
    // Collection ohne Draft & Publish -- die Gegenprobe unten entscheidet.
  }
  return "neu";
}

async function main(): Promise<void> {
  if (APPLY && !TOKEN) {
    console.error(
      "Kein STRAPI_TOKEN gesetzt. Aufruf:\n" +
        "  STRAPI_TOKEN=<token> npx tsx scripts/aerzte-profile-bereinigen.mts --apply",
    );
    process.exit(1);
  }

  // Ein ungueltiger Token liefert 401 auf jeden Lesezugriff. Ohne diese
  // Pruefung sieht das spaeter aus wie "Eintrag nicht gefunden".
  if (TOKEN) {
    try {
      await strapi(`/api/employees?pagination[pageSize]=1&fields[0]=slug`);
    } catch (err) {
      console.error(
        `Strapi lehnt den STRAPI_TOKEN ab:\n  ${(err as Error).message}\n\n` +
          "Steht da noch der Platzhalter aus der Anleitung? Es muss der echte\n" +
          "Token-Wert hin, ohne spitze Klammern.",
      );
      process.exit(1);
    }
  }

  console.log(`Strapi: ${STRAPI_URL}`);
  console.log(APPLY ? "MODUS: schreiben (--apply)\n" : "MODUS: Trockenlauf\n");

  const mitToken = Boolean(TOKEN);

  // ---------------------------------------------------------------- 1. Weber
  console.log("--- 1. Testeintrag verstecken ---");
  for (const locale of LOCALES) {
    const e = await lade(WEBER, locale, mitToken);
    if (!e) continue;
    const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
    if (e.hideFromPublic) {
      console.log(`[${locale}] ${e.slug}: "${name}" ist bereits versteckt`);
      continue;
    }
    console.log(`[${locale}] ${e.slug}: "${name}" -> hideFromPublic = true`);
    if (APPLY) await schreibe(WEBER, locale, { hideFromPublic: true });
  }

  // ------------------------------------------------------------ 2. Avin/Mohammad
  console.log("\n--- 2. Doppelprofil zusammenlegen ---");

  const avinDe = await lade(AVIN, "de", mitToken);
  if (!avinDe) {
    console.error("Avin-Eintrag nicht gefunden -- abgebrochen.");
    process.exit(1);
  }
  const fotoUrl = avinDe.photo?.url ?? null;
  const fotoId = avinDe.photo?.id ?? null;
  console.log(
    `Foto aus dem Avin-Eintrag: ${fotoUrl ?? "keines vorhanden"}` +
      (fotoId ? ` (id ${fotoId})` : ""),
  );

  const umleitungen: Array<[string, string]> = [];

  for (const locale of LOCALES) {
    const m = await lade(MOHAMMAD, locale, mitToken);
    if (!m) continue;

    const alterSlug = (m.slug ?? "").trim();
    const von = `${SEKTION[locale]}/${alterSlug}`;
    const nach = `${SEKTION[locale]}/${ZIEL.slug}`;

    const alterName = [m.firstName, m.lastName].filter(Boolean).join(" ");
    console.log(
      `[${locale}] "${alterName}" -> "${ZIEL.firstName} ${ZIEL.lastName}", ` +
        `${alterSlug} -> ${ZIEL.slug}`,
    );

    // Rolle nur auf Deutsch korrigieren -- die Uebersetzungen rate ich nicht.
    if (locale === "de" && (m.role ?? "").trim() !== ZIEL.roleDe) {
      console.log(`[de]   Rolle: "${(m.role ?? "").trim()}" -> "${ZIEL.roleDe}"`);
    } else if (locale !== "de") {
      console.log(`[${locale}]   Rolle bleibt "${(m.role ?? "").trim()}" -- bitte pruefen`);
    }

    if (APPLY) {
      const daten: Record<string, unknown> = {
        firstName: ZIEL.firstName,
        lastName: ZIEL.lastName,
        slug: ZIEL.slug,
      };
      if (locale === "de") daten.role = ZIEL.roleDe;
      if (fotoId) daten.photo = fotoId;
      await schreibe(MOHAMMAD, locale, daten);
    }
    if (alterSlug && alterSlug !== ZIEL.slug) umleitungen.push([von, nach]);
  }

  // Der Avin-Eintrag existiert nur auf Deutsch.
  const avinSlug = (avinDe.slug ?? "").trim();
  if (avinSlug) {
    umleitungen.push([`/aerzte/${avinSlug}`, `/aerzte/${ZIEL.slug}`]);
  }
  console.log(`\n[de] Avin-Eintrag ${avinSlug}: hideFromPublic = true`);

  console.log("\nWeiterleitungen:");
  for (const [von, nach] of umleitungen) console.log(`  ${von} -> ${nach}`);

  if (!APPLY) {
    console.log("\nTrockenlauf beendet. Mit --apply ausfuehren.");
    return;
  }

  for (const [von, nach] of umleitungen) {
    const zustand = await redirect(von, nach);
    console.log(`  ok ${von} -> ${nach} (301 ${zustand})`);
  }
  // Erst umleiten, dann verstecken: so laeuft die alte Adresse nie ins Leere.
  await schreibe(AVIN, "de", { hideFromPublic: true });

  // ------------------------------------------------------------- Gegenprobe
  console.log("\nGegenprobe (oeffentliche API, ohne Token):");
  let fehler = 0;

  for (const [documentId, name] of [
    [WEBER, "Weber"],
    [AVIN, "Avin (alt)"],
  ] as const) {
    const e = await lade(documentId, "de", false);
    // Versteckte Eintraege liefert die oeffentliche API weiter aus; die
    // Profilseite wertet das Feld aus. Also das Feld pruefen, nicht die Existenz.
    if (e && !e.hideFromPublic) {
      fehler++;
      console.log(`  OFFEN ${name}: hideFromPublic ist weiterhin false`);
    } else {
      console.log(`  ok    ${name} ist versteckt`);
    }
  }

  const m = await lade(MOHAMMAD, "de", false);
  const neuerName = [m?.firstName, m?.lastName].filter(Boolean).join(" ");
  if (neuerName !== `${ZIEL.firstName} ${ZIEL.lastName}` || m?.slug !== ZIEL.slug) {
    fehler++;
    console.log(`  OFFEN zusammengelegtes Profil: "${neuerName}" / ${m?.slug}`);
  } else {
    console.log(`  ok    "${neuerName}" unter ${SEKTION.de}/${m?.slug}`);
  }
  if (fotoId && !m?.photo) {
    fehler++;
    console.log("  OFFEN Foto wurde nicht uebernommen");
  }

  for (const [von, nach] of umleitungen) {
    const { data } = await strapi<{ data: Array<{ to: string }> }>(
      `/api/redirects?filters[from][$eq]=${encodeURIComponent(von)}&fields[0]=to`,
      {},
      false,
    );
    if (data.length === 0 || data[0]?.to !== nach) {
      fehler++;
      console.log(`  FEHLT ${von}`);
    }
  }

  console.log(
    fehler === 0
      ? "  Alles wie geplant."
      : `  ${fehler} Punkt(e) offen -- oben nachsehen.`,
  );
  console.log(
    "  Hinweis: der Server cacht die Redirect-Liste 5 Minuten, die Profilseiten\n" +
      "  liegen zusaetzlich 3 Stunden im ISR-Cache (routeRules in nuxt.config.ts).",
  );

  if (fehler > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
