/**
 * "Der erste Screen steht" (#180): `load` plus erster LCP-Eintrag.
 *
 * Alles, was nicht zum ersten Bild gehoert, aber trotzdem vorab laden soll
 * (Calendly-Vorwaermen, Autoplay-Videos), wartet hierauf, statt mit dem
 * Hero-Bild um die Leitung zu konkurrieren. Browser ohne LCP-Messung (Safari
 * vor 26) warten nur auf `load`. Nach `SPAETESTENS_MS` geht es in jedem Fall
 * weiter — ein haengender Drittanbieter soll nichts ganz verhindern.
 *
 * Nur im Browser aufrufen.
 */
const SPAETESTENS_MS = 15000;

let fertig = false;
let wartende: Array<() => void> = [];
let gestartet = false;

function melden() {
  if (fertig) return;
  fertig = true;
  const liste = wartende;
  wartende = [];
  for (const cb of liste) cb();
}

function beobachten() {
  if (gestartet) return;
  gestartet = true;

  let geladen = document.readyState === "complete";
  let lcp = false;
  const pruefen = () => {
    if (geladen && lcp) melden();
  };

  const kenntLcp =
    typeof PerformanceObserver !== "undefined" &&
    (PerformanceObserver.supportedEntryTypes ?? []).includes(
      "largest-contentful-paint",
    );
  if (kenntLcp) {
    try {
      const po = new PerformanceObserver((liste) => {
        if (liste.getEntries().length === 0) return;
        lcp = true;
        po.disconnect();
        pruefen();
      });
      po.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      lcp = true;
    }
  } else {
    lcp = true;
  }

  if (!geladen) {
    window.addEventListener(
      "load",
      () => {
        geladen = true;
        pruefen();
      },
      { once: true },
    );
  }
  setTimeout(melden, SPAETESTENS_MS);
  pruefen();
}

/** Ruft `cb` auf, sobald der erste Screen steht (sofort, falls schon so). */
export function whenFirstScreenDone(cb: () => void) {
  if (fertig) {
    cb();
    return;
  }
  wartende.push(cb);
  beobachten();
}
