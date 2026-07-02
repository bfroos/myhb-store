export const NEWSLETTER_SIGNUP_SOURCES = [
  "newsletter_footer",
  "discount_cta_20",
  "blog_newsletter_block",
] as const;

export type NewsletterSignupSource =
  (typeof NEWSLETTER_SIGNUP_SOURCES)[number];

export function useNewsletterSignup(
  source: NewsletterSignupSource = "newsletter_footer",
) {
  const { t, te } = useI18n();

  const email = ref("");
  const loading = ref(false);
  const success = ref<string | null>(null);
  const error = ref<string | null>(null);

  function trackSignup() {
    if (import.meta.client && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "newsletter_subscribe", {
        signup_source: source,
      });
    }
  }

  async function submit(overrideEmail?: string): Promise<boolean> {
    const emailToUse = overrideEmail ?? email.value;

    if (!emailToUse?.trim()) {
      error.value = t("newsletter.errors.generic");
      return false;
    }

    error.value = null;
    success.value = null;
    loading.value = true;

    try {
      await $fetch("/api/mailchimp/subscribe", {
        method: "POST",
        body: { email: emailToUse.trim(), source },
      });
      email.value = "";
      success.value = "ok";
      trackSignup();
      return true;
    } catch (e: any) {
      const code = e?.data?.errorCode ?? e?.statusMessage ?? "generic";
      const key = `newsletter.errors.${code}`;
      error.value = te(key) ? t(key) : t("newsletter.errors.generic");
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    email,
    loading,
    success,
    error,
    submit,
  };
}
