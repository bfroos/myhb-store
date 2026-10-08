/**
 * Link „Mein Konto" zur Kunden-App (bfroos/myhb-store#282, myhb-os#904).
 *
 * Ziel ist die Startseite der App, nicht `/?mode=login` und nicht
 * `/patient-dashboard`:
 * - `/` zeigt Nicht-Angemeldeten das Login (Index.tsx, Standardmodus "login")
 *   und leitet Angemeldete in ihr Dashboard (IndexWithRedirect in App.tsx).
 * - `/?mode=login` leitet Angemeldete bewusst NICHT weiter; eine Kundin, die
 *   schon angemeldet ist, saehe das Login-Formular.
 * - `/patient-dashboard` schickt Nicht-Angemeldete per ProtectedRoute auf
 *   `/?mode=login` und ersetzt dabei die URL; die UTM-Werte koennten vor der
 *   Erfassung (captureUrlAttribution) verloren gehen.
 *
 * Die UTM-Werte trennen die Einstiege fuer die Kennzahl aus myhb-os#904.
 */
export const KONTO_APP_URL = "https://app.myhealthandbeauty.com/";

export type KontoLinkOrt = "header" | "footer" | "behandlungsseite";

export function kontoLinkUrl(ort: KontoLinkOrt): string {
  const url = new URL(KONTO_APP_URL);
  url.searchParams.set("utm_source", "website");
  url.searchParams.set("utm_medium", ort);
  url.searchParams.set("utm_campaign", "konto-link");
  return url.toString();
}

/**
 * Schalter `NUXT_PUBLIC_KONTO_LINK`. Der Link geht erst nach den Schulungen
 * live (myhb-os#905, #906, Reihenfolge in #908). Darum: leer/unbekannt = AUS,
 * nur ein ausdrueckliches "on"/"1"/"true"/"yes" schaltet ihn ein.
 */
export function isKontoLinkEnabled(raw: unknown): boolean {
  const wert = String(raw ?? "").trim().toLowerCase();
  return wert === "on" || wert === "1" || wert === "true" || wert === "yes";
}
