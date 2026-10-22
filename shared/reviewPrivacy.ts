/**
 * Bewertungen und Aerzt:innen auf www und go. rechtssicher ausliefern
 * (bfroos/myhb-store#307, E24).
 *
 * Leitplanken (Benjamin): keine vollen Arztnamen, kein "Dr."-Titel
 * (Ausnahme Dr. Gero Ruppert), Kundinnen nur mit Vorname + Initiale.
 * Die Google-Rezensionen in Strapi nennen Aerzt:innen teils mit Titel und
 * Nachnamen ("Frau Dr. Noura Ahmad"). Der Text wird nicht umgeschrieben,
 * nur der Name gekuerzt: "Frau Dr. Noura Ahmad" -> "Noura".
 *
 * Laeuft zentral im Strapi-Proxy (server/api/strapi) und in den eigenen
 * Endpunkten, damit die Namen weder auf der Seite noch im JSON-LD oder im
 * Nuxt-Payload stehen.
 */

/**
 * Nachnamen von Aerzt:innen aus Kundenrezensionen (auch Tippfehler) und der
 * zugehoerige Vorname, wie er auf der Website steht. `null` = Vorname nicht
 * bekannt; solche Rezensionen werden nicht ausgeliefert.
 */
const SURNAMES: ReadonlyArray<readonly [RegExp, string | null]> = [
  [/^ahm[ae]d$/i, "Noura"],
  [/^rooshan$/i, "Melissa"],
  [/^karimi$/i, "Sahar"],
  [/^wahbeh$/i, "Bachar"],
  [/^masm(?:oudi|ondi|oldi)$/i, "Khaled"],
  [/^kleber$/i, null],
  [/^sch[äa]fer$/i, null],
  [/^zoabi$/i, null],
  [/^makhlin$/i, null],
  [/^zouria$/i, null],
];

/** Ausnahme: der medizinische Pruefer darf mit Titel und Namen stehen. */
const KEEP = /^(?:Gero\s+)?Ruppert$/;

const WORD = "[A-ZÄÖÜ][a-zäöüß]+(?:-[A-ZÄÖÜ][a-zäöüß]+)?";
const SALUTATION = "(?:\\b(?:Frau|Fr\\.?|Herrn?|Hr\\.?)\\s*)";
const TITLE = "(?:\\bDr(?:\\.\\s*|\\s+)(?:med\\.?\\s*)?)";

function surnameFor(word: string): { hit: boolean; firstName: string | null } {
  for (const [re, first] of SURNAMES) {
    if (re.test(word)) return { hit: true, firstName: first };
  }
  return { hit: false, firstName: null };
}

