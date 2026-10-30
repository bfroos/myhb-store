/**
 * Bewerbung Aerzte → App (myhb-app/myhb-os#1464, E6).
 *
 * Reine Logik ohne Server, damit sie mit node:test pruefbar ist; die Route
 * steht in server/api/karriere/bewerbung.post.ts.
 *
 * Ziel ist die Edge Function `bewerbung-eingang` im "eigenen Format"
 * (supabase/functions/_shared/bewerbung.ts in myhb-os). Sie sitzt im selben
 * Projekt wie `lead-anfrage` und nimmt denselben Schluessel
 * (cron_secrets.LEAD_WEBHOOK_SECRET). Deshalb braucht es keine neue Variable
 * in Vercel: die Adresse wird aus NUXT_LEAD_ANFRAGE_URL abgeleitet.
 */

export interface BewerbungDaten {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  ausbildungsstandLabel: string;
  wunschstandort: string;
  nachricht: string;
  quelle: string;
  cv: { data: Uint8Array; filename: string; type?: string } | null;
}

/** ".../functions/v1/lead-anfrage" -> ".../functions/v1/bewerbung-eingang" */
export function bewerbungUrl(leadAnfrageUrl: string | undefined): string | null {
  const url = (leadAnfrageUrl ?? "").trim();
  if (!/\/functions\/v1\/lead-anfrage\/?$/.test(url)) return null;
  return url.replace(/lead-anfrage\/?$/, "bewerbung-eingang");
}

const MIME_AUS_ENDUNG: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const base64 = (bytes: Uint8Array): string => {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
};

/** Formular -> Body fuer bewerbung-eingang. Die Einwilligung ist vorher geprueft. */
export function bewerbungFuerApp(d: BewerbungDaten) {
  const endung = d.cv ? d.cv.filename.slice(d.cv.filename.lastIndexOf(".")).toLowerCase() : "";
  return {
    vorname: d.vorname,
    nachname: d.nachname,
    email: d.email,
    telefon: d.telefon,
    stelle: "Arzt (m/w/d)",
    standort: d.wunschstandort || null,
    ausbildungsstand: d.ausbildungsstandLabel || null,
    nachricht: d.nachricht || null,
    quelle: "website",
    datenschutz: true,
    herkunft: { formular: d.quelle },
    lebenslauf_datei: d.cv
      ? {
          name: d.cv.filename,
          typ: d.cv.type || MIME_AUS_ENDUNG[endung] || "application/pdf",
          base64: base64(d.cv.data),
        }
      : null,
  };
}
