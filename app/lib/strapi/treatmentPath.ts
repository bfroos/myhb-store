export interface TreatmentPage {
  slug: string;
  ancestorSlugs?: string[];
}

export function buildTreatmentPath(page: {
  slug: string;
  ancestorSlugs?: string[];
  cityLocationSlug?: string;
}): string {
  const segments = [...(page.ancestorSlugs ?? []), page.slug].filter(Boolean);

  if (page.cityLocationSlug) {
    return `/standorte/${page.cityLocationSlug}/${segments.join("/")}`;
  }

  return "/behandlungen/" + segments.join("/");
}
