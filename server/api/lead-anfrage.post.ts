/**
 * Anfrage aus dem Website-Funnel (OP-Landingpages) → App
 * (E28, myhb-app/myhb-os#1637).
 *
 * Die Edge Function `lead-anfrage` ist mit dem Header `x-lead-secret`
 * geschuetzt. Der Schluessel darf nie im Browser liegen, deshalb geht der
 * Funnel hierher und erst diese Route ruft die App auf. Die Anfrage landet in
 * `lead_anfragen` (Lead-Board, quelle='landingpage').
 *
 * In Vercel setzen (Laufzeit-Namen, nicht ins Bundle backen):
 *   NUXT_LEAD_ANFRAGE_URL     = https://<projekt>.supabase.co/functions/v1/lead-anfrage
 *   NUXT_LEAD_ANFRAGE_SECRET  = cron_secrets.LEAD_WEBHOOK_SECRET
 *
 * Keine Personendaten in Logs, nur Fehlercodes.
 */
import { pruefeLeadEingabe, type LeadEingabe } from "#shared/leadAnfrage";

/** Grobe Drossel je Instanz: hoechstens 5 Anfragen je IP in 10 Minuten. */
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
  const url = (config as any).leadAnfrageUrl as string | undefined;
  const secret = (config as any).leadAnfrageSecret as string | undefined;
  if (!url || !secret) {
    console.error("[lead-anfrage] Konfiguration fehlt (NUXT_LEAD_ANFRAGE_URL/SECRET)");
    throw createError({ statusCode: 503, statusMessage: "Anfrage gerade nicht möglich." });
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unbekannt";
  if (gedrosselt(ip)) {
    throw createError({ statusCode: 429, statusMessage: "Zu viele Anfragen. Bitte versuch es später noch einmal." });
  }

  const eingabe = (await readBody<LeadEingabe>(event).catch(() => null)) ?? {};
  const pruefung = pruefeLeadEingabe(eingabe);
  if (!pruefung.ok) {
    throw createError({ statusCode: 400, statusMessage: pruefung.fehler });
  }
  // Bot: freundlich bestaetigen, damit er es nicht erneut versucht.
  if (pruefung.bot) return { status: "ok" as const };

  const anfrage = {
    ...pruefung.anfrage,
    herkunft: {
      ...pruefung.anfrage.herkunft,
      user_agent: getRequestHeader(event, "user-agent")?.slice(0, 200) ?? null,
    },
  };

  try {
    const antwort = await $fetch.raw(url, {
      method: "POST",
      headers: { "x-lead-secret": secret, "Content-Type": "application/json" },
      body: anfrage,
      timeout: 10_000,
    });
    return { status: "ok" as const, id: (antwort._data as any)?.id ?? null };
  } catch (error: any) {
    console.error("[lead-anfrage] Weiterleitung fehlgeschlagen", error?.statusCode ?? error?.name ?? "unbekannt");
    throw createError({
      statusCode: 502,
      statusMessage: "Deine Anfrage konnte gerade nicht gesendet werden. Bitte ruf uns an oder versuch es gleich noch einmal.",
    });
  }
});
