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
import { mirrorFunnelEvent } from "~/lib/firstPartyFunnel";
import { checkoutEventId, startCheckoutAttempt } from "~/lib/checkoutAttempt";
import { carriesOfferVariant, currentOfferVariant } from "~/lib/offerVariant";

type DataLayerObject = Record<string, unknown> & { event: string };

const pushToDataLayer = (payload: DataLayerObject) => {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(payload);
  // Trichter-Ereignisse zusaetzlich in die eigene Datenbank (myhb-os#521).
  mirrorFunnelEvent(payload);
};

/** Ereignisse, an denen die A/B-Werte je Ereignis stimmen muessen (#161). */
const istBuchungsereignis = (eventName: string): boolean =>
  eventName === "click_booking" || eventName.startsWith("booking_");

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
    // Leere Felder rausfiltern: Ein `ab_variant: undefined` aus einem
    // Aufrufer-Objekt wuerde sonst den Wert aus dem Speicher ueberschreiben.
    const params = Object.fromEntries(
      Object.entries(eventParams ?? {}).filter(([, v]) => v !== undefined),
    ) as Record<string, any>;
    // #161: `ab_fallback` und `ab_bypass` sind ereignisgenau. Der Filter oben
    // liess ein frueheres `ab_fallback: true` im Datenmodell stehen, und jedes
    // spaetere Buchungsereignis ohne Rueckfall erbte es — GTM liest den
    // zusammengefuehrten Stand, nicht den auslösenden Push. Ein Push mit
    // `undefined` setzt den Schluessel im Modell zurueck (so arbeitet auch
    // plugins/ab-split.client.ts). Bewusst kein `false`: das fuellte die
    // GA4-Dimension, ohne etwas zu sagen. `ab_variant`/`ab_source` bleiben
    // beim Modell — die pflegt ab-split je Seite aus dem Cookie.
    if (istBuchungsereignis(eventName)) {
      params.ab_fallback = params.ab_fallback === true ? true : undefined;
      params.ab_bypass = params.ab_bypass === true ? true : undefined;
    }
    const withAttribution =
      params.event_category === 'conversion'
        ? { ...(readGaAttributionParams() ?? {}), ...params }
        : params;
    // go.-Vorschau der Seitenvorlage v2 (/vorschau-v2/...): Ereignisse tragen
    // `template: "v2-preview"`, damit Vorschau-Klicks die Messwerte der
    // echten Anzeigenseiten nicht vermischen. Sonst kein Feld (unveraendert).
    const previewTemplate =
      typeof window !== 'undefined'
        ? (window as any).__myhbPreviewTemplate
        : undefined;
    const withTemplate = previewTemplate
      ? { ...withAttribution, template: previewTemplate }
      : withAttribution;
    // go.-Angebots-Test (shared/adsOfferVariant.ts): `offer_variant` "a"/"b"
    // an den Konversions-Ereignissen, nur wenn bekannt. Ein Wert des
    // Aufrufers gewinnt.
    const offerVariant = carriesOfferVariant(eventName) ? currentOfferVariant() : undefined;
    const tagged =
      offerVariant && withTemplate.offer_variant === undefined
        ? { ...withTemplate, offer_variant: offerVariant }
        : withTemplate;
    // `event` zuletzt, damit kein Parameter den Ereignisnamen ueberschreibt.
    pushToDataLayer({ ...tagged, event: eventName });
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
    extra?: {
      location_slug?: string;
      treatment_type?: string;
      cta_location?: string;
      /** Variante des A/B-Splits (#100), falls der Besucher im Test ist. */
      ab_variant?: 'app' | 'calendly';
      /** App-Arm, der mangels appBookingUrl auf Calendly zurueckfiel (#100). */
      ab_fallback?: boolean;
      /** Deployment der Zuweisung: ads oder seo — trennt die beiden Toepfe. */
      ab_source?: 'ads' | 'seo';
      /**
       * Knopf mit Strapi-Methode `app-booking` (#128): oeffnet die App am
       * A/B-Split vorbei. Nur wenn wahr — ein `false` an jedem Klick wuerde die
       * GA4-Dimension fuellen, ohne etwas zu sagen.
       */
      ab_bypass?: boolean;
      /**
       * Dialog von einer Behandlungsseite geoeffnet, mit Kontextzeile
       * „<Behandlung> · ab <Preis>" im Kopf (bfroos/myhb-store#78). Immer
       * gesetzt (true/false), damit die Wochenauswertung
       * (elanagency/myhb-os#271) beide Gruppen gegeneinander stellen kann.
       */
      treatment_context?: boolean;
      /**
       * Preis der Behandlungsseite als Zahl (elanagency/myhb-os#400), aus
       * der Kontextzeile. GTM liest ihn fuer Meta „Schedule mit Wert", wenn
       * spaeter die Calendly-Buchung eintrifft.
       */
      booking_value?: number;
      /**
       * Buchung nach „20 % Rabatt sichern" (`nk20`). Der Wert oben ist dann
       * schon der Neukundenpreis.
       */
      offer?: string;
    },
  ) => {
    // #400: ein Klick = ein Buchungsversuch. Dieselbe event_id traegt die App
    // an `booking_start` (per ?checkout_id=), Meta zaehlt InitiateCheckout
    // dann einmal.
    const checkoutId = startCheckoutAttempt();
    trackEvent('click_booking', {
      event_category: 'conversion',
      booking_type: bookingType,
      ...(extra ?? {}),
      treatment_context: extra?.treatment_context ?? false,
      event_id: checkoutEventId(checkoutId),
      // Bewusst null statt weglassen: GTM liest den zusammengefuehrten Stand
      // der Datenschicht, ein Preis vom vorigen Klick darf nicht kleben (#161).
      booking_value: extra?.booking_value ?? null,
      booking_currency: extra?.booking_value ? 'EUR' : null,
      // Ebenso: das Angebot des vorigen Versuchs darf nicht kleben.
      offer: extra?.offer ?? null,
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
    ab?: {
      ab_variant?: 'app' | 'calendly';
      ab_fallback?: boolean;
      ab_source?: 'ads' | 'seo';
      /** Dialog kam von einer Behandlungsseite (#78). */
      treatment_context?: boolean;
      /**
       * #182: Slug des Seitenstandorts ohne Online-Buchung, von dem aus eine
       * andere Lounge gewaehlt wurde (z. B. "mediapark-klinik").
       */
      fallback_from?: string;
    },
  ) => {
    trackEvent('booking_location_selected', {
      event_category: 'conversion',
      booking_type: bookingType,
      location_slug: locationSlug,
      ...(ab ?? {}),
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
    ab_variant?: 'app' | 'calendly';
    ab_fallback?: boolean;
    ab_source?: 'ads' | 'seo';
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
   * `event_id` carries the Calendly invitee UUID so a booking counts once even
   * if the widget fires the message twice.
   *
   * Fires from two places (elanagency/myhb-os#131): the embedded widget
   * (`embedded: true`) and the thank-you page Calendly redirects to
   * (`confirmation_page: true`; `embedded` false for bookings made on
   * calendly.com itself). lib/calendlyBookingHandoff.ts keeps the two from
   * double counting. `location` is the Calendly calendar's display name
   * (`assigned_to`) when the thank-you page has no location slug.
   */
  const trackCalendlyBookingConfirmed = (extra?: {
    location_slug?: string;
    treatment_type?: string;
    event_id?: string;
    embedded?: boolean;
    location?: string;
    confirmation_page?: boolean;
    /** Variante des A/B-Splits (#100), falls die Buchung aus dem Test kommt. */
    ab_variant?: 'app' | 'calendly';
    /** App-Arm, der mangels appBookingUrl auf Calendly zurueckfiel (#100). */
    ab_fallback?: boolean;
    /** Deployment der Zuweisung: ads oder seo. */
    ab_source?: 'ads' | 'seo';
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
   * Track a submitted job application (bfroos/myhb-store#102).
   *
   * Fires only after the server route confirmed that the application reached
   * HubSpot — a `career_apply` on a failed submit would inflate the only
   * number the recruiting funnel has.
   */
  const trackCareerApply = (extra?: {
    job_type?: string;
    location_slug?: string;
  }) => {
    trackEvent('career_apply', {
      event_category: 'conversion',
      ...(extra ?? {}),
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
    trackCareerApply,
    trackFormSubmission,
  };
};
