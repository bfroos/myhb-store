/**
 * Behandlungsmenue ohne verwaiste Seiten (Footer und Kopfmenue).
 *
 * Der /menu-Endpoint von Strapi liefert eine Seite oben in der Liste, sobald
 * sie in dieser Sprache keine Elternseite hat. Im Franzoesischen lagen so am
 * 16.10.2026 elf Altseiten vom Mai ("Hände", "Krähenfüße", "Bruststraffung")
 * mit deutschem Namen in der obersten Ebene, die meisten mit Ziel 404.
 * Eine Seite, deren pathKey einen Schraegstrich hat, ist eine Unterseite und
 * gehoert nicht nach oben. Eintraege ohne Namen (Entwuerfe) fallen ebenfalls
 * raus.
 */
export type MenuNode = {
  name: string;
  pathKey?: string;
  children?: MenuNode[];
};

function hasName(item: MenuNode): boolean {
  return typeof item.name === "string" && item.name.trim() !== "";
}

function withoutNameless<T extends MenuNode>(items: T[]): T[] {
  return items.filter(hasName).map((item) =>
    item.children?.length
      ? { ...item, children: withoutNameless(item.children as T[]) }
      : item,
  );
}

export function cleanMenuTree<T extends MenuNode>(items: T[]): T[] {
  const topLevel = items.filter(
    (item) => !item.pathKey || !item.pathKey.includes("/"),
  );
  return withoutNameless(topLevel);
}
