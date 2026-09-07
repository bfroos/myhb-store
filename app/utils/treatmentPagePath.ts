/**
 * URL einer ueberregionalen Behandlungsseite.
 *
 * `pathKey` traegt den vollen Pfad inklusive aller Ancestors
 * ("hyaluron/lippen-aufspritzen") und ist damit unabhaengig von der Menuetiefe
 * korrekt. Die Navigation hat den Pfad vorher aus den einzelnen Slugs
 * zusammengesetzt - das stimmt nur bei genau zwei Ebenen: bei einer dritten
 * faellt die Mitte heraus (/behandlungen/{root}/{enkel}) und die URL gibt 404.
 *
 * Die Slug-Segmente bleiben als Fallback, solange der /menu-Endpoint
 * `pathKey` nicht ausliefert (myhb-cms#25). Damit ist das Verhalten vor dem
 * CMS-Deploy identisch zu vorher.
 */
export function treatmentPagePath(
  pathKey: string | undefined,
  ...fallbackSegments: (string | undefined)[]
): string {
  const path = pathKey || fallbackSegments.filter(Boolean).join("/");

  return `/behandlungen/${path}`;
}
