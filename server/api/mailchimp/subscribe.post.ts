// https://mailchimp.com/developer/marketing/api/list-members/add-member-to-list/

import { createHash } from "node:crypto";
import mailchimp from "@mailchimp/mailchimp_marketing";

const ALLOWED_SOURCES = new Set([
  "newsletter_footer",
  "discount_cta_20",
  "blog_newsletter_block",
]);

/**
 * Bringt eine vom Nutzer eingegebene Nummer in ein E.164-nahes Format.
 * Deutschland-zentriert (fuehrende 0 -> +49), da das die Hauptzielgruppe ist.
 * Rein defensiv – schlaegt nie fehl, gibt im Zweifel die bereinigte Eingabe zurueck.
 */
function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[\s()/.-]/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith("0")) return `+49${cleaned.slice(1)}`;
  return `+${cleaned}`;
}

export default defineEventHandler(async (event) => {
  const { mailchimpApiKey, mailchimpServerPrefix, mailchimpAudienceId } =
    useRuntimeConfig(event);

  // Optionaler n8n-Webhook (z. B. WhatsApp-Welcome via Superchat).
  // Wird nur genutzt, wenn gesetzt; blockiert die Anmeldung nie.
  const n8nNewsletterWebhookUrl = process.env.N8N_NEWSLETTER_WEBHOOK_URL;

  const body = await readBody<{ email?: string; source?: string; phone?: string }>(
    event,
  );
  const email = (body.email || "").trim().toLowerCase();
  const rawSource = (body.source || "").trim();
  const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : null;
  const phone = (body.phone || "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

  // Fire-and-forget: n8n benachrichtigen (E-Mail + optionale Handynummer).
  // Fehler hier duerfen die Newsletter-Anmeldung NIE fehlschlagen lassen.
  const notifyN8n = async () => {
    if (!n8nNewsletterWebhookUrl) return;
    try {
      await $fetch(n8nNewsletterWebhookUrl, {
        method: "POST",
        body: {
          email,
          phone: phone || null,
          source: source || "newsletter_dialog",
        },
      });
    } catch (err) {
      console.error("[newsletter] n8n webhook notification failed", err);
    }
  };

  // Best-effort: Handynummer am Mailchimp-Kontakt speichern (Merge-Feld WHATSAPP).
  // Laeuft NACH dem erfolgreichen Subscribe und ist bewusst fehlertolerant –
  // ein fehlgeschlagenes Merge-Update darf die Anmeldung nie beeintraechtigen.
  const storePhoneInMailchimp = async () => {
    if (!phone) return;
    try {
      const subscriberHash = createHash("md5").update(email).digest("hex");
      await mailchimp.lists.setListMember(mailchimpAudienceId, subscriberHash, {
        email_address: email,
        status_if_new: "subscribed",
        merge_fields: { WHATSAPP: normalizePhone(phone) },
      });
    } catch (err) {
      console.error("[newsletter] mailchimp phone merge update failed", err);
    }
  };

  mailchimp.setConfig({
    apiKey: mailchimpApiKey,
    server: mailchimpServerPrefix,
  });

  try {
    const res = await mailchimp.lists.addListMember(mailchimpAudienceId, {
      email_address: email,
      status: "subscribed",
      ...(source ? { tags: [`source:${source}`] } : {}),
    });

    await storePhoneInMailchimp();
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
      await storePhoneInMailchimp();
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
