/**
 * Kurzbewerbung aus dem Recruiting-Funnel (/karriere/bewerben/<stadt>).
 *
 * Ersatz fuer den Perspective-Funnel: JSON ohne Lebenslauf, direkt an
 * `bewerbung-eingang` der App (Bewerber-Board, Mail an das Recruiting).
 * Gleicher Schluessel und gleiche Adresse wie /api/karriere/bewerbung.
 * Keinen HubSpot-Ausweichweg mehr: HubSpot wird abgeschaltet (myhb-os#1468).
 */
import {
  kurzbewerbungFuerApp,
  pruefeKurzbewerbung,
  stadtAusSlug,
  trackingAusQuery,
} from "#shared/recruitingFunnel";
import { bewerbungUrl } from "#shared/bewerbungApp";

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => null)) as Record<string, any> | null;
  if (!body || typeof body !== "object") {
    throw createError({ statusCode: 400, statusMessage: "Formulardaten fehlen" });
  }

  // Honeypot wie im grossen Formular: ausgefuellt = Bot, still mit 200 beantworten.
  if (body.website) return { status: "ok" as const };

  const stadt = stadtAusSlug(String(body.stadt ?? ""));
  if (!stadt) {
    throw createError({ statusCode: 400, statusMessage: "Unbekannter Standort" });
  }

  const eingabe = {
    vorname: String(body.vorname ?? ""),
    nachname: String(body.nachname ?? ""),
    email: String(body.email ?? ""),
    telefon: String(body.telefon ?? ""),
    wohnort: String(body.wohnort ?? ""),
    antworten: (body.antworten && typeof body.antworten === "object" ? body.antworten : {}) as Record<string, string>,
    datenschutz: body.datenschutz === true,
  };
  const problem = pruefeKurzbewerbung(eingabe);
  if (problem) throw createError({ statusCode: 400, statusMessage: problem });

  const runtime = useRuntimeConfig() as any;
  const appUrl = bewerbungUrl(runtime.leadAnfrageUrl);
  const secret = String(runtime.leadAnfrageSecret ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
  if (!appUrl || !secret) {
    console.error("[kurzbewerbung] App-Adresse fehlt (NUXT_LEAD_ANFRAGE_URL/SECRET)");
    throw createError({ statusCode: 503, statusMessage: "Bewerbung gerade nicht möglich. Bitte versuche es gleich noch einmal." });
  }

  try {
    await $fetch(appUrl, {
      method: "POST",
      headers: { "x-lead-secret": secret, "Content-Type": "application/json" },
      body: kurzbewerbungFuerApp({
        ...eingabe,
        stadt,
        tracking: trackingAusQuery(
          body.tracking && typeof body.tracking === "object" ? body.tracking : {},
        ),
      }),
      timeout: 15_000,
    });
  } catch (error: any) {
    // Keine Personendaten ins Log, nur der Fehlercode.
    console.error("[kurzbewerbung] App nicht erreicht", error?.statusCode ?? error?.name ?? "unbekannt");
    throw createError({ statusCode: 502, statusMessage: "Bewerbung gerade nicht möglich. Bitte versuche es gleich noch einmal." });
  }
  return { status: "ok" as const };
});
