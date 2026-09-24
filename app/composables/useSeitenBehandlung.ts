import type { TreatmentPageDto } from "~/lib/strapi/dto/collections";
import type { TreatmentType } from "~/lib/strapi/dto/enums";
import type { BookingTreatmentContext } from "~/lib/bookingTreatmentContext";
import { resolveAppTreatmentSlug } from "~/composables/useAppBookingDialog";
import { treatmentPriceLabel } from "~/utils/treatmentPriceLabel";

/**
 * Die Behandlung, die die aktuelle Seite bereits kennt (bfroos/myhb-store#78).
 *
 * Gegenstueck zu `useSeitenStandort`: Auf einer Behandlungsseite weiss die
 * Seite, welche Behandlung gemeint ist. Bisher trug nur der Hero-Knopf
 * Behandlungstyp und App-Slug in den Dialog; alle uebrigen Buchungsknoepfe
 * derselben Seite (Abschluss-CTA, Preis-Teaser, Standort-Teaser, Fliesstext)
 * oeffneten ihn ohne Behandlung. Die Kontextzeile „<Behandlung> · ab <Preis>"
 * im Dialogkopf (Entscheidung Benjamin, 24.09.2026) soll aber fuer jeden Knopf
 * der Seite gelten — die Seite ist der Kontext, nicht der Knopf.
 *
 * Dieselben Regeln wie beim Standort:
 * - Der Kontext haengt am **Pfad**, der ihn gesetzt hat. Von der vorigen
 *   Seite bleibt nichts stehen.
 * - Der Knopf in der Kopfzeile erbt nichts (`ohneSeitenKontext` am
 *   `SharedButton`).
 * - Start-, Standort- und Landingpages ohne Behandlung setzen keinen Kontext.
 *
 * Name und Preis stammen aus derselben Quelle wie der Hero der Seite
 * (`treatmentPage.name`, `treatmentPriceLabel`), damit Seite und Dialog nie
 * zwei verschiedene Preise zeigen.
 */
export type SeitenBehandlung = {
  treatmentType?: TreatmentType;
  appTreatmentSlug?: string;
  kontext: BookingTreatmentContext;
};

type Gemerkt = SeitenBehandlung & { pfad: string };

export function useSeitenBehandlung() {
  const gemerkt = useState<Gemerkt | null>("seitenBehandlung", () => null);
  const route = useRoute();
  const { t } = useI18n();

  /** Setzt die Behandlung der Seite. `null` loescht sie. */
  function setzeSeitenBehandlung(page?: TreatmentPageDto | null) {
    const name = page?.name?.trim();
    if (!page || !name) {
      gemerkt.value = null;
      return;
    }
    const priceLabel = treatmentPriceLabel(
      page.treatment,
      page.hero?.showPrice,
      t,
    );
    gemerkt.value = {
      pfad: route.path,
      treatmentType: page.treatment?.type,
      appTreatmentSlug: resolveAppTreatmentSlug(page),
      kontext: { name, priceLabel: priceLabel || undefined },
    };
  }

  /**
   * Die Behandlung dieser Seite — oder `null`, wenn der gemerkte Wert von
   * einer anderen Seite stammt.
   */
  const seitenBehandlung = computed<SeitenBehandlung | null>(() => {
    const wert = gemerkt.value;
    if (!wert || wert.pfad !== route.path) return null;
    const { pfad: _pfad, ...rest } = wert;
    return rest;
  });

  return { seitenBehandlung, setzeSeitenBehandlung };
}
