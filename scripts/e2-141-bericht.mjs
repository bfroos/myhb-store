#!/usr/bin/env node
/**
 * E2-141 — Tagesbericht: Kommen Klicker im Kalender an?
 *
 * Abnahmekriterium des Tickets: `invitee_event_type_page` soll mindestens 70 %
 * der `click_booking` erreichen (Ausgangslage 25 %). Dieses Skript liest beides
 * aus GA4 (Data API, Property 386323763, Service-Account wie
 * myhb-os/docs/ga4-data-api-zugang.md) und faellt das Urteil selbst.
 *
 * Nur volle Tage: GA4 hat rund fuenf Stunden Verarbeitungsrueckstand und die
 * letzten Stunden fuellen sich nach — am Rand des Fensters nie urteilen.
 *
 * Read-only. Nimmt nichts an, was es nicht gemessen hat.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PROPERTY = process.env.GA4_PROPERTY_ID || '386323763';
const KEYPFAD = process.env.GA4_SERVICE_ACCOUNT_KEY
  || path.join(os.homedir(), '.config/ga4/service-account.json');
const TAGE = Number(process.env.TAGE || 7);

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
  if (!res.ok) throw new Error(`Token ${res.status}: ${d.error_description || JSON.stringify(d).slice(0, 200)}`);
  return d.access_token;
};

const bericht = async (tok, body) => {
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

const EREIGNISSE = ['click_booking', 'invitee_event_type_page', 'booking_confirmed'];

// Unter so vielen click_booking im Zeitraum wird nicht geurteilt: bezahlte Suche
// bringt 3–5 Ereignisse am Tag, da kippt die Quote an einem einzigen Klick.
const MINDEST_N = 30;

const quantil = (werte, p) => {
  if (!werte.length) return null;
  const s = [...werte].sort((a, b) => a - b);
  const i = (s.length - 1) * p;
  const lo = Math.floor(i), hi = Math.ceil(i);
  return Math.round(s[lo] + (s[hi] - s[lo]) * (i - lo));
};

const main = async () => {
  let key;
  try { key = JSON.parse(fs.readFileSync(KEYPFAD, 'utf8')); }
  catch { console.error(`Kein GA4-Schluessel unter ${KEYPFAD}`); process.exit(1); }
  const tok = await token(key);

  const VON = tag(TAGE), BIS = tag(1); // gestern zurueck, nur volle Tage
  console.log(`E2-141 — Kalender-Erreichbarkeit, ${VON} bis ${BIS} (volle Tage, GA4 ${PROPERTY})\n`);

  const basis = {
    dateRanges: [{ startDate: VON, endDate: BIS }],
    dimensions: [{ name: 'date' }, { name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: EREIGNISSE } } },
    limit: 1000,
  };

  for (const [titel, zusatz, hinweis, urteilen] of [
    ['Nur bezahlte Suche (die Zahl aus dem Ticket)', { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Paid Search' } }, null, true],
    ['Alle Quellen', null,
      'Die Quote hier ist KEINE Trichterquote: invitee_event_type_page feuert auch\n'
      + 'fuer direkte Calendly-Links aus Mail, WhatsApp und Anzeigen, die nie ueber\n'
      + 'unseren Knopf laufen (14.09.: 374 Kalender bei 0 Klicks). Nur als Grundrauschen lesen.', false],
  ]) {
    const body = { ...basis };
    if (zusatz) {
      body.dimensionFilter = {
        andGroup: {
          expressions: [
            { filter: basis.dimensionFilter.filter },
            { filter: zusatz },
          ],
        },
      };
    }
    const d = await bericht(tok, body);
    if (d.fehler) { console.log(`${titel}: Abfrage fehlgeschlagen — ${d.fehler}\n`); continue; }

    const proTag = new Map();
    for (const r of d.rows || []) {
      const [datum, ev] = r.dimensionValues.map((v) => v.value);
      const n = Number(r.metricValues[0].value);
      if (!proTag.has(datum)) proTag.set(datum, {});
      proTag.get(datum)[ev] = n;
    }
    console.log(`## ${titel}`);
    if (hinweis) console.log(hinweis);
    console.log('Tag         click_booking  Kalender erreicht  Quote   gebucht');
    let sk = 0, si = 0, sb = 0;
    for (const datum of [...proTag.keys()].sort()) {
      const z = proTag.get(datum);
      const k = z.click_booking || 0, i = z.invitee_event_type_page || 0, b = z.booking_confirmed || 0;
      sk += k; si += i; sb += b;
      const q = k ? `${Math.round((i / k) * 100)} %` : '—';
      console.log(`${datum}  ${String(k).padStart(11)}  ${String(i).padStart(17)}  ${q.padStart(6)}  ${String(b).padStart(8)}`);
    }
    const quote = sk ? Math.round((si / sk) * 100) : null;
    console.log(`Summe       ${String(sk).padStart(11)}  ${String(si).padStart(17)}  ${(quote === null ? '—' : quote + ' %').padStart(6)}  ${String(sb).padStart(8)}`);
    if (!urteilen) {
      console.log('Kein Urteil: diese Quote ist keine Trichterquote (siehe Hinweis oben).');
    } else if (quote === null) {
      console.log('Urteil: keine click_booking im Zeitraum — nichts zu beurteilen.');
    } else if (sk < MINDEST_N) {
      console.log(`Urteil: Datenbasis zu duenn — ${sk} click_booking im Zeitraum (unter ${MINDEST_N}).`);
      console.log(`        ${quote} % waeren hier ein Zufallswert; mit TAGE=28 weiten oder abwarten.`);
    } else if (quote >= 70) {
      console.log(`Urteil: Abnahmeschwelle (70 %) erreicht — ${quote} %.`);
    } else {
      console.log(`Urteil: unter der Abnahmeschwelle — ${quote} % statt 70 %.`);
    }
    console.log();
  }

  // Kommt das neue Timing-Ereignis ueberhaupt an?
  const d = await bericht(tok, {
    dateRanges: [{ startDate: VON, endDate: BIS }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'booking_embed_ready' } } },
  });
  const n = d.rows && d.rows[0] ? Number(d.rows[0].metricValues[0].value) : 0;
  console.log('## Ladezeit-Messung (booking_embed_ready) — die Leitkennzahl');
  if (n === 0) {
    console.log('0 Ereignisse. Der GTM-Container laesst den Namen nicht durch (Ausloeser-Regex, Liste erlaubter Ereignisnamen) — bis das ergaenzt ist, gibt es keine Ladezeitmessung aus dem Feld.');
    return;
  }
  console.log(`${n} Ereignisse im Zeitraum.`);

  // embed_ready_ms gibt die Data API nur als Summe her. Ueber die Minute als
  // Dimension zerfaellt das in viele Zeilen mit genau einem Ereignis — deren
  // Summe *ist* der Einzelwert. Nur aus diesen wird die Verteilung gerechnet.
  const fein = await bericht(tok, {
    dateRanges: [{ startDate: VON, endDate: BIS }],
    dimensions: [{ name: 'dateHourMinute' }, { name: 'customEvent:embed_prewarmed' }],
    metrics: [{ name: 'eventCount' }, { name: 'customEvent:embed_ready_ms' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'booking_embed_ready' } } },
    limit: 100000,
  });
  if (fein.fehler) {
    console.log(`Verteilung nicht abrufbar — ${fein.fehler}`);
    console.log('Fehlt embed_ready_ms als benutzerdefinierte Metrik oder embed_prewarmed als Dimension, hier in GA4 nachtragen.');
    return;
  }

  const einzel = new Map();
  let gesamt = 0, einzeln = 0;
  for (const r of fein.rows || []) {
    const vorgewaermt = r.dimensionValues[1].value;
    const anzahl = Number(r.metricValues[0].value);
    const summe = Number(r.metricValues[1].value);
    gesamt += anzahl;
    if (anzahl !== 1) continue; // Mischzeilen sagen nichts ueber den Einzelwert
    einzeln += 1;
    if (!einzel.has(vorgewaermt)) einzel.set(vorgewaermt, []);
    einzel.get(vorgewaermt).push(summe);
  }
  const alle = [...einzel.values()].flat();
  if (!alle.length) { console.log('Keine Einzelwerte isolierbar — Verteilung diesmal nicht belastbar.'); return; }

  console.log(`Verteilung aus ${einzeln} eindeutigen Einzelwerten (von ${gesamt} Ereignissen):`);
  console.log('vorgewaermt       n   Median      p90  schlechtester');
  for (const [vorgewaermt, werte] of [...einzel.entries()].sort()) {
    console.log(`${String(vorgewaermt).padEnd(12)}${String(werte.length).padStart(5)}`
      + `${(quantil(werte, 0.5) + ' ms').padStart(9)}${(quantil(werte, 0.9) + ' ms').padStart(9)}`
      + `${(Math.max(...werte) + ' ms').padStart(15)}`);
  }
  console.log(`gesamt      ${String(alle.length).padStart(5)}${(quantil(alle, 0.5) + ' ms').padStart(9)}`
    + `${(quantil(alle, 0.9) + ' ms').padStart(9)}${(Math.max(...alle) + ' ms').padStart(15)}`);
  const zaeh = (s) => alle.filter((v) => v >= s).length;
  console.log(`ueber 3 s: ${zaeh(3000)} von ${alle.length} · ueber 12 s (Beschwerde aus dem Ticket): ${zaeh(12000)}`);
};

main().catch((e) => { console.error('Fehlgeschlagen:', e.message); process.exit(1); });
