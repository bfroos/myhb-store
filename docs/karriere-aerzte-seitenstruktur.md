# Karriere-Landingpage Ärzte — Seitenstruktur und Texte

Ticket: bfroos/myhb-store#101 · Epic E6 (#103) · Stand: 18.09.2026

> **Status: live in sechs Sprachen, Texte weiterhin nicht freigegeben.**
> Der Eintrag `karriere-aerzte` (documentId `zsv06zditubao6x2mbrvfa9w`) wurde am
> 12.09.2026 versehentlich veröffentlicht und ist seitdem öffentlich. Die
> Entscheidung, ihn online zu lassen, ist bewusst gefallen. Seit dem 17.09.2026
> steht die Seite zusätzlich in der Sitemap und ist auf `index, follow`
> gesetzt — sie wird also aktiv zur Indexierung angemeldet.
>
> **Die Freigabe durch Hessam und Rihem steht weiterhin aus.** Das ist das
> Akzeptanzkriterium des Tickets und der einzige Grund, warum #101 offen ist.

## Was am 18.09.2026 gegen Produktion nachgemessen wurde

Diese Datei beschrieb bis zum 18.09.2026 einen Stand vom 14.09., der an
mehreren Stellen überholt war. Nachgemessen und korrigiert:

| Aussage bis 17.09. | Tatsächlich |
|---|---|
| „Seite ist nicht verlinkt, nur über die direkte URL auffindbar" | Steht seit #114 in der Sitemap, `index, follow`. Intern verlinkt ist sie trotzdem nicht — siehe offener Punkt 6 |
| „Bilder liegen nur im Draft" | 7 Bilder live: Hero plus sechs Prozessbilder |
| „Strapi-Live-Preview funktioniert für diese Seite nicht" | Gefixt in #108/#109, seit 14.09. auf Produktion |
| „13 Blöcke" | 12 — der Verdienst-Block ist am 17.09. entfernt worden |
| „Nur `de` ist gepflegt, die Übersetzungen fehlen" | Alle sechs Sprachen gepflegt und veröffentlicht |
| „Icons noch nicht gesetzt" | 10/10 Benefit-Items haben Icons, in allen sechs Sprachen |
| „Noch offen: Eintrag in `sitemap.xml.ts`" | Erledigt in #114, dazu sechs 301er für die `/p/`-Variante |

## Quelle der Inhalte

`Ausbildungskonzept_Aerzte-2.pptx` von Rihem Mikhail, 10 Folien, aus der Mail
„Fwd: Präsentation" vom 12.08.2026. Die Datei liegt lokal unter
`~/Downloads/Ausbildungskonzept_Aerzte-2.pptx`; sie war zeitweise nicht
auffindbar, weshalb frühere Kommentare an #101 sie als fehlend führen.

**Folie 1 kennzeichnet das Deck als „Interne Präsentation · Management-Review
2026".** Zahlen daraus stehen teilweise öffentlich auf der Seite — siehe offene
Punkte 1 und 2.

Ergänzend verwendet: die bestehende Stellenanzeige `arzt-aerztin-mwd`
(Approbation als Voraussetzung, Recruiting-Ziel, Recruiterin Jenniffer Bauer)
und die acht Lounge-Standorte aus deren Location-Relation.

## Zielgruppe und Kanal

Aus der Mail:

- **Ärztinnen und Ärzte in der Facharztweiterbildung**, vorzugsweise aus dem
  Krankenhaus.
- **Nicht** die Zielgruppe: fertige Fachärzt:innen, frisch Approbierte.
- **Hauptkanal: Social Media**, mit Link auf diese Seite. Die Seite ist eine
  Landingpage für kalten Social-Traffic, keine Unterseite, auf die man sich
  durchklickt: sie beantwortet in den ersten zwei Bildschirmhöhen, wer gesucht
  wird und was geboten wird.
- **Ansprache: Du-Form** (Kunden und Bewerber werden geduzt, Staff gesiezt).

Die Abgrenzung der Zielgruppe steht deshalb sichtbar als zweiter Abschnitt auf
der Seite und nicht nur im Targeting — sonst bewerben sich Fachärzt:innen und
frisch Approbierte.

## Aufbau der Seite (12 Blöcke)

Die Reihenfolge folgt der Frage-Reihenfolge der Zielgruppe: *Bin ich gemeint? →
Was lerne ich? → Wohin führt das? → Wie bewerbe ich mich?*

Am 18.09.2026 aus dem Nuxt-Payload der Live-Seite verifiziert.

