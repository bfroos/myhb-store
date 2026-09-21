# Neukunden-Funnel: Conversion-Audit (Website → App-Buchung → Registrierung → Fragebogen)

**Stand:** 2026-09-07 · **Geprüft:** www.myhealthandbeauty.com (Store, Nuxt/Strapi) und app.myhealthandbeauty.com (Buchungs-App) · **Viewports:** Mobile 390×844, Tablet 820×1180, Desktop 1440×900 · **Methode:** Code-Review myhb-store + Live-Walkthrough im Headless-Chromium (Screenshots je Schritt), Performance-Messung, Route-/Meta-Prüfung.

> **Nicht prüfbar in dieser Session:** Der Code des App-Repos `elanagency/myhb-os` (anderer GitHub-Owner, Zugriff aus dieser Session gesperrt), der Gesundheitsfragebogen (liegt hinter dem SMS-OTP-Login), die Bestätigungsseite sowie SMS/E-Mail nach Buchung, das Cookiebot-Banner (im Headless nicht angezeigt) und echte Geolocation. Für den App-Code eine neue Session mit `elanagency/myhb-os` als Quelle starten.

---

## 1. Funnel-Karte (Ist-Zustand)

| # | Schritt | System | Beobachtete Hürden |
|---|---------|--------|--------------------|
| 0 | Anzeige/Google → Landing (Home, Behandlungs- oder Standortseite) | Store | Sehr lange Seiten (Behandlungsseite 23.900 px mobil), CTA knapp an der Fold-Grenze |
| 1 | CTA „Termin buchen“ / „Kostenlose Beratung“ | Store | Öffnet Dialog „Buche deinen Termin jetzt über Calendly“ mit Standortliste, nicht nach Nähe sortiert (Leipzig zuerst) |
| 2a | Standort mit Calendly-URL → Calendly-Widget | Calendly | Fremd-Branding (blau, Zeitzone „UTC“), 4 Event-Typen, 4 Pflichtfelder + 4 Zusatzfragen, Calendly-AGB. **Kein MY-Konto, kein Fragebogen** |
| 2b | Standort mit App-URL → App im iFrame | App | Im Store aktuell **kein** Standort auf App umgestellt (Aachen läuft auf Calendly, obwohl Aachen in der App buchbar ist) |
| 3 | App: Standort wählen | App | 9 Karten, „Entfernung nicht verfügbar“ 9×, keine PLZ-Suche, Namen abweichend vom Store („MY HEALTH & BEAUTY Aachen“ vs. „Aquis Plaza“) |
| 4 | App: Kategorie → Behandlung(en) | App | Gut: Beratung (kostenlos) zuerst, Preis + Dauer sichtbar. „Weiter“ ohne Erklärung deaktiviert, Preisformat inkonsistent (149,99 € vs. €149.99) |
| 5 | App: Datum & Uhrzeit | App | Skeleton mehrere Sekunden, englische Wochentage/Labels, 40 Slots à 15 min als Wand, kein „nächster freier Termin“ |
| 6 | App: Zusammenfassung | App | „Sep 08“, „Ab €149.99“, keine Storno-/Erwartungsinfos, kein Trust-Element |
| 7 | App: „Termin bestätigen“ → Login-Modal (Überraschung) | App | Titel „In Ihr Konto einloggen“ auch beim Registrieren, Sie-Form (Website duzt), Modal breiter als Viewport (390 px), kein Datenschutzhinweis, keine Marketing-Einwilligung |
| 8 | SMS-Code → Konto → Buchung → Fragebogen | App | Nicht prüfbar. Hinweis im Summary: „Fragebogen vor dem Besuch ausfüllen“ |
| – | „Ablehnen“-Button in jedem App-Schritt | App | Führt auf die Login-Seite → Funnel-Exit mit missverständlichem Label |

---

## 2. Befunde je Schritt und Viewport

### 2.1 Store: Startseite
- **Mobile:** H1, Subline, Text, CTA „Kostenlose Beratung“ erst bei y≈700 von 844 px, Google-Badge darunter. CTA ist sichtbar, aber ohne Puffer; bei kleineren Geräten (iPhone SE, 667 px) unter der Fold. Kein Sticky-CTA auf der Startseite (Komponente `MobileStickyCtaBlock` existiert, wird hier nicht genutzt). Seitenlänge 15.700 px.
- **Tablet (820 px):** Mobile-Layout (Hamburger) mit riesigem Hero-Bild (≈460 px hoch), CTA erst bei y≈824.
- **Desktop:** Zweispaltig, Nav mit allen Behandlungen + „Termin buchen“, Trust (Google, Presse) im Hero. Gut.
- **Trust:** „1.538+ 5-STERNE“ ohne Durchschnittsnote; Standortseiten zeigen „4,9 · 49 Bewertungen“. Einheitlich „4,9 ★ aus 1.538 Google-Bewertungen“ wäre stärker und belegbar.
- **Copy:** Homepage-CTA „Kostenlose Beratung“ vs. „Termin buchen“ überall sonst. Konsistente Botschaft fehlt (Beratung kostenlos = stärkstes Neukunden-Argument).

