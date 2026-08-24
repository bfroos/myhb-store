/**
 * MYH&B UTM-Persistenz v1.3
 *
 * v1.0: Speichert utm_*, gclid, fbclid, ttclid beim Erstbesuch (First Touch)
 * und dekoriert automatisch alle Calendly-URLs (Links, Embeds, Popups) sowie
 * Cross-Domain-Links zwischen myhealthandbeauty.com und .app.
 *
 * v1.1 (Ideen aus utm-tracking.js von Kevin Kirch):
 * - Referrer-Fallback: ohne UTM/Click-ID wird die Quelle aus document.referrer
 *   abgeleitet (google -> organic, instagram -> social_organic, sonst referral,
 *   kein Referrer -> direct). Jede Buchung traegt damit eine Quelle.
 * - First-/Last-Touch getrennt: First wird nie ueberschrieben, Last bei jedem
 *   neuen externen Signal aktualisiert. Dekoration nutzt Last (Fallback First).
 *
 * v1.2 (T6 Set B, #24): Klick-ID zusaetzlich als salesforce_uuid an
 * Calendly-URLs. Calendly reicht im Webhook (invitee.created -> tracking.*)
 * nur utm_* und salesforce_uuid zurueck — gclid/fbclid/ttclid als nackte
 * Query-Parameter gehen dort verloren. Format "gclid:..." | "fbclid:..." |
 * "ttclid:..." wie touchpoints.click_id.
 *
 * v1.3 (ATTR-12 / dashboard#32): Der First Touch ging auf dem Calendly-Pfad
 * verloren. pickTouch() liefert den Last Touch, sobald der ein utm_source hat —
 * wer ueber eine Anzeige kam, spaeter organisch zurueckkehrte und dann buchte,
 * verlor die Klick-ID, und der bezahlte Kanal wurde systematisch unterbewertet.
 * Der Newsletter-Pfad hatte das Problem nie, weil dort attribution.first UND
 * attribution.last an n8n gehen.
 * - salesforce_uuid: Klick-ID des Last Touch, Fallback auf die des First Touch.
 *   Wirkt sofort, der Calendly-Sub liest tracking.salesforce_uuid bereits.
 * - utm_term / utm_content tragen zusaetzlich den First Touch (Quelle/Medium
 *   bzw. Klick-ID) mit ft_-Praefix, und nur wenn das Feld sonst leer bliebe.
 *   Echte Kampagnenwerte haben Vorrang. Wirkt erst, wenn der Calendly-Sub die
 *   beiden Felder auswertet.
 *
 * Consent: Mit Cookiebot-Marketing-Consent 90 Tage persistent (First-Party-
 * Cookie + localStorage), ohne Consent nur sessionStorage. Bei nachtraeglichem
 * Accept wird hochgestuft.
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

  const COOKIE_DOMAIN = (() => {
    const parts = window.location.hostname.split(".");
    return parts.length >= 2 ? "." + parts.slice(-2).join(".") : window.location.hostname;
  })();

  type Touch = Partial<Record<(typeof PARAMS)[number], string>> & {
    _ts?: string;
    _lp?: string;
    _ref?: string;
  };
  type Store = { first?: Touch; last?: Touch };

  // ---------- Consent ----------
  function hasMarketingConsent(): boolean {
    const cb = (window as any).Cookiebot;
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
  function save(store: Store) {
    const payload = JSON.stringify(store);
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
  function load(): Store | null {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
    } catch {}
    if (!raw) raw = getCookie(KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      // Migration vom flachen v1.0-Format
      if (parsed && !parsed.first && !parsed.last && (parsed.utm_source || parsed._ts)) {
        return { first: parsed as Touch, last: parsed as Touch };
      }
      return parsed as Store;
    } catch {
      return null;
    }
  }

  // ---------- Referrer-Klassifikation ----------
  function deriveFromReferrer(): Touch | null {
    const here = COOKIE_DOMAIN.replace(/^\./, "");
    let host = "";
    try {
      if (document.referrer) {
        const u = new URL(document.referrer);
        if (u.hostname === window.location.hostname || u.hostname.endsWith(here)) return null; // interne Navigation
        host = u.hostname.replace(/^www\./, "");
      }
    } catch {
      return null;
    }
    if (!host) return { utm_source: "direct", utm_medium: "none" };
    const rules: Array<[RegExp, string, string]> = [
      [/(^|\.)google\./, "google", "organic"],
      [/(^|\.)bing\./, "bing", "organic"],
      [/duckduckgo\.com$/, "duckduckgo", "organic"],
      [/ecosia\.org$/, "ecosia", "organic"],
      [/(^|\.)yahoo\./, "yahoo", "organic"],
      [/instagram\.com$/, "instagram", "social_organic"],
      [/(facebook\.com|fb\.com|m\.facebook\.com)$/, "facebook", "social_organic"],
      [/tiktok\.com$/, "tiktok", "social_organic"],
      [/linkedin\.com$/, "linkedin", "social_organic"],
      [/pinterest\./, "pinterest", "social_organic"],
      [/(youtube\.com|youtu\.be)$/, "youtube", "social_organic"],
      [/(twitter\.com|x\.com|t\.co)$/, "x", "social_organic"],
    ];
    for (const [re, source, medium] of rules) {
      if (re.test(host)) return { utm_source: source, utm_medium: medium, _ref: host };
    }
    return { utm_source: host, utm_medium: "referral", _ref: host };
  }

  // ---------- 1) Parameter/Quelle einsammeln ----------
  function capture() {
    const qs = new URLSearchParams(window.location.search);
    const found: Touch = {};
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

    const store = load() || {};
    let touch: Touch | null = hasAny ? found : null;
    if (!touch) {
      // Referrer-Fallback nur, wenn ein externes Signal vorliegt oder noch
      // gar keine Attribution existiert (direct-Erstbesuch).
      const derived = deriveFromReferrer();
      if (derived && (derived._ref || !store.first)) touch = derived;
    }
    if (!touch) return;

    touch._ts = new Date().toISOString();
    touch._lp = window.location.pathname;

    if (!store.first) store.first = touch;
    store.last = touch;
    save(store);
  }

  // ---------- 2) Calendly-URLs dekorieren ----------
  function pickTouch(): Touch | null {
    const store = load();
    if (!store) return null;
    if (store.last && store.last.utm_source) return store.last;
    return store.first || null;
  }

  // Klick-ID im Format von touchpoints.click_id, oder null.
  function clickIdOf(t: Touch | null | undefined): string | null {
    if (!t) return null;
    return t.gclid
      ? `gclid:${t.gclid}`
      : t.fbclid
        ? `fbclid:${t.fbclid}`
        : t.ttclid
          ? `ttclid:${t.ttclid}`
          : null;
  }

  function decorate(url: string): string {
    const store = load();
    const data = pickTouch();
    if (!data) return url;
    try {
      const u = new URL(url, window.location.origin);
      if (!u.hostname.includes("calendly.com")) return url;
      for (const p of PARAMS) {
        if (data[p] && !u.searchParams.get(p)) u.searchParams.set(p, data[p] as string);
      }
      // v1.2 (T6 #24): Klick-ID via salesforce_uuid — einziger freier
      // Passthrough, den Calendly im Webhook (tracking.salesforce_uuid)
      // zurueckgibt. Salesforce ist bei uns nicht im Einsatz.
      // v1.3: Fallback auf den First Touch. Ein bezahlter Klick darf nicht
      // verloren gehen, nur weil die Person spaeter organisch zurueckkam.
      const first = store && store.first ? store.first : null;
      const cid = clickIdOf(data) || clickIdOf(first);
      if (cid && !u.searchParams.get("salesforce_uuid")) {
        u.searchParams.set("salesforce_uuid", cid);
      }
      // v1.3: First Touch zusaetzlich mitgeben, wenn er ein anderer Besuch war
      // als der Last Touch. utm_term/utm_content werden nur belegt, wenn sie
      // sonst leer blieben — echte Kampagnenwerte haben Vorrang. Das ft_-Praefix
      // macht die Herkunft im Webhook eindeutig unterscheidbar.
      if (first && first._ts && first._ts !== data._ts && first.utm_source) {
        if (!u.searchParams.get("utm_term")) {
          u.searchParams.set("utm_term", `ft_src:${first.utm_source}|${first.utm_medium || "none"}`);
        }
        const fcid = clickIdOf(first);
        if (fcid && !u.searchParams.get("utm_content")) {
          u.searchParams.set("utm_content", `ft_cid:${fcid}`);
        }
      }
      return u.toString();
    } catch {
      return url;
    }
  }

  function decorateAll() {
    const data = pickTouch();
    if (!data) return;
    document.querySelectorAll<HTMLAnchorElement>('a[href*="calendly.com"]').forEach((a) => {
      a.href = decorate(a.href);
    });
    document.querySelectorAll('[data-url*="calendly.com"]').forEach((el) => {
      el.setAttribute("data-url", decorate(el.getAttribute("data-url") as string));
    });
    document.querySelectorAll<HTMLIFrameElement>('iframe[src*="calendly.com"]').forEach((f) => {
      const dec = decorate(f.src);
      if (dec !== f.src) f.src = dec;
    });
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
  new MutationObserver(run).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  window.addEventListener("CookiebotOnAccept", () => {
    const data = load();
    if (data) save(data);
  });
});
