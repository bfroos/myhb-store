/**
 * Newsletter-Anmeldung fuer Adressen, die Mailchimp schon kennt (26.10.2026).
 *
 * Anlass: Eine Kundin in Kaiserslautern meldete sich auf der Website an und
 * bekam keinen 20-%-Code. Die App hatte sie beim Termin in Shopify angelegt,
 * die Shopify-Verbindung trug sie in Mailchimp als "transactional" ein. Die
 * Anmeldung lief dann in "Member Exists", die Website meldete Erfolg und
 * tat nichts. Ohne "subscribed" vergibt Discounteo keinen Code.
 *
 * Wer sich selbst ueber das Formular anmeldet, willigt neu ein. Diese
 * Stati werden deshalb auf "subscribed" gesetzt. "cleaned" (Adresse
 * unzustellbar) und "pending"/"subscribed" bleiben unberuehrt.
 */
import { createHash } from "node:crypto";

const NACHZUHOLEN = new Set(["transactional", "archived", "unsubscribed"]);

export function anmeldungNachholen(status: unknown): boolean {
  return typeof status === "string" && NACHZUHOLEN.has(status);
}

/** Mailchimp-Mitglieds-ID: MD5 der kleingeschriebenen Adresse. */
export function subscriberHash(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}
