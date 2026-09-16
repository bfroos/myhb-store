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
 * Zusaetzlich die Slugs (--slugs): die URLs tragen den Titel ebenfalls
 * (/aerzte/dr-katharina). Mit --slugs wird der Slug auf den Anzeigenamen
 * umgestellt und fuer die alte URL ein 301 in der Strapi-Collection
 * `redirects` angelegt -- je Sprache mit ihrem eigenen Routen-Segment
 * (/aerzte, /en/doctors, /tr/doktorlar, /ar/atibba, /fr/medecins, /nl/artsen).
 *   STRAPI_TOKEN=... npx tsx scripts/aerzte-titel-bereinigen.mts --slugs --apply
 *
 * Ohne --apply ist alles Trockenlauf. Nach dem Schreiben prueft das Skript
 * ueber die oeffentliche API nach und meldet jede Zeile einzeln.
 */

const STRAPI_URL = (
  process.env.NUXT_PUBLIC_STRAPI_URL ??
  "https://striking-bear-e5a15ddc94.strapiapp.com"
).replace(/\/+$/, "");

const TOKEN = process.env.STRAPI_TOKEN ?? "";
const APPLY = process.argv.includes("--apply");
const SLUGS = process.argv.includes("--slugs");

/** Sprachen, in denen die Arzt-Eintraege gepflegt sind. */
const LOCALES = ["de", "en", "ar", "tr", "fr", "nl"] as const;

type Locale = (typeof LOCALES)[number];

/**
 * Routen-Segment je Sprache, inklusive Sprachpraefix. Muss zur Zuordnung
 * "aerzte/[slug]" in nuxt.config.ts passen; strategy ist prefix_except_default,
 * deutsch laeuft also ohne Praefix. resolveRedirect() vergleicht den rohen
 * Pfad, deshalb muss `from` genau diese Form haben.
 */
const SEKTION: Record<Locale, string> = {
  de: "/aerzte",
  en: "/en/doctors",
  tr: "/tr/doktorlar",
  ar: "/ar/atibba",
  fr: "/fr/medecins",
  nl: "/nl/artsen",
};

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

/**
 * Ein abgelehnter Token darf nicht als "nichts zu tun" durchgehen: die Lese-
 * aufrufe tragen den Token mit, ein ungueltiger liefert 401 auf alles, und
 * ohne diese Pruefung meldet das Skript faelschlich Erfolg.
 */
