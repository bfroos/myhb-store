/**
 * Merkt sich das Werbeangebot (`?angebot=`) fuer die Sitzung, damit es auch
 * nach einem Seitenwechsel noch an die App-Buchung geht (shared/werbeangebot.ts).
 *
 * Zwei Kopien: eine im Arbeitsspeicher der Seite und eine in sessionStorage
 * (fuer Neuladen). Cookiebot raeumt bei der Antwort auf den Banner nicht
 * klassifizierte Storage-Schluessel ab (utm-persist v1.7); die Kopie im
 * Arbeitsspeicher ueberlebt das. Kein Cookie, keine Daten zur Person.
 */
import { angebotAusSuche, normalAngebot } from "#shared/werbeangebot";

const KEY = "mhb_angebot";
let imSpeicher: string | null = null;

/** Liest `?angebot=` aus der aktuellen URL und merkt es sich. */
export function angebotErfassen(): void {
  if (typeof window === "undefined") return;
  const neu = angebotAusSuche(window.location.search);
  if (!neu) return;
  imSpeicher = neu;
  try {
    sessionStorage.setItem(KEY, neu);
  } catch {
    // Privater Modus o. Ae.: dann nur im Arbeitsspeicher.
  }
}

/** Aktuelles Angebot: URL vor Arbeitsspeicher vor sessionStorage. */
export function aktuellesAngebot(): string | null {
  if (typeof window === "undefined") return null;
  const ausUrl = angebotAusSuche(window.location.search);
  if (ausUrl) return ausUrl;
  if (imSpeicher) return imSpeicher;
  try {
    return normalAngebot(sessionStorage.getItem(KEY));
  } catch {
    return null;
  }
}