### 2.2 Store: Behandlungsseite (Beispiel Lippen aufspritzen)
- **Mobile:** Breadcrumb, Hero-Bild, H1, Subline, Preis-Pill „ab 149,99 € · Termin buchen“, „20 % Rabatt sichern“, Google-Badge, „Medizinisch geprüft von Dr. Gero Ruppert“. Starker Above-the-fold-Block. Danach 23.900 px Content, 3 Inline-CTAs, 15 FAQ, Floating-CTA nach Scroll (gut).
- **Desktop:** Hero zweispaltig, Floating-CTA mit Google-Badge.
- **Hürden:** Rabatt-CTA öffnet Newsletter-Dialog mit **Pflichtfeld Handynummer** und öffnet erst danach die Buchung. Der Rabattcode ist in der App nirgends eingebbar → Versprechen ohne Einlösung im Funnel.
- Seitenlänge und 15 FAQ sind SEO-getrieben; für Paid-Traffic (go.*-Ads-Mode) gehört der Preis-/Ablauf-/Arzt-Block in die ersten 3 Viewports.

### 2.3 Store: Standortseite (Aachen Aquis Plaza)
- Gut: lokale Bewertung 4,9/49, Presse-Logos, Karte, Anfahrt, Öffnungszeiten, Telefon, WhatsApp. „Termin buchen“ führt trotzdem zu Calendly, obwohl Aachen in der App live ist.
- Tablet/Mobile identisch, ohne Sticky-CTA.

### 2.4 Store: Buchungsdialog (`CalendlyDialog.vue`)
- Header „Buche deinen Termin jetzt über Calendly“ nennt einen Fremdanbieter als erstes Wort im Buchungsprozess.
- Standortliste: ohne Geolocation-Freigabe nicht sortiert (erste Karte Leipzig), Suchfeld „PLZ oder Ort“ ohne „Mein Standort“-Button (Key `blocks.locationFinder.useMyLocation` existiert), keine Bewertungen/Öffnungszeiten je Standort, gewählte Behandlung wird nicht angezeigt.
- Standorte ohne URL zeigen „Nicht buchbar“ (deaktivierter Button) statt Alternative (Anruf/WhatsApp).
- Mobile: Dialog 100 vw/98 svh, gut. Desktop: 600 px breit.

### 2.5 Calendly-Pfad (heute der Hauptpfad)
- Eigenes Branding (blau, Proxima Nova), Zeitzonen-Anzeige, 4 Event-Typen mit langen Beschreibungen. Formular: Vorname, Nachname, E-Mail, Telefon (alle Pflicht), Behandlungsinteresse, Herkunftsfrage, Anmerkung, SMS-Opt-in, Calendly-AGB/Datenschutz.
- Ergebnis: Termin ohne MY-Konto → Fragebogen erst vor Ort → Registrierung findet ggf. gar nicht statt, Kundendaten liegen bei Calendly, Attribution nur über UTM-Dekoration (`utm-persist.client.ts`).

### 2.6 App: Einstieg / Standortwahl
- **Mobile:** Header nur „MY“ (klein), EN/DE, „Anmelden“. Kein Marken-Logo, kein Link zur Website, keine Trust-Elemente, keine Schrittanzeige. Karten: Standortname abgeschnitten („MY HEALTH & BEAUTY Aac…“), „Entfernung nicht verfügbar“ auf jeder Karte (kein Geolocation-Prompt mit Nutzenerklärung, kein Fallback PLZ-Suche). Footer „Ablehnen | Weiter“, Weiter deaktiviert.
- **Tablet:** 2 Spalten, Bildkarten ~500 px hoch → nur 2 Standorte je Viewport.
- **Desktop:** 3 Spalten, Bildkarten ~475 px → 3 Standorte je Viewport, Rest unter der Fold. Für 9+ Standorte ist eine kompakte Liste + Karte schneller.
- Lokalisierung: `<html lang="en">`, Title „MY HEALTH & BEAUTY“, Meta-Description „My Health & Beauty“, `author=Lovable`, `twitter:site=@lovable_dev`, OG-Image auf r2.dev. Beim Teilen des Links wirkt das wie eine Testseite.
- Rechtliches: /impressum, /datenschutz, /privacy, /imprint liefern 404; im Funnel keine Footer-Links. In DE Pflicht, zusätzlich Trust-Faktor.

### 2.7 App: Kategorie und Behandlung
- Kategorien mit Kurzbeschreibung, „Beratung (kostenlos)“ an erster Stelle: gut.
- Behandlungskarten mit Dauer, Preis, Beschreibung, Mehrfachauswahl, Summenbox: gut.
- Hürden: „Weiter“ deaktiviert ohne Hinweis („Bitte wähle eine Behandlung“); Preisformat in Summenbox „€149.99“ (EN) vs. Karte „149,99 €“; Neukundenrabatt (20 %) taucht nirgends auf, kein Code-Feld.

### 2.8 App: Datum & Uhrzeit
- Skeleton lädt mehrere Sekunden ohne Text; Wochentage „MON TUE WED“, Aria „Previous month“, Slots „10:00 to 10:15“ (englisch) im DE-Modus.
- 40 Slots à 15 min ungegliedert (mobil 14 Reihen). Kein „Nächster freier Termin“, keine Tageszeit-Gruppen, Slot-Ende überflüssig für 15-min-Termine.
- Heute (7.9.) ist klickbar, hat aber keine Slots → Fehlermeldung erst nach Klick. Akzentfarbe des gewählten Tags lila, nicht Marken-Schwarz.
- Ausgewählter Termin erscheint nur unten; kein sticky Summary auf Mobile.

