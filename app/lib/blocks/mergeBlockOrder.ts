/**
 * Effektive Block-Reihenfolge einer Standort-Behandlungsseite.
 *
 * Vertrag mit dem CMS (siehe myhb-cms, findByLocationAndPath):
 *   blockOrder   = reine SORTIERUNG. Nicht gelistete Bloecke werden in
 *                  Default-Reihenfolge HINTEN angehaengt. Eine unvollstaendige
 *                  Liste blendet also nichts aus.
 *   hiddenBlocks = explizites AUSBLENDEN.
 *   Beide sind null, wenn nicht gepflegt (nie []).
 *
 * Wichtig: Es wird bewusst NICHT `?? DEFAULT` verwendet. Ein leeres Array
 * wuerde damit durchrutschen und die Seite komplett leeren.
 */
export function mergeBlockOrder(
  customOrder: unknown,
  defaultOrder: readonly string[],
  hiddenBlocks?: unknown,
): string[] {
  const custom = Array.isArray(customOrder)
    ? customOrder.filter((key): key is string => typeof key === "string")
    : [];
  const hidden = new Set(
    Array.isArray(hiddenBlocks)
      ? hiddenBlocks.filter((key): key is string => typeof key === "string")
      : [],
  );

  const seen = new Set<string>();
  const result: string[] = [];

  // Erst die gepflegte Reihenfolge, dann der Rest in Default-Reihenfolge.
  for (const key of [...custom, ...defaultOrder]) {
    if (seen.has(key)) continue;
    seen.add(key);
    if (hidden.has(key)) continue;
    result.push(key);
  }

  return result;
}
