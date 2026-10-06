/**
 * Strapi-Datenmigration zur Standort-Konsolidierung Köln
 * (Ticket "Standortarchitektur Köln konsolidieren"; Code: myhb-cms
 * src/utils/locationTreatmentRouting.ts, myhb-store PR derselben Branch).
 *
 * WARUM DATEN UND NICHT NUR CODE: Die Redirect-Middleware liest die Strapi-
 * Collection `redirects` VOR der Seite. Ein falscher Strapi-Redirect schlaegt
 * also die neue Standortregel. Heute zeigen dort 16 Köln-Eintraege ins Leere:
 *   - 9 Selbst-Redirects (from == to) -> wirkungslos, MediaPark-Duplikate
 *     wie /mediapark-klinik/hyaluron/hylase lieferten deshalb 200
 *   - 6 Ziele auf nationale /behandlungen/...-Seiten statt auf den Standort
 *   - 1 Ziel auf /koeln-arcaden/botox-rabatt (404 im SEO-Baum)
 *
 * Optional (--typen): Behandlungstypen korrigieren. "Facelift" und die
 * Kategorie "Schönheits-OPs" stehen auf minimally-invasive. Die Standortregel
 * faengt das ueber die Kategorie-Regel ab; die Korrektur ist fachlich richtig,
 * hat aber eine Nebenwirkung AUSSERHALB Kölns: Lounges anderer Staedte zeigen
 * Facelift/Schönheits-OPs dann nicht mehr in ihren Kacheln. Deshalb getrennt
 * und nur nach Freigabe.
 *
 * Aufruf (Trockenlauf, aendert nichts):
 *   npx tsx scripts/koeln-konsolidierung-strapi.mts
 * Schreiben (Redirects):
 *   npx tsx scripts/koeln-konsolidierung-strapi.mts --apply
 * Zusaetzlich Behandlungstypen:
 *   npx tsx scripts/koeln-konsolidierung-strapi.mts --apply --typen
 * Rueckgaengig (schreibt die vorherigen Werte zurueck):
 *   npx tsx scripts/koeln-konsolidierung-strapi.mts --rollback --apply [--typen]
 *
 * Jede Zeile wird vor dem Schreiben gegen den erwarteten Ist-Wert geprueft;
 * weicht Strapi ab (jemand hat inzwischen etwas geaendert), wird die Zeile
 * uebersprungen und gemeldet.
 */

import { ladeToken } from "./strapiToken.mts";

const STRAPI_URL = (
  process.env.NUXT_PUBLIC_STRAPI_URL ??
  "https://striking-bear-e5a15ddc94.strapiapp.com"
).replace(/\/+$/, "");

const APPLY = process.argv.includes("--apply");
const TYPEN = process.argv.includes("--typen");
const ROLLBACK = process.argv.includes("--rollback");
let TOKEN = (process.env.STRAPI_TOKEN ?? "").trim();

const A = "/standorte/koeln/koeln-arcaden/";
const M = "/standorte/koeln/mediapark-klinik/";

/** documentId, from, Ist-Ziel (vorher), Soll-Ziel (nachher), Grund */
const REDIRECTS: [string, string, string, string, string][] = [
  ["vld7grwyt02g4ev3f6brs1nj", A + "schoenheitsoperationen/haartransplantation", "/behandlungen/schoenheitsoperationen/haartransplantation", M + "schoenheitsoperationen/haartransplantation", "Ziel national"],
  ["ogp93as25vbl8tn3f65qqb7n", A + "schoenheitsoperationen/bauchdeckenstraffung", "/behandlungen/schoenheitsoperationen/bauchdeckenstraffung", M + "schoenheitsoperationen/bauchdeckenstraffung", "Ziel national"],
  ["f6np1b5wsbcysy3fysf3az4x", A + "schoenheitsoperationen/lidstraffung", "/behandlungen/schoenheitsoperationen/lidstraffung", M + "schoenheitsoperationen/lidstraffung", "Ziel national"],
  ["hr9p680kyg23ni0279miqewe", M + "hyaluron/augenringe-unterspritzen", M + "hyaluron/augenringe-unterspritzen", A + "hyaluron/augenringe-unterspritzen", "Selbst-Redirect"],
  ["kkfnxspev457xa4y2w4u8g3l", M + "hyaluron/hylase", M + "hyaluron/hylase", A + "hyaluron/hylase", "Selbst-Redirect"],
  ["dgytgnlv0oateit4k5sb3iu2", M + "hyaluron/lippenkorrektur", M + "hyaluron/lippenkorrektur", A + "hyaluron/lippenkorrektur", "Selbst-Redirect"],
  ["dom5fdw9l6cjbujhu39ldbrt", M + "hyaluron/lippen-aufspritzen", M + "hyaluron/lippen-aufspritzen", A + "hyaluron/lippen-aufspritzen", "Selbst-Redirect"],
  ["st5tcyiu64lurq3937puycxj", M + "hyaluron/dekolletee", M + "hyaluron/dekolletee", A + "hyaluron/dekolletee", "Selbst-Redirect"],
  ["wgzl3z980158qx9yuy3yqzpj", M + "hyaluron/wangenaufbau", M + "hyaluron/wangenaufbau", A + "hyaluron/wangenaufbau", "Selbst-Redirect"],
  ["g546fwdy7k3bzvds1a97a3jk", M + "hyaluron/nasolabialfalte", M + "hyaluron/nasolabialfalte", A + "hyaluron/nasolabialfalte", "Selbst-Redirect"],
  ["bhyeb6jmwbh7r8czmo9c0xq7", M + "hyaluron/haende", "/behandlungen/hyaluron/haende", A + "hyaluron/haende", "Ziel national"],
  ["a82c4s1v9wtb1jhc7nvwqtff", M + "hyaluron/kinnkorrektur", M + "hyaluron/kinnkorrektur", A + "hyaluron/kinnkorrektur", "Selbst-Redirect"],
  ["t8kw7i9a3qzs9sedxw0fzoab", M + "fettwegspritze/lemon-bottle-oberarm", M + "fettwegspritze/lemon-bottle-oberarm", A + "fettwegspritze/lemon-bottle-oberarm", "Selbst-Redirect"],
  ["j4djzd84g6qgpuicz4w9lewv", M + "botox-rabatt", A + "botox-rabatt", A + "botox", "Ziel 404 (nur go.-Baum) - PRUEFEN"],
  ["rp1wjokwtuki3f953kobsv1k", M + "hair-boost-infusion4", "/behandlungen/anti-haarausfall/hair-boost-infusion4", A + "anti-haarausfall/hair-boost-infusion4", "Ziel national"],
  ["vt5yqz1m6dc0wm9m2ke3imee", M + "skinbooster/vampir-lifting-prp", "/behandlungen/skinbooster/vampir-lifting-prp", A + "skinbooster/vampir-lifting-prp", "Ziel national"],
];

