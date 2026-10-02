// Aerzteteam-Section (Strapi blocks.doctor-team, shared.doctor-card).
//
// Eine Karte verknuepft bevorzugt einen Employee; `name`, `role`, `image`
// ueberschreiben dessen Daten nur, wenn gepflegt. Der CMS-Populate laedt den
// Employee nur, wenn er sichtbar und aktiv ist - sonst kommt die Relation leer
// an und die Karte faellt auf die manuellen Felder zurueck oder entfaellt
// (ohne Namen wird nichts gezeigt). Genutzt von der v2-Ads-Vorlage
// (adsV2/Page.vue) und vom generischen Block (block/DoctorTeam.vue).

export type DoctorTeamEmployeeLike = {
  id?: number | string | null;
  academicTitle?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  slug?: string | null;
  isActive?: boolean | null;
  hideFromPublic?: boolean | null;
  photo?: unknown;
};

export type DoctorCardLike = {
  id?: number | string | null;
  employee?: DoctorTeamEmployeeLike | null;
  name?: string | null;
  role?: string | null;
  image?: unknown;
  imageAlt?: string | null;
  profileLink?: string | null;
};

export type ResolvedDoctorCard<M = unknown> = {
  key: string;
  /** kleine Zeile ueber dem Namen, z. B. "Ärztin", "Dr. med." */
  title: string;
  /** Name, fett */
  name: string;
  photo: M | null;
  alt: string;
  profileLink: string | null;
};

const TITLE_PREFIX =
  /^((?:Dr\.\s*(?:med\.\s*)?(?:dent\.\s*)?)|Ärztin|Arzt|Prof\.\s*(?:Dr\.\s*)?)\s*(.+)$/;

const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

function displayName(e: DoctorTeamEmployeeLike): string {
  return [e.academicTitle, e.firstName, e.lastName].map(clean).filter(Boolean).join(" ");
}

/** "Ärztin Iqra" -> { title: "Ärztin", fullName: "Iqra" } (bisherige v2-Logik). */
export function doctorLines(display: string): { title: string; fullName: string } {
  const m = TITLE_PREFIX.exec(display.trim());
  return m ? { title: m[1]!.trim(), fullName: m[2]!.trim() } : { title: "", fullName: display.trim() };
}

/** Nur relative Pfade oder http(s)-Links; alles andere (javascript: ...) faellt weg. */
export function safeProfileLink(link: unknown): string | null {
  const v = clean(link);
  if (!v) return null;
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  return /^https?:\/\//i.test(v) ? v : null;
}

export function resolveDoctorCard<M = unknown>(
  card: DoctorCardLike | null | undefined,
  index = 0,
): ResolvedDoctorCard<M> | null {
  if (!card) return null;
  const emp = card.employee ?? null;
  // Sicherheitsnetz zum CMS-Filter: nie inaktive/versteckte Employees zeigen.
  const usableEmp = emp && emp.isActive !== false && !emp.hideFromPublic ? emp : null;
  const fromEmp = usableEmp ? doctorLines(displayName(usableEmp)) : { title: "", fullName: "" };

  const name = clean(card.name) || fromEmp.fullName;
  if (!name) return null;
  const title = clean(card.role) || fromEmp.title;
  const photo = ((card.image ?? null) || (usableEmp?.photo ?? null)) as M | null;
  const alt = clean(card.imageAlt) || `Porträt: ${[title, name].filter(Boolean).join(" ")}`;
  const key = String(card.id ?? usableEmp?.id ?? `${index}-${name}`);
  return { key, title, name, photo, alt, profileLink: safeProfileLink(card.profileLink) };
}

export function resolveDoctorCards<M = unknown>(
  cards: Array<DoctorCardLike | null | undefined> | null | undefined,
): ResolvedDoctorCard<M>[] {
  return (cards ?? [])
    .map((c, i) => resolveDoctorCard<M>(c, i))
    .filter((c): c is ResolvedDoctorCard<M> => c !== null);
}
