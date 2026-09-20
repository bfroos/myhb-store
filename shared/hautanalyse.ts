/**
 * Hautanalyse: Merkmale, Empfehlungen, Buchungs-Deeplinks (#136, E19 #251/#253).
 *
 * Liegt in `shared/`, weil Seite und Server-Route denselben Satz brauchen: die
 * Seite zum Anzeigen, die Route zum Normalisieren der Anbieter-Antwort. Ein
 * zweiter Satz Merkmalsnamen waere genau die Stelle, an der ein Anbieterwechsel
 * die Empfehlungslogik still veraendert.
 *
 * Zwei Entscheidungen stecken hier drin, beide aus docs/hautanalyse-recht.md:
 *
 * 1. **Keine Krankheitsbegriffe.** Die Anbieter liefern auch Akne-, Rosazea-
 *    und Blackhead-Werte. Die tauchen hier nicht auf. Sobald das Werkzeug
 *    Krankheiten benennt, ist die Aussage "keine Diagnose" nicht mehr haltbar
 *    (elanagency/myhb-os#252), und wir landen im Medizinprodukterecht.
 * 2. **Jede Empfehlung endet in der kostenlosen Beratung**, nie direkt in einer
 *    kostenpflichtigen Behandlung. Die Behandlung steht als Kontext dabei und
 *    faehrt als `utm_content` mit, damit die Auswertung (#254) weiss, welche
 *    Empfehlung geklickt wurde — gebucht wird aber das Gespraech mit der
 *    Aerztin. Das ist zugleich die HWG-sichere Variante.
 *
 * Die Zuordnung Merkmal -> Behandlung ist **vorlaeufig**: sie stammt aus dem
 * Behandlungskatalog, nicht aus einer aerztlichen Freigabe. Die Freigabe ist
 * der offene Teil von elanagency/myhb-os#253.
 */

/** Ein Merkmal, das wir anzeigen. Bewusst kosmetisch, nie diagnostisch. */
export type MerkmalKey =
  | "falten"
  | "augenringe"
  | "feuchtigkeit"
  | "poren"
  | "textur"
  | "pigment"
  | "roetung"
  | "fettigkeit";

/** Wie stark ein Merkmal auffaellt. Aus dem Wert abgeleitet, siehe `stufeFuer`. */
export type Stufe = "gut" | "mittel" | "auffaellig";

export interface Merkmal {
  key: MerkmalKey;
  /** 0–100, **hoeher ist besser** (100 = unauffaellig). */
  wert: number;
}

export interface HautanalyseErgebnis {
  /** Geschaetztes Hautalter in Jahren, oder null wenn der Anbieter keines liefert. */
  hautalter: number | null;
  merkmale: Merkmal[];
  /**
   * Optionale Falschfarben-Bilder je Merkmal (data-URL), so wie die Anbieter
   * sie zurueckgeben. Werden nur angezeigt, nie gespeichert.
   */
  karten?: Partial<Record<MerkmalKey, string>>;
  /** Welcher Anbieter gemessen hat — steht auf der Ergebnisseite. */
  quelle: string;
}

export const MERKMAL_LABELS: Record<MerkmalKey, { titel: string; hinweis: string }> = {
  falten: {
    titel: "Linien und Fältchen",
    hinweis: "Wie deutlich sich Linien auf Stirn und um die Augen abzeichnen.",
  },
  augenringe: {
    titel: "Augenpartie",
    hinweis: "Schatten und Volumenverlust unter den Augen.",
  },
  feuchtigkeit: {
    titel: "Feuchtigkeit",
    hinweis: "Wie gut deine Haut Feuchtigkeit hält.",
  },
  poren: {
    titel: "Poren",
    hinweis: "Wie sichtbar die Poren auf Wangen, Stirn und Kinn sind.",
  },
  textur: {
    titel: "Hautbild",
    hinweis: "Wie eben und glatt die Hautoberfläche wirkt.",
  },
  pigment: {
    titel: "Pigmentunterschiede",
    hinweis: "Unterschiede im Hautton, etwa nach Sonne.",
  },
  roetung: {
    titel: "Rötungen",
    hinweis: "Wie stark gerötete Stellen hervortreten.",
  },
  fettigkeit: {
    titel: "Glanz",
    hinweis: "Wie viel Glanz die T-Zone zeigt.",
  },
};

/** Ab welchem Wert ein Merkmal als auffaellig gilt. */
export function stufeFuer(wert: number): Stufe {
  if (wert >= 75) return "gut";
  if (wert >= 50) return "mittel";
  return "auffaellig";
}

