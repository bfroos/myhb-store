/**
 * Entfernt unbelegte Doktortitel aus den Arzt-Eintraegen in Strapi.
 *
 * ANLASS (16.09.2026): Auf /aerzte trugen 26 von 27 oeffentlichen Eintraegen
 * ein "Dr." bzw. "DR." -- eingetragen aber nicht im dafuer vorgesehenen Feld
 * `academicTitle`, sondern im Feld `firstName`, waehrend der echte Vorname im
 * Feld `lastName` stand ("DR." + "Katharina"). Der Name wird als
 * [academicTitle, firstName, lastName] zusammengesetzt, deshalb stand auf der
 * Seite "DR. Katharina". In der App-Datenbank traegt keiner dieser Namen einen
 * Titel. Das unbefugte Fuehren eines Doktorgrades ist in Deutschland nach
 * § 132a Abs. 1 Nr. 1 StGB strafbar und wettbewerbsrechtlich abmahnbar.
 *
 * Das Skript verschiebt den echten Vornamen nach `firstName` und leert
 * `lastName`. Aus "DR." + "Katharina" wird "Katharina". Wer eine belegte
 * Promotion hat, gehoert in BELEGTE_PROMOTION und wird nicht angefasst --
 * dort gehoert der Titel in `academicTitle`, so wie bei Gero Ruppert.
 *
 * Aufruf (Trockenlauf, aendert nichts):
 *   STRAPI_TOKEN=... npx tsx scripts/aerzte-titel-bereinigen.mts
 *
 * Aufruf (schreibt):
 *   STRAPI_TOKEN=... npx tsx scripts/aerzte-titel-bereinigen.mts --apply
 *
 * Nach dem Schreiben prueft das Skript ueber die oeffentliche API nach, ob der
 * Titel wirklich weg ist, und meldet jede Zeile einzeln.
 */

const STRAPI_URL = (
  process.env.NUXT_PUBLIC_STRAPI_URL ??
  "https://striking-bear-e5a15ddc94.strapiapp.com"
).replace(/\/+$/, "");

const TOKEN = process.env.STRAPI_TOKEN ?? "";
const APPLY = process.argv.includes("--apply");

/** Sprachen, in denen die Arzt-Eintraege gepflegt sind. */
const LOCALES = ["de", "en", "ar", "tr", "fr", "nl"] as const;

/**
 * Belegte Promotion -- diese Eintraege bleiben unveraendert.
 * documentId (nicht id), weil die ueber alle Sprachen gleich ist.
 * Erweitern, sobald eine Urkunde vorliegt.
 */
const BELEGTE_PROMOTION = new Set<string>([
  "no3ynri9oz14x7y8bussqvdl", // Dr. Gero Ruppert, Chefarzt (Dr. med., Uni Koeln)
]);

/** "Dr", "Dr.", "DR." -- der Titel als ganzer Feldinhalt. */
const NUR_TITEL = /^\s*dr\.?\s*$/i;

type Employee = {
  id: number;
  documentId: string;
  firstName: string | null;
  lastName: string | null;
  academicTitle: string | null;
  slug: string | null;
  locale?: string;
};

