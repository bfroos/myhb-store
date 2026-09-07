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
