/**
 * MYH&B UTM-Persistenz v1.9
 *
 * v1.9 (13.11.2026): Calendly ist abgeschaltet. Die Dekoration der
 * Calendly-URLs (utm_*, salesforce_uuid-Stempel aus v1.2–v1.6, Popup-Patch)
 * ist raus; die App-Buchung bekommt Herkunft und Einwilligung ueber
 * useAppBookingDialog. Was bleibt: Erfassen, Speichern (inkl. Server-Stempel
 * und Cookiebot-Rueckschreiben) und die Cross-Domain-Links.
 *
 * v1.0: Speichert utm_*, gclid, fbclid, ttclid beim Erstbesuch (First Touch)
 * und dekorierte Calendly-URLs sowie Cross-Domain-Links zwischen
 * myhealthandbeauty.com und .app.
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
 * v1.6 (myhb-os#399): salesforce_uuid traegt zusaetzlich die Seite, auf der die
 * Buchung startete, als ";lp:<pfad>" (ohne Query). Auf dem App-Weg kommt sie als
 * ref_path an, auf dem Calendly-Weg fehlte sie bisher: 90 % der Buchungen hatten
 * keine Landingpage. T14 schreibt das Token nach appointment_attribution.ref_path;
 * aeltere T14-Fassungen ignorieren es still wie jedes unbekannte Token.
 *
 * v1.8 (myhb-os#2157): Nach jedem Speichern setzt /api/stempel das Cookie
 * zusaetzlich serverseitig, sonst loescht Safari es nach 7 Tagen.
 *
 * v1.7 (store#168): Cookiebot raeumt bei der Antwort auf den Banner alle
 * Cookies und Storage-Schluessel ab, die im Scan als "nicht klassifiziert"
 * gefuehrt werden — myhb_attribution eingeschlossen, bei "Alle zulassen"
 * genauso wie bei "Ablehnen". Fast jeder Anzeigenklick ist ein Erstbesuch, der
 * den Banner vor dem Klick auf "Termin buchen" beantwortet; die Calendly-URL
 * bekam danach weder gclid noch utm_* noch den c:-Stempel (#126, myhb-os#399,
 * myhb-os#82). Der Speicher haelt deshalb eine Kopie im Arbeitsspeicher der
 * Seite und schreibt sie nach jeder Cookiebot-Antwort zurueck (sofort und mit
 * zwei Nachlaeufen, weil Cookiebot nicht synchron raeumt); danach werden die
 * Calendly-URLs neu dekoriert. Dauerhaft loest das nur die Klassifizierung von
 * myhb_attribution als "Notwendig" im Cookiebot-Manager.
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
    // Microsoft Ads (Bing), seit 16.10.2026 fuer den Bing-Test
    "msclkid",
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
  // v1.7 (store#168): letzte bekannte Attribution, ueberlebt das Aufraeumen
  // durch Cookiebot, weil das nur Cookies und Web Storage trifft.
  let kopie: Store | null = null;

  function save(store: Store) {
    kopie = store;
    const payload = JSON.stringify(store);
    try {
      sessionStorage.setItem(KEY, payload);
    } catch {}
    if (hasMarketingConsent()) {
      try {
        localStorage.setItem(KEY, payload);
      } catch {}
      setCookie(KEY, payload, TTL_DAYS);
      serverStempel(payload);
    }
  }

  // v1.8 (myhb-os#2157): Safari kappt per JavaScript gesetzte Cookies auf
  // 7 Tage. Der Server setzt den Stempel deshalb per Set-Cookie noch einmal
  // (server/api/stempel.post.ts); hoechstens einmal je Seitenaufruf und Stand.
  let zuletztGesendet: string | null = null;
  function serverStempel(payload: string) {
    if (payload === zuletztGesendet) return;
    zuletztGesendet = payload;
    try {
      fetch("/api/stempel", { method: "POST", credentials: "same-origin", keepalive: true }).catch(() => {});
    } catch {}
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
      const store: Store =
        parsed && !parsed.first && !parsed.last && (parsed.utm_source || parsed._ts)
          ? { first: parsed as Touch, last: parsed as Touch }
          : (parsed as Store);
      kopie = store;
      return store;
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
      } else if (found.msclkid) {
        found.utm_source = "bing";
        found.utm_medium = found.utm_medium || "cpc";
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

  // ---------- 2) Cross-Domain-Links dekorieren ----------
  function pickTouch(): Touch | null {
    const store = load();
    if (!store) return null;
    if (store.last && store.last.utm_source) return store.last;
    return store.first || null;
  }

  function decorateAll() {
    const data = pickTouch();
    if (!data) return;
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

  // ---------- Init ----------
  capture();
  const run = () => decorateAll();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  new MutationObserver(run).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  // v1.7 (store#168): Nach der Banner-Antwort ist der Speicher leer. Aus der
  // Kopie zurueckschreiben (bei Accept stuft save() dabei auf 90 Tage hoch) und
  // die Links neu dekorieren. Cookiebot raeumt nicht immer synchron zum Ereignis,
  // deshalb zwei Nachlaeufe.
  function nachAntwort() {
    const data = load() || kopie;
    if (!data) return;
    save(data);
    run();
  }
  const nachAntwortMitNachlauf = () => {
    nachAntwort();
    for (const ms of [300, 1500]) {
      window.setTimeout(() => {
        if (!load()) nachAntwort();
      }, ms);
    }
  };
  for (const ev of ["CookiebotOnConsentReady", "CookiebotOnAccept", "CookiebotOnDecline"]) {
    window.addEventListener(ev, nachAntwortMitNachlauf);
  }

});
