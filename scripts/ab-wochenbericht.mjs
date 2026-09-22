#!/usr/bin/env node
/**
 * A/B-Test Calendly gegen App-Buchung (#100) — Wochenbericht.
 *
 * Beantwortet die eine Frage, die ueber die Abschaltung von Calendly
 * entscheidet: Bucht mehr, wer die App bekommt, oder wer Calendly bekommt?
 *
 * Gerechnet wird mit einem **geschlossenen Trichter** (runFunnelReport): Klick
 * und Buchung muessen zur selben Kette gehoeren, in dieser Reihenfolge.
 *
 * Die erste Fassung zaehlte "Sitzungen mit Klick" und "Sitzungen mit Buchung"
 * getrennt und teilte sie. Damit war der Zaehler keine Teilmenge des Nenners:
 * Wer ueber einen WhatsApp- oder Mail-Link direkt bei Calendly bucht, aber vom
 * Websitebesuch noch ein A/B-Cookie traegt, landete im Zaehler, ohne je einen
 * Knopf gedrueckt zu haben. Das schoente Calendly — gemessen am 22.09.2026:
 * 23,6 % statt der tatsaechlichen 20,5 %, waehrend die App fast unveraendert
 * blieb. Der Abstand schrumpfte damit von 24 % auf 12 %.
 *
 * ## Was ausgeschlossen wird und warum
 *
 * **Standorte ohne App-Standort** (`OHNE_APP`) fliegen aus **beiden** Armen.
 * Wer dort im App-Arm landet, bekommt ersatzweise Calendly (`ab_fallback`).
 * Diese Sitzungen nur aus dem App-Arm zu entfernen waere falsch — im
 * Calendly-Arm blieben dieselben Menschen drin, und man vergliche zwei
 * verschiedene Personengruppen.
 *
 * **Sitzungen ohne Bucket** (`ab_variant` leer) stehen ausserhalb des Tests:
 * ohne Marketing-Einwilligung kein Cookie, kein Bucket, immer Calendly. Sie
 * hatten am 21.09.2026 mit 26 % die beste Quote und wuerden Calendly
 * kuenstlich gut aussehen lassen.
 *
 * **ads und seo getrennt.** Bezahlter und organischer Verkehr haben
 * verschiedene Grundkonversionsraten; zusammengeworfen kann eine echte Wirkung
 * verschwinden oder eine erfundene entstehen.
 *
 * Read-only.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PROPERTY = process.env.GA4_PROPERTY_ID || '386323763';
const KEYPFAD = process.env.GA4_SERVICE_ACCOUNT_KEY
  || path.join(os.homedir(), '.config/ga4/service-account.json');
const TAGE = Number(process.env.TAGE || 7);

/** Standorte ohne App-Standort — siehe Kopf. Stand 21.09.2026. */
const OHNE_APP = ['mediapark-klinik', 'city-arkaden-wuppertal', 'Allee-Center-Magdeburg'];
/** Ab hier wird ueberhaupt geurteilt; darunter ist es Rauschen. */
const MINDEST_N = 30;