### 2.9 App: Zusammenfassung
- Zeigt Behandlung, „Ab €149.99“, „Sep 08“, Standort mit Karte, Hinweis auf Fragebogen und 10 min früher.
- Fehlt: Stornobedingungen („kostenlos stornierbar bis …“), „keine Vorkasse“, Was-passiert-danach (SMS-Code, Bestätigung), Arzt/Team, Google-Bewertung des Standorts.
- „Termin bestätigen“ öffnet unangekündigt ein Login-Modal. Erwartung („fertig“) und Realität („jetzt registrieren“) klaffen auseinander → typischer Abbruchpunkt.

### 2.10 App: Registrierung / Login (SMS-OTP)
- Modal-Titel „In Ihr Konto einloggen“ und Untertitel „Geben Sie Ihre Telefonnummer ein …“ auch im Tab „Registrieren“.
- Felder: Vollständiger Name, E-Mail, Telefon (Land-Dropdown: Reihenfolge US, UK, Kanada, Australien, Indien … vor DE/AT/CH), „Wie haben Sie von uns erfahren?“ (optional). Button „Konto erstellen“ deaktiviert, ohne Erklärung welches Feld fehlt.
- **Mobile-Bug:** Modal ist ca. 440 px breit bei 390 px Viewport → Felder und Button rechts abgeschnitten (Screenshot). Login-Startseite (app.myhealthandbeauty.com) hat ebenfalls horizontalen Überlauf (Sprachumschalter und „Hilfe benötigt?“ abgeschnitten).
- Sie-Form in der ganzen App, Website spricht in Du-Form.
- Kein Datenschutzhinweis (Art. 13 DSGVO) am Formular, keine Marketing-Einwilligung (Newsletter/WhatsApp) → verschenkte Opt-ins.
- Tablet/Desktop: Modal korrekt zentriert.

### 2.11 Fragebogen, Bestätigung, Post-Booking
Nicht einsehbar (hinter OTP). Aus Marketing-Sicht kritisch: Fragebogen-Completion-Rate, Erinnerungen (SMS/WhatsApp), Kalender-Datei, Anfahrt, Vorbereitungshinweise. Aufgaben dazu unter 4.5 als Prüfaufträge formuliert.

---

## 3. Querschnittsthemen

### 3.1 Tracking & Attribution
- `useGoogleAnalytics.trackBookingClick()` sendet `booking_type: 'calendly'` fest, auch für App-Buchungen.
- `useAppBookingDialog.buildBookingUrl()` übergibt nur gclid/gbraid/wbraid/gclsrc an die App; utm_*, fbclid, ttclid und First-Touch gehen verloren (im Calendly-Pfad werden sie dekoriert, im App-Pfad nicht).
- App-Subdomain: Cross-Domain-Measurement (GA4 Linker) und ein durchgängiges Event-Schema (booking_start, location_selected, treatment_selected, slot_selected, otp_sent, otp_verified, booking_confirmed, questionnaire_completed) sind nicht erkennbar.
- Store und App laden je ~25 Drittanbieter-Hosts (GTM, GA4, Doubleclick, Facebook, TikTok, Clarity, HubSpot ×5, TWIPLA/visitor-analytics, Stape, unpkg). Parallel existiert Server-Side-Tagging (Stape). Doppelte Stacks kosten Ladezeit und Consent-Risiko.

### 3.2 Performance (Mobile, kalter Cache)
| Seite | TTFB | DOMContentLoaded | Load | Requests | Transfer | JS |
|-------|------|------------------|------|----------|----------|----|
| Store Behandlungsseite | 0,7 s | 1,3 s | 3,7 s | 119 | 728 KB | 231 KB |
| App /book-appointment | 1,3 s | 1,8 s | 2,6 s (Network idle 6,1 s) | 104 | 439 KB | 400 KB |

App-TTFB 1,3 s plus Skeleton im Kalender: der Schritt 5 fühlt sich langsam an.

### 3.3 Zwei Buchungssysteme parallel
Der Store routet heute alle Standorte auf Calendly (Strapi-Feld „Calendly URL“), obwohl die App für 9 Standorte live ist. Folgen: Kunden ohne Konto, Fragebogen offline, Daten in zwei Systemen, doppelte Pflege, inkonsistente Namen und Preise. Der Migrationspfad ist im Code vorbereitet (`isAppBookingUrl`, `withAppTreatmentSlug`), aber der Deeplink `?treatment=<slug>` liefert bei nicht passendem Slug ein Fehlerbanner „Dieser Buchungslink ist nicht mehr verfügbar“ (getestet mit `?location=aachen&treatment=lippen-aufspritzen`).

### 3.4 Tonalität & Marke
Website: Du, warm, „Lounge“. App: Sie, „Klinik auswählen“, generische UI-Bibliothek, kein Logo, englische Restbestände. Der Markenwechsel im wichtigsten Moment (Buchung) senkt Vertrauen.

---

## 4. Aufgabenliste (priorisiert)

Legende: **P0** = Bugs/Recht/Datenverlust, sofort · **P1** = größte Conversion-Hebel, nächste 2–4 Wochen · **P2** = Optimierung/Tests. Aufwand S (<1 Tag), M (1–3 Tage), L (>3 Tage). Owner: App = myhb-os, Store = myhb-store, CMS = Strapi-Content, MKT = Marketing/Tracking.

