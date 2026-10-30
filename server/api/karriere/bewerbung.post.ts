/**
 * Bewerbung Aerzte → App (myhb-app/myhb-os#1464, vorher bfroos/myhb-store#102).
 *
 * Nimmt das Formular der Karriereseite als multipart/form-data entgegen
 * (wegen des Lebenslaufs) und schickt es an die Edge Function
 * `bewerbung-eingang` der App. Dort landet es im Bewerber-Board, der
 * Lebenslauf im privaten Fach, und das Recruiting bekommt eine Mail.
 *
 * Erreicht die Route die App nicht, faellt sie auf den alten Weg nach HubSpot
 * zurueck (sofern dort ein Token gesetzt ist): eine Bewerbung in HubSpot ist
 * besser als eine verlorene. Der HubSpot-Weg legt an:
 *   1. Lebenslauf im File Manager (PRIVATE)
 *   2. Kontakt (Upsert ueber die E-Mail)
 *   3. Deal in der Recruiting-Pipeline, Stage "Bewerbung eingegangen"
 *   4. Notiz mit allen Feldern und dem Lebenslauf als Anhang
 * Scheitert dort nur der Upload, laeuft der Rest trotzdem durch.
 */
import {
  AUSBILDUNGSSTAND_WERTE,
  BEWERBUNG_MAX_NACHRICHT,
  CV_ERLAUBTE_ENDUNGEN,
  CV_ERLAUBTE_MIME_TYPES,
  CV_MAX_BYTES,
  ausbildungsstandLabel,
} from "#shared/karriere";
import { bewerbungFuerApp, bewerbungUrl } from "#shared/bewerbungApp";

/** Lebenslauf ist Pflicht: ohne ihn kann das Recruiting nicht sichten. */
const CV_PFLICHT = true;

