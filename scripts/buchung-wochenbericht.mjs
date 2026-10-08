#!/usr/bin/env node
/**
 * Wochenbericht Buchung ueber die App — Nachfolger von ab-wochenbericht.mjs.
 *
 * Seit 07.10.2026 (#281) buchen alle ueber die App; den Calendly-Arm gibt es
 * nicht mehr. Die Frage ist jetzt: Wie viele Klicks auf "Buchen" werden zu
 * einem echten Termin, wer erscheint, und wo bricht der App-Trichter ab?
 *
 * Gerechnet wird aus der eigenen Messung `public.funnel_events` (myhb-os#521)
 * und den Terminen in `appointments`, nicht aus GA4. GA4 verlor
 * Calendly-Buchungen, Besucher mit Werbeblocker und lieferte den Vortag erst
 * am naechsten Morgen. Store und App schreiben dieselbe `session_id`
 * (fp_sid), deshalb ist "Klick -> gebucht" ein geschlossener Trichter je
 * Sitzung.
 *
 * ## Was "gebucht" heisst
 *
 * Das App-Ereignis `booking_confirmed` feuert, bevor die Kundin per SMS
 * bestaetigt; am 02.10.2026 wurden 22 % dieser Buchungen nie bestaetigt. Als
 * gebucht zaehlt deshalb nur ein Termin mit `confirmed_at` (oder einer, zu dem
 * die Kundin tatsaechlich erschienen ist). Erscheinen, No-Show und Storno
 * gibt es nur fuer Termine vor heute; juengere sind unreif.
 *
 * ## Quelle
 *
 * `ab_source` (ads = go., seo = www) kommt aus einem Cookie, das nur mit
 * Marketing-Einwilligung gesetzt wird. Klicks ohne Einwilligung stehen unter
 * "unbekannt" — sie buchen trotzdem ueber die App.
 *
 * ## Waechter
 *
 * Ein Standort ohne `appBookingUrl` in Strapi faellt sichtbar auf Calendly
 * zurueck (`ab_fallback` / `booking_type = calendly`). Solche Klicks fehlen
 * im App-Trichter und werden einzeln gemeldet.
 *
 * Aufruf: node scripts/buchung-wochenbericht.mjs   (TAGE=14 weitet das Fenster)
 * Zugang: Supabase-Management-Token unter ~/.config/supabase/access-token,
 * nur der Read-only-Endpunkt. Read-only.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PROJEKT = 'forgsirmbzkxbblepscr';
const TOKENPFAD = process.env.SUPABASE_ACCESS_TOKEN_FILE
  || path.join(os.homedir(), '.config/supabase/access-token');
const TAGE = Number(process.env.TAGE || 7);
/** Ab hier gilt ein Klick ohne Arm als App-Klick (erster App-Klick ohne Arm nach #281). */
const UMSTELLUNG = '2026-10-07T21:56:00Z';
/** Darunter ist eine Quote Rauschen. */
const MINDEST_N = 30;

const token = (() => {
  try { return fs.readFileSync(TOKENPFAD, 'utf8').trim(); }
  catch { console.error(`Kein Supabase-Token unter ${TOKENPFAD}`); process.exit(1); }
})();