const token = async (key) => {
  const jetzt = Math.floor(Date.now() / 1000);
  const teil = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const kopf = teil({ alg: 'RS256', typ: 'JWT' });
  const rumpf = teil({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: jetzt, exp: jetzt + 3600,
  });
  const sig = crypto.createSign('RSA-SHA256').update(`${kopf}.${rumpf}`).sign(key.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${kopf}.${rumpf}.${sig}`,
    }),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(`Token ${res.status}: ${d.error_description || ''}`);
  return d.access_token;
};

const abfrage = async (tok, body) => {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const d = await res.json();
  if (!res.ok) return { fehler: `${res.status}: ${(d.error && d.error.message) || ''}`.slice(0, 300) };
  return d;
};

const tag = (versatz) => {
  const d = new Date();
  d.setDate(d.getDate() - versatz);
  return d.toISOString().slice(0, 10);
};

const main = async () => {
  let key;
  try { key = JSON.parse(fs.readFileSync(KEYPFAD, 'utf8')); }
  catch { console.error(`Kein GA4-Schluessel unter ${KEYPFAD}`); process.exit(1); }
  const tok = await token(key);
  const VON = tag(TAGE), BIS = tag(1);

  console.log(`A/B Calendly gegen App — ${VON} bis ${BIS} (volle Tage, GA4 ${PROPERTY})`);
  console.log(`Ausgeschlossen: ${OHNE_APP.join(', ')} (kein App-Standort, in beiden Armen)\n`);

  const trichter = async (quelle, arm) => {
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1alpha/properties/${PROPERTY}:runFunnelReport`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate: VON, endDate: BIS }],
          dimensionFilter: {
            andGroup: {
              expressions: [
                { filter: { fieldName: "customEvent:ab_source", stringFilter: { value: quelle } } },
                { filter: { fieldName: "customEvent:ab_variant", stringFilter: { value: arm } } },
                { notExpression: { filter: { fieldName: "customEvent:location_slug", inListFilter: { values: OHNE_APP } } } },
              ],
            },
          },
          funnel: {
            isOpenFunnel: false,
            steps: [
              { name: "Klick", filterExpression: { funnelEventFilter: { eventName: "click_booking" } } },
              { name: "Gebucht", filterExpression: { funnelEventFilter: { eventName: "booking_confirmed" } } },
            ],
          },
        }),
      },
    );
    const d = await res.json();
    if (!res.ok) return { fehler: (d.error && d.error.message) || "unbekannt" };
    const zeilen = ((d.funnelTable || {}).rows || []).filter(
      (r) => !r.dimensionValues.some((v) => v.value === "RESERVED_TOTAL"),
    );
    const wert = (i) => (zeilen[i] ? Number(zeilen[i].metricValues[0].value) : 0);
    return { klick: wert(0), gebucht: wert(1) };
  };

  for (const quelle of ["ads", "seo"]) {
    console.log(`## Herkunft: ${quelle === "ads" ? "bezahlt (go.)" : "organisch (www)"}`);
    console.log(" Arm        Klick auf Buchen   davon gebucht   CR");
    const cr = {};
    for (const arm of ["calendly", "app"]) {
      const r = await trichter(quelle, arm);
      if (r.fehler) { console.log(` ${arm.padEnd(10)} Abfrage fehlgeschlagen — ${r.fehler}`); cr[arm] = null; continue; }
      cr[arm] = r.klick >= MINDEST_N ? r.gebucht / r.klick : null;
      const anzeige = r.klick === 0 ? "—"
        : `${((r.gebucht / r.klick) * 100).toFixed(1)} %` + (r.klick < MINDEST_N ? " (zu duenn)" : "");
      console.log(` ${arm.padEnd(10)} ${String(r.klick).padStart(16)} ${String(r.gebucht).padStart(15)}   ${anzeige}`);
    }
    if (cr.app !== null && cr.calendly) {
      const d2 = (cr.app / cr.calendly - 1) * 100;
      console.log(` Urteil: Die App liegt ${d2 >= 0 ? "+" : ""}${d2.toFixed(0)} % gegenueber Calendly.`
        + (d2 >= 0 ? " Gleichstand erreicht — Abschaltung von Calendly wird besprechbar." : " Noch nicht gleichauf."));
    } else {
      console.log(` Urteil: Datenbasis zu duenn (unter ${MINDEST_N} Klicks je Arm) — nicht klassifizieren.`);
    }
    console.log();
  }

  // Waechter: faellt irgendwo wieder eine App-URL weg, steigt das hier an.
  const f = await abfrage(tok, {
    dateRanges: [{ startDate: VON, endDate: BIS }],
    dimensions: [{ name: 'customEvent:location_slug' }],
    metrics: [{ name: 'sessions' }],
    dimensionFilter: {
      andGroup: {
        expressions: [
          { filter: { fieldName: 'eventName', stringFilter: { value: 'click_booking' } } },
          { filter: { fieldName: 'customEvent:ab_fallback', stringFilter: { value: 'true' } } },
          { notExpression: { filter: { fieldName: 'customEvent:location_slug', inListFilter: { values: OHNE_APP } } } },
        ],
      },
    },
    limit: 50,
  });
  console.log('## Waechter: App-Arm ohne App-URL an Standorten, die eine haben sollten');
  if (f.fehler) console.log(' Abfrage fehlgeschlagen —', f.fehler);
  else if (!f.rows || !f.rows.length) console.log(' keine — alle freigeschalteten Standorte liefern ihre App-URL aus.');
  else {
    console.log(' Hier fehlt eine appBookingUrl in Strapi, das verwaessert den App-Arm:');
    for (const r of f.rows) console.log(`   ${(r.dimensionValues[0].value || '(nicht gesetzt)').padEnd(28)} ${r.metricValues[0].value} Sitzungen`);
  }
};

main().catch((e) => { console.error('Fehlgeschlagen:', e.message); process.exit(1); });