const MAX_TEXT = 255;

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const badRequest = (message: string) =>
  createError({ statusCode: 400, statusMessage: message });

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event);
  if (!parts?.length) {
    throw badRequest("Formulardaten fehlen");
  }

  const felder: Record<string, string> = {};
  let cvTeil: { data: Buffer; filename: string; type?: string } | null = null;

  for (const part of parts) {
    if (!part.name) continue;
    if (part.filename) {
      if (part.name === "cv" && part.data?.length) {
        cvTeil = {
          data: part.data,
          filename: part.filename,
          type: part.type,
        };
      }
      continue;
    }
    felder[part.name] = part.data.toString("utf-8").trim();
  }

  // Honeypot: ein Feld, das im Formular versteckt ist. Ausgefuellt = Bot.
  // Absichtlich mit 200 beantwortet, damit der Bot es nicht erneut versucht.
  if (felder.website) {
    return { status: "ok" as const };
  }

  const vorname = felder.vorname?.slice(0, MAX_TEXT) || "";
  const nachname = felder.nachname?.slice(0, MAX_TEXT) || "";
  const email = felder.email?.toLowerCase().slice(0, MAX_TEXT) || "";
  const telefon = felder.telefon?.slice(0, MAX_TEXT) || "";
  const ausbildungsstand = felder.ausbildungsstand || "";
  const wunschstandort = felder.wunschstandort?.slice(0, MAX_TEXT) || "";
  const nachricht = felder.nachricht?.slice(0, BEWERBUNG_MAX_NACHRICHT) || "";
  const quelle = felder.quelle?.slice(0, MAX_TEXT) || "karriere-aerzte";

  if (!vorname) throw badRequest("Bitte gib deinen Vornamen an.");
  if (!nachname) throw badRequest("Bitte gib deinen Nachnamen an.");
  if (!email || !isValidEmail(email)) {
    throw badRequest("Bitte gib eine gültige E-Mail-Adresse an.");
  }
  if (!telefon) throw badRequest("Bitte gib deine Telefonnummer an.");
  if (!AUSBILDUNGSSTAND_WERTE.includes(ausbildungsstand)) {
    throw badRequest("Bitte wähle deinen Ausbildungsstand aus.");
  }
  if (!wunschstandort) {
    throw badRequest("Bitte wähle einen Wunschstandort aus.");
  }
  // Die Einwilligung ist die Rechtsgrundlage fuer die Speicherung der Bewerbung.
  // Ohne sie wird nichts uebertragen.
  if (felder.datenschutz !== "true") {
    throw badRequest("Bitte stimme der Datenschutzerklärung zu.");
  }

  if (cvTeil) {
    const endung = cvTeil.filename.slice(cvTeil.filename.lastIndexOf("."));
    const endungOk = CV_ERLAUBTE_ENDUNGEN.includes(
      endung.toLowerCase() as (typeof CV_ERLAUBTE_ENDUNGEN)[number],
    );
    const mimeOk =
      !cvTeil.type ||
      CV_ERLAUBTE_MIME_TYPES.includes(
        cvTeil.type as (typeof CV_ERLAUBTE_MIME_TYPES)[number],
      );
    if (!endungOk || !mimeOk) {
      throw badRequest("Bitte lade den Lebenslauf als PDF oder Word-Datei hoch.");
    }
    if (cvTeil.data.length > CV_MAX_BYTES) {
      throw badRequest("Die Datei ist zu groß (maximal 4 MB).");
    }
  } else if (CV_PFLICHT) {
    throw badRequest("Bitte lade deinen Lebenslauf hoch.");
  }

  const ausbildungsstandText = ausbildungsstandLabel(ausbildungsstand);

  // Erster Weg: die App. Antwortet sie, ist die Bewerbung angekommen.
  const runtime = useRuntimeConfig() as any;
  const appUrl = bewerbungUrl(runtime.leadAnfrageUrl);
  const secret = String(runtime.leadAnfrageSecret ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
  if (appUrl && secret) {
    try {
      await $fetch(appUrl, {
        method: "POST",
        headers: { "x-lead-secret": secret, "Content-Type": "application/json" },
        body: bewerbungFuerApp({
          vorname,
          nachname,
          email,
          telefon,
          ausbildungsstandLabel: ausbildungsstandText,
          wunschstandort,
          nachricht,
          quelle,
          cv: cvTeil,
        }),
        timeout: 20_000,
      });
      return { status: "ok" as const };
    } catch (error: any) {
      // Keine Personendaten ins Log, nur der Fehlercode.
      console.error("[bewerbung] App nicht erreicht, weiter mit HubSpot", error?.statusCode ?? error?.name ?? "unbekannt");
    }
  } else {
    console.error("[bewerbung] App-Adresse fehlt (NUXT_LEAD_ANFRAGE_URL/SECRET), weiter mit HubSpot");
  }

  return await nachHubspot({
    vorname,
    nachname,
    email,
    telefon,
    ausbildungsstand,
    ausbildungsstandLabel: ausbildungsstandText,
    wunschstandort,
    nachricht,
    quelle,
    cvTeil,
  });
});

/** Alter Weg, nur noch Ausweichweg: Bewerbung als Deal in HubSpot. */
async function nachHubspot(f: {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  ausbildungsstand: string;
  ausbildungsstandLabel: string;
  wunschstandort: string;
  nachricht: string;
  quelle: string;
  cvTeil: { data: Buffer; filename: string; type?: string } | null;
}) {
  const config = getHubspotConfig();
  const { cvTeil, ...felder } = f;
  const eingegangenAm = new Date();

  // Upload zuerst: Scheitert er, steht das Ergebnis in der Notiz. Scheitert
  // stattdessen HubSpot selbst, wurde noch nichts halb angelegt.
  let cv = null;
  let cvFehler: string | null = null;
  if (cvTeil) {
    try {
      cv = await uploadCv(config, cvTeil);
    } catch (error: any) {
      cvFehler = "Upload in den File Manager fehlgeschlagen";
      console.error("[bewerbung] CV-Upload fehlgeschlagen", error?.message);
    }
  }

  const daten = { ...felder, eingegangenAm, cv, cvFehler };

  const contactId = await upsertBewerberKontakt(config, daten);
  const dealId = await createBewerbungsDeal(config, contactId, daten);

  // Die Notiz ist Komfort, kein Muss: Kontakt und Deal stehen schon. Ein
  // Fehler hier darf der Bewerberin keine Fehlermeldung zeigen.
  try {
    await createBewerbungsNotiz(config, contactId, dealId, daten);
  } catch (error: any) {
    console.error("[bewerbung] Notiz fehlgeschlagen", error?.message);
  }

  return { status: "ok" as const };
}
