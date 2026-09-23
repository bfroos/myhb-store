/**
 * Engagement-Tracking ohne Eingriff in jede Komponente (bfroos/myhb-store#155, #156).
 *
 * Ein Klick-Listener in der Capture-Phase erkennt ausgehende Links am Ziel:
 *   - WhatsApp (wa.me, api.whatsapp.com)    -> click_whatsapp
 *   - Google-Bewertungen (place_id-Link,
 *     ReviewsBadge)                          -> click_reviews
 *   - Wegbeschreibung (google.com/maps/dir)  -> click_directions
 * Damit zaehlen auch Links, die spaeter aus dem CMS dazukommen.
 *
 * Native Videos (<video>) melden video_start, video_progress (25/50/75) und
 * video_complete. Media-Events blubbern nicht hoch, darum ebenfalls Capture.
 * Stumm im Loop laufende Hintergrundvideos (autoplay) zaehlen nicht — sie
 * sagen nichts ueber Interesse. YouTube meldet sich selbst ueber YouTubeEmbed.vue.
 *
 * Namen und Parameter folgen den GA4-Empfehlungen (video_percent,
 * video_current_time, video_duration, video_title, video_provider, video_url),
 * damit die Standardberichte greifen. Alles geht als flaches Objekt in die
 * Datenschicht, siehe useGoogleAnalytics.ts.
 */
import { useGoogleAnalytics } from "~/composables/useGoogleAnalytics";

const PROGRESS_STEPS = [25, 50, 75] as const;

type LinkKind = "whatsapp" | "reviews" | "directions";

const classifyLink = (a: HTMLAnchorElement): LinkKind | null => {
  let url: URL;
  try {
    url = new URL(a.href, window.location.href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "wa.me" || host === "api.whatsapp.com") return "whatsapp";
  if (a.closest(".reviewsBadge")) return "reviews";
  if (host === "google.com" && url.pathname.startsWith("/maps")) {
    if (url.pathname.startsWith("/maps/dir")) return "directions";
    if (url.search.includes("place_id")) return "reviews";
  }
  return null;
};

// Wo auf der Seite der Link sitzt: explizit per data-track-placement, sonst die
// erste CSS-Klasse des Links oder seines naechsten Elternteils mit Klasse
// (z. B. "loc__pill", "sticky__btn", "reviewsBadge").
const placementOf = (a: HTMLElement): string | undefined => {
  const explicit = a.closest<HTMLElement>("[data-track-placement]");
  if (explicit?.dataset.trackPlacement) return explicit.dataset.trackPlacement;
  const withClass = a.classList.length ? a : a.closest<HTMLElement>("[class]");
  return withClass?.classList[0];
};

export default defineNuxtPlugin(() => {
  const { trackEvent } = useGoogleAnalytics();
  const router = useRouter();

  const pageContext = () => {
    const params = router.currentRoute.value.params as Record<string, unknown>;
    const slug = params.locationSlug;
    return {
      page_path: window.location.pathname,
      location_slug: typeof slug === "string" ? slug : undefined,
    };
  };

  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as Element | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!a) return;
      const kind = classifyLink(a);
      if (!kind) return;
      trackEvent(`click_${kind}`, {
        ...pageContext(),
        placement: placementOf(a),
        link_url: a.href,
        outbound: true,
        // Der Link oeffnet meist einen neuen Tab oder die WhatsApp-App —
        // beacon sorgt dafuer, dass der Treffer trotzdem ankommt.
        transport_type: "beacon",
      });
    },
    { capture: true },
  );

  // Pro <video>-Element: welche Stufen schon gemeldet wurden.
  const reached = new WeakMap<HTMLVideoElement, Set<number>>();

  const isBackgroundLoop = (v: HTMLVideoElement) =>
    v.muted && v.loop && v.autoplay;

  const videoParams = (v: HTMLVideoElement) => ({
    ...pageContext(),
    video_provider: "html5",
    video_title:
      v.getAttribute("aria-label") || v.getAttribute("title") || undefined,
    video_url: v.currentSrc || v.src || undefined,
    video_duration: Number.isFinite(v.duration)
      ? Math.round(v.duration)
      : undefined,
    video_current_time: Math.round(v.currentTime),
  });

  document.addEventListener(
    "play",
    (e) => {
      const v = e.target;
      if (!(v instanceof HTMLVideoElement) || isBackgroundLoop(v)) return;
      if (reached.has(v)) return; // Fortsetzen nach Pause ist kein neuer Start
      reached.set(v, new Set());
      trackEvent("video_start", { ...videoParams(v), video_percent: 0 });
    },
    { capture: true },
  );

  document.addEventListener(
    "timeupdate",
    (e) => {
      const v = e.target;
      if (!(v instanceof HTMLVideoElement)) return;
      const done = reached.get(v);
      if (!done || !Number.isFinite(v.duration) || v.duration <= 0) return;
      const percent = (v.currentTime / v.duration) * 100;
      for (const step of PROGRESS_STEPS) {
        if (percent >= step && !done.has(step)) {
          done.add(step);
          trackEvent("video_progress", {
            ...videoParams(v),
            video_percent: step,
          });
        }
      }
    },
    { capture: true },
  );

  document.addEventListener(
    "ended",
    (e) => {
      const v = e.target;
      if (!(v instanceof HTMLVideoElement)) return;
      const done = reached.get(v);
      if (!done || done.has(100)) return;
      done.add(100);
      trackEvent("video_complete", { ...videoParams(v), video_percent: 100 });
    },
    { capture: true },
  );
});