| # | Block | Abschnitt | Inhalt aus |
|---|---|---|---|
| 1 | `blocks.landing-hero` | „In drei Jahren zum Aesthetic Medical Expert" + 4 Checks + CTA | Folie 1, 2, 8, 9 |
| 2 | `blocks.comparison-block` | „Das passt zu dir" / „Das passt (noch) nicht" | Mail + Stellenanzeige |
| 3 | `blocks.process-steps` | „Drei Jahre, drei Entwicklungsstufen" (Jahr 1–3) | Folie 2 + 3 |
| 4 | `blocks.text-content` | „Vor jedem Praxiskurs bereitest du dich online vor" | Folie 4 |
| 5 | `blocks.benefit-grid` | Hersteller-Schulungen, Zertifikate, Masterclasses, Technik (4) | Folie 5, 6 |
| 6 | `blocks.process-steps` | „Dein Weg nach der Ausbildung" (Expert → Facharzt → Oberarzt) | Folie 7 |
| 7 | `blocks.highlights-strip` | „Was dabei für dich herauskommt" — 4 Kennzahlen | Folie 8, 9 |
| 8 | `blocks.text-content` | „Weniger Stunden, mehr Urlaub – Jahr für Jahr" | Folie 9 |
| 9 | `blocks.benefit-grid` | Zusatzleistungen (6) | Folie 10 |
| 10 | `blocks.text-content` | „Wo du arbeitest" — acht Lounges, zweispaltig | Stellenanzeige |
| 11 | `blocks.faq-accordion` | 7 Fragen | abgeleitet |
| 12 | `blocks.final-cta` | „Bewirb dich jetzt" | — |

