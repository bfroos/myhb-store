import type { Ref } from "vue";
import { depthOffset, shouldEnableDepthMotion } from "#shared/adsPremium";

/**
 * Premium-Ebene der go.-Vorlage v2 (shared/adsPremium.ts): ruhige Parallaxe
 * im Hero. Setzt nur zwei CSS-Variablen (--ads-depth-x/-y in px) am
 * Wurzelelement; die Bewegung selbst macht CSS mit transform (GPU, kein
 * Layout, kein CLS). Laeuft nur im Browser, nur auf Desktop mit Maus, nicht
 * bei prefers-reduced-motion / Datensparmodus / schwachen Geraeten. Ohne JS
 * oder ohne Freigabe bleibt die statische Tiefe - Inhalt und CTA haengen nie
 * daran.
 */
export function useAdsDepth(root: Ref<HTMLElement | null>, enabled: Ref<boolean>) {
  if (import.meta.server) return;

  let frame = 0;
  let pending: { x: number; y: number } | null = null;
  let active = false;
  let mqReduced: MediaQueryList | null = null;
  let mqCoarse: MediaQueryList | null = null;

  const write = () => {
    frame = 0;
    const el = root.value;
    if (!el || !pending) return;
    el.style.setProperty("--ads-depth-x", `${pending.x}px`);
    el.style.setProperty("--ads-depth-y", `${pending.y}px`);
    pending = null;
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    pending = depthOffset(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    if (!frame) frame = requestAnimationFrame(write);
  };

  const reset = () => {
    pending = { x: 0, y: 0 };
    if (!frame) frame = requestAnimationFrame(write);
  };

  const allowed = () => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    return (
      enabled.value &&
      shouldEnableDepthMotion({
        reducedMotion: !!mqReduced?.matches,
        coarsePointer: !!mqCoarse?.matches,
        saveData: !!nav.connection?.saveData,
        deviceMemory: nav.deviceMemory,
        viewportWidth: window.innerWidth,
      })
    );
  };

  const start = () => {
    if (active) return;
    active = true;
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", reset, { passive: true });
    root.value?.setAttribute("data-depth-motion", "on");
  };

  const stop = () => {
    if (!active) return;
    active = false;
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", reset);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pending = null;
    const el = root.value;
    el?.style.removeProperty("--ads-depth-x");
    el?.style.removeProperty("--ads-depth-y");
    el?.removeAttribute("data-depth-motion");
  };

  const sync = () => (allowed() ? start() : stop());
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sync, 200);
  };

  onMounted(() => {
    mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    mqCoarse = window.matchMedia("(pointer: coarse)");
    mqReduced.addEventListener?.("change", sync);
    mqCoarse.addEventListener?.("change", sync);
    window.addEventListener("resize", onResize, { passive: true });
    // Erst nach dem ersten Bild starten: kein Einfluss auf LCP/INP beim Laden.
    const idle = (window as any).requestIdleCallback as ((cb: () => void) => void) | undefined;
    if (idle) idle(sync);
    else setTimeout(sync, 300);
  });

  watch(enabled, sync);

  onBeforeUnmount(() => {
    stop();
    clearTimeout(resizeTimer);
    mqReduced?.removeEventListener?.("change", sync);
    mqCoarse?.removeEventListener?.("change", sync);
    window.removeEventListener("resize", onResize);
  });
}
