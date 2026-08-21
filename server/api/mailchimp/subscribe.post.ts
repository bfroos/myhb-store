// https://mailchimp.com/developer/marketing/api/list-members/add-member-to-list/

import mailchimp from "@mailchimp/mailchimp_marketing";

const ALLOWED_SOURCES = new Set([
  "newsletter_footer",
  "discount_cta_20",
  "blog_newsletter_block",
]);

// Zentrale Adresspruefung (Syntax, Tippfehler, MX-Eintrag). Dient hier als
// Sicherheitsnetz fuer alles, was am Frontend vorbeikommt: Bots, Clients
// ohne JavaScript, direkte API-Aufrufe.
const EMAIL_VALIDATION_URL =
  process.env.N8N_EMAIL_VALIDATION_URL ||
  "https://n8n.myhealthandbeauty.com/webhook/validate-email";
const EMAIL_VALIDATION_TIMEOUT_MS = 4000;

// ---- T6 Set B (#13): Quellenstempel -----------------------------------
// Wire-Format siehe app/lib/attribution.ts. Alles hier ist rein additiv
// und darf die Anmeldung NIE fehlschlagen lassen.

const WIRE_TOUCH_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "click_id",
  "ts",
  "landing_page",
  "referrer",
] as const;

type WireTouch = Partial<Record<(typeof WIRE_TOUCH_KEYS)[number], string>>;
type WireAttribution = { first?: WireTouch; last?: WireTouch };

function sanitizeTouch(input: unknown): WireTouch | undefined {
  if (!input || typeof input !== "object") return undefined;
  const out: WireTouch = {};
  for (const k of WIRE_TOUCH_KEYS) {
    const v = (input as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 500);
  }
  return Object.keys(out).length ? out : undefined;
}

function sanitizeAttribution(input: unknown): WireAttribution | null {
  if (!input || typeof input !== "object") return null;
  const first = sanitizeTouch((input as any).first);
  const last = sanitizeTouch((input as any).last);
  if (!first && !last) return null;
  return { ...(first ? { first } : {}), ...(last ? { last } : {}) };
}

// Ableitung auf die touchpoints-source-Taxonomie (nur eindeutige Faelle;
// das endgueltige Mapping macht der n8n-Intake).
function deriveSrc(t: WireTouch | undefined): string | null {
  if (!t) return null;
  const cid = t.click_id || "";
  const src = (t.utm_source || "").toLowerCase();
  const med = (t.utm_medium || "").toLowerCase();
  if (cid.startsWith("gclid:")) return "google_ads";
  if (cid.startsWith("ttclid:")) return "tiktok_ads";
  if (cid.startsWith("fbclid:")) return "meta_ads";
  if (src === "google" && (med === "cpc" || med.includes("paid"))) return "google_ads";
  if (src === "tiktok" && med.includes("paid")) return "tiktok_ads";
  if ((src === "facebook" || src === "instagram") && med.includes("paid")) return "meta_ads";
  if (med === "organic" || med === "social_organic") return "organic";
  if (med === "referral") return "referral";
  if (src === "direct") return "direct";
  return null;
}

async function isEmailDeliverable(email: string): Promise<boolean> {
  try {
    const res = await $fetch<{ valid?: boolean }>(EMAIL_VALIDATION_URL, {
      method: "POST",
      body: { email },
      timeout: EMAIL_VALIDATION_TIMEOUT_MS,
    });
    // Fail-open: nur ein ausdrueckliches false blockiert.
    return res?.valid !== false;
  } catch (err) {
    console.error("[newsletter] email validation unavailable", err);
    return true;
  }
}

