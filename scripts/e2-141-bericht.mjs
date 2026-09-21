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

  for (const [titel, zusatz, hinweis] of [
    ['Nur bezahlte Suche (die Zahl aus dem Ticket)', { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Paid Search' } }, null],
    ['Alle Quellen', null,
      'Die Quote hier ist KEINE Trichterquote: invitee_event_type_page feuert auch\n'
      + 'fuer direkte Calendly-Links aus Mail, WhatsApp und Anzeigen, die nie ueber\n'
      + 'unseren Knopf laufen (14.09.: 374 Kalender bei 0 Klicks). Nur als Grundrauschen lesen.'],
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
    if (quote === null) console.log('Urteil: keine click_booking im Zeitraum — nichts zu beurteilen.');
    else if (quote >= 70) console.log(`Urteil: Abnahmeschwelle (70 %) erreicht — ${quote} %.`);
    else console.log(`Urteil: unter der Abnahmeschwelle — ${quote} % statt 70 %.`);
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
  console.log('## Ladezeit-Messung (booking_embed_ready)');
  if (n > 0) console.log(`${n} Ereignisse — kommt an. Fuer embed_ready_ms/embed_prewarmed muessen beide noch als benutzerdefinierte Metrik bzw. Dimension in GA4 registriert sein.`);
  else console.log('0 Ereignisse. Der GTM-Container laesst den Namen nicht durch (Ausloeser-Regex, Liste erlaubter Ereignisnamen) — bis das ergaenzt ist, gibt es keine Ladezeitmessung aus dem Feld.');
};

main().catch((e) => { console.error('Fehlgeschlagen:', e.message); process.exit(1); });
