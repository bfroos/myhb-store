/**
 * Anfrage aus dem Website-Funnel → Edge Function `lead-anfrage` der App
 * (E28, myhb-app/myhb-os#1637). Reine Funktionen, damit Pruefung und Umbau
 * ohne Server testbar sind; die Route steht in server/api/lead-anfrage.post.ts.
 *
 * Ziel ist das "eigene Format" von `lead-anfrage`:
 *   { behandlung, vorname, nachname, email, telefon,
 *     antworten: [{frage, antwort}], quelle, quelle_id, herkunft }
 */

export const LEAD_MAX_TEXT = 200;
export const LEAD_MAX_ANTWORTEN = 30;
export const LEAD_KONTAKTWEGE = ["whatsapp", "anruf", "email"] as const;
export type LeadKontaktweg = (typeof LEAD_KONTAKTWEGE)[number];

export type LeadEingabe = {
  behandlung?: unknown;
  name?: unknown;
  email?: unknown;
  telefon?: unknown;
  kontaktweg?: unknown;
  einwilligung?: unknown;
  antworten?: unknown;
  rechner?: unknown;
  seite?: unknown;
  attribution?: unknown;
  /** Honeypot: im Formular versteckt, ausgefuellt = Bot. */
  website?: unknown;
};

export type LeadAnfrage = {
  behandlung: string;
  vorname: string | null;
  nachname: string | null;
  email: string | null;
  telefon: string | null;
  antworten: { frage: string; antwort: string }[];
  quelle: "landingpage";
  quelle_id: string | null;
  herkunft: Record<string, unknown>;
};

export type LeadPruefung =
  | { ok: true; bot: false; anfrage: LeadAnfrage }
  | { ok: true; bot: true }
  | { ok: false; fehler: string };

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

const text = (v: unknown, max = LEAD_MAX_TEXT): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\s+/g, " ").trim();
  return s ? s.slice(0, max) : null;
};

/** "Anna Maria Muster" → Vorname "Anna Maria", Nachname "Muster". */
export function teileName(name: string | null): {
  vorname: string | null;
  nachname: string | null;
} {
  if (!name) return { vorname: null, nachname: null };
  const teile = name.split(" ");
  if (teile.length === 1) return { vorname: teile[0]!, nachname: null };
  return {
    vorname: teile.slice(0, -1).join(" "),
    nachname: teile[teile.length - 1]!,
  };
}

/** Nur JSON-artige, kleine Objekte durchlassen (Rechner, Attribution). */
function kleinesObjekt(v: unknown, maxBytes = 4000): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  try {
    const json = JSON.stringify(v);
    if (json.length > maxBytes) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function pruefeLeadEingabe(
  eingabe: LeadEingabe,
  jetzt: Date = new Date(),
): LeadPruefung {
  if (text(eingabe.website)) return { ok: true, bot: true };

  const behandlung = text(eingabe.behandlung, 80);
  if (!behandlung) return { ok: false, fehler: "Behandlung fehlt." };

  const name = text(eingabe.name);
  if (!name) return { ok: false, fehler: "Bitte gib deinen Namen an." };

  const email = text(eingabe.email)?.toLowerCase() ?? null;
  if (email && !EMAIL.test(email)) {
    return { ok: false, fehler: "Bitte prüf deine E-Mail-Adresse." };
  }
  const telefon = text(eingabe.telefon, 40);
  if (telefon && telefon.replace(/[^\d]/g, "").length < 6) {
    return { ok: false, fehler: "Bitte prüf deine Telefonnummer." };
  }
  if (!email && !telefon) {
    return { ok: false, fehler: "Bitte gib eine Telefonnummer oder E-Mail an." };
  }
  if (eingabe.einwilligung !== true) {
    return { ok: false, fehler: "Bitte bestätige die Einwilligung." };
  }

  const kontaktweg = LEAD_KONTAKTWEGE.includes(eingabe.kontaktweg as LeadKontaktweg)
    ? (eingabe.kontaktweg as LeadKontaktweg)
    : null;

  const antworten = (Array.isArray(eingabe.antworten) ? eingabe.antworten : [])
    .slice(0, LEAD_MAX_ANTWORTEN)
    .map((a: any) => ({ frage: text(a?.frage), antwort: text(a?.antwort, 500) }))
    .filter((a): a is { frage: string; antwort: string } => !!a.frage && !!a.antwort);
  if (kontaktweg) {
    antworten.push({ frage: "Wie sollen wir uns melden?", antwort: kontaktweg });
  }

  const { vorname, nachname } = teileName(name);
  const seite = text(eingabe.seite, 300);

  return {
    ok: true,
    bot: false,
    anfrage: {
      behandlung,
      vorname,
      nachname,
      email,
      telefon,
      antworten,
      quelle: "landingpage",
      quelle_id: null,
      herkunft: {
        seite,
        kontaktweg,
        rechner: kleinesObjekt(eingabe.rechner),
        attribution: kleinesObjekt(eingabe.attribution),
        eingang: jetzt.toISOString(),
      },
    },
  };
}
