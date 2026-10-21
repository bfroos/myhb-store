/**
 * Loeschfrist fuer Bewerberdaten Aerzte (bfroos/myhb-store#102).
 *
 * Das Portal hat kein HubSpot Professional, Workflows gibt es dort also nicht.
 * Die Loeschung nach sechs Monaten macht deshalb die Cron-Route
 * server/api/cron/bewerber-loeschen.get.ts. Hier steht nur die Entscheidung,
 * was mit einem faelligen Kontakt passiert, ohne HubSpot-Aufrufe, damit sie
 * sich testen laesst.
 */

/**
 * Stages der Recruiting-Pipeline, in denen nach Ablauf der Frist geloescht
 * wird: Die Bewerbung wurde nie bearbeitet oder ist abgesagt. In allen anderen
 * Stages (Erstgespraech, Bewerberpool, Eingestellt, …) laeuft der Prozess noch
 * oder es gibt einen eigenen Grund fuer die Aufbewahrung — das entscheidet das
 * Recruiting, nicht der Cron.
 */
export const LOESCHBARE_RECRUITING_STAGES: readonly string[] = [
  "5463910623", // Bewerbung eingegangen
  "5463910629", // Absage
];

/** Lifecycle-Stages, bei denen der Kontakt mehr ist als eine Bewerbung. */
const KUNDEN_LIFECYCLE_STAGES: readonly string[] = ["customer", "evangelist"];

export type FaelligerBewerber = {
  lifecyclestage: string | null;
  /** Deal-Stages der Deals in der Recruiting-Pipeline. */
  recruitingDealStages: string[];
  /** Hat der Kontakt Deals ausserhalb der Recruiting-Pipeline? */
  hatAndereDeals: boolean;
};

export type LoeschEntscheidung =
  | { aktion: "kontakt_loeschen" }
  | { aktion: "nur_bewerbung_loeschen"; grund: string }
  | { aktion: "behalten"; grund: string };

export function entscheideLoeschung(
  bewerber: FaelligerBewerber,
): LoeschEntscheidung {
  const laufend = bewerber.recruitingDealStages.filter(
    (stage) => !LOESCHBARE_RECRUITING_STAGES.includes(stage),
  );
  if (laufend.length > 0) {
    return {
      aktion: "behalten",
      grund: `Recruiting-Deal in Stage ${laufend.join(", ")}`,
    };
  }

  // Bestandskundin, die sich beworben hat: Das Upsert hat ihren bestehenden
  // Kontakt benutzt. Geloescht wird dann nur, was von der Bewerbung stammt.
  if (bewerber.hatAndereDeals) {
    return { aktion: "nur_bewerbung_loeschen", grund: "weitere Deals" };
  }
  if (
    bewerber.lifecyclestage &&
    KUNDEN_LIFECYCLE_STAGES.includes(bewerber.lifecyclestage)
  ) {
    return {
      aktion: "nur_bewerbung_loeschen",
      grund: `Lifecycle ${bewerber.lifecyclestage}`,
    };
  }

  return { aktion: "kontakt_loeschen" };
}

/**
 * `bewerbung_cv_url` ist ein Deep-Link in den File Manager
 * (`…/files/<portal>/?fileId=<id>`). Die Datei haengt nicht am Kontakt und
 * verschwindet beim Loeschen nicht mit, deshalb braucht der Cron die ID.
 */
export function cvFileIdAusUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = /[?&]fileId=(\d+)/.exec(url);
  return match ? match[1]! : null;
}

/**
 * Faellig ist, wessen Loeschdatum heute oder frueher ist. HubSpot-Datumsfelder
 * stehen auf Mitternacht UTC; der Suchfilter erwartet Millisekunden.
 */
export function faelligBisMs(heute: Date): string {
  return String(
    Date.UTC(heute.getUTCFullYear(), heute.getUTCMonth(), heute.getUTCDate()),
  );
}
