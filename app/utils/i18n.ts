type PluralKeyOptions = {
  /**
   * Wenn true, wird 0 wie Singular behandelt (z.B. "0 Lounge").
   * Default: false (0 => plural/other).
   */
  zeroIsSingular?: boolean;
};

/**
 * Liefert einen i18n-Key im Format `${base}_one|${base}_other`.
 * Standard-Logik: nur 1 => one, alles andere => other.
 *
 * Mit `zeroIsSingular: true` wird 0 ebenfalls als `one` behandelt.
 */
export function pluralKey(
  base: string,
  count: number,
  opts: PluralKeyOptions = {}
) {
  const zeroIsSingular = opts.zeroIsSingular ?? false;
  const normalized = Number(count);

  const isOne = normalized === 1 || (zeroIsSingular && normalized === 0);
  return `${base}_${isOne ? "one" : "other"}`;
}
