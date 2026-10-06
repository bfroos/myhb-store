import {
  BOOKING_THANK_YOU_SLUGS,
  hasFiredBookingConfirmed,
  markBookingConfirmedFired,
  readBookingHandoff,
  clearBookingHandoff,
} from "~/lib/calendlyBookingHandoff";
import { pushErweiterteConversions } from "~/lib/enhancedConversions";

/**
 * `booking_confirmed` auf der Dankesseite nach einer Calendly-Buchung
 * (elanagency/myhb-os#131).
 *
 * Calendly leitet nach jeder Buchung auf `/p/danke-fuer-deine-terminbuchung`
 * weiter und hängt die Ereignisdetails an die URL (`invitee_uuid`,
 * `event_type_uuid`, `assigned_to`, utm_*). Diese Seite sieht damit auch die
 * Buchungen, die nicht im eingebetteten Widget entstanden sind — Direktlinks
 * aus Funnel, WhatsApp, E-Mail und Anzeigen — und die Embed-Buchungen, deren
 * `calendly.event_scheduled`-Nachricht im Redirect verloren ging.
 *
 * Doppelzählung verhindert die Übergabe aus CalendlyDialog.vue
 * (lib/calendlyBookingHandoff.ts): Hat der Dialog dieselbe `invitee_uuid`
 * schon gemeldet, feuert die Dankesseite nicht. Reloads der Dankesseite
 * (GA4 zählte 1,22 `termin_gebucht` je Nutzer) fängt die Liste der schon
 * gemeldeten IDs ab.
 *
 * `embedded` sagt, ob die Buchung im Widget auf unserer Seite entstand
 * (Übergabe vorhanden oder Seite läuft im iframe) oder auf calendly.com.
 * Damit lässt sich der Anteil außerhalb des Embeds in GA4 fortlaufend
 * messen — der eigentliche Auftrag von #131.
 */
export function useBookingThankYouTracking() {
  const route = useRoute();
  const { trackCalendlyBookingConfirmed, trackEvent } = useGoogleAnalytics();

  const slug = route.params.slug;
  const isThankYouPage =
    typeof slug === "string" &&
    (BOOKING_THANK_YOU_SLUGS as readonly string[]).includes(slug);

  const firstString = (v: unknown): string | undefined => {
    const x = Array.isArray(v) ? v[0] : v;
    return typeof x === "string" && x.trim() ? x.trim() : undefined;
  };

  /**
   * Erweiterte Conversions (myhb-app/myhb-os#637): Calendly gibt E-Mail
   * (`invitee_email`) und die erste Frage "Telefonnummer" (`answer_1`) an die
   * Dankesseite. Nur mit Marketing-Einwilligung und nur gehasht als
   * `ec_user_data` in die Datenschicht, BEVOR `booking_thank_you` kommt — der
   * Ads-Tag 44 liest sie ueber "Vom Nutzer bereitgestellte Daten". Ohne
   * Einwilligung wird ein frueherer Stand geleert.
   */
  const setzeErweiterteConversions = () =>
    pushErweiterteConversions(window as unknown as Parameters<typeof pushErweiterteConversions>[0], {
      email: firstString(route.query.invitee_email),
      phone: firstString(route.query.answer_1),
    });

  const track = async () => {
    try {
      await setzeErweiterteConversions();
    } catch (err) {
      console.error("[ads] erweiterte Conversions", err);
    }
    const inviteeUuid = firstString(route.query.invitee_uuid);
    const eventTypeUuid = firstString(route.query.event_type_uuid);
    const assignedTo = firstString(route.query.assigned_to);

    const handoff = readBookingHandoff();
    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    // Dedupe-Schlüssel: Calendly-ID, sonst Ereignistyp + Minute (falls eine
    // Calendly-Ereignisart die Details nicht mitgibt).
    const dedupeId = inviteeUuid
      ? `calendly:${inviteeUuid}`
      : `calendly:${eventTypeUuid ?? "unknown"}:${new Date().toISOString().slice(0, 16)}`;
    if (hasFiredBookingConfirmed(dedupeId)) return;

    const sameBooking =
      !!handoff &&
      (handoff.invitee_uuid && inviteeUuid
        ? handoff.invitee_uuid === inviteeUuid
        : // Ohne IDs: eine frische Übergabe gehört zu dieser Buchung.
          true);

    // Google-Ads-Conversion „Dankesseite Calendly" (GTM, 01.10.2026): genau
    // einmal je Buchung, auch wenn der Dialog `booking_confirmed` schon
    // gemeldet hat — jede Calendly-Buchung landet hier, das Embed nicht immer.
    // `value` ist der Seitenpreis aus dem Dialog; GTM rechnet den DB1.
    // Bewusst nicht an `booking_confirmed` (das faellt im Embed-Fall hier aus).
    trackEvent("booking_thank_you", {
      event_category: "conversion",
      booking_type: "calendly",
      event_id: inviteeUuid ?? dedupeId,
      value: sameBooking ? handoff?.booking_value : undefined,
      currency: "EUR",
    });

    // Dialog hat diese Buchung schon gemeldet → nur aufräumen.
    if (handoff?.fired && sameBooking) {
      markBookingConfirmedFired(dedupeId);
      clearBookingHandoff();
      return;
    }

    const embedded = (!!handoff && sameBooking) || inIframe;
    trackCalendlyBookingConfirmed({
      event_id: inviteeUuid,
      embedded,
      location_slug: sameBooking ? handoff?.location_slug : undefined,
      treatment_type: sameBooking ? handoff?.treatment_type : undefined,
      // #100: Die Variante kommt aus der Uebergabe, nicht aus dem Bucket-Cookie.
      // Der Cookie sagt nur, in welchem Arm der Besucher ist — die Uebergabe
      // sagt, dass DIESE Buchung aus einem Dialog unter dem Split stammt. Sonst
      // zaehlte eine spaetere Buchung ueber eine SEO-Seite mit in den Test.
      ab_variant: sameBooking ? handoff?.ab_variant : undefined,
      ab_fallback: sameBooking ? handoff?.ab_fallback : undefined,
      // Ohne diesen Wert waere die Buchung nicht mehr der Quelle zuzuordnen:
      // Calendly leitet immer auf www weiter, auch bei Anzeigen-Verkehr.
      ab_source: sameBooking ? handoff?.ab_source : undefined,
      // Calendly-Anzeigename des Standort-Kalenders, wenn kein Slug bekannt ist.
      location: assignedTo,
      confirmation_page: true,
    });
    markBookingConfirmedFired(dedupeId);
    if (sameBooking) clearBookingHandoff();
  };

  onMounted(() => {
    if (!isThankYouPage || !import.meta.client) return;
    void track();
  });

  return { isThankYouPage };
}
