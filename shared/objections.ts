// "Noch unsicher?" (Strapi blocks.objection-section, shared.objection-card).
//
// Platzhalter in Titel, Text und Link-Text:
//   {preis}  -> Preiszeile der Seite, z. B. "ab 79,99 € pro Zone*" (Variante A)
//               bzw. "ab 149,99 €" (Variante B)
//   {rabatt} -> Neukundenrabatt, z. B. "20 %"
// Fehlt der Wert, entfaellt die ganze Karte (beim Link-Text nur der Link) -
// nie ein halber Satz und nie ein Rabatt, den es fuer diese Besucher nicht
// gibt (Variante B: kein Rabatt).
// Unbekannte Platzhalter bleiben sichtbar stehen (Tippfehler faellt in der
// Vorschau auf). Genutzt von der v2-Ads-Vorlage und block/ObjectionSection.vue.

export type ObjectionCardLike = {
  id?: number | string | null;
  icon?: unknown;
  title?: string | null;
  text?: string | null;
  link?: unknown;
};

export type ObjectionContext = {
  /** Preiszeile der Seite; leer = Karten mit {preis} entfallen. */
  price?: string | null;
  /** Rabatt in Prozent; leer/0 = Karten mit {rabatt} entfallen. */
  discountPct?: number | null;
};

export type ResolvedObjectionCard<I = unknown, L = unknown> = {
  key: string;
  title: string;
  text: string;
  icon: I | null;
  link: L | null;
};

const PLACEHOLDER = /\{\s*(preis|rabatt)\s*\}/gi;

const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** Ersetzt {preis}/{rabatt}; null, wenn ein benoetigter Wert fehlt. */
export function fillObjectionPlaceholders(text: string, ctx: ObjectionContext = {}): string | null {
  const price = clean(ctx.price);
  const pct = typeof ctx.discountPct === "number" && ctx.discountPct > 0 ? ctx.discountPct : null;
  let missing = false;
  const out = text.replace(PLACEHOLDER, (_m, name: string) => {
    if (name.toLowerCase() === "preis") {
      if (!price) missing = true;
      return price;
    }
    if (pct === null) missing = true;
    return pct === null ? "" : `${pct}\u00a0%`;
  });
  return missing ? null : out;
}

function hasIconData(icon: unknown): boolean {
  return !!icon && typeof (icon as { iconData?: unknown }).iconData === "string" && !!clean((icon as { iconData: string }).iconData);
}

function hasLabel(link: unknown): boolean {
  return !!link && !!clean((link as { label?: unknown }).label);
}

export function resolveObjectionCard<I = unknown, L = unknown>(
  card: ObjectionCardLike | null | undefined,
  ctx: ObjectionContext = {},
  index = 0,
): ResolvedObjectionCard<I, L> | null {
  if (!card) return null;
  const rawTitle = clean(card.title);
  if (!rawTitle) return null;
  const title = fillObjectionPlaceholders(rawTitle, ctx);
  const text = fillObjectionPlaceholders(clean(card.text), ctx);
  if (title === null || text === null) return null;
  // Link-Text: dieselben Platzhalter; fehlt der Wert, entfaellt nur der Link
  // (z. B. "{rabatt} sichern" in Variante B), die Karte bleibt.
  let link: L | null = null;
  if (hasLabel(card.link)) {
    const raw = card.link as { label: string };
    const label = fillObjectionPlaceholders(clean(raw.label), ctx);
    if (label !== null) link = (label === raw.label ? raw : { ...raw, label }) as L;
  }
  return {
    key: String(card.id ?? `${index}-${rawTitle}`),
    title,
    text,
    icon: hasIconData(card.icon) ? (card.icon as I) : null,
    link,
  };
}

export function resolveObjectionCards<I = unknown, L = unknown>(
  cards: Array<ObjectionCardLike | null | undefined> | null | undefined,
  ctx: ObjectionContext = {},
): ResolvedObjectionCard<I, L>[] {
  return (cards ?? [])
    .map((c, i) => resolveObjectionCard<I, L>(c, ctx, i))
    .filter((c): c is ResolvedObjectionCard<I, L> => c !== null);
}