const sql = async (query) => {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJEKT}/database/query/read-only`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const d = await res.json().catch(() => null);
  if (!res.ok || !Array.isArray(d)) throw new Error(`SQL ${res.status}: ${JSON.stringify(d).slice(0, 300)}`);
  return d;
};

/** Kalendertag in Berlin, `versatz` Tage vor heute. */
const tag = (versatz) => {
  const d = new Date(Date.now() - versatz * 86400000);
  return d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
};

const SCHRITTE = [
  ['klick', 'Klick auf Buchen'],
  ['geoeffnet', 'App geoeffnet'],
  ['standort', 'Standort gewaehlt'],
  ['behandlung', 'Behandlung gewaehlt'],
  ['termin', 'Termin gewaehlt'],
  ['zusammenfassung', 'Zusammenfassung'],
  ['gebucht_ereignis', 'gebucht (Ereignis)'],
  ['bestaetigt', 'gebucht (bestaetigt)'],
];

/** Ein Fenster [von, bis) in Berliner Tagen; liefert eine Zeile je Quelle plus "gesamt". */
const trichter = (von, bis) => sql(`
with k as (
  select session_id, coalesce(max(ab_source), 'unbekannt') quelle
  from funnel_events
  where surface = 'store' and event = 'click_booking'
    and received_at >= '${von}'::date at time zone 'Europe/Berlin'
    and received_at <  '${bis}'::date at time zone 'Europe/Berlin'
    and coalesce(booking_type, '') <> 'calendly' and not coalesce(ab_fallback, false)
    and (ab_variant = 'app' or (ab_variant is null and received_at >= '${UMSTELLUNG}'))
  group by session_id
),
a as (
  select session_id,
    bool_or(event = 'booking_start') geoeffnet,
    bool_or(event = 'location_selected') standort,
    bool_or(event = 'treatment_selected') behandlung,
    bool_or(event = 'slot_selected') termin,
    bool_or(event = 'summary_view') zusammenfassung,
    bool_or(event = 'booking_confirmed') gebucht_ereignis,
    array_remove(array_agg(distinct appointment_id) filter (where event = 'booking_confirmed'), null) termine
  from funnel_events
  where surface = 'app' and session_id in (select session_id from k)
    and received_at >= '${von}'::date at time zone 'Europe/Berlin'
    and received_at <  ('${bis}'::date + 1) at time zone 'Europe/Berlin'
  group by session_id
),
t as (
  select a.session_id, ap.id, ap.status,
    (ap.confirmed_at is not null or ap.checked_in_at is not null or ap.treatment_started_at is not null
      or ap.status in ('completed', 'checked_in', 'in_treatment')) bestaetigt,
    ap.appointment_date < (now() at time zone 'Europe/Berlin')::date reif,
    (ap.checked_in_at is not null or ap.treatment_started_at is not null
      or ap.status in ('completed', 'checked_in', 'in_treatment')) erschienen,
    (select coalesce(sum(p.total), 0) from payments p
      where p.appointment_id = ap.id and p.payment_status = 'paid' and p.total > 0) umsatz
  from a cross join lateral unnest(a.termine) tid join appointments ap on ap.id = tid
),
s as (
  select k.session_id, k.quelle,
    coalesce(a.geoeffnet, false) geoeffnet, coalesce(a.standort, false) standort,
    coalesce(a.behandlung, false) behandlung, coalesce(a.termin, false) termin,
    coalesce(a.zusammenfassung, false) zusammenfassung, coalesce(a.gebucht_ereignis, false) gebucht_ereignis,
    coalesce(bool_or(t.bestaetigt), false) bestaetigt,
    coalesce(bool_or(t.bestaetigt and t.reif), false) reif,
    coalesce(bool_or(t.bestaetigt and t.reif and t.erschienen), false) erschienen,
    coalesce(bool_or(t.bestaetigt and t.reif and t.status = 'no_show'), false) no_show,
    coalesce(bool_or(t.bestaetigt and t.reif and t.status = 'cancelled')
      and not bool_or(t.erschienen), false) storniert,
    coalesce(sum(t.umsatz) filter (where t.bestaetigt), 0) umsatz
  from k left join a using (session_id) left join t using (session_id)
  group by 1, 2, 3, 4, 5, 6, 7, 8
)
select coalesce(quelle, 'gesamt') quelle,
  count(*) klick, count(*) filter (where geoeffnet) geoeffnet, count(*) filter (where standort) standort,
  count(*) filter (where behandlung) behandlung, count(*) filter (where termin) termin,
  count(*) filter (where zusammenfassung) zusammenfassung, count(*) filter (where gebucht_ereignis) gebucht_ereignis,
  count(*) filter (where bestaetigt) bestaetigt, count(*) filter (where reif) reif,
  count(*) filter (where erschienen) erschienen, count(*) filter (where no_show) no_show,
  count(*) filter (where storniert) storniert, round(sum(umsatz)) umsatz
