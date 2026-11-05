// myhb-os#2157: setzt den Werbe-Stempel serverseitig neu, damit Safari ihn
// nicht nach 7 Tagen loescht. Liest nur das Cookie aus der Anfrage, nimmt
// keinen Inhalt aus dem Body an. Begruendung in shared/stempelCookie.ts.
import { STEMPEL_KEY, STEMPEL_TAGE, stempelDomain, stempelGueltig } from "#shared/stempelCookie";

export default defineEventHandler((event) => {
  setHeader(event, "Cache-Control", "no-store");
  const wert = stempelGueltig(getCookie(event, STEMPEL_KEY));
  if (!wert) return { ok: false };
  setCookie(event, STEMPEL_KEY, wert, {
    maxAge: STEMPEL_TAGE * 86400,
    path: "/",
    domain: stempelDomain(getRequestHost(event)),
    sameSite: "lax",
    secure: true,
    // Die Seite und die App lesen den Stempel per JavaScript.
    httpOnly: false,
  });
  return { ok: true };
});
