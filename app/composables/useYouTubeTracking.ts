/**
 * YouTube-Videos messbar machen (bfroos/myhb-store#155).
 *
 * YouTubeEmbed.vue laedt den Player erst nach Marketing-Einwilligung und
 * Klick. Dann haengt sich diese Funktion ueber die IFrame-Player-API an das
 * vorhandene iFrame (braucht `enablejsapi=1` in der Embed-URL) und meldet
 * video_start, video_progress (25/50/75) und video_complete — dieselben
 * Namen und Parameter wie native Videos in plugins/engagement-tracking.client.ts.
 *
 * Die API-Datei kommt von www.youtube.com; sie wird erst geladen, wenn das
 * Video selbst schon geladen wird, also nie ohne Einwilligung.
 */
import type { Ref } from "vue";
import { useGoogleAnalytics } from "~/composables/useGoogleAnalytics";

type YTPlayer = {
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
};
type YTNamespace = {
  Player: new (
    el: HTMLIFrameElement,
    opts: {
      events: {
        onReady?: () => void;
        onStateChange: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { PLAYING: number; ENDED: number };
};
type YTWindow = Window & {
  YT?: YTNamespace;
  onYouTubeIframeAPIReady?: () => void;
};

let apiPromise: Promise<YTNamespace> | null = null;

const loadApi = (): Promise<YTNamespace> => {
  const w = window as YTWindow;
  if (w.YT?.Player) return Promise.resolve(w.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (w.YT) resolve(w.YT);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    s.onerror = () => {
      apiPromise = null;
      reject(new Error("YouTube IFrame API nicht geladen"));
    };
    document.head.appendChild(s);
  });
  return apiPromise;
};

const PROGRESS_STEPS = [25, 50, 75] as const;

export const useYouTubeTracking = (
  frame: Ref<HTMLIFrameElement | null | undefined>,
  meta: () => { videoId?: string; title?: string },
) => {
  const { trackEvent } = useGoogleAnalytics();
  let player: YTPlayer | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  const reached = new Set<number>();
  let started = false;

  const params = () => {
    const { videoId, title } = meta();
    const duration = player?.getDuration() ?? 0;
    return {
      page_path: window.location.pathname,
      video_provider: "youtube",
      video_title: title,
      video_url: videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : undefined,
      video_duration: duration > 0 ? Math.round(duration) : undefined,
      video_current_time: Math.round(player?.getCurrentTime() ?? 0),
    };
  };

  const checkProgress = () => {
    if (!player) return;
    const duration = player.getDuration();
    if (!duration) return;
    const percent = (player.getCurrentTime() / duration) * 100;
    for (const step of PROGRESS_STEPS) {
      if (percent >= step && !reached.has(step)) {
        reached.add(step);
        trackEvent("video_progress", { ...params(), video_percent: step });
      }
    }
  };

  const stopTimer = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  const attach = async () => {
    const el = frame.value;
    if (!el || player) return;
    try {
      const YT = await loadApi();
      const onState = (data: number) => {
        if (data === YT.PlayerState.PLAYING) {
          if (!started) {
            started = true;
            trackEvent("video_start", { ...params(), video_percent: 0 });
          }
          if (!timer) timer = setInterval(checkProgress, 1000);
        } else {
          stopTimer();
          checkProgress();
        }
        if (data === YT.PlayerState.ENDED && !reached.has(100)) {
          reached.add(100);
          trackEvent("video_complete", { ...params(), video_percent: 100 });
        }
      };
      player = new YT.Player(el, {
        events: {
          // Das Embed startet per autoplay, oft bevor die API angehaengt ist.
          // onStateChange kaeme fuer diesen ersten Start nicht mehr.
          onReady: () => onState(player?.getPlayerState() ?? -1),
          onStateChange: ({ data }) => onState(data),
        },
      });
    } catch (err) {
      // Messung darf das Video nie blockieren.
      console.warn("[youtube-tracking]", err);
    }
  };

  const detach = () => {
    stopTimer();
    player = null;
  };

  return { attach, detach };
};