async function pruefeToken(): Promise<void> {
  if (!TOKEN) return;
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

/** Name, wie er nach der Titel-Bereinigung auf der Seite steht. */
function anzeigename(e: Employee): string {
  return [e.academicTitle, e.firstName, e.lastName]
    .map((s) => (s ?? "").trim())
    .filter((s) => s && !NUR_TITEL.test(s))
    .join(" ");
}

function slugify(wert: string): string {
  return wert
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SlugPlan = {
  e: Employee;
  alterSlug: string;
  neuerSlug: string;
  von: string;
  nach: string;
};

/** Nur Slugs, die den Titel tragen. `employee` oder `katharina-makhlin` bleiben. */
function slugPlanen(e: Employee, belegteSlugs: Set<string>): SlugPlan | null {
  if (BELEGTE_PROMOTION.has(e.documentId)) return null;

  const alterSlug = (e.slug ?? "").trim();
  if (!/^dr-/i.test(alterSlug)) return null;

  const neuerSlug = slugify(anzeigename(e));
  if (!neuerSlug || neuerSlug === alterSlug) return null;

  // Zwei Eintraege duerfen in derselben Sprache nicht auf denselben Slug fallen.
  if (belegteSlugs.has(neuerSlug)) {
    console.warn(
      `  ! [${e.locale}] ${alterSlug}: "${neuerSlug}" ist in dieser Sprache schon vergeben -- uebersprungen`,
    );
    return null;
  }

  const sektion = SEKTION[e.locale as Locale];
  return {
    e,
    alterSlug,
    neuerSlug,
    von: `${sektion}/${alterSlug}`,
    nach: `${sektion}/${neuerSlug}`,
  };
}

/** Legt den 301 an, falls er noch nicht existiert, und veroeffentlicht ihn. */
async function redirectAnlegen(plan: SlugPlan): Promise<"neu" | "vorhanden"> {
  const vorhanden = await strapi<{ data: Array<{ documentId: string }> }>(
    `/api/redirects?filters[from][$eq]=${encodeURIComponent(plan.von)}&fields[0]=from`,
  );
  if (vorhanden.data.length > 0) return "vorhanden";

  const angelegt = await strapi<{ data: { documentId: string } }>(
    `/api/redirects`,
    {
      method: "POST",
      body: JSON.stringify({
        data: { from: plan.von, to: plan.nach, code: 301 },
      }),
    },
  );

  // Draft & Publish: ohne diesen Schritt liest die oeffentliche API -- und
  // damit die Redirect-Middleware -- den Eintrag nicht. Hat die Collection
  // kein Draft & Publish, laeuft der Aufruf ins Leere; das ist kein Fehler,
  // die Gegenprobe am Ende sagt ohnehin die Wahrheit.
  try {
    await strapi(`/api/redirects/${angelegt.data.documentId}?status=published`, {
      method: "PUT",
      body: JSON.stringify({ data: {} }),
    });
  } catch {
    // bewusst geschluckt -- siehe Kommentar oben
  }

  return "neu";
}

async function slugPhase(): Promise<void> {
  console.log("\n--- Slugs und Redirects ---\n");

  const plaene: SlugPlan[] = [];
  const nichtGelesen: string[] = [];
  for (const locale of LOCALES) {
    let eintraege: Employee[];
    try {
      eintraege = await ladeEintraege(locale);
    } catch (err) {
      console.error(`Sprache ${locale} nicht lesbar: ${(err as Error).message}`);
      nichtGelesen.push(locale);
      continue;
    }
    // Belegte Slugs dieser Sprache: bestehende plus die schon eingeplanten.
    const belegt = new Set(
      eintraege.map((x) => (x.slug ?? "").trim()).filter(Boolean),
    );
    for (const e of eintraege) {
      const plan = slugPlanen(e, belegt);
      if (!plan) continue;
      belegt.add(plan.neuerSlug);
      plaene.push(plan);
    }
  }

  for (const p of plaene) {
    console.log(`[${p.e.locale}] ${p.von} -> ${p.nach}`);
  }

  if (nichtGelesen.length > 0) {
    console.error(
      `\nAbgebrochen: ${nichtGelesen.join(", ")} liessen sich nicht lesen.`,
    );
    process.exit(1);
  }

  if (plaene.length === 0) {
    console.log("Kein Slug traegt noch einen Titel.");
    return;
  }

  if (!APPLY) {
    console.log(`\n${plaene.length} Slug-Aenderung(en) vorgemerkt. Mit --apply ausfuehren.`);
    return;
  }

  console.log(`\nSchreibe ${plaene.length} Slug-Aenderung(en) ...`);
  let fehler = 0;
  for (const p of plaene) {
    try {
      // Erst der Slug, dann der Redirect: andersherum zeigte der 301 eine
      // Zeit lang auf eine Adresse, die es noch nicht gibt.
      await strapi(
        `/api/employees/${p.e.documentId}?locale=${p.e.locale}&status=published`,
        { method: "PUT", body: JSON.stringify({ data: { slug: p.neuerSlug } }) },
      );
      const zustand = await redirectAnlegen(p);
      console.log(`  ok   [${p.e.locale}] ${p.von} -> ${p.nach} (301 ${zustand})`);
    } catch (err) {
      fehler++;
      console.error(`  FEHL [${p.e.locale}] ${p.von}: ${(err as Error).message}`);
    }
  }

  // Gegenprobe: liest die oeffentliche API genau das, was die Middleware liest?
  console.log("\nGegenprobe Redirects (oeffentliche API, ohne Token):");
  let fehlend = 0;
  for (const p of plaene) {
    try {
      const { data } = await strapi<{ data: Array<{ to: string }> }>(
        `/api/redirects?filters[from][$eq]=${encodeURIComponent(p.von)}&fields[0]=to`,
        {},
        false,
      );
      if (data.length === 0 || data[0]?.to !== p.nach) {
        fehlend++;
        console.log(`  FEHLT ${p.von}`);
      }
    } catch {
      fehlend++;
      console.log(`  UNKLAR ${p.von}`);
    }
  }
  console.log(
    fehlend === 0
      ? `  Alle ${plaene.length} Weiterleitungen sind oeffentlich sichtbar.`
      : `  ${fehlend} Weiterleitung(en) fehlen -- oben nachsehen.`,
  );
  console.log(
    "  Hinweis: der Server cacht die Redirect-Liste 5 Minuten. Bis dahin kann\n" +
      "  die alte URL noch ins Leere laufen.",
  );

  if (fehler > 0) process.exit(1);
}

async function main(): Promise<void> {
  if (APPLY) assertToken();
  await pruefeToken();

  console.log(`Strapi: ${STRAPI_URL}`);
  console.log(APPLY ? "MODUS: schreiben (--apply)\n" : "MODUS: Trockenlauf\n");

  const offen: Array<{ e: Employee; neu: { firstName: string; lastName: string } }> = [];
  const titelImFeld: Employee[] = [];
  const nichtGelesen: string[] = [];

  for (const locale of LOCALES) {
    let eintraege: Employee[];
    try {
      eintraege = await ladeEintraege(locale);
    } catch (err) {
      console.error(`Sprache ${locale} nicht lesbar: ${(err as Error).message}`);
      nichtGelesen.push(locale);
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

  if (nichtGelesen.length > 0) {
    console.error(
      `\nAbgebrochen: ${nichtGelesen.join(", ")} liessen sich nicht lesen.\n` +
        "Ein unvollstaendiges Bild darf hier nicht als Ergebnis durchgehen --\n" +
        "sonst sieht ein Fehlschlag aus wie 'nichts zu tun'.",
    );
    process.exit(1);
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
    if (SLUGS) await slugPhase();
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

  if (SLUGS) await slugPhase();

  if (fehler > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
