/**
 * Newsletter-Anmeldung fuer Adressen, die Mailchimp schon kennt (26.10.2026).
 *
 * Anlass: Eine Kundin in Kaiserslautern meldete sich auf der Website an und
 * bekam keinen 20-%-Code. Die App hatte sie beim Termin in Shopify angelegt,
 * die Shopify-Verbindung trug sie in Mailchimp als "transactional" ein. Die
 * Anmeldung lief dann in "Member Exists", die Website meldete Erfolg und
 * tat nichts. Ohne "subscribed" vergibt Discounteo keinen Code.
 *
 * Regel von Benjamin (26.10.2026): Bestandskunden bekommen keinen Code.
 * Nachgeholt wird deshalb nur, wenn Mailchimp die Adresse erst am selben Tag
 * (Berliner Zeit) von Shopify bekommen hat, also Kunde heute im Laden
 * angelegt und gleich danach angemeldet. Aeltere oder frueher abgemeldete
 * Adressen bleiben, wie sie sind: Mit "subscribed" wuerde Discounteo ihnen
 * einen Neukundencode schicken.
 */
import { createHash } from "node:crypto";

const NACHZUHOLEN = new Set(["transactional", "archived"]);

const berlinerTag = (d: Date) =>
  d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });

export function anmeldungNachholen(
  member: { status?: unknown; timestamp_opt?: unknown; timestamp_signup?: unknown } | null | undefined,
  jetzt: Date = new Date(),
): boolean {
  if (typeof member?.status !== "string" || !NACHZUHOLEN.has(member.status)) return false;
  const roh = member.timestamp_opt || member.timestamp_signup;
  if (typeof roh !== "string") return false;
  const angelegt = new Date(roh);
  if (Number.isNaN(angelegt.getTime())) return false;
  return berlinerTag(angelegt) === berlinerTag(jetzt);
}

/** Mailchimp-Mitglieds-ID: MD5 der kleingeschriebenen Adresse. */
export function subscriberHash(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}