/** documentId, Name, Ist-Typ, Soll-Typ */
const TYPEN_KORREKTUR: [string, string, string, string][] = [
  ["w5q7duceecqppy3o3u8wp7bw", "Facelift", "minimally-invasive", "operational"],
  ["i5qaggd62y3lldf8u6zh74la", "Schönheits-OPs (Kategorie)", "minimally-invasive", "abulatory"],
];

async function strapi(path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${path}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const norm = (p: string) => {
  let v = (p || "").trim();
  if (/^https?:\/\//.test(v)) v = new URL(v).pathname;
  if (!v.startsWith("/")) v = "/" + v;
  return v.length > 1 ? v.replace(/\/+$/, "") : v;
};

async function main() {
  console.log(`${APPLY ? "SCHREIBT" : "Trockenlauf"}${ROLLBACK ? " (ROLLBACK)" : ""} gegen ${STRAPI_URL}\n`);
  if (APPLY && !TOKEN) TOKEN = await ladeToken();

  let fehler = 0;
  for (const [documentId, from, vorher, nachher, grund] of REDIRECTS) {
    const [ist, soll] = ROLLBACK ? [nachher, vorher] : [vorher, nachher];
    const aktuell = (await strapi(`/api/redirects/${documentId}`)).data;
    if (norm(aktuell?.from) !== norm(from)) {
      console.log(`  ! ${documentId} from weicht ab (${aktuell?.from}) - uebersprungen`);
      fehler++;
      continue;
    }
    if (norm(aktuell.to) === norm(soll)) {
      console.log(`  = ${from} -> ${soll} (bereits gesetzt)`);
      continue;
    }
    if (norm(aktuell.to) !== norm(ist)) {
      console.log(`  ! ${from}: Ziel ist "${aktuell.to}", erwartet "${ist}" - uebersprungen`);
      fehler++;
      continue;
    }
    console.log(`  ${APPLY ? "~" : "?"} ${from}\n      ${aktuell.to} -> ${soll}   [${grund}]`);
    if (APPLY) {
      await strapi(`/api/redirects/${documentId}`, {
        method: "PUT",
        body: JSON.stringify({ data: { to: soll, code: 301 } }),
      });
    }
  }

  if (TYPEN) {
    console.log("\nBehandlungstypen:");
    for (const [documentId, name, vorher, nachher] of TYPEN_KORREKTUR) {
      const [ist, soll] = ROLLBACK ? [nachher, vorher] : [vorher, nachher];
      const aktuell = (await strapi(`/api/treatments/${documentId}?locale=de&fields[0]=type`)).data;
      if (aktuell?.type === soll) {
        console.log(`  = ${name}: ${soll} (bereits gesetzt)`);
        continue;
      }
      if (aktuell?.type !== ist) {
        console.log(`  ! ${name}: Typ ist "${aktuell?.type}", erwartet "${ist}" - uebersprungen`);
        fehler++;
        continue;
      }
      console.log(`  ${APPLY ? "~" : "?"} ${name}: ${ist} -> ${soll}`);
      if (APPLY) {
        // type ist nicht lokalisiert; Schreiben ueber de reicht.
        await strapi(`/api/treatments/${documentId}?locale=de&status=published`, {
          method: "PUT",
          body: JSON.stringify({ data: { type: soll } }),
        });
      }
    }
  }

  console.log(`\n${fehler ? `${fehler} Zeile(n) uebersprungen - bitte pruefen.` : "Fertig."}`);
  if (!APPLY) console.log("Trockenlauf: nichts geschrieben. Mit --apply ausfuehren.");
  console.log(
    "\nManuell in Strapi (Rich Text, nicht skriptbar):\n" +
      "  Blog \"was-hilft-gegen-haarausfall\":\n" +
      `    ${M}anti-haarausfall/prp-haartherapie -> ${A}anti-haarausfall/prp-haartherapie\n` +
      `    ${M}anti-haarausfall/mesotherapie-haare -> ${A}anti-haarausfall/mesotherapie-haare\n` +
      "Danach: Vercel-Deployment neu ausrollen oder /api/revalidate fuer die Köln-Pfade, damit der ISR-Cache die neuen Redirects zeigt.",
  );
  process.exit(fehler ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
