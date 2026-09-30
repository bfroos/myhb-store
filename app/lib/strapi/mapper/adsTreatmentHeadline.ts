/**
 * go.* (Ads-Modus): H1 in Suchsprache (#186).
 *
 * Wer "Falten weg" oder den Markennamen sucht, sah als H1 "Muskelrelaxans
 * Köln" - Fachsprache, nicht Suchsprache. Der Markenname darf auf go. nicht
 * stehen (shared/adsTerms.ts), also "Faltenbehandlung mit Muskelrelaxans".
 * Nur die Grundseite; Unterseiten (Zornesfalte, Stirnfalte, Kraehenfuesse ...)
 * tragen schon ein Problem-Wort und bleiben, wie sie sind.
 *
 * `null` = kein Sondertitel, die Seite nimmt ihren normalen H1.
 */
export function adsTreatmentHeadline(
  pathKey: string | null | undefined,
  city?: string | null,
): string | null {
  if (pathKey !== "muskelrelaxans" && pathKey !== "muskelrelaxans-rabatt") {
    return null;
  }
  const base = "Faltenbehandlung mit Muskelrelaxans";
  return city ? `${base} in ${city}` : base;
}
