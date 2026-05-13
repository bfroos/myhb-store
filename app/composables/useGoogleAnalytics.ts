/**
 * Composable for Google Analytics 4 Event Tracking
 * Provides gtag() interface for tracking custom events
 */

export const useGoogleAnalytics = () => {
  /**
   * Track custom event in GA4
   * @param eventName - Event identifier
   * @param eventParams - Event parameters (optional)
   */
  const trackEvent = (
    eventName: string,
    eventParams?: Record<string, any>
  ) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, eventParams || {});
    }
  };

  /**
   * Track page view
   * @param pagePath - Page path
   * @param pageTitle - Page title
   */
  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
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
   * Track booking/Calendly click
   */
  const trackBookingClick = () => {
    trackEvent('click_booking', {
      event_category: 'conversion',
      booking_type: 'calendly',
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
    trackPhoneClick,
    trackFormSubmission,
  };
};
