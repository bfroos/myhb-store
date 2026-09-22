import type { LocationDto } from "~/lib/strapi/dto/collections";
import { bookingUrlsOf } from "~/lib/strapi/bookingUrls";

/**
 * Der Standort, den die aktuelle Seite bereits kennt (bfroos/myhb-store#78).
 *
 * Auf einer Standortseite weiss die Seite, welche Lounge gemeint ist — der
 * Besucher hat sie ausgesucht, indem er dort gelandet ist. Trotzdem fragte
 * bisher fast jeder Buchungsknopf derselben Seite noch einmal „Welche Lounge?":
 * Nur der Hero-Knopf bekommt seine Buchungsdaten mitgegeben
 * (`BlockTreatmentHero`), alle uebrigen Knoepfe — Abschluss-CTA, Bewertungen,
 * Preis-Teaser, Ablauf, Vorteile, Fliesstext — rendern `<SharedButton>` ohne
 * `data` und oeffnen deshalb den Standortwaehler.
 *
 * Gemessen fuer elanagency/myhb-os#205 (GA4, App-Arm, 16.–21.09.2026):
 * 69 % aller Buchungsklicks oeffnen erst den Waehler, 192 davon auf Seiten,
 * die den Standort langst kennen. Dieser Zwischenschritt ist Teil des
 * teuersten Abbruchs im A/B-Test.
 *
 * Der Kontext haengt bewusst am **Pfad**, der ihn gesetzt hat. Ein Wert, der
 * von der vorigen Seite stehen bleibt, waere schlimmer als gar keiner: Der
 * Besucher bekaeme auf einer allgemeinen Behandlungsseite stillschweigend die
 * Lounge, die er vor zwei Klicks angesehen hat.
 *
 * Ein gesperrter Standort (`isBookingAllowed = false`) liefert ueber
 * `bookingUrlsOf` keine URLs und damit auch keinen Kontext — dort ist der
 * Waehler die richtige Antwort, weil er zu einem Standort fuehrt, der Termine
 * annimmt.
 */
export type SeitenStandort = {
  calendlyUrl?: string;
  appBookingUrl?: string;
  locationSlug?: string;
};

type Gemerkt = SeitenStandort & { pfad: string };

export function useSeitenStandort() {
  const gemerkt = useState<Gemerkt | null>("seitenStandort", () => null);
  const route = useRoute();

  /** Setzt den Standort der Seite. `null` loescht ihn. */
  function setzeSeitenStandort(location?: LocationDto | null) {
    if (!location) {
      gemerkt.value = null;
      return;
    }
    const { calendlyUrl, appBookingUrl } = bookingUrlsOf(location);
    gemerkt.value =
      calendlyUrl || appBookingUrl
        ? {
            pfad: route.path,
            calendlyUrl,
            appBookingUrl,
            locationSlug: location.slug ?? undefined,
          }
        : null;
  }

  /**
   * Der Standort dieser Seite — oder `null`, wenn der gemerkte Wert von einer
   * anderen Seite stammt.
   */
  const seitenStandort = computed<SeitenStandort | null>(() => {
    const wert = gemerkt.value;
    if (!wert || wert.pfad !== route.path) return null;
    const { pfad: _pfad, ...rest } = wert;
    return rest;
  });

  return { seitenStandort, setzeSeitenStandort };
}
