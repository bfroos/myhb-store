/**
 * Loeschfrist fuer Bewerberdaten Aerzte (bfroos/myhb-store#102).
 *
 * Vercel ruft die Route taeglich auf (vercel.json → crons). Sie sucht Kontakte,
 * deren `bewerbung_loeschdatum` erreicht ist, und loescht die Bewerbung:
 * Recruiting-Deals, die Bewerbungsnotizen, den Lebenslauf im File Manager und —
 * wenn der Kontakt nur wegen der Bewerbung existiert — den Kontakt selbst.
 * Was mit welchem Kontakt passiert, steht in shared/bewerberLoeschung.ts.
 *
 * Laeuft der Prozess noch (Recruiting-Deal ausserhalb von "Bewerbung
 * eingegangen"/"Absage"), bleibt alles stehen; der Kontakt taucht dann am
 * naechsten Tag wieder auf und wird erneut geprueft.
 *
 * Schutz: Vercel schickt `Authorization: Bearer $CRON_SECRET`. Ohne gesetztes
 * CRON_SECRET loescht die Route nichts. `?dryRun=1` meldet nur, was sie tun
 * wuerde.
 */
import {
  cvFileIdAusUrl,
  entscheideLoeschung,
  faelligBisMs,
  type LoeschEntscheidung,
} from "#shared/bewerberLoeschung";

/**
 * Pro Lauf; der Rest folgt am naechsten Tag. "Behalten"-Kontakte zaehlen mit
 * (sie bleiben faellig, bis das Recruiting den Deal abschliesst) — bei 50 ist
 * das fuer die erwartbaren Bewerberzahlen weit genug.
 */
const MAX_PRO_LAUF = 50;

type Ergebnis = {
  kontaktId: string;
  entscheidung: LoeschEntscheidung;
  fehler?: string;
};

export default defineEventHandler(async (event) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: "CRON_SECRET ist nicht gesetzt",
    });
  }
  if (getHeader(event, "authorization") !== `Bearer ${secret}`) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const dryRun = getQuery(event).dryRun === "1";
  const config = getHubspotConfig();
  const faellige = await findeFaelligeBewerber(
    config,
    faelligBisMs(new Date()),
    MAX_PRO_LAUF,
  );

  const ergebnisse: Ergebnis[] = [];

  for (const kontakt of faellige) {
    let entscheidung: LoeschEntscheidung = {
      aktion: "behalten",
      grund: "nicht geprueft",
    };
    try {
      const spuren = await ladeBewerbungsSpuren(config, kontakt.id);
      entscheidung = entscheideLoeschung({
        lifecyclestage: kontakt.lifecyclestage,
        recruitingDealStages: spuren.recruitingDeals.map((deal) => deal.stage),
        hatAndereDeals: spuren.hatAndereDeals,
      });

      if (!dryRun && entscheidung.aktion !== "behalten") {
        // Datei zuerst: Sie haengt an keinem CRM-Objekt und waere nach dem
        // Loeschen des Kontakts nicht mehr auffindbar.
        const dateiIds = new Set(spuren.dateiIds);
        const cvId = cvFileIdAusUrl(kontakt.cvUrl);
        if (cvId) dateiIds.add(cvId);
        for (const fileId of dateiIds) await loescheDatei(config, fileId);

        for (const notizId of spuren.notizIds) {
          await loescheObjekt(config, "notes", notizId);
        }
        for (const deal of spuren.recruitingDeals) {
          await loescheObjekt(config, "deals", deal.id);
        }

        if (entscheidung.aktion === "kontakt_loeschen") {
          await loescheObjekt(config, "contacts", kontakt.id);
        } else {
          await leereBewerbungsFelder(config, kontakt.id);
        }
      }

      ergebnisse.push({ kontaktId: kontakt.id, entscheidung });
    } catch (error: any) {
      // Ein Kontakt darf den Lauf nicht abbrechen; er kommt morgen wieder.
      console.error(
        `[bewerber-loeschen] Kontakt ${kontakt.id} fehlgeschlagen`,
        error?.message,
      );
      ergebnisse.push({
        kontaktId: kontakt.id,
        entscheidung,
        fehler: error?.statusMessage || error?.message || "unbekannt",
      });
    }
  }

  const zaehle = (aktion: LoeschEntscheidung["aktion"]) =>
    ergebnisse.filter((e) => !e.fehler && e.entscheidung.aktion === aktion)
      .length;

  const zusammenfassung = {
    dryRun,
    gefunden: faellige.length,
    kontaktGeloescht: zaehle("kontakt_loeschen"),
    nurBewerbungGeloescht: zaehle("nur_bewerbung_loeschen"),
    behalten: zaehle("behalten"),
    fehler: ergebnisse.filter((e) => e.fehler).length,
  };
  console.log("[bewerber-loeschen]", JSON.stringify(zusammenfassung));

  // Nur IDs und Entscheidungen, keine Namen oder E-Mail-Adressen: Die
  // Antwort landet in den Vercel-Logs.
  return { ...zusammenfassung, ergebnisse };
});