from s group by rollup (quelle) order by grouping(quelle), count(*) desc`);

const prozent = (z, n) => (n ? `${(100 * z / n).toFixed(1).replace('.', ',')} %` : '–');
const rechts = (v, b) => String(v).padStart(b);

const main = async () => {
  const VON = tag(TAGE), BIS = tag(0); // BIS exklusiv: heute zaehlt nicht mit
  const VOR_VON = tag(2 * TAGE);
  const [jetzt, vorher] = await Promise.all([trichter(VON, BIS), trichter(VOR_VON, VON)]);
  const letzterTag = tag(1);

  console.log(`Buchung ueber die App — ${VON} bis ${letzterTag} (volle Tage, funnel_events + appointments)`);
  console.log(`Vorperiode ${VOR_VON} bis ${tag(TAGE + 1)}. Klicks vor der Umstellung (07.10.2026) nur aus dem App-Arm.\n`);

  const zeile = (r) => r || { klick: 0 };
  const vorGesamt = zeile(vorher.find((r) => r.quelle === 'gesamt'));

  console.log('## Klick -> bestaetigter Termin');
  console.log(' Quelle        Klicks  bestaetigt   CR        Vorperiode');
  for (const r of jetzt) {
    const v = zeile(vorher.find((x) => x.quelle === r.quelle));
    const duenn = r.klick < MINDEST_N ? ' (zu duenn)' : '';
    console.log(` ${r.quelle.padEnd(12)}${rechts(r.klick, 7)}${rechts(r.bestaetigt, 12)}   ${prozent(r.bestaetigt, r.klick).padEnd(9)} ${v.klick ? `${prozent(v.bestaetigt, v.klick)} (${v.bestaetigt}/${v.klick})` : '–'}${duenn}`);
  }
  console.log(' "unbekannt" = Klick ohne Marketing-Einwilligung, Quelle ads/seo nicht messbar.\n');

  const g = jetzt.find((r) => r.quelle === 'gesamt');
  if (!g || !g.klick) { console.log('Keine App-Klicks im Fenster.'); }
  else {
    console.log('## App-Trichter (alle Quellen, Sitzungen)');
    let groesster = null;
    SCHRITTE.forEach(([k, name], i) => {
      const vor = i ? g[SCHRITTE[i - 1][0]] : null;
      const verlust = vor ? (g[k] / vor - 1) : null;
      if (verlust !== null && i < SCHRITTE.length - 1 && (!groesster || verlust < groesster.verlust)) {
        groesster = { verlust, von: SCHRITTE[i - 1][1], nach: name };
      }
      console.log(` ${name.padEnd(24)}${rechts(g[k], 6)}  ${verlust === null ? '' : `${(verlust * 100).toFixed(0)} %`}`);
    });
    if (groesster) console.log(` Groesster Abbruch: ${groesster.von} -> ${groesster.nach} (${(groesster.verlust * 100).toFixed(0)} %).`);
    console.log(` Nie bestaetigt: ${g.gebucht_ereignis - g.bestaetigt} von ${g.gebucht_ereignis} gemeldeten Buchungen.\n`);

    console.log('## Nach dem Termin (nur Termine vor heute)');
    if (g.reif < MINDEST_N) console.log(` Erst ${g.reif} reife Termine — Datenbasis zu duenn, Quoten nur zur Orientierung.`);
    console.log(` reif ${g.reif} · erschienen ${g.erschienen} (${prozent(g.erschienen, g.reif)}) · No-Show ${g.no_show} (${prozent(g.no_show, g.reif)}) · storniert ${g.storniert} (${prozent(g.storniert, g.reif)})`);
    console.log(` Umsatz bisher ${g.umsatz} € · je Klick ${(g.umsatz / g.klick).toFixed(2).replace('.', ',')} € (waechst, solange Termine offen sind)`);
    if (vorGesamt.klick) console.log(` Vorperiode: erschienen ${prozent(vorGesamt.erschienen, vorGesamt.reif)} von ${vorGesamt.reif}, Umsatz je Klick ${(vorGesamt.umsatz / vorGesamt.klick).toFixed(2).replace('.', ',')} €`);
    console.log('');
  }

  const direkt = await sql(`
    select count(distinct session_id) n from funnel_events f
    where surface = 'app' and event = 'booking_confirmed'
      and received_at >= '${VON}'::date at time zone 'Europe/Berlin'
      and received_at <  '${BIS}'::date at time zone 'Europe/Berlin'
      and not exists (select 1 from funnel_events s where s.session_id = f.session_id
        and s.surface = 'store' and s.event = 'click_booking')`);
  console.log(`Ausserhalb des Trichters: ${direkt[0].n} App-Buchungen ohne Klick auf der Website (Direktlink, Rezeption, App).\n`);

  console.log('## Waechter: Klicks, die noch auf Calendly zurueckfallen');
  const fallback = await sql(`
    select coalesce(location, '(ohne Standort)') standort, split_part(page_path, '?', 1) seite,
      count(distinct session_id) n
    from funnel_events
    where surface = 'store' and event = 'click_booking'
      and received_at >= greatest('${VON}'::date at time zone 'Europe/Berlin', '${UMSTELLUNG}'::timestamptz)
      and received_at <  '${BIS}'::date at time zone 'Europe/Berlin'
      and (booking_type = 'calendly' or ab_fallback)
    group by 1, 2 order by 3 desc limit 20`);
  if (!fallback.length) console.log(' keine — alle Klicks seit der Umstellung oeffnen die App.');
  else {
    console.log(' Hier fehlt vermutlich eine appBookingUrl in Strapi (oder die Seite ist eine Nur-Calendly-Seite):');
    for (const r of fallback) console.log(`   ${r.standort.padEnd(28)} ${r.seite.padEnd(48)} ${r.n} Sitzungen`);
  }
  const calendly = await sql(`
    select count(*) n from funnel_events
    where surface = 'store' and event = 'booking_confirmed' and booking_type = 'calendly'
      and coalesce(event_id, '') not like 'CHECK%'
      and received_at >= greatest('${VON}'::date at time zone 'Europe/Berlin', '${UMSTELLUNG}'::timestamptz)
      and received_at <  '${BIS}'::date at time zone 'Europe/Berlin'`);
  console.log(` Calendly-Buchungen seit der Umstellung im Fenster: ${calendly[0].n} (Direktlinks aus Mail/WhatsApp/Anzeigen oder Rueckfall).`);
};

main().catch((e) => { console.error(e.message); process.exit(1); });
