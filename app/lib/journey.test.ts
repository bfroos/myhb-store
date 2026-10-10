import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_TOUCHES,
  appendTouch,
  fitCookie,
  siteOf,
  externalReferrerHost,
  parseJourney,
  sameSignal,
  toWire,
  touchFromLocation,
  type Journey,
} from './journey.ts';

const ID = '0b6f1d2e-3c4a-4b5c-8d9e-0f1a2b3c4d5e';
const NOW = Date.UTC(2026, 9, 10, 12, 0, 0);

describe('touchFromLocation', () => {
  it('nimmt utm und Klick-ID', () => {
    const t = touchFromLocation('?utm_source=google&utm_medium=cpc&gclid=abc', '/botox', '', 'go', NOW);
    assert.deepEqual(t, { ts: NOW, s: 'go', src: 'google', med: 'cpc', ck: 'gclid', lp: '/botox' });
  });

  it('nimmt einen externen Referrer ohne Parameter', () => {
    const t = touchFromLocation('', '/', 'https://www.instagram.com/', 'www', NOW);
    assert.equal(t?.ref, 'instagram.com');
  });

  it('ignoriert interne Navigation und Direktaufrufe', () => {
    assert.equal(touchFromLocation('', '/a', 'https://go.myhealthandbeauty.com/x', 'app', NOW), null);
    assert.equal(touchFromLocation('', '/a', '', 'www', NOW), null);
  });

  it('erkennt das Unternehmensprofil an utm_campaign=gbp', () => {
    const t = touchFromLocation('?utm_source=google&utm_medium=organic&utm_campaign=gbp', '/koeln', '', 'www', NOW);
    assert.equal(t?.cmp, 'gbp');
  });
});

describe('appendTouch', () => {
  it('haelt den ersten Kontakt und kappt bei MAX_TOUCHES', () => {
    let j: Journey = { id: ID, t: [] };
    for (let i = 0; i < MAX_TOUCHES + 5; i++) j = appendTouch(j, { ts: NOW + i, s: 'www', src: `s${i}` });
    assert.equal(j.t.length, MAX_TOUCHES);
    assert.equal(j.t[0].src, 's0');
    assert.equal(j.t[j.t.length - 1].src, `s${MAX_TOUCHES + 4}`);
  });
});

describe('parseJourney', () => {
  it('verwirft kaputte Werte und fremde IDs', () => {
    assert.equal(parseJourney('{'), null);
    assert.equal(parseJourney(JSON.stringify({ id: 'x', t: [] })), null);
  });

  it('verwirft Kontakte aelter als 90 Tage', () => {
    const alt = NOW - 91 * 864e5;
    const j = parseJourney(JSON.stringify({ id: ID, t: [{ ts: alt, s: 'www' }, { ts: NOW, s: 'go' }] }), NOW);
    assert.deepEqual(j?.t.map((k) => k.s), ['go']);
  });
});

describe('toWire / externalReferrerHost', () => {
  it('uebersetzt die Kurzschluessel', () => {
    const w = toWire({ ts: NOW, s: 'app', src: 'google', ck: 'gbraid', ref: 'google.com' });
    assert.equal(w.ts, new Date(NOW).toISOString());
    assert.equal(w.source, 'google');
    assert.equal(w.click_kind, 'gbraid');
    assert.equal(w.referrer, 'google.com');
  });

  it('zaehlt den eigenen Host nicht als extern', () => {
    assert.equal(externalReferrerHost('http://localhost:8080/x', 'localhost'), undefined);
    assert.equal(touchFromLocation('', '/a', 'http://localhost:8080/b', 'app', NOW, 'localhost'), null);
  });

  it('erkennt dasselbe Signal', () => {
    assert.equal(sameSignal({ ts: 1, s: 'app', src: 'google', ck: 'gclid' }, { ts: 2, s: 'app', src: 'google', ck: 'gclid' }), true);
    assert.equal(sameSignal({ ts: 1, s: 'app', src: 'google' }, { ts: 2, s: 'app', src: 'meta' }), false);
  });

  it('zaehlt eigene Subdomains nicht als extern', () => {
    assert.equal(externalReferrerHost('https://app.myhealthandbeauty.com/x'), undefined);
    assert.equal(externalReferrerHost('https://www.google.de/'), 'google.de');
  });
});

describe('fitCookie / siteOf', () => {
  it('kuerzt zu lange Listen und behaelt den ersten Kontakt', () => {
    const lang = 'x'.repeat(140);
    let j: Journey = { id: ID, t: [] };
    for (let i = 0; i < 20; i++) j = appendTouch(j, { ts: NOW + i, s: 'go', src: `s${i}`, cmp: lang, trm: lang });
    const kurz = fitCookie(j);
    assert.ok(encodeURIComponent(JSON.stringify(kurz)).length <= 3500);
    assert.equal(kurz.t[0].src, 's0');
    assert.ok(kurz.t.length < 20);
  });

  it('ordnet Hosts zu', () => {
    assert.equal(siteOf('go.myhealthandbeauty.com'), 'go');
    assert.equal(siteOf('www.myhealthandbeauty.com'), 'www');
    assert.equal(siteOf('myhb-store-git-x.vercel.app'), 'other');
  });
});
