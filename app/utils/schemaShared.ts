import type {
  StrapiRichText,
  StrapiRichTextNode,
} from "~/lib/strapi/dto/types";

export type SchemaOrgContext = {
  publicUrl: string;
  path: string;
  brandName?: string;
};

export type WebSiteSchemaContext = SchemaOrgContext & {
  name?: string;
  description?: string;
  logoUrl?: string;
  inLanguage?: string;
};

export function strapiRichTextToPlainText(
  value: StrapiRichText | null | undefined,
) {
  if (!value || !Array.isArray(value)) return undefined;

  const parts: string[] = [];

  const walkNodes = (nodes: Array<unknown> | undefined) => {
    if (!nodes) return;
    for (const node of nodes) {
      const n = node as Partial<StrapiRichTextNode> & {
        children?: Array<unknown>;
        text?: string;
      };
      if (n.type === "text" && typeof n.text === "string") {
        parts.push(n.text);
      } else if (Array.isArray(n.children)) {
        walkNodes(n.children);
      }
    }
  };

  for (const block of value) {
    walkNodes(block.children as Array<unknown> | undefined);
    parts.push("\n");
  }

  const text = parts
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text || undefined;
}

export function normalizeSchemaDateTime(
  value: string | null | undefined,
): string | undefined {
  if (!value) return undefined;

  // If it's a plain date (YYYY-MM-DD), convert to a full ISO date-time in UTC.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }

  // If it already contains an explicit timezone (Z or +/-HH:MM or +/-HHMM), keep it.
  if (/(Z|[+-]\d{2}:\d{2}|[+-]\d{4})$/.test(value)) {
    return value;
  }

  // Otherwise, try to parse and normalize to ISO with timezone.
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function toAbsoluteUrl(publicUrl: string, path: string): string {
  const base = (publicUrl || "").replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function formatEuroFromCent(valueInEuroCent: number): string {
  return (valueInEuroCent / 100).toFixed(2);
}

export function parseEuroCent(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}