### 4.1 P0 – sofort
| # | Aufgabe | Owner | Aufwand |
|---|---------|-------|---------|
| 1 | Impressum, Datenschutz, AGB als Footer-Links in jedem App-Schritt; Datenschutzhinweis + Link direkt am Registrierungsformular | App | S |
| 2 | Mobile-Overflow beheben: Registrierungs-/Login-Modal `max-width: calc(100vw - 32px)`; Login-Startseite horizontaler Überlauf (Sprachumschalter, „Hilfe benötigt?“) | App | S |
| 3 | Lokalisierung DE vervollständigen: `html lang`, Wochentage, „to“ → „–“, Datumsformat „Di, 08.09.“, Preisformat „149,99 €“ überall, Aria-Labels; Du-Form konsistent mit Website | App | M |
| 4 | „Ablehnen“-Button aus dem Buchungsfluss entfernen (führt zur Login-Seite). Falls Abbruch nötig: „Abbrechen“ → zurück zur Website mit Bestätigungsdialog | App | S |
| 5 | Meta/OG bereinigen: Titel je Schritt („Termin buchen – MY HEALTH & BEAUTY“), Description, eigenes OG-Image, `author`/`twitter:site` Lovable entfernen, Favicon, volles Logo im Header | App | S |
| 6 | Deeplink Store → App absichern: Slug-Mapping Strapi ↔ App-Treatment prüfen, bei Fehlschlag Standort trotzdem vorwählen und **kein** rotes Fehlerbanner zeigen; automatisierter Test für alle Behandlungs-Slugs | App + Store + CMS | M |
| 7 | Tracking reparieren: `booking_type` dynamisch (calendly/app); utm_*, fbclid, ttclid, First-Touch (`readWireAttribution`) an App-URL übergeben; GA4 Cross-Domain für app.*; Funnel-Events in der App (booking_start … booking_confirmed, questionnaire_completed) | Store + App + MKT | M |

### 4.2 P1 – Conversion-Hebel App
| # | Aufgabe | Owner | Aufwand |
|---|---------|-------|---------|
| 8 | Fortschrittsanzeige „1 Standort · 2 Behandlung · 3 Termin · 4 Bestätigung“ + Zeitversprechen („dauert 2 Minuten“) | App | S |
| 9 | Standortwahl: Geolocation-Prompt mit Nutzenerklärung, PLZ/Ort-Suche, Sortierung nach Nähe, „Entfernung nicht verfügbar“ ausblenden, kompakte Liste statt Bildkarten, Center-Name wie im Store, Google-Note je Standort, nächste freie Zeit je Standort | App | M |
| 10 | Trust-Leiste in allen Schritten (sticky unter Header oder über Footer): „4,9 ★ · 1.538+ Google-Bewertungen“, „Behandlung ausschließlich durch Ärzte“, „Kostenlose Beratung“, „Kostenlos stornierbar bis X h vorher“; Presse-Logos auf Summary | App + CMS | M |
| 11 | Terminwahl: „Nächster freier Termin“-Button, Slots nach Vormittag/Nachmittag/Abend gruppieren, Slot-Ende weglassen, heute ohne Slots ausgrauen, Ladehinweis statt leerem Skeleton, gewählter Slot als Sticky-Bar, Akzent in Markenfarbe | App | M |
| 12 | Zusammenfassung: Erwartungsmanagement („So geht es weiter: SMS-Code → Bestätigung → Fragebogen“), Storno-Policy, „keine Vorkasse“, Arzt/Team des Standorts, Anfahrt; Button-Text „Weiter zur Bestätigung“ statt „Termin bestätigen“, solange noch Login folgt | App | S |
| 13 | Registrierung: Titel „Konto erstellen“ mit Nutzen („Termin verwalten, Fragebogen ausfüllen, 20 % Neukundenrabatt“), Länderliste DE/AT/CH zuerst, Pflichtfelder auf Name + Handy reduzieren (E-Mail optional oder nach OTP), Inline-Validierung mit Fehlertext, Erklärung „Wir senden dir einen 6-stelligen Code per SMS“, Marketing-Opt-in (Newsletter/WhatsApp, Double-Opt-in) | App + MKT | M |
| 14 | Neukundenrabatt im Funnel einlösbar machen: Rabattcode-Feld oder automatische Anwendung für neue Konten, Anzeige im Summary („20 % Neukundenrabatt: –30 €“) | App + CMS | M |
| 15 | Fragebogen (nach OTP) prüfen: Mobile-First, Fortschritt speichern, Abschlussquote messen, Erinnerung per SMS/WhatsApp 24 h vor Termin, Fragebogen-Link in Bestätigung | App + MKT | L |
| 16 | Bestätigungsseite/-nachricht: Kalender-Datei (ICS), Anfahrt, „Was mitbringen“, Umbuchung/Storno-Link, Empfehlungs-Hook (Refer-a-friend) | App | M |

