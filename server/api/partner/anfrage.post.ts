/**
 * Bewerbung Partnerprogramm (Seite /partnerpraxis) → App (E32, bfroos/myhb-store#403, myhb-app/myhb-os#2196).
 *
 * Die Edge Function `partner-anfrage` legt die Bewerbung in
 * `partner_anfragen` ab und schickt Benjamin eine Mail. Sie ist mit
 * `x-lead-secret` geschuetzt (derselbe Schluessel wie lead-anfrage), deshalb
 * geht das Formular hierher und nicht direkt an Supabase. Die Adresse wird aus
 * NUXT_LEAD_ANFRAGE_URL abgeleitet, es braucht keine neue Variable in Vercel.
 *
 * Keine Personendaten in Logs, nur Fehlercodes.
 */
import { partnerAnfrageUrl, pruefePartnerEingabe, type PartnerEingabe } from "#shared/partnerProgramm";

/** Grobe Drossel je Instanz: hoechstens 5 Bewerbungen je IP in 10 Minuten. */
const FENSTER_MS = 10 * 60 * 1000;
const MAX_JE_FENSTER = 5;
const zuletzt = new Map<string, number[]>();

function gedrosselt(ip: string, jetzt = Date.now()): boolean {
  const liste = (zuletzt.get(ip) ?? []).filter((t) => jetzt - t < FENSTER_MS);
  liste.push(jetzt);
  zuletzt.set(ip, liste);
  if (zuletzt.size > 5000) zuletzt.clear();
  return liste.length > MAX_JE_FENSTER;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const url = partnerAnfrageUrl((config as any).leadAnfrageUrl as string | undefined);
  const secret = String((config as any).leadAnfrageSecret ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
  if (!url || !secret) {
    console.error("[partner-anfrage] Konfiguration fehlt (NUXT_LEAD_ANFRAGE_URL/SECRET)");
    throw createError({ statusCode: 503, statusMessage: "Bewerbung gerade nicht möglich. Bitte versuch es später noch einmal." });
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unbekannt";
  if (gedrosselt(ip)) {
    throw createError({ statusCode: 429, statusMessage: "Zu viele Anfragen. Bitte versuch es später noch einmal." });
  }

  const eingabe = (await readBody<PartnerEingabe>(event).catch(() => null)) ?? {};
  const pruefung = pruefePartnerEingabe(eingabe);
  if (!pruefung.ok) throw createError({ statusCode: 400, statusMessage: pruefung.fehler });
  // Bot: freundlich bestaetigen, damit er es nicht erneut versucht.
  if (pruefung.bot) return { status: "ok" as const };

  try {
    const antwort = await $fetch.raw(url, {
      method: "POST",
      headers: { "x-lead-secret": secret, "Content-Type": "application/json" },
      body: pruefung.anfrage,
      timeout: 10_000,
    });
    return { status: "ok" as const, id: (antwort._data as any)?.id ?? null };
  } catch (error: any) {
    console.error("[partner-anfrage] Weiterleitung fehlgeschlagen", error?.statusCode ?? error?.name ?? "unbekannt");
    throw createError({
      statusCode: 502,
      statusMessage: "Deine Bewerbung konnte gerade nicht gesendet werden. Bitte versuch es gleich noch einmal.",
    });
  }
});
