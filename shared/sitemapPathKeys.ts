/**
 * Behandlungs-pathKeys einer Filiale plus alle Eltern-pathKeys, ohne Dubletten,
 * Reihenfolge stabil (Eltern vor der ersten Unterseite).
 * "skinbooster/profhilo" bringt "skinbooster" mit.
 */
export function withAncestorPathKeys(keys: ReadonlyArray<string | null | undefined>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const key of keys) {
    if (!key) continue;
    const parts = key.split("/").filter(Boolean);
    for (let i = 1; i <= parts.length; i++) {
      const k = parts.slice(0, i).join("/");
      if (!seen.has(k)) {
        seen.add(k);
        out.push(k);
      }
    }
  }
  return out;
}