/** Wie surnameFor, aber auch kleingeschrieben ("Dr.masmoudi"). */
function surnameForLoose(word: string) {
  return surnameFor(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

/**
 * Kuerzt Arztnamen im Text. Rueckgabe null, wenn ein Nachname vorkommt, zu
 * dem kein Vorname bekannt ist (dann die Rezension lieber weglassen).
 */
export function anonymizeDoctorNames(text: string): string | null {
  let unresolved = false;
  // 1) Titel (+ Anrede) + ein oder zwei Woerter: "Frau Dr. Noura Ahmad",
  //    "Dr.masmoudi", "Dr Omar", "Herr Dr. Kleber".
  const titled = new RegExp(
    `${SALUTATION}?${TITLE}\\s*([A-Za-zÄÖÜäöüß]+(?:-[A-ZÄÖÜ][a-zäöüß]+)?)(?:\\s+(${WORD}))?`,
    "g",
  );
  let out = text.replace(titled, (whole, w1: string, w2: string | undefined) => {
    const pair = w2 ? `${w1} ${w2}` : w1;
    if (KEEP.test(pair) || KEEP.test(w1)) return whole;
    const s1 = surnameForLoose(w1);
    if (s1.hit) {
      if (!s1.firstName) unresolved = true;
      // "Dr. Masmondi Hat ..." - das zweite Wort gehoert zum Satz.
      return `${s1.firstName ?? w1}${w2 ? ` ${w2}` : ""}`;
    }
    if (w2) {
      const s2 = surnameFor(w2);
      if (s2.hit) return w1; // "Dr. Noura Ahmad" -> "Noura"
      return `${w1} ${w2}`; // "Dr. Adi Super ..." -> Titel weg, Rest bleibt
    }
    return w1;
  });
  // 2) Ohne Titel: "Frau Noura Ahmad", "Frau Nura Ahmad" -> "Noura".
  const named = new RegExp(`${SALUTATION}?(${WORD})\\s+(${WORD})`, "g");
  out = out.replace(named, (whole, w1: string, w2: string) => {
    const s2 = surnameFor(w2);
    if (!s2.hit) return whole;
    if (!s2.firstName) {
      unresolved = true;
      return whole;
    }
    return s2.firstName;
  });
  // 3) Uebrig gebliebene Nachnamen allein ("Frau Ahmad").
  const lone = new RegExp(`${SALUTATION}(${WORD})`, "g");
  out = out.replace(lone, (whole, w1: string) => {
    const s = surnameFor(w1);
    if (!s.hit) return whole;
    if (!s.firstName) unresolved = true;
    return s.firstName ?? whole;
  });
  return unresolved ? null : out;
}

/**
 * Autor:in auf Vorname + Initiale kuerzen: "Julia Karaus" -> "Julia K.",
 * "Laura G. A." bleibt, Einzelnamen bleiben.
 */
export function shortenReviewAuthor(author: string | null | undefined): string {
  const parts = String(author ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts.join(" ");
  const [first, ...rest] = parts;
  const initials = rest
    .filter((p) => !/^(?:von|van|de|der|den|du|da|di|v\.)$/i.test(p))
    .map((p) => (/^[A-Za-zÄÖÜäöü]\.$/.test(p) ? p.toUpperCase() : `${p.charAt(0).toUpperCase()}.`));
  return [first, initials[initials.length - 1] ?? ""].filter(Boolean).join(" ");
}

/**
 * Rezensionen, die andere Anbieter nennen ("... was M1 Beauty nicht
 * geschafft hat"), zeigen wir nicht: Auf unserer Seite waeren sie
 * vergleichende Werbung mit einer herabsetzenden Aussage (§ 6 UWG).
 */
const COMPETITORS = /\bM1\b|m1[- ]?beauty|aesthetify|liebdeingesicht|k[oö]e[- ]?(?:klinik|aesthetics)/i;

export function namesCompetitor(text: string | null | undefined): boolean {
  return COMPETITORS.test(String(text ?? ""));
}

/**
 * Rezensionen mit unserer frueheren Kurzbezeichnung (M-Y-H, "&", B; auch mit
 * Leerzeichen oder "und") zeigen wir nicht: Die Bezeichnung verletzt fremde
 * Markenrechte und darf nirgends mehr bei uns stehen (Markenstreit
 * LG Stuttgart 17 O 287/26, Benjamin 22.10.2026). Der Kundentext wird nicht
 * umgeschrieben, die Rezension faellt weg.
 */
const LEGACY_BRAND = /\bMY\s?H\s?(?:&|&amp;|\+|und)\s?B\b/i;

export function namesLegacyBrand(text: string | null | undefined): boolean {
  return LEGACY_BRAND.test(String(text ?? ""));
}

type ReviewShape = { author?: unknown; text?: unknown; rating?: unknown };

function isReviewShape(x: any): x is ReviewShape {
  return (
    !!x &&
    typeof x === "object" &&
    !Array.isArray(x) &&
    "author" in x &&
    "text" in x &&
    "rating" in x
  );
}

/** Eine Rezension bereinigen; null = nicht ausliefern. */
export function sanitizeReview<T extends ReviewShape>(r: T): T | null {
  let text = r.text;
  if (typeof r.text === "string") {
    if (namesCompetitor(r.text)) return null;
    if (namesLegacyBrand(r.text)) return null;
    const clean = anonymizeDoctorNames(r.text);
    if (clean === null) return null;
    text = clean;
  }
  return {
    ...r,
    text,
    author: typeof r.author === "string" ? shortenReviewAuthor(r.author) : r.author,
  };
}

/**
 * Test-Eintraege der Aerzte-Sammlung in Strapi ("Frau Ärztin Weber",
 * "MusterMannFrau"): slug "employee" bzw. "employee-<n>". Nie ausliefern.
 */
export function isTestEmployeeSlug(slug: unknown): boolean {
  return typeof slug === "string" && /^employee(?:-\d+)?$/.test(slug);
}

function isTestEmployee(x: any): boolean {
  if (!x || typeof x !== "object" || Array.isArray(x)) return false;
  if (!("firstName" in x || "employeeType" in x)) return false;
  if (isTestEmployeeSlug(x.slug)) return true;
  return x.firstName === "MusterMannFrau" || x.lastName === "MusterMannFrau";
}

/**
 * Ganze Strapi-Antwort durchgehen: Rezensionen bereinigen (oder weglassen),
 * Test-Aerzt:innen aus Listen entfernen. Gibt neue Objekte zurueck.
 */
export function sanitizeReviewsDeep<T>(input: T): T {
  const walk = (x: any): any => {
    if (Array.isArray(x)) {
      const out: any[] = [];
      for (const item of x) {
        if (isTestEmployee(item)) continue;
        if (isReviewShape(item)) {
          const r = sanitizeReview(item);
          if (r) out.push(walk(r));
          continue;
        }
        out.push(walk(item));
      }
      return out;
    }
    if (x && typeof x === "object") {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(x)) out[k] = walk(v);
      return out;
    }
    return x;
  };
  return walk(input);
}
