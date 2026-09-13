const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export type ParsedYouTubeUrl = {
  id: string;
  start?: number;
  isShort?: boolean;
};

function parseStart(value: string | null): number | undefined {
  if (!value) return undefined;
  const asNumber = Number.parseInt(value, 10);
  if (Number.isFinite(asNumber) && asNumber > 0) return asNumber;

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match) return undefined;
  const [, h, m, s] = match;
  const seconds =
    Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
  return seconds > 0 ? seconds : undefined;
}

/** Pulls the src out of the snippet YouTube's "Share -> Embed" button copies. */
function extractIframeSrc(value: string): string | undefined {
  if (!/<iframe[\s>]/i.test(value)) return undefined;
  const src = value.match(/\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const found = src?.[1] ?? src?.[2] ?? src?.[3];
  return found?.replace(/&amp;/g, "&").trim() || undefined;
}

/** Accepts a watch/share/shorts/embed URL, a full <iframe> embed code, or a bare video id. */
export function parseYouTubeUrl(
  input?: string | null,
): ParsedYouTubeUrl | undefined {
  const trimmed = input?.trim();
  if (!trimmed) return undefined;

  const raw = extractIframeSrc(trimmed) ?? trimmed;

  if (VIDEO_ID.test(raw)) return { id: raw };

  let url: URL;
  try {
    url = new URL(raw.startsWith("//") ? `https:${raw}` : raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return undefined;
  }

  const host = url.hostname.replace(/^www\./, "");
  const segments = url.pathname.split("/").filter(Boolean);

  let id: string | undefined;
  let isShort = false;
  if (host === "youtu.be") {
    id = segments[0];
  } else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    if (segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "v") {
      id = segments[1];
      isShort = segments[0] === "shorts";
    } else {
      id = url.searchParams.get("v") ?? undefined;
    }
  }

  if (!id || !VIDEO_ID.test(id)) return undefined;

  return {
    id,
    start: parseStart(url.searchParams.get("start") ?? url.searchParams.get("t")),
    isShort,
  };
}