**Folie 3 („Jeder Kurs: Inhalt, Ziel, Zertifikat") hat keinen eigenen Block
mehr.** Ihre Inhalte — Lerninhalt, Lernziel und Zertifikatsstufe je Kurs —
stecken in den drei Schritten von Block 3, der dadurch je Jahr „Ziel: …" und
„Abschluss: Basic/Advanced/Expert Certificate" nennt.

**Der Verdienst-Block ist am 17.09.2026 aus allen sechs Sprachen entfernt
worden** (Fixum 4.000/5.000 € netto, Provisionsstaffel 4/8/12/15 %). Gehaltszahlen
stehen aber weiterhin an drei Stellen auf der Seite — siehe offener Punkt 1.

### Was weiterhin fehlt

- **Videos** (aus der Mail gefordert): existieren nicht. Sobald produziert,
  kommen sie als `blocks.stories` (Hochformat, passend zur Social-Herkunft) oder
  `blocks.youtube-video` dazu.
- **Meinungen** (aus der Mail gefordert): Zitate und Freigaben von Ärzt:innen,
  die heute schon da sind. Block dafür: `blocks.employee-list` oder
  `blocks.reviews`.
- **Standorte als Karte:** `blocks.location-teasers` ist **nicht** in der
  Dynamic Zone der `pages`-Collection freigegeben. Die Standorte stehen deshalb
  als Liste in Block 10. Wenn eine Karte gewünscht ist, geht das über
  `blocks.location-map` — oder der Block muss in Strapi für `pages` freigegeben
  werden.

### Zum CTA

Primär- und Final-CTA zeigen beide auf
`https://recruiting.myhealthandbeauty.com/docs1/`, das bestehende Ziel der
Arzt-Stellenanzeige. Das ist eine **Übergangslösung**: Das Bewerbungsformular
mit HubSpot-Pipeline und Benachrichtigung an Jenny ist **#102** und ersetzt
dieses Ziel dort.

## Technische Umsetzung

- Route: `app/pages/karriere/aerzte.vue` → `/karriere/aerzte`
- Inhalte: Strapi-Collection `pages`, Eintrag mit Slug `karriere-aerzte`.
  Redaktion pflegt Blöcke, Texte, Bilder und SEO ohne Deploy.
- Sprachpfade in `nuxt.config.ts`, alle sechs Fassungen veröffentlicht:

| | URL | `<html lang>` |
|---|---|---|
| Deutsch | `/karriere/aerzte` | `de` |
| Englisch | `/en/careers/doctors` | `en` |
| Türkisch | `/tr/kariyer/doktorlar` | `tr` |
| Arabisch | `/ar/masar-mihani/atibba` | `ar` |
| Französisch | `/fr/carrieres/medecins` | `fr` |
| Niederländisch | `/nl/carriere/artsen` | `nl` |

- Deutschlandspezifische Begriffe stehen in den Übersetzungen mit
  Klammerzusatz, damit sie nicht ins Leere übersetzen: `Approbation`,
  `Oberarzt`. Ortsnamen und die Zertifikatsstufen bleiben unübersetzt.
- SEO: `metaTitle` und `metaDescription` gesetzt, Canonical je Sprache auf sich
  selbst, sechs `hreflang`-Alternates plus `x-default`, `index, follow`.
- Sitemap: eigener `ROUTE_MAP`-Eintrag `careerDoctors` plus `staticRoutes` in
  `server/routes/sitemap.xml.ts` (#114). Aus der `pages`-Schleife konnte die
  Seite nicht kommen, die baut `/p/[slug]`.
- `excludeFromSitemap: true` bleibt am Strapi-Eintrag stehen. Das wirkt nur noch
  auf die `/p/`-Variante und hält sie aus der Sitemap; die feste Route kommt
  über `ROUTE_MAP` hinein und ist davon unberührt.
- `/p/karriere-aerzte` lieferte 200 mit Canonical auf sich selbst — ein zweiter
  indexierbarer Zwilling. Sechs 301er in `server/assets/redirects.json`, eine
  Zeile je Sprache, weil der Redirect-Lookup exakt ist und keine
  Locale-Präfixe kennt.
- ISR: von der bestehenden Regel `/karriere/**` (12 h) abgedeckt.

### Zwei Fallen beim Schreiben über die Strapi-API

Beides hat in der Session vom 17.09. je einen Anlauf gekostet:

1. **`__component` muss der erste Schlüssel im Block-Objekt sein.** Steht er
   weiter hinten, lehnt die Validierung den ganzen Block mit
   `Invalid key __component at blocks` ab — unabhängig von der Payload-Größe.
   Die GET-Antwort liefert ihn am **Ende**, beim Zurückschreiben muss er also
   umsortiert werden.
2. **Entwurf und veröffentlichte Fassung haben getrennte Komponenten-IDs.** Ein
   PUT schreibt in den Entwurf; die IDs der Live-Fassung weist Strapi als „not
   related to the entity" zurück. Und ein Eintrag nur als
   `{ __component, id }` erhält zwar einfache Felder, **leert aber
   verschachtelte wiederholbare Komponenten** — so sind die `numberItems` der
   Zahlenleiste verschwunden. Immer den vollen Block schicken.

## Offene Punkte

1. **Gehaltszahlen auf der Seite.** Der Verdienst-Block ist raus, aber die
   Provisionsstaffel „gestaffelt von 4 % bis 15 %" steht weiterhin in der
   FAQ-Antwort „Wie setzt sich mein Gehalt zusammen?", und „8.000–10.000 €
   brutto" steht im Hero, in der Zahlenleiste (Block 7) und im Arbeitszeit-Block.
   Alle drei Angaben stammen aus dem als intern gekennzeichneten Deck. Die
   Entscheidung vom 17.09. lautete „nur der eine Block"; ob die FAQ nachgezogen
   wird, ist offen.

2. **Netto-Fixum.** Folie 8 nennt das Fixum netto, die Gesamtsumme brutto. Auf
   der Seite steht seit dem 17.09. nur noch die Brutto-Spanne, das Netto-Fixum
   ist mit dem Block verschwunden. Falls der Verdienst-Block je zurückkommt:
   eine Nettolohnzusage in einer Stellenausschreibung ist arbeitsrechtlich
   heikel und gehört vorher geprüft.

3. **Widerspruch in der Quelle: Ausbildung vor oder parallel zur
   Facharztweiterbildung?** Die Mail sucht Ärzt:innen, die **bereits in der
   Facharztweiterbildung** stehen. Folie 7 beschreibt den Weg als: erst drei
   Jahre Ausbildung, **danach** Start der Facharztausbildung. Folie 8 trägt die
   Überschrift „Gehaltsmodell **während** der Facharztausbildung" und nennt ein
   „Start-Fixum zu Beginn der Facharztausbildung" plus eine Erhöhung „nach
   Abschluss der dreijährigen Ausbildung" — was nur aufgeht, wenn beides
   parallel läuft. Der Widerspruch steht so in der Quelle und ist nicht durch
   Redaktion auflösbar. Die Seite ist bewusst so geschrieben, dass sie keine der
   Lesarten ausschließt. Für die Freigabe muss geklärt werden, was gilt.

4. **„Das passt (noch) nicht: fertige Fachärzt:innen"** steht so auf der Seite,
   weil die Mail es so vorgibt. Wenn Fachärzt:innen trotzdem willkommen sind,
   muss Block 2 angepasst werden.

5. **Freigabe der Texte durch Hessam und Rihem** — das Akzeptanzkriterium des
   Tickets. Ändern sich die deutschen Texte, müssen die fünf Übersetzungen
   nachgezogen werden.

6. **Kein interner Link auf die Seite.** Sie steht in der Sitemap und ist
   `index, follow`, aber keine Seite verlinkt sie: `/karriere` führt nur die
   Stellenanzeige „Arzt / Ärztin (m/w/d)", der Footer-Link „Ärzte" zeigt auf
   `/aerzte`, die Team-Seite. Als reine Social-Landingpage ist das vertretbar,
   für die Indexierung ist eine verwaiste Seite aber ein Nachteil. Eine
   Verlinkung von `/karriere` aus wäre eine CMS-Änderung in sechs Sprachen, kein
   Deploy. Entscheidung offen.