export interface Empfehlung {
  merkmal: MerkmalKey;
  titel: string;
  text: string;
  /**
   * Behandlung aus unserem Katalog, die im Gespraech in Frage kommt — oder
   * null, wenn wir dafuer nichts anbieten. Der `slug` ist der `url_slug` aus
   * `treatments` und faehrt nur als `utm_content` mit.
   */
  behandlung: { name: string; slug: string } | null;
}

/**
 * Merkmal -> Empfehlungstext und passende Behandlung. Merkmale ohne Behandlung
 * fehlen hier nicht, sie bekommen `behandlung: null` — "dafuer haben wir nichts"
 * ist eine ehrliche Antwort und besser als eine erfundene Zuordnung.
 */
const REGELN: Record<MerkmalKey, Omit<Empfehlung, "merkmal">> = {
  falten: {
    titel: "Linien glätten",
    text: "Deine Stirn- und Augenpartie zeigt deutliche Linien. Darüber lohnt sich ein Gespräch — was sinnvoll ist, entscheidet die Ärztin mit dir vor Ort.",
    behandlung: { name: "Botox®", slug: "botox-behandlung" },
  },
  augenringe: {
    titel: "Augenpartie auffrischen",
    text: "Unter den Augen zeigen sich Schatten. In der Beratung schauen wir uns an, woran das liegt.",
    behandlung: { name: "Lumi Eyes", slug: "lumi-eyes" },
  },
  feuchtigkeit: {
    titel: "Feuchtigkeit auffüllen",
    text: "Deine Haut hält aktuell wenig Feuchtigkeit. Dafür gibt es Behandlungen, die von innen polstern statt nur einzucremen.",
    behandlung: { name: "PROFHILO®", slug: "profhilo" },
  },
  poren: {
    titel: "Hautbild verfeinern",
    text: "Die Poren treten sichtbar hervor. Ein Skinbooster arbeitet genau an dieser Oberfläche.",
    behandlung: { name: "Mesotherapie", slug: "mesotherapie" },
  },
  textur: {
    titel: "Oberfläche glätten",
    text: "Die Hautoberfläche wirkt uneben. Was dagegen hilft, hängt von der Ursache ab — die klärt die Ärztin im Gespräch.",
    behandlung: { name: "Mesotherapie", slug: "mesotherapie" },
  },
  pigment: {
    titel: "Pigmentunterschiede besprechen",
    text: "Dein Hautton ist ungleichmäßig. Dafür haben wir keine eigene Behandlung — aber die Ärztin sagt dir in der kostenlosen Beratung ehrlich, was sinnvoll ist.",
    behandlung: null,
  },
  roetung: {
    titel: "Rötungen besprechen",
    text: "Es zeigen sich gerötete Stellen. Woran das liegt, kann eine Selfie-Analyse nicht beantworten — das gehört ins Gespräch.",
    behandlung: null,
  },
  fettigkeit: {
    titel: "Glanz besprechen",
    text: "Deine T-Zone glänzt deutlich. Bring das in der Beratung zur Sprache, dann ordnen wir es gemeinsam ein.",
    behandlung: null,
  },
};

/**
 * Die auffaelligsten Merkmale zuerst, hoechstens drei. Drei, weil eine
 * Ergebnisseite mit acht Empfehlungen keine Empfehlung mehr ist — und weil der
 * Katalog fuer mehr ohnehin keine sinnvollen Antworten hat.
 */
export function empfehlungenFuer(
  ergebnis: HautanalyseErgebnis,
  max = 3,
): Empfehlung[] {
  return ergebnis.merkmale
    .filter((m) => stufeFuer(m.wert) !== "gut")
    .sort((a, b) => a.wert - b.wert)
    .slice(0, max)
    .map((m) => ({ merkmal: m.key, ...REGELN[m.key] }));
}

/** Buchungsflaeche der App — dieselbe Konstante wie in `useAppBookingDialog`. */
const APP_BOOKING_URL = "https://app.myhealthandbeauty.com/book-appointment";

/** `url_slug` der kostenlosen Beratung in `treatments` (elanagency/myhb-os). */
export const BERATUNG_SLUG = "kostenlose-beratung";

/**
 * Deeplink in die App-Buchung. Vorbelegt ist immer die **kostenlose Beratung**;
 * die empfohlene Behandlung faehrt nur als `utm_content` mit, damit #254 die
 * Kette Analyse -> Beratung -> bezahlte Behandlung auswerten kann.
 */
export function beratungsDeeplink(empfehlung?: Empfehlung | null): string {
  const url = new URL(APP_BOOKING_URL);
  url.searchParams.set("treatment", BERATUNG_SLUG);
  url.searchParams.set("utm_source", "hautanalyse");
  url.searchParams.set("utm_medium", "website");
  if (empfehlung?.behandlung) {
    url.searchParams.set("utm_content", empfehlung.behandlung.slug);
  }
  return url.toString();
}