/** Nur zum Schreiben noetig -- der Trockenlauf liest oeffentlich. */
function assertToken(): void {
  if (!TOKEN) {
    console.error(
      "Kein STRAPI_TOKEN gesetzt. Aufruf:\n" +
        "  STRAPI_TOKEN=<token> npx tsx scripts/aerzte-titel-bereinigen.mts [--apply]",
    );
    process.exit(1);
  }
}

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
    throw new Error(`${init.method ?? "GET"} ${path} -> ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T;
}

async function ladeEintraege(locale: string): Promise<Employee[]> {
  const felder = ["firstName", "lastName", "academicTitle", "slug"]
    .map((f, i) => `fields[${i}]=${f}`)
    .join("&");
  const { data } = await strapi<{ data: Employee[] }>(
    `/api/employees?pagination[pageSize]=200&locale=${locale}&${felder}`,
  );
  return data.map((e) => ({ ...e, locale }));
}

/** Was muss an diesem Eintrag geaendert werden -- oder nichts? */
function planen(e: Employee): { firstName: string; lastName: string } | null {
  if (BELEGTE_PROMOTION.has(e.documentId)) return null;

  const vorname = (e.firstName ?? "").trim();
  const nachname = (e.lastName ?? "").trim();
  if (!NUR_TITEL.test(vorname)) return null;

  // Ohne echten Namen im zweiten Feld waere die Zeile nach der Aenderung leer.
  if (!nachname) return null;

  return { firstName: nachname, lastName: "" };
}

async function main(): Promise<void> {
  if (APPLY) assertToken();

  console.log(`Strapi: ${STRAPI_URL}`);
  console.log(APPLY ? "MODUS: schreiben (--apply)\n" : "MODUS: Trockenlauf\n");

  const offen: Array<{ e: Employee; neu: { firstName: string; lastName: string } }> = [];
  const titelImFeld: Employee[] = [];

  for (const locale of LOCALES) {
    let eintraege: Employee[];
    try {
      eintraege = await ladeEintraege(locale);
    } catch (err) {
      console.warn(`Sprache ${locale} uebersprungen: ${(err as Error).message}`);
      continue;
    }
    for (const e of eintraege) {
      const neu = planen(e);
      if (neu) offen.push({ e, neu });

      // Zweiter Fall: Titel steht korrekt in academicTitle, ist aber nicht belegt.
      const titel = (e.academicTitle ?? "").trim();
      if (titel && /dr\.?/i.test(titel) && !BELEGTE_PROMOTION.has(e.documentId)) {
        titelImFeld.push(e);
      }
    }
  }

  if (offen.length === 0) {
    console.log("Nichts zu tun: kein Eintrag traegt einen Titel im Namensfeld.");
  }

  for (const { e, neu } of offen) {
    const alt = [e.academicTitle, e.firstName, e.lastName]
      .map((s) => (s ?? "").trim())
      .filter(Boolean)
      .join(" ");
    console.log(
      `[${e.locale}] ${e.slug ?? e.documentId}: "${alt}" -> "${neu.firstName}"`,
    );
  }

  if (titelImFeld.length > 0) {
    console.log("\nTitel steht in academicTitle und ist nicht als belegt hinterlegt:");
    for (const e of titelImFeld) {
      console.log(
        `  [${e.locale}] ${e.slug ?? e.documentId}: academicTitle="${e.academicTitle}" ` +
          `(pruefen; wenn belegt, documentId in BELEGTE_PROMOTION aufnehmen)`,
      );
    }
  }

  if (!APPLY) {
    console.log(
      `\n${offen.length} Aenderung(en) vorgemerkt. Mit --apply ausfuehren.`,
    );
    return;
  }

  console.log(`\nSchreibe ${offen.length} Aenderung(en) ...`);
  let fehler = 0;
  for (const { e, neu } of offen) {
    try {
      await strapi(`/api/employees/${e.documentId}?locale=${e.locale}&status=published`, {
        method: "PUT",
        body: JSON.stringify({ data: neu }),
      });
      console.log(`  ok   [${e.locale}] ${e.slug ?? e.documentId}`);
    } catch (err) {
      fehler++;
      console.error(`  FEHL [${e.locale}] ${e.slug ?? e.documentId}: ${(err as Error).message}`);
    }
  }

  // Gegenprobe ueber die oeffentliche API: steht da noch ein Titel?
  console.log("\nGegenprobe (oeffentliche API, ohne Token):");
  let uebrig = 0;
  for (const locale of LOCALES) {
    let eintraege: Employee[];
    try {
      const felder = ["firstName", "lastName", "academicTitle", "slug"]
        .map((f, i) => `fields[${i}]=${f}`)
        .join("&");
      const { data } = await strapi<{ data: Employee[] }>(
        `/api/employees?pagination[pageSize]=200&locale=${locale}&${felder}`,
        {},
        false,
      );
      eintraege = data.map((x) => ({ ...x, locale }));
    } catch {
      continue;
    }
    for (const e of eintraege) {
      if (BELEGTE_PROMOTION.has(e.documentId)) continue;
      const name = [e.academicTitle, e.firstName, e.lastName]
        .map((s) => (s ?? "").trim())
        .filter(Boolean)
        .join(" ");
      if (/\bdr\.?\b/i.test(name)) {
        uebrig++;
        console.log(`  OFFEN [${locale}] ${e.slug ?? e.documentId}: "${name}"`);
      }
    }
  }

  console.log(
    uebrig === 0
      ? "  Kein unbelegter Titel mehr in den Namen."
      : `  ${uebrig} Eintrag/Eintraege tragen weiter einen Titel -- oben nachsehen.`,
  );

  if (fehler > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
