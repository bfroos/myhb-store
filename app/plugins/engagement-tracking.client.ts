/**
 * Engagement-Tracking ohne Eingriff in jede Komponente (bfroos/myhb-store#155, #156).
 *
 * Ein Klick-Listener in der Capture-Phase erkennt ausgehende Links am Ziel:
 *   - WhatsApp (wa.me, api.whatsapp.com)    -> click_whatsapp
 *   - Google-Bewertungen (place_id-Link,
 *     ReviewsBadge)                          -> click_reviews
 *   - Wegbeschreibung (google.com/maps/dir)  -> click_directions
 * Damit zaehlen auch Links, die spaeter aus dem CMS dazukommen.
 * Jeder andere Klick auf einen Button oder Link meldet click_element mit
 * element_text und placement (#155: "welche Taste wurde geklickt").
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
// naechste sprechende BEM-Klasse (z. B. "loc__pill", "sticky__btn",
// "hero__reviews", "contact__bar"). Generische Klassen wie "button" sagen
// nichts ueber die Stelle und werden uebersprungen.
const GENERIC = /^(button|btn|link|icon|theme-)/;
const placementOf = (a: HTMLElement): string | undefined => {
  const explicit = a.closest<HTMLElement>("[data-track-placement]");
  if (explicit?.dataset.trackPlacement) return explicit.dataset.trackPlacement;
  let el: HTMLElement | null = a;
  for (let depth = 0; el && depth < 6; depth++, el = el.parentElement) {
    const bem = [...el.classList].find(
      (c) => c.includes("__") && !GENERIC.test(c),
    );
    if (bem) return bem;
  }
  return [...a.classList].find((c) => !GENERIC.test(c)) ?? a.classList[0];
};

const fileTitle = (src: string): string | undefined => {
  const name = src.split("/").pop()?.split("?")[0];
  return name ? name.replace(/(_[0-9a-f]{10})?\.[a-z0-9]+$/i, "") : undefined;
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

  // #155: alle uebrigen Klicks auf Buttons und Links. Der Cookie-Dialog zaehlt
  // nicht, er sagt nichts ueber die Landingpage.
  const trackElementClick = (target: Element | null) => {
    const el = target?.closest?.(
      "a[href], button, [role=button]",
    ) as HTMLElement | null;
    if (!el || el.closest("#CybotCookiebotDialog")) return;
    const text = (el.getAttribute("aria-label") || el.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
    const href = el instanceof HTMLAnchorElement ? el.href : undefined;
    trackEvent("click_element", {
      ...pageContext(),
      placement: placementOf(el),
      element_text: text || undefined,
      link_url: href,
      outbound: href ? !href.startsWith(window.location.origin) : undefined,
    });
  };

  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as Element | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      const kind = a ? classifyLink(a) : null;
      if (!kind) {
        trackElementClick(e.target as Element | null);
        return;
      }
      trackEvent(`click_${kind}`, {
        ...pageContext(),
        placement: placementOf(a!),
        link_url: a!.href,
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
    // CMS-Videos haben oft keinen Titel — dann der Dateiname ohne Hash-Anhang.
    video_title:
      v.getAttribute("aria-label") ||
      v.getAttribute("title") ||
      fileTitle(v.currentSrc || v.src),
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
