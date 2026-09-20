/**
 * MYH&B UTM-Persistenz v1.5
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
 * v1.5 (#86): salesforce_uuid traegt zusaetzlich die Kampagne des First Touch als
 * ";ft_cmp:<id>". Ohne sie steht in appointment_attribution.first_utm_campaign nur
 * eine Kopie von last_utm_campaign — First-Touch-Attribution trug damit auf Kanal-,
 * aber nicht auf Kampagnenebene, was #86 ("CAC je Kanal UND Kampagne") braucht.
 * T14 liest das Token seit dem 16.09.; aeltere T14-Fassungen ignorieren es still.
 *
 * v1.4 (#126): salesforce_uuid traegt zusaetzlich den Cookiebot-Stand als
 * ";c:1" / ";c:0". Ohne diesen Stempel kennt T14 den Einwilligungsstand einer
 * Calendly-Buchung nicht, appointment_attribution.marketing_consent bleibt NULL
 * und meta-capi-purchase ueberspringt JEDE Calendly-Buchung ("no_marketing_-
 * consent") — das waren zuletzt 739 von 749. Format daher:
 * "fbclid:...;c:1" | "gclid:...;c:0" | "c:1" (ohne Klick-ID).
 * Das Trennzeichen ist ein Doppelpunkt, kein Gleichheitszeichen: T14 vergleicht
 * den Teil nach dem ";" exakt gegen "c:1"/"c:0". Mit "c=1" wuerde der Stempel
 * stillschweigend verworfen und marketing_consent bliebe NULL.
 *
 * Consent: Mit Cookiebot-Marketing-Consent 90 Tage persistent (First-Party-
 * Cookie + localStorage), ohne Consent nur sessionStorage. Bei nachtraeglichem
 * Accept wird hochgestuft.
 */
export default defineNuxtPlugin(() => {
  // Auf dem Server gibt es keinen Speicher und keine Klick-ID; der Dialog ruft
  // $decorateBookingUrl trotzdem auf und bekommt die URL unveraendert zurueck.
  if (import.meta.server) {
    return { provide: { decorateBookingUrl: (url: string) => url } };
  }

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

  /**
   * v1.4 (#126): Der Cookiebot-Stand als Stempel fuer den Calendly-Pfad.
   *
   * Bewusst NICHT hasMarketingConsent(): das defaultet auf true, weil es nur
   * ueber die Speicherdauer entscheidet und ein fehlendes Cookiebot dort
   * harmlos ist. Hier entscheidet der Wert, ob spaeter ein Purchase an Meta
   * geht — deshalb drei Zustaende. Ohne Antwort des Besuchers bleibt es null,
   * T14 schreibt dann NULL und meta-capi-purchase schweigt.
   */
  function marketingConsentFlag(): "1" | "0" | null {
    const cb = (window as any).Cookiebot;
    if (!cb || !cb.consent || !cb.hasResponse) return null;
    return cb.consent.marketing ? "1" : "0";
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
      // v1.4 (#126): Der Consent reist als ";c:1"/";c:0" im selben Feld mit.
      // salesforce_uuid ist der einzige freie Passthrough, den Calendly im
      // Webhook zurueckgibt. Ohne Klick-ID wird der Stempel allein gesetzt,
      // sonst haette eine organische Buchung nie einen Einwilligungsnachweis.
      const consent = marketingConsentFlag();
      const existing = u.searchParams.get("salesforce_uuid");
      // v1.5 (#86): Kampagne des First Touch als ";ft_cmp:<id>". Sie reist hier mit
      // und nicht in utm_term/utm_content, weil die beiden nur belegt werden, wenn
      // sie sonst leer blieben — bei bezahltem Verkehr sind sie besetzt, also genau
      // dort, wo die First-Touch-Kampagne interessant waere.
      const ersterBesuchAnders = !!(
        first && first._ts && first._ts !== data._ts && first.utm_source
      );
      // Semikolon ist das Trennzeichen des Stempels; ein Kampagnenname, der eines
      // enthaelt, wuerde den Rest abschneiden. Deshalb raus damit, nicht escapen.
      const ftCmp =
        ersterBesuchAnders && first?.utm_campaign
          ? String(first.utm_campaign).replace(/;/g, "").trim() || null
          : null;
      const stamp = [
        cid,
        consent ? `c:${consent}` : null,
        ftCmp ? `ft_cmp:${ftCmp}` : null,
      ]
        .filter(Boolean)
        .join(";");
      // Cookiebot antwortet oft erst nach dem ersten Dekorieren. Einen eigenen
      // Wert ohne Stempel deshalb nachtraeglich hochstufen, einen fremden nicht.
      const nachruesten = !!existing && !!consent && !/(^|;)c:[01]$/.test(existing);
      if (stamp && (!existing || nachruesten)) {
        u.searchParams.set("salesforce_uuid", stamp);
      }
      // v1.3: First Touch zusaetzlich mitgeben, wenn er ein anderer Besuch war
      // als der Last Touch. utm_term/utm_content werden nur belegt, wenn sie
      // sonst leer blieben — echte Kampagnenwerte haben Vorrang. Das ft_-Praefix
      // macht die Herkunft im Webhook eindeutig unterscheidbar.
      if (ersterBesuchAnders && first) {
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
      // #141: Nur beim ersten Mal. Eine zweite Zuweisung an `src` laedt das
      // iFrame neu — und der Ladevorgang, den der Besucher gerade ansieht,
      // finge von vorne an. Das passierte, sobald Cookiebot spaeter antwortete:
      // Der Einwilligungsstempel in salesforce_uuid aendert sich, die URL damit
      // auch. Die Buchungs-URL wird seit #141 schon vor dem Einhaengen
      // dekoriert (CalendlyDialog), hier bleibt nur der Fall fremder iFrames.
      if (f.dataset.myhbDecorated) return;
      const dec = decorate(f.src);
      f.dataset.myhbDecorated = "1";
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

  // #141: Die Buchungs-URL wird jetzt dekoriert, *bevor* das iFrame entsteht.
  // Vorher hing das an der MutationObserver-Runde nach dem Einhaengen — die
  // Zuweisung an `src` war ein zweiter Ladevorgang.
  return { provide: { decorateBookingUrl: decorate } };
});
