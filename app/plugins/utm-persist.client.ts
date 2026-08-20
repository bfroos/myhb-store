/**
 * MYH&B UTM-Persistenz
 *
 * Problem: Nur ~1 % der Calendly-Buchungen tragen UTM-Parameter, weil die
 * Parameter beim Navigieren Landingpage -> Behandlungsseite -> Calendly
 * verloren gehen. Dieses Plugin speichert Marketing-Parameter beim
 * Erstbesuch (First Touch) und hängt sie automatisch an alle Calendly-URLs
 * (Links, Inline-Embeds, Popups) sowie an Cross-Domain-Links zwischen
 * myhealthandbeauty.com und myhealthandbeauty.app.
 *
 * Consent: Mit Cookiebot-Marketing-Consent wird 90 Tage persistiert
 * (First-Party-Cookie + localStorage), ohne Consent nur für die laufende
 * Session (sessionStorage). Bei nachträglichem Accept wird hochgestuft.
 */
export default defineNuxtPlugin(() => {
  if (import.meta.server) return;

  const PARAMS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
    "ttclid",
  ] as const;
  const KEY = "myhb_attribution";
  const TTL_DAYS = 90;

  // Registrierbare Domain (funktioniert für .com und .app inkl. Subdomains)
  const COOKIE_DOMAIN = (() => {
    const parts = window.location.hostname.split(".");
    return parts.length >= 2 ? "." + parts.slice(-2).join(".") : window.location.hostname;
  })();

  type AttributionData = Partial<Record<(typeof PARAMS)[number], string>> & {
    _ts?: string;
    _lp?: string;
  };

  // ---------- Consent ----------
  function hasMarketingConsent(): boolean {
    const cb = (window as any).Cookiebot;
    // Cookiebot nicht (mehr) vorhanden -> nicht blockieren
    if (!cb || !cb.consent) return true;
    return !!cb.consent.marketing;
  }

  // ---------- Storage ----------
  function setCookie(name: string, value: string, days: number) {
    const d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    document.cookie =
      `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()}` +
      `;path=/;domain=${COOKIE_DOMAIN};SameSite=Lax;Secure`;
  }
  function getCookie(name: string): string | null {
    const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
    return m ? decodeURIComponent(m.pop() as string) : null;
  }
  function save(data: AttributionData) {
    const payload = JSON.stringify(data);
    try {
      sessionStorage.setItem(KEY, payload);
    } catch {}
    if (hasMarketingConsent()) {
      try {
        localStorage.setItem(KEY, payload);
      } catch {}
      setCookie(KEY, payload, TTL_DAYS);
    }
  }
  function load(): AttributionData | null {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
    } catch {}
    if (!raw) raw = getCookie(KEY);
    try {
      return raw ? (JSON.parse(raw) as AttributionData) : null;
    } catch {
      return null;
    }
  }

  // ---------- 1) Parameter einsammeln (First Touch, Paid überschreibt nie Paid) ----------
  function capture() {
    const qs = new URLSearchParams(window.location.search);
    const found: AttributionData = {};
    let hasAny = false;
    for (const p of PARAMS) {
      const v = qs.get(p);
      if (v) {
        found[p] = v;
        hasAny = true;
      }
    }
    if (!found.utm_source) {
      if (found.gclid) {
        found.utm_source = "google";
        found.utm_medium = found.utm_medium || "cpc";
      } else if (found.fbclid) {
        found.utm_source = "facebook";
        found.utm_medium = found.utm_medium || "paid_social";
      } else if (found.ttclid) {
        found.utm_source = "tiktok";
        found.utm_medium = found.utm_medium || "paid_social";
      }
    }
    if (!hasAny) return;

    const existing = load();
    // Vorhandene Attribution mit Quelle nicht durch parameterlose Besuche
    // verwässern; neue Quelle (neuer Klick) gewinnt.
    if (existing?.utm_source && !found.utm_source) return;
    found._ts = new Date().toISOString();
    found._lp = window.location.pathname;
    save(found);
  }

  // ---------- 2) Calendly-URLs dekorieren ----------
  function decorate(url: string): string {
    const data = load();
    if (!data) return url;
    try {
      const u = new URL(url, window.location.origin);
      if (!u.hostname.includes("calendly.com")) return url;
      for (const p of PARAMS) {
        if (data[p] && !u.searchParams.get(p)) u.searchParams.set(p, data[p] as string);
      }
      return u.toString();
    } catch {
      return url;
    }
  }

  function decorateAll() {
    const data = load();
    if (!data) return;
    // a) Links
    document.querySelectorAll<HTMLAnchorElement>('a[href*="calendly.com"]').forEach((a) => {
      a.href = decorate(a.href);
    });
    // b) Inline-Embeds (data-url)
    document.querySelectorAll('[data-url*="calendly.com"]').forEach((el) => {
      el.setAttribute("data-url", decorate(el.getAttribute("data-url") as string));
    });
    // c) Calendly-iframes (nuxt-calendly InlineWidget)
    document.querySelectorAll<HTMLIFrameElement>('iframe[src*="calendly.com"]').forEach((f) => {
      const dec = decorate(f.src);
      if (dec !== f.src) f.src = dec;
    });
    // d) Cross-Domain-Links .com <-> .app (Cookies gelten nur je Domain)
    document.querySelectorAll<HTMLAnchorElement>('a[href*="myhealthandbeauty."]').forEach((a) => {
      try {
        const u = new URL(a.href, window.location.origin);
        const here = COOKIE_DOMAIN.replace(/^\./, "");
        if (!u.hostname.includes("myhealthandbeauty.")) return;
        if (u.hostname.endsWith(here)) return;
        for (const p of PARAMS) {
          if (data[p] && !u.searchParams.get(p)) u.searchParams.set(p, data[p] as string);
        }
        a.href = u.toString();
      } catch {}
    });
  }

  // ---------- 3) Calendly-Popup-/Inline-API abfangen ----------
  function patchCalendly() {
    const c = (window as any).Calendly;
    if (!c || c.__myhbPatched) return;
    for (const fn of ["initPopupWidget", "initInlineWidget", "initBadgeWidget"]) {
      if (typeof c[fn] === "function") {
        const orig = c[fn].bind(c);
        c[fn] = (opts: any) => {
          if (opts?.url) opts.url = decorate(opts.url);
          return orig(opts);
        };
      }
    }
    c.__myhbPatched = true;
  }

  // ---------- Init ----------
  capture();
  const run = () => {
    decorateAll();
    patchCalendly();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  // SPA-Navigation + lazy geladene Widgets
  new MutationObserver(run).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  // Nachträglicher Consent -> Persistenz hochstufen
  window.addEventListener("CookiebotOnAccept", () => {
    const data = load();
    if (data) save(data);
  });
});
