import { toAbsoluteUrl } from "~/utils/schemaShared";

export type MedicalReviewer = {
  name: string;
  jobTitle?: string;
  specialty?: string;
  slug: string;
  photoUrl?: string;
};

/**
 * Default medical reviewer for YMYL content (E-E-A-T).
 * Chefarzt Dr. Gero Ruppert steht als medizinischer Leiter hinter den Inhalten.
 * Kann später pro Seite über ein CMS-Feld überschrieben werden, sobald weitere
 * Ärzte einer Nennung zustimmen.
 */
export const DEFAULT_MEDICAL_REVIEWER: MedicalReviewer = {
  name: "Dr. Gero Ruppert",
  jobTitle: "Chefarzt",
  specialty: "Plastische, Ästhetische & Handchirurgie",
  slug: "dr-gero-ruppert",
  photoUrl: "https://media.myhb.app/6/dr_gero_ruppert_54fc7b563a.png",
};

/** Arzt-Eintrag aus Strapi (employees), soweit fuer die Nennung gebraucht. */
export type ReviewerSource = {
  slug?: string | null;
  academicTitle?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  photo?: { url?: string | null } | null;
} | null | undefined;

/**
 * Pruefer bzw. Autor einer Seite (TSEO-12, Entscheidung Benjamin 07.10.2026):
 * Ist in Strapi ein Arzt gepflegt (z. B. Feld medicalReviewer auf der Seite
 * oder author am Blogartikel), wird er genannt. Sonst Dr. Gero Ruppert als
 * Standard. Die Strapi-Felder gibt es noch nicht; sobald sie angelegt und
 * befuellt sind, greifen sie hier ohne weitere Code-Aenderung.
 */
export function resolveMedicalReviewer(source: ReviewerSource): MedicalReviewer {
  const name = [source?.academicTitle, source?.firstName, source?.lastName]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(" ");
  if (!source?.slug || !name) return DEFAULT_MEDICAL_REVIEWER;
  return {
    name,
    slug: source.slug,
    ...(source.role ? { jobTitle: source.role } : {}),
    ...(source.photo?.url ? { photoUrl: source.photo.url } : {}),
  };
}

/**
 * schema.org Person node für author / reviewedBy.
 * WICHTIG: Person (nicht Physician) ist für Autorschaft korrekt –
 * Physician ist ein MedicalBusiness-Typ, keine Person.
 */
export function buildReviewerPersonSchema(
  reviewer: MedicalReviewer,
  publicUrl: string,
  brandName?: string,
): Record<string, unknown> | null {
  if (!reviewer?.name) return null;
  return {
    "@type": "Person",
    name: reviewer.name,
    ...(reviewer.jobTitle ? { jobTitle: reviewer.jobTitle } : {}),
    ...(reviewer.slug
      ? { url: toAbsoluteUrl(publicUrl, `/aerzte/${reviewer.slug}`) }
      : {}),
    ...(reviewer.photoUrl ? { image: reviewer.photoUrl } : {}),
    ...(brandName
      ? {
          worksFor: {
            "@type": "Organization",
            "@id": `${toAbsoluteUrl(publicUrl, "/")}#organization`,
            name: brandName,
          },
        }
      : {}),
  };
}

/**
 * schema.org MedicalWebPage node – der korrekte Typ für eine medizinisch
 * geprüfte Seite. Trägt lastReviewed + reviewedBy (Person).
 */
export function buildMedicalWebPageSchema(opts: {
  publicUrl: string;
  path: string;
  reviewer: MedicalReviewer;
  lastReviewed?: string | null;
  brandName?: string;
}): Record<string, unknown> | null {
  const person = buildReviewerPersonSchema(
    opts.reviewer,
    opts.publicUrl,
    opts.brandName,
  );
  if (!person) return null;

  let lastReviewed: string | undefined;
  if (opts.lastReviewed) {
    const d = new Date(opts.lastReviewed);
    if (!isNaN(d.getTime())) lastReviewed = d.toISOString().slice(0, 10);
  }

  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    url: toAbsoluteUrl(opts.publicUrl, opts.path),
    ...(lastReviewed ? { lastReviewed } : {}),
    reviewedBy: person,
  };
}
