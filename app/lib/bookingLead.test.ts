/**
 * Lead-Token fuer die App-Vorbefuellung. Laeuft mit `npm run test:unit`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LEAD_ENDPUNKT,
  createBookingLead,
  withLeadToken,
  withoutLeadToken,
} from "./bookingLead.ts";

const TOKEN = "a".repeat(48);
const APP = "https://app.myhealthandbeauty.com/book-appointment?location=koeln-arcaden";

test("withLeadToken: nur an App-URLs, nur gueltige Tokens", () => {
  assert.equal(
    withLeadToken(APP, TOKEN),
    `${APP}&lead=${TOKEN}`,
  );
  const cal = "https://calendly.com/koeln-arcaden";
  assert.equal(withLeadToken(cal, TOKEN), cal);
  assert.equal(withLeadToken(APP, undefined), APP);
  assert.equal(withLeadToken(APP, "kurz"), APP);
  assert.equal(withLeadToken(APP, "x".repeat(20) + "&a=b"), APP);
});

test("withoutLeadToken entfernt nur lead", () => {
  assert.equal(withoutLeadToken(`${APP}&lead=${TOKEN}`), APP);
  assert.equal(withoutLeadToken(APP), APP);
});

test("createBookingLead: schickt Daten nur im Koerper, liefert Token", async () => {
  let aufruf: { url: string; init: RequestInit } | undefined;
  const fetchImpl = (async (url: string, init: RequestInit) => {
    aufruf = { url, init };
    return new Response(JSON.stringify({ token: TOKEN }), { status: 200 });
  }) as unknown as typeof fetch;
  const token = await createBookingLead(
    { email: " a@b.de ", phone: "0171 1234567" },
    { fetchImpl },
  );
  assert.equal(token, TOKEN);
  assert.equal(aufruf?.url, LEAD_ENDPUNKT);
  assert.ok(!aufruf!.url.includes("@"));
  assert.deepEqual(JSON.parse(String(aufruf!.init.body)), {
    email: "a@b.de",
    phone: "0171 1234567",
  });
});

test("createBookingLead: ohne Daten kein Aufruf, Fehler werden undefined", async () => {
  let aufrufe = 0;
  const zaehlt = (async () => {
    aufrufe += 1;
    return new Response("{}", { status: 200 });
  }) as unknown as typeof fetch;
  assert.equal(await createBookingLead({}, { fetchImpl: zaehlt }), undefined);
  assert.equal(aufrufe, 0);

  const nichtDa = (async () => new Response("", { status: 404 })) as unknown as typeof fetch;
  assert.equal(await createBookingLead({ email: "a@b.de" }, { fetchImpl: nichtDa }), undefined);

  const kaputt = (async () => {
    throw new TypeError("Failed to fetch");
  }) as unknown as typeof fetch;
  assert.equal(await createBookingLead({ phone: "0171" }, { fetchImpl: kaputt }), undefined);

  const unsinn = (async () =>
    new Response(JSON.stringify({ token: "<script>" }), { status: 200 })) as unknown as typeof fetch;
  assert.equal(await createBookingLead({ phone: "0171" }, { fetchImpl: unsinn }), undefined);
});

test("createBookingLead: Zeitlimit bricht ab", async () => {
  const haengt = ((_u: string, init: RequestInit) =>
    new Promise((_res, rej) => {
      init.signal?.addEventListener("abort", () => rej(new Error("abort")));
    })) as unknown as typeof fetch;
  const start = Date.now();
  assert.equal(
    await createBookingLead({ email: "a@b.de" }, { fetchImpl: haengt, timeoutMs: 50 }),
    undefined,
  );
  assert.ok(Date.now() - start < 1000);
});
