/**
 * Composable for Google Maps Cookie Consent (Cookiebot)
 */

export function useCookiebot() {
  const hasPreferencesConsent = ref(false);
  const hasStatisticsConsent = ref(false);
  const hasMarketingConsent = ref(false);
  const isReady = ref(false);

  const checkConsent = (): boolean => {
    if (!import.meta.client) return false;
    if (typeof window === "undefined" || !window.Cookiebot) return false;

    try {
      hasPreferencesConsent.value =
        window.Cookiebot?.consent?.preferences === true;
      hasStatisticsConsent.value =
        window.Cookiebot?.consent?.statistics === true;
      hasMarketingConsent.value = window.Cookiebot?.consent?.marketing === true;
      return true;
    } catch (error) {
      console.warn("Error checking Cookiebot consent:", error);
      return false;
    }
  };

  const openCookieSettings = () => {
    if (!import.meta.client) return;

    const cb = window.Cookiebot;
    if (!cb) return;

    if (typeof cb.show === "function") {
      cb.show();
    } else if (typeof cb.renew === "function") {
      cb.renew();
    }
  };

  const onCookiebotReady = () => {
    if (checkConsent()) {
      isReady.value = true;
    }
  };

  onMounted(() => {
    if (!import.meta.client) return;

    onCookiebotReady();

    window.addEventListener(
      "CookiebotOnLoad",
      onCookiebotReady as EventListener,
    );
    window.addEventListener(
      "CookiebotOnConsentReady",
      onCookiebotReady as EventListener,
    );
    window.addEventListener(
      "CookiebotOnAccept",
      onCookiebotReady as EventListener,
    );
    window.addEventListener(
      "CookiebotOnDecline",
      onCookiebotReady as EventListener,
    );
  });

  onBeforeUnmount(() => {
    if (!import.meta.client) return;

    window.removeEventListener(
      "CookiebotOnLoad",
      onCookiebotReady as EventListener,
    );
    window.removeEventListener(
      "CookiebotOnConsentReady",
      onCookiebotReady as EventListener,
    );
    window.removeEventListener(
      "CookiebotOnAccept",
      onCookiebotReady as EventListener,
    );
    window.removeEventListener(
      "CookiebotOnDecline",
      onCookiebotReady as EventListener,
    );
  });

  return {
    hasPreferencesConsent: readonly(hasPreferencesConsent),
    hasStatisticsConsent: readonly(hasStatisticsConsent),
    hasMarketingConsent: readonly(hasMarketingConsent),
    isReady: readonly(isReady),
    checkConsent,
    openCookieSettings,
  };
}
