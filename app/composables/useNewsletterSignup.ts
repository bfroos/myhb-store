import { readWireAttribution } from "~/lib/attribution";
import { leadEventId } from "~/lib/checkoutAttempt";

export const NEWSLETTER_SIGNUP_SOURCES = [
  "newsletter_footer",
  "discount_cta_20",
  "blog_newsletter_block",
] as const;

export type NewsletterSignupSource =
  (typeof NEWSLETTER_SIGNUP_SOURCES)[number];

// Zentrale Adresspruefung (Syntax, Tippfehler-Vorschlag, MX-Eintrag).
// Derselbe Endpunkt wird von der Referral-Landingpage und den n8n-Intakes
// genutzt, damit die Providerliste nur an einer Stelle gepflegt wird.
const EMAIL_VALIDATION_URL =
  "https://n8n.myhealthandbeauty.com/webhook/validate-email";
const EMAIL_VALIDATION_TIMEOUT_MS = 4000;

type EmailValidationResult = {
  valid: boolean;
  suggestion?: string | null;
  reason?: string;
};

async function validateEmailAddress(
  value: string,
): Promise<EmailValidationResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      EMAIL_VALIDATION_TIMEOUT_MS,
    );
    const result = await $fetch<EmailValidationResult>(EMAIL_VALIDATION_URL, {
      method: "POST",
      body: { email: value },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return result ?? { valid: true };
  } catch {
    // Fail-open: Dienst nicht erreichbar -> niemals blockieren.
    return { valid: true };
  }
}

// go. Variante A (02.10.2026): Wer sich schon angemeldet hat, bekommt beim
// naechsten "20 % Rabatt sichern" nicht noch einmal das Formular, sondern
// gleich die Buchung. Gemerkt wird nur, DASS angemeldet wurde (kein E-Mail,
// keine Telefonnummer) - eine reine Komfortmarke im Browser.
const SIGNED_UP_KEY = "myhb_newsletter_signed_up";

export function rememberNewsletterSignup(): void {
  if (!import.meta.client) return;
  try {
    localStorage.setItem(SIGNED_UP_KEY, new Date().toISOString().slice(0, 10));
  } catch {}
}

export function hasNewsletterSignup(): boolean {
  if (!import.meta.client) return false;
  try {
    return !!localStorage.getItem(SIGNED_UP_KEY);
  } catch {
    return false;
  }
}

/**
 * Warum `submit` false lieferte: "validation" = Eingabe korrigierbar
 * (leer, Tippfehler-Vorschlag, ungueltige Adresse), "server" = Anmeldung
 * selbst gescheitert (Mailchimp/Netz). Der Rabatt-Dialog oeffnet bei
 * "server" trotzdem die Buchung.
 */
export type NewsletterSignupFailure = "validation" | "server";

export function useNewsletterSignup(
  source: NewsletterSignupSource = "newsletter_footer",
) {
  const { t, te } = useI18n();
  const { trackEvent } = useGoogleAnalytics();

  const email = ref("");
  const phone = ref("");
  const loading = ref(false);
  const success = ref<string | null>(null);
  const error = ref<string | null>(null);
  const failure = ref<NewsletterSignupFailure | null>(null);
  // Vorschlag bei erkanntem Tippfehler, z. B. "max@gmail.com" statt
  // "max@gmial.com". Wird der Nutzerin einmal angeboten; schickt sie
  // dieselbe Adresse erneut ab, wird sie akzeptiert.
  const suggestion = ref<string | null>(null);
  const suggestionShownFor = ref<string | null>(null);

  function applySuggestion() {
    if (!suggestion.value) return;
    email.value = suggestion.value;
    suggestion.value = null;
    error.value = null;
  }

  function trackSignup() {
    if (import.meta.client && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "newsletter_subscribe", {
        signup_source: source,
      });
    }
    // Meta „Lead" und die Google-Ads-Conversion „Rabatt-Anmeldung" haengen in
    // GTM an diesem flachen Ereignis. Das gtag-Ereignis oben bleibt fuer die
    // bestehenden GA4-Berichte; seine Parameter liegen in GTM unter
    // `eventModel.*` und taugen nicht fuer Tags (siehe useGoogleAnalytics).
    // Bis 01.10.2026 kam eine Anmeldung bei Meta und Google Ads gar nicht an.
    trackEvent("newsletter_signup", {
      event_category: "conversion",
      signup_source: source,
      event_id: leadEventId(),
    });
  }

  function invalidEmailMessage() {
    const key = "newsletter.errors.invalid_email";
    return te(key) ? t(key) : t("newsletter.errors.generic");
  }

  async function submit(overrideEmail?: string): Promise<boolean> {
    const emailToUse = overrideEmail ?? email.value;

    failure.value = null;
    if (!emailToUse?.trim()) {
      failure.value = "validation";
      error.value = t("newsletter.errors.generic");
      return false;
    }

    error.value = null;
    success.value = null;
    loading.value = true;

    try {
      const trimmed = emailToUse.trim();
      const normalized = trimmed.toLowerCase();
      const check = await validateEmailAddress(trimmed);

      if (check.valid === false) {
        suggestion.value = check.suggestion ?? null;
        suggestionShownFor.value = normalized;
        error.value = invalidEmailMessage();
        failure.value = "validation";
        return false;
      }

      // Adresse ist technisch zustellbar, sieht aber nach Tippfehler aus.
      // Wichtig: Domains wie 109gmail.com oder gmy.de haben echte
      // Mailserver (Typosquatting/geparkt) - die Mail bounct nicht, sie
      // verschwindet. Nur der Vorschlag faengt diese Faelle ab.
      if (
        check.suggestion &&
        check.suggestion.toLowerCase() !== normalized &&
        suggestionShownFor.value !== normalized
      ) {
        suggestion.value = check.suggestion;
        suggestionShownFor.value = normalized;
        failure.value = "validation";
        return false;
      }

      suggestion.value = null;

      await $fetch("/api/mailchimp/subscribe", {
        method: "POST",
        body: {
          email: trimmed,
          source,
          // Handynummer ist optional; nur mitsenden, wenn ausgefuellt.
          phone: phone.value?.trim() || undefined,
          // T6 Set B (#13): Quellenstempel aus dem utm-persist-Plugin.
          // Rein additiv; wenn nichts erfasst wurde, fehlt das Feld.
          attribution: readWireAttribution() ?? undefined,
        },
      });
      email.value = "";
      phone.value = "";
      suggestionShownFor.value = null;
      success.value = "ok";
      rememberNewsletterSignup();
      trackSignup();
      return true;
    } catch (e: any) {
      const code = e?.data?.errorCode ?? e?.statusMessage ?? "generic";
      failure.value = code === "invalid_email" ? "validation" : "server";
      const key = `newsletter.errors.${code}`;
      error.value = te(key) ? t(key) : t("newsletter.errors.generic");
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    email,
    phone,
    loading,
    success,
    error,
    failure,
    suggestion,
    applySuggestion,
    submit,
  };
}