export default defineEventHandler(async (event) => {
  const { mailchimpApiKey, mailchimpServerPrefix, mailchimpAudienceId } =
    useRuntimeConfig(event);

  // Optionaler n8n-Webhook (z. B. WhatsApp-Welcome via Superchat).
  // Wird nur genutzt, wenn gesetzt; blockiert die Anmeldung nie.
  const n8nNewsletterWebhookUrl = process.env.N8N_NEWSLETTER_WEBHOOK_URL;

  const body = await readBody<{
    email?: string;
    source?: string;
    phone?: string;
    attribution?: unknown;
  }>(event);
  const email = (body.email || "").trim().toLowerCase();
  const rawSource = (body.source || "").trim();
  const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : null;
  const phone = (body.phone || "").trim();
  const attribution = sanitizeAttribution(body.attribution);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "invalid_email",
      data: { errorCode: "invalid_email" },
    });
  }

  if (!(await isEmailDeliverable(email))) {
    throw createError({
      statusCode: 400,
      statusMessage: "invalid_email",
      data: { errorCode: "invalid_email" },
    });
  }

  if (!mailchimpApiKey || !mailchimpServerPrefix || !mailchimpAudienceId) {
    throw createError({
      statusCode: 500,
      statusMessage: "generic",
      data: { errorCode: "generic" },
    });
  }

  // Fire-and-forget: n8n benachrichtigen (E-Mail + optionale Handynummer
  // + Quellenstempel). Fehler hier duerfen die Newsletter-Anmeldung NIE
  // fehlschlagen lassen.
  const notifyN8n = async () => {
    if (!n8nNewsletterWebhookUrl) return;
    try {
      await $fetch(n8nNewsletterWebhookUrl, {
        method: "POST",
        body: {
          email,
          phone: phone || null,
          source: source || "newsletter_dialog",
          // T6 Set B (#13): first/last-Touch fuer touchpoints/identities.
          attribution: attribution || null,
        },
      });
    } catch (err) {
      console.error("[newsletter] n8n webhook notification failed", err);
    }
  };

  // T6 Set B (#13): Merge-Felder erst senden, wenn sie in der Audience
  // existieren (sonst 400 von Mailchimp). Nach dem Anlegen von
  // UTMSRC/UTMMED/UTMCMP/CLICKID/SRC das Env-Flag auf "1" setzen.
  const mergeFieldsReady = process.env.MAILCHIMP_ATTR_MERGE_READY === "1";
  const stampTouch = attribution?.last ?? attribution?.first;
  const mergeFields: Record<string, string> = {};
  if (mergeFieldsReady && stampTouch) {
    if (stampTouch.utm_source) mergeFields.UTMSRC = stampTouch.utm_source;
    if (stampTouch.utm_medium) mergeFields.UTMMED = stampTouch.utm_medium;
    if (stampTouch.utm_campaign) mergeFields.UTMCMP = stampTouch.utm_campaign;
    if (stampTouch.click_id) mergeFields.CLICKID = stampTouch.click_id;
    const derived = deriveSrc(stampTouch);
    if (derived) mergeFields.SRC = derived;
  }

  mailchimp.setConfig({
    apiKey: mailchimpApiKey,
    server: mailchimpServerPrefix,
  });

  try {
    const res = await mailchimp.lists.addListMember(mailchimpAudienceId, {
      email_address: email,
      status: "subscribed",
      ...(source ? { tags: [`source:${source}`] } : {}),
      ...(Object.keys(mergeFields).length ? { merge_fields: mergeFields } : {}),
    });

    await notifyN8n();

    return { ok: true, response: res };
  } catch (err: any) {
    const status = err?.status || err?.statusCode || 500;
    const errorBody = err?.response?.body || err?.data || {};
    const errorTitle = errorBody?.title;
    const errorDetail = errorBody?.detail;
    const errorType = errorBody?.type;
    const errorList = Array.isArray(errorBody?.errors) ? errorBody.errors : [];
    const hasMemberExistsCode = errorList.some(
      (entry: any) => entry?.error_code === "MEMBER_EXISTS",
    );
    const isMemberExists =
      status === 400 &&
      (errorTitle === "Member Exists" ||
        errorDetail?.includes("is already a list member") ||
        errorType?.includes("member-exists") ||
        hasMemberExistsCode);

    if (isMemberExists) {
      // Merge-Felder werden bei Bestandsmitgliedern bewusst NICHT
      // ueberschrieben (First-Stempel bleibt stehen); der n8n-Intake
      // entscheidet dort anhand von identities.
      await notifyN8n();
      return { ok: true };
    }

    const detailLower = (errorDetail || "").toLowerCase();
    const titleLower = (errorTitle || "").toLowerCase();
    const isInvalidEmail =
      detailLower.includes("valid email") ||
      detailLower.includes("invalid resource") ||
      titleLower.includes("invalid") ||
      errorList.some(
        (entry: any) =>
          entry?.field === "email_address" ||
          String(entry?.message || "").toLowerCase().includes("email"),
      );

    const errorCode = isInvalidEmail ? "invalid_email" : "generic";

    throw createError({
      statusCode: status,
      statusMessage: errorCode,
      data: { errorCode },
    });
  }
});
