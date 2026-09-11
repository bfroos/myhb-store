/**
 * Composable fuer GA4-Event-Tracking ueber den GTM-Container GTM-5KCNWFWS.
 *
 * Events gehen als flache Datenschicht-Objekte `{ event, ...params }` raus,
 * NICHT als `gtag('event', ...)`. Hintergrund (bfroos/myhb-store#120):
 *
 * GTM macht aus einem gtag-Aufruf zwar ein Ereignis mit dem passenden Namen —
 * der GA4-Tag "Funnel Events" (tag_id 108) feuerte deshalb auch fuer das
 * `booking_confirmed` dieser Website. Die Parameter eines gtag-Aufrufs liegen
 * in GTM aber unter `eventModel.*`, waehrend die Datenschichtvariablen des
 * Containers (`booking_type`, `event_id`, `location`, ...) die Top-Level-Keys
 * lesen. Ergebnis in GA4, Woche 04.–10.09.2026: 86 von 87 `booking_confirmed`
 * mit `booking_type = (not set)`, das einzige gesetzte kam aus der App.
 *
 * Die App pusht seit jeher flache Objekte (src/lib/analytics.ts in
 * elanagency/myhb-os). Diese Datei folgt jetzt demselben Vertrag, damit ein
 * Variablensatz im Container beide Flaechen bedient. Nebeneffekt: Kein
 * `if (window.gtag)`-Guard mehr — GTM arbeitet die Datenschicht beim Laden
 * nach, fruehe Klicks vor dem Consent-Banner gehen nicht verloren.
 */
import { readGaAttributionParams } from "~/lib/attribution";

type DataLayerObject = Record<string, unknown> & { event: string };

const pushToDataLayer = (payload: DataLayerObject) => {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(payload);
};

export const useGoogleAnalytics = () => {
  /**
   * Track custom event in GA4 (via GTM-Datenschicht)
   * @param eventName - Event identifier
   * @param eventParams - Event parameters (optional)
   */
  const trackEvent = (
    eventName: string,
    eventParams?: Record<string, any>
  ) => {
    // Conversion-Events tragen die Kampagnenwerte selbst mit. GA4 kennt die
    // Sitzungsquelle ohnehin, aber nur so lassen sich Calendly- und
    // App-Buchungen im selben Funnel nach Kanal aufteilen — die App schickt
    // dieselben Feldnamen mit `booking_confirmed`. Explizite Parameter des
    // Aufrufers gewinnen.
    const params = eventParams || {};
    const withAttribution =
      params.event_category === 'conversion'
        ? { ...(readGaAttributionParams() ?? {}), ...params }
        : params;
    // `event` zuletzt, damit kein Parameter den Ereignisnamen ueberschreibt.
    pushToDataLayer({ ...withAttribution, event: eventName });
  };

  /**
   * Track page view
   * @param pagePath - Page path
   * @param pageTitle - Page title
   */
  const trackPageView = (pagePath: string, pageTitle?: string) => {
    pushToDataLayer({
      event: 'page_view',
      page_path: pagePath,
      page_title: pageTitle,
    });
  };

  /**
   * Track CTA click events
   */
  const trackCtaClick = (ctaLocation: string) => {
    trackEvent('click_cta', {
      event_category: 'engagement',
      cta_location: ctaLocation, // 'hero', 'middle', 'footer', etc.
    });
  };

  /**
   * Track discount offer click
   */
  const trackDiscountOfferClick = () => {
    trackEvent('click_discount_offer', {
      event_category: 'engagement',
      offer: '20_percent_rabatt',
    });
  };

  /**
   * Track FAQ accordion open
   */
  const trackFaqOpen = (faqQuestion: string) => {
    trackEvent('faq_open', {
      event_category: 'engagement',
      question: faqQuestion,
    });
  };

  /**
   * Track carousel navigation
   */
  const trackCarouselNavigate = (direction: 'next' | 'prev', currentIndex: number) => {
    trackEvent('carousel_navigate', {
      event_category: 'engagement',
      direction,
      current_index: currentIndex,
    });
  };

  /**
   * Track booking click (Calendly widget or in-app booking flow).
   *
   * `bookingType` names the system that actually opens: 'app' for the
   * app.myhealthandbeauty.com iframe, 'calendly' for the Calendly widget,
   * 'location_search' when the location picker opens first (the concrete
   * system is then tracked via trackBookingLocationSelected()).
   */
  const trackBookingClick = (
    bookingType: 'calendly' | 'app' | 'location_search' = 'calendly',
    extra?: { location_slug?: string; treatment_type?: string; cta_location?: string },
  ) => {
    trackEvent('click_booking', {
      event_category: 'conversion',
      booking_type: bookingType,
      ...(extra ?? {}),
    });
  };

  /**
   * Track the location picked inside the booking dialog. Fires with the
   * system that opens for that location so the funnel can be split by
   * Calendly vs. app per lounge.
   */
  const trackBookingLocationSelected = (
    bookingType: 'calendly' | 'app',
    locationSlug?: string,
  ) => {
    trackEvent('booking_location_selected', {
      event_category: 'conversion',
      booking_type: bookingType,
      location_slug: locationSlug,
    });
  };

  /**
   * Track that the visitor picked a slot in the Calendly widget — the step
   * between opening the widget and confirming. Mirrors the app's
   * `summary_view` so both systems can be compared at the same funnel stage.
   */
  const trackCalendlyDateTimeSelected = (extra?: {
    location_slug?: string;
    treatment_type?: string;
  }) => {
    trackEvent('booking_datetime_selected', {
      event_category: 'conversion',
      booking_type: 'calendly',
      ...(extra ?? {}),
    });
  };

  /**
   * Track a COMPLETED Calendly booking (`calendly.event_scheduled`).
   *
   * Deliberately the same event name the app pushes on a confirmed booking
   * (`booking_confirmed`, see src/lib/analytics.ts in elanagency/myhb-os), so
   * the conversion rate of both systems is comparable in one GA4 funnel:
   * `click_booking` → `booking_confirmed`, split by `booking_type`.
   *
   * Until this existed we only tracked that Calendly *opened*, never that
   * somebody booked — Calendly had a denominator but no numerator.
   *
   * `event_id` carries the Calendly invitee URI so a booking counts once even
   * if the widget fires the message twice.
   */
  const trackCalendlyBookingConfirmed = (extra?: {
    location_slug?: string;
    treatment_type?: string;
    event_id?: string;
  }) => {
    trackEvent('booking_confirmed', {
      event_category: 'conversion',
      booking_type: 'calendly',
      ...(extra ?? {}),
    });
  };

  /**
   * Track phone click
   */
  const trackPhoneClick = (phoneNumber?: string) => {
    trackEvent('click_phone', {
      event_category: 'conversion',
      phone_number: phoneNumber,
    });
  };

  /**
   * Track form submission
   */
  const trackFormSubmission = (formName: string) => {
    trackEvent('form_submission', {
      event_category: 'conversion',
      form_name: formName,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackCtaClick,
    trackDiscountOfferClick,
    trackFaqOpen,
    trackCarouselNavigate,
    trackBookingClick,
    trackBookingLocationSelected,
    trackCalendlyDateTimeSelected,
    trackCalendlyBookingConfirmed,
    trackPhoneClick,
    trackFormSubmission,
  };
};