### 4.3 P1 – Conversion-Hebel Store
| # | Aufgabe | Owner | Aufwand |
|---|---------|-------|---------|
| 17 | Calendly-Migration abschließen: pro Standort „Calendly URL“ in Strapi auf App-URL (`https://app.myhealthandbeauty.com/book-appointment?…`) umstellen, beginnend mit Aachen; Calendly-Event-Typen nur noch für Sonderfälle (Haaranalyse) | CMS + MKT | S je Standort |
| 18 | Buchungsdialog: Header „Wähle deine Lounge“ statt „… über Calendly“, „Mein Standort“-Button, Sortierung nach Nähe, gewählte Behandlung + Preis im Dialogkopf, Google-Note je Standort, „Nicht buchbar“ → Telefon/WhatsApp-Fallback | Store | M |
| 19 | Mobile Above-the-fold: Hero-Bild auf max. 40 % Viewport, CTA + Google-Badge im ersten Screen (auch bei 667 px), Sticky-CTA (`MobileStickyCtaBlock` mit Anrufen/Buchen/WhatsApp) auf Startseite, Standort- und Behandlungsseiten | Store + CMS | S–M |
| 20 | Social Proof konkretisieren: „4,9 ★ aus 1.538 Google-Bewertungen“ statt „1.538+ 5-STERNE“, Vorher/Nachher-Block auf Behandlungsseiten nach oben, Arztfoto im Hero | Store + CMS | S |
| 21 | Ads-Mode-Seiten straffen: Preis, Ablauf, Arzt, Bewertungen, CTA in den ersten 3 Viewports; FAQ auf 6 kürzen, Rest eingeklappt; Inhaltsverzeichnis sticky | Store + CMS | M |
| 22 | 20 %-Newsletter-Dialog: Handynummer optional testen (A/B), Rabattcode sofort anzeigen und in App-URL übergeben (`?promo=`) | Store + App | S |

### 4.4 P2 – Optimierung & Tests
| # | Aufgabe | Owner | Aufwand |
|---|---------|-------|---------|
| 23 | Drittanbieter-Skripte konsolidieren (Client-Pixel über Server-Side-Tagging/Stape, HubSpot-Skripte nur auf Formularseiten, unpkg entfernen); Ziel: < 60 Requests, JS < 250 KB pro Seite | Store + App + MKT | M |
| 24 | App-Hosting/TTFB (1,3 s) prüfen: Edge-Caching der Shell, Verfügbarkeits-API vorladen, Kalender-Prefetch nach Behandlungswahl | App | M |
| 25 | A/B-Tests: CTA-Text („Kostenlose Beratung buchen“ vs. „Termin buchen“), Preis im CTA, Reihenfolge Standort ↔ Behandlung, Login vor vs. nach Terminwahl | MKT + App | L |
| 26 | Tablet: Store-Hero bei 820 px begrenzen, App-Karten 2-spaltig kompakter; Login-Seite Layout | Store + App | S |
| 27 | Barrierefreiheit: Kontrast der grauen Beschreibungstexte, sichtbare Fokus-Stile, deutsche Aria-Labels, Tastaturbedienung Kalender | App + Store | M |
| 28 | Standort-Bewertungen in der App aus Google Places (Skript `update-google-ratings` im Store existiert bereits) | App + Store | S |

### 4.5 Messplan (Funnel-KPIs)
| Schritt | Event | Zielwert (Richtwert) |
|---------|-------|----------------------|
| CTA-Klick auf Website | click_booking (type=app/calendly) | ≥ 8 % der Sitzungen (Paid) |
| App geladen | booking_start | ≥ 95 % der CTA-Klicks |
| Standort gewählt | location_selected | ≥ 85 % |
| Behandlung gewählt | treatment_selected | ≥ 80 % |
| Slot gewählt | slot_selected | ≥ 70 % |
| OTP angefordert | otp_sent | ≥ 85 % der Summary-Views |
| OTP bestätigt | otp_verified | ≥ 90 % der otp_sent |
| Buchung bestätigt | booking_confirmed | ≥ 35 % der booking_start |
| Fragebogen abgeschlossen | questionnaire_completed | ≥ 80 % vor Termin |
| Erscheinen | appointment_attended | ≥ 85 % |

---

## 5. Anhang: Fundstellen im Store-Code
- CTA-Routing: `app/components/shared/SharedButton.vue`, `app/composables/useCalendlyDialog.ts`, `app/composables/useAppBookingDialog.ts`
- Standortliste im Dialog: `app/components/ui/organism/CalendlyDialog.vue`, `app/components/ui/molecule/LocationItem.vue`
- Tracking: `app/composables/useGoogleAnalytics.ts` (booking_type fest „calendly“), `app/plugins/utm-persist.client.ts`, `app/lib/attribution.ts`
- Sticky/Floating CTA: `app/components/block/MobileStickyCtaBlock.vue`, `app/components/block/TreatmentHero.vue`
- Rabatt-Dialog: `app/components/ui/organism/NewsletterSignUpDialog.vue` (Handynummer Pflicht)
- Texte: `i18n/locales/de.json` (`dialogs.calendly.header`, `cta.bookAppointmentNotAvailable`)

---

## 6. Umsetzungsstand (07.09.2026)

Alle Aufgaben sind als GitHub-Issues angelegt: Epic [#60](https://github.com/bfroos/myhb-store/issues/60) mit den Sub-Issues #61–#88 (Labels `P0`/`P1`/`P2`, `area:store`/`area:app`/`area:cms`/`area:tracking`). App-Issues (`area:app`) betreffen das Repo `elanagency/myhb-os` und liegen hier nur zur Nachverfolgung.

Im Store-Frontend auf diesem Branch umgesetzt:

| Issue | Änderung |
|-------|----------|
| #67 Tracking | `trackBookingClick(type)` mit `calendly` / `app` / `location_search`; neues Event `booking_location_selected` (System + Standort-Slug) im Dialog; App-URL bekommt `utm_*`, `gclid|fbclid|ttclid`, First-Touch (`ft_source`, `ft_medium`, `ft_campaign`, `ft_click_id`), `ref_path` und optional `promo` (`collectAttributionParams`, `buildBookingUrl`) |
| #78 Buchungsdialog | Header „Wähle deine Lounge“ (6 Locales); „Mein Standort“-Button mit Nähe-Sortierung, automatisch bei bereits erteilter Berechtigung, Hinweis bei Ablehnung; Google-Note je Standort und Telefon/WhatsApp-Fallback statt „Nicht buchbar“ in `LocationItem` (wird aktiv, sobald `/locations/bookable` in Strapi `googlePlaceId` und `contact` ausliefert) |
| #79 / #86 Above-the-fold | Hero-Bild in `TreatmentHero` und `MediaCard` auf `min(38–40svh, 320px)` begrenzt (Tablet: 444 → 316 px), `LandingHeroBlock` auf 40svh |
| #80 Social Proof | Globaler Bewertungs-Badge zeigt die gewichtete Google-Durchschnittsnote (`getGoogleReviewAggregate`, aktuell 4,9) neben „1.538+ 5-Sterne“ |

Offen im Store (CMS/Design-Entscheidungen): Sticky-CTA-Block auf Start- und Standortseiten (Strapi), H1-Länge/Schriftgröße mobil (CTA auf 667-px-Geräten noch unter der Fold), Ads-Mode-Blockreihenfolge, Newsletter-Handynummer-Test, Calendly-URL-Umstellung je Standort.


### 6.1 App-Umsetzung (elanagency/myhb-os, 08.09.2026)

PR [elanagency/myhb-os#54](https://github.com/elanagency/myhb-os/pull/54), Branch `feat/funnel-p0-conversion-audit`, ein Commit je Issue. Screenshot-Nachweise vorher/nachher in 390/820/1440 px (teils 320 px) unter `docs/screenshots/funnel-p0/`, Deeplink-Schema unter `docs/DEEPLINKS.md` (Kopie hier im Store-Repo), DB-/Settings-Vorschläge nicht angewendet unter `docs/sql/2026-09-08-funnel-attribution-proposal.sql`.

| Issue | Änderung in der App |
|-------|----------------------|
| #62 Mobile-Overflow | Dialog `calc(100% - 2rem)` mit innerem Scroll, Telefonfeld `min-w-0`, Login-Seite ohne horizontalen Scroll (320–430 px); Modal bei 390 px jetzt 358 px breit mit Rand |
| #61 Rechtslinks | Footer Impressum · Datenschutz in jedem Schritt (auch im iFrame), `/impressum` und `/datenschutz` statt 404 (verlinken auf `/p/impressum`, `/p/datenschutz`), Datenschutzhinweis unter „Konto erstellen“. Offen: AGB-Seite auf der Website fehlt |
| #64 „Ablehnen“ | → „Abbrechen“ mit Rückfrage; Ziel Website (iFrame: `postMessage` `myhb:booking-cancelled` + Top-Navigation), Dashboard für eingeloggte Nutzer |
| #63 Lokalisierung | `formatters.ts` mit Intl (`Di, 08.09.2026 · 10:00–10:15 Uhr · 149,99 €`), ein Preis-Formatter, deutscher Kalender inkl. Aria-Labels, Du-Form im Buchungsfluss, `lang="de"`. Offen: Sie-Form außerhalb des Buchungsflusses, SMS-Vorlage (DB) |
| #65 Meta/OG | Titel je Route, Description, eigenes OG-Bild `app.myhealthandbeauty.com/og-image.png`, Lovable-Reste entfernt, Website-Favicons, volle Wortmarke im Header → www. |
| #67 Tracking (App) | Liest `utm_*`, `gclid|fbclid|ttclid`, `ft_*`, `ref_path`, `promo` und hält sie über den Flow; First/Last Touch an `appointment_attribution`, First Touch ans Profil; GA4-Events `booking_start`, `location_selected`, `treatment_selected`, `slot_selected`, `summary_view`, `otp_sent`, `otp_verified`, `booking_confirmed`, `questionnaire_started`, `questionnaire_completed`; Linker www. ↔ app. **GTM-Trigger und Cross-Domain-Liste müssen nachgezogen werden** |
| #66 Deeplinks | `docs/DEEPLINKS.md`; Alias-Tabelle Website-Slug → App-Slug (nur 3 von 63 Slugs stimmten überein), Kategorie-Fallback, kein rotes Banner mehr, `scripts/check-deeplink-slugs.mjs`. Vorschlag: Strapi-Feld `appTreatmentSlug` bzw. `treatments.website_slugs` |
| #68 Stepper | „1 Standort · 2 Behandlung · 3 Termin · 4 Bestätigung“, mobil kompakt, „Dauert etwa 2 Minuten“ |
| #72 Zusammenfassung | „So geht es weiter“, Storno-/Vorkasse-Zeile (`app_settings.booking_cancellation_hours`, Default 24), „Weiter zur Bestätigung“ für Gäste, Lage im Center, Anfahrt, „Ab“-Preis erklärt |
| #73 Registrierung | Titel „Konto erstellen“ mit Nutzen, Pflichtfelder Name + Handy, E-Mail optional, Inline-Validierung, DE/AT/CH/NL/TR zuerst, Marketing-Opt-in (Auth-Metadaten, Double-Opt-in offen) |
| #71 Terminwahl | „Nächster freier Termin“, Slot-Gruppen Vormittag/Nachmittag/Abend, Ladehinweis, heute ohne Slots ausgegraut, Sticky-Auswahl mobil |
| #69 Standortwahl | Standort-Freigabe mit Erklärung statt Prompt beim Laden, PLZ/Ort-Suche, Nähe-Sortierung, kompakte Liste (alle 9 Standorte auf einem Desktop-Screen), keine abgeschnittenen Namen |
| #70 Trust-Leiste | Google-Note aus `venues.google_rating` (Override per `app_settings`), Ärzte, kostenlose Beratung, Storno-Frist – unter dem Header auf allen Schritten |
| #75 Fragebogen | Nur Code-Review (kein Test-Konto): Antworten werden je Frage gespeichert, Events vorhanden; offen: Erfolgsdialog ohne Ausstieg, Sie-Form in `medicalForms.json`, kein Footer auf `/q/:token`, keine E-Mail |

Nach dem Merge (außerhalb des Codes): GTM-Trigger umstellen, SQL-Vorschlag prüfen und ausführen, Store-Seite (Strapi-Feld, `myhb:booking-cancelled`-Listener, AGB-Seite), Lovable-Publish.

### 6.2 Stand 17.09.2026 (Issue-Review und Live-Prüfung)

Quellen: Issue-Status in bfroos/myhb-store, gemergte Store-PRs (#89, #91, #98, #99, #104, #113, #119–#124), Abschnitt 6.1 (App-PR elanagency/myhb-os#54) und ein Live-Durchlauf der App am 17.09. (390 px, Deeplink `?location=aachen-aquiz-plaza&treatment=lippen-aufspritzen`).

**Bilanz:** 17 von 28 Issues erledigt oder weitgehend umgesetzt, 4 teilweise, 7 offen. 6 von 7 P0-Issues erledigt; offen ist operativ die Calendly-Migration (#77).

| Status | Issues |
|--------|--------|
| Erledigt (live verifiziert bzw. gemergt) | #61, #62, #64, #65, #66, #68, #69, #70, #71, #72, #88 |
| Weitgehend erledigt, Rest-Notiz | #63 (Sie-Form außerhalb des Buchungsflusses, SMS-Vorlage), #67 (GTM-Trigger, Cross-Domain-Liste, SQL-Vorschlag), #73 (Marketing-Opt-in mit Double-Opt-in), #78 (Store fertig; Strapi liefert `googlePlaceId`/`contact` weiterhin nicht), #80 (Store fertig; CMS-Reihenfolge offen), #86 |
| Teilweise | #75 (nur Code-Review, keine Test-Nummer), #76 (nur `booking_confirmed` auf der Danke-Seite), #79 (Hero-Caps; Sticky-CTA und H1 offen), #85 (A/B-Split-Infrastruktur gebaut, Split aus) |
| Offen | #74, #77, #81, #82, #83, #84, #87 |

**Live in der App verifiziert (17.09.):** `lang="de"`, Titel je Route, Meta ohne Lovable, eigenes OG-Bild, Wortmarke im Header; Footer mit Impressum · Datenschutz · AGB; Trust-Leiste; Stepper „Schritt 3 von 4“; deutscher Kalender mit „Nächster freier Termin“; „Abbrechen“ statt „Ablehnen“; Zusammenfassung mit „Do, 17.09.2026 · 14:45 Uhr · Ab 149,99 €“, Preis-Erklärung, „So geht es weiter“, Storno-/Vorkasse-Zeile, Google-Note des Standorts; Registrierungs-Modal „Fast geschafft“ 358 px breit, Handynummer zuerst, Datenschutz-Link; Deeplink mit Website-Slug ohne Fehlerbanner.

**Im Store seit dem Audit gemergt:** #91 (Deeplink-Slug auch für den im Dialog gewählten Standort, `appTreatmentSlug` mit Fallback, Abbruch-Handshake, AGB-Seite), #98/#104/#113 (Calendly-Buchungen als `booking_confirmed`, flache Datenschicht-Objekte: zuvor hatten 86 von 87 `booking_confirmed` in GA4 kein `booking_type`), #119/#122/#123 (A/B-Split Calendly vs. App mit `ab_variant`/`ab_source`, Dialog-Überschrift je Schritt), #124 (Ladezustand im Dialog).

**Neu aufgefallen:**
- Bewertungszahlen widersprechen sich: App „1.640 Google-Bewertungen“ (`venues.google_rating`), Website-Badge „1.538+ 5-Sterne“ (Strapi Global), Store-Aggregat 1.551 (`GOOGLE_RATINGS`). Eine Quelle festlegen (#88 erweitern).
- Strapi: `appBookingUrl` existiert am Standort, ist aber bei allen 10 Standorten leer; A/B-Split steht auf 0 %. Der Store routet weiterhin 0 von 10 Standorten in die App.
- Strapi: `appTreatmentSlug` bei 71 Behandlungs- und 109 Ads-Seiten leer; Alias-Tabelle in der App fachlich unbestätigt.

**Empfehlung Issue-Pflege:** #62, #64, #65, #68, #69, #70, #71, #72, #88 schließen; #63 und #73 mit Rest-Notiz schließen; #67 und #74–#87 offen lassen. Nächster Schritt mit größtem Hebel: #77, Aachen mit `appBookingUrl` befüllen und Split auf 50 % stellen, eine Woche messen.

### 6.3 A/B-Test Calendly vs. App läuft (Prüfung 17.09.2026)

Korrektur zu 6.2: Der Test aus `docs/AB-BOOKING-SPLIT.md` (#100) ist seit 16./17.09. scharf. `NUXT_PUBLIC_AB_BOOKING_SPLIT=50` auf www und go., `appBookingUrl` an 9 von 10 Standorten (MediaPark Klinik ohne App-URL, fällt im App-Arm mit `ab_fallback: true` auf Calendly zurück). #77 und #85 laufen damit als Test statt als offene Aufgabe.

**Live geprüft (390 px, `?ab=app` / `?ab=calendly`, www und go.):** Cookies `myhb_ab_booking` und `myhb_ab_source` auf `.myhealthandbeauty.com`; `ab_assigned` genau einmal je Bucket; `ab_variant`/`ab_source` an `click_booking` und `booking_location_selected`; App-Arm öffnet `app.myhealthandbeauty.com/book-appointment?location=aachen-aquiz-plaza&treatment=lippen-aufspritzen&…&ab_variant=app`, Calendly-Arm das Widget mit Consent-Stempel. Die App liest Variante und Quelle aus den Cookies (Fallback URL-Parameter in sessionStorage) und hängt beide an `booking_confirmed` mit `booking_type: app`. Der GTM-Container GTM-5KCNWFWS enthält `ab_variant`, `ab_source`, `ab_fallback`, `ab_assigned`, `booking_confirmed`.

**Für die Auswertung:**
- Buttons mit Methode `app-booking` (Neukundenrabatt-Seite) umgehen den Split; die App hängt den Cookie-Bucket an → `booking_type=app` mit `ab_variant=calendly` möglich. Als Datenqualitätsprüfung mitführen und ausschließen, oder den Button durch `resolveBooking` schicken.
- Besucher außerhalb der EU erhalten von Cookiebot implied consent und sind automatisch im Test (Fußnote).
- Randfall: Bucket `calendly` an einem Standort ohne `calendlyUrl` öffnet die App mit `ab_variant=calendly`; heute nicht relevant, wird es beim Entfernen erster Calendly-URLs.
- Laufzeit: bei grob 140 Buchungs-Klicks je Arm und Woche etwa 4 Wochen für einen relativen Effekt von 30 % auf Klick → Buchung, etwa 8 Wochen für 20 % (80 % Power, α 5 %). Nach drei Tagen die realen Wochenwerte je Arm und `ab_source` aus GA4 nehmen. Primärmetrik `booking_confirmed` je `ab_assigned` (Intent-to-treat), getrennt nach `ab_source`, ohne `ab_fallback`; Guardrail: Anteil `booking_type ≠ ab_variant`.
- GA4/GTM sind vorbereitet (laut #100, 15./16.09.): ereignisbezogene Dimensionen „AB Variante“, „AB Fallback“, „AB Quelle“ in G-PB2XDTTPKZ; GTM Version 82 mit `ab_variant`/`ab_source`/`ab_fallback` am Tag „Funnel Events“, Trigger für `ab_assigned` und `click_booking`. `booking_location_selected` und `booking_datetime_selected` erreichen GA4 bewusst nicht.

**Folge-Tickets (17.09.):** unter Epic #93 „Buchungssystem-Migration“ (`E2-buchung`): #128 Buchungen am Split vorbei kennzeichnen (`app-booking`-Buttons), #129 Randfall Bucket `calendly` ohne `calendlyUrl`. Unter Epic #60: #130 Bewertungszahlen vereinheitlichen, #131 `appTreatmentSlug` befüllen und Alias-Tabelle freigeben, #132 `/locations/bookable` um `googlePlaceId` und `contact` erweitern. Messung und Entscheidungsregel des Tests: elanagency/myhb-os#204.

### 6.3.1 Korrektur zu 6.3 (21.09.2026)

Die Angabe „`appBookingUrl` an 9 von 10 Standorten" in 6.3 war zum Zeitpunkt der Prüfung **falsch**. Tatsächlich hatte
nur `koeln-arcaden` eine App-URL; die übrigen acht buchbaren Lounges hatten das Feld leer. Der App-Arm fiel damit vom
16.09. bis 21.09.2026 an neun von zehn Standorten auf Calendly zurück (`ab_fallback: true`).

**Folge für die Auswertung:** Alle Zahlen aus diesem Zeitraum — auch der gemeldete Vergleich 22 % (App) zu 24 %
(Calendly) — vergleichen im Wesentlichen Calendly mit Calendly, solange nicht auf `ab_fallback = false` gefiltert wird.
Der Zeitraum taugt nicht als Testperiode; die Messung beginnt praktisch am 21.09.2026 neu.

Am 21.09.2026 wurden die acht fehlenden `appBookingUrl` in Strapi nachgetragen (Slugs aus `public.venues` der App,
Tabelle in `docs/AB-BOOKING-SPLIT.md`). Ohne App-Venue bleibt `mediapark-klinik` (Klinik, keine Lounge) — dort ist der
Fallback weiterhin korrekt und erwartet.

### 6.4 Epic-Zuordnung der offenen Tickets (17.09.2026)

Neues Epic-Label `E9-funnel` für #60, nach dem Schema E1–E8 des Repos. Alle offenen Sub-Issues tragen es.

| Label | Epic | Offene Tickets |
|-------|------|----------------|
| `E9-funnel` | #60 Neukunden-Funnel Conversion-Audit | #67, #74–#87, #131, #132 |
| `E2-buchung` | #93 Buchungssystem-Migration Calendly → App | #96, #97, #128, #129 |
| `E1-tracking` | Messung und Entscheidungsregel (Epic in elanagency/myhb-os, u. a. #204) | #100, #130 |

Session-Regel aus #93: je Epic höchstens eine Claude-Session, 🔒-Kommentar beim Start und 🔓 beim Ende am Epic-Issue. Der Parent von #130 bleibt technisch #60; das Umhängen auf das E1-Epic geht nur über die GitHub-Oberfläche.
