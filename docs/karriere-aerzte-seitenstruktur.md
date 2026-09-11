# Karriere-Landingpage Ärzte — Seitenstruktur (Entwurf)

Ticket: bfroos/myhb-store#101 · Epic E6 (#103) · Stand: 11.09.2026

> **Status: Entwurf, nicht freigegeben.** Dieses Dokument beschreibt **nur die
> Struktur**. Es enthält bewusst **keine fertigen Seitentexte**: Grundlage wäre
> `Ausbildungskonzept_Aerzte-2.pptx` von Rihem Mikhail (Mail „Fwd: Präsentation“
> vom 12.08.2026, Hessam an Benjamin/Michael). Die Präsentation lag dieser
> Session nicht vor: der angebundene Gmail-Account ist `marketing@myhb.app`,
> die Mail liegt in Benjamins Postfach `b.roos@myhb.app`; in Google Drive ist
> die Datei ebenfalls nicht abgelegt (siehe „Was fehlt“). Die Texte werden erst
> geschrieben, wenn die Präsentation da ist, und gehen anschließend zur Freigabe
> an Hessam/Rihem.

## Zielgruppe und Kanal

Aus der Mail:

- **Ärztinnen und Ärzte in der Facharztweiterbildung**, vorzugsweise aus dem
  Krankenhaus.
- **Nicht** die Zielgruppe: fertige Fachärzt:innen, frisch Approbierte.
- **Hauptkanal: Social Media**, mit Link auf diese Seite. Die Seite ist also
  eine Landingpage für kalten Social-Traffic, keine Unterseite, auf die man sich
  durchklickt: sie muss in den ersten zwei Bildschirmhöhen beantworten, wer
  gesucht wird und was geboten wird.
- **Ansprache: Du-Form** (Kunden und Bewerber werden geduzt, Staff gesiezt).

Für die Struktur heißt das:

- Mobil zuerst. Der Traffic kommt aus dem Feed, fast ausschließlich vom Handy.
- Die Abgrenzung der Zielgruppe gehört sichtbar auf die Seite, nicht nur ins
  Targeting — sonst bewerben sich Fachärzt:innen und frisch Approbierte.
- Videos und echte Stimmen tragen die Seite; reiner Fließtext wird im Social-
  Traffic nicht gelesen.

## Abschnitte

Die Reihenfolge folgt der Frage-Reihenfolge der Zielgruppe: *Bin ich gemeint? →
Was habe ich davon? → Wie sieht das konkret aus? → Wem glaube ich das? → Wie
bewerbe ich mich?*

| # | Abschnitt | Zweck | Strapi-Block | Inhalt kommt aus |
|---|---|---|---|---|
| 1 | **Hero** | Wer wird gesucht, was ist das Angebot, CTA | `blocks.page-header` (Layout `split`, mit Bild oder Video) | Präsentation |
| 2 | **Für wen das ist** | Zielgruppe klar abgrenzen: Facharztweiterbildung ja, Facharzt/frisch approbiert nein | `blocks.benefits-list` oder `blocks.text-content` | Mail (Zielgruppe) + Präsentation |
| 3 | **Benefits** | Die vier bis sechs stärksten Argumente, überfliegbar | `blocks.highlights-strip` (Icons) oder `blocks.benefit-grid` | Präsentation |
| 4 | **Ausbildungskonzept** | Der eigentliche Kern: was lernst du, in welchen Schritten | `blocks.process-steps` | **Präsentation (Hauptquelle)** |
| 5 | **Einblick in den Arbeitsalltag** | Wie ein Tag in der Lounge aussieht | `blocks.media-bento` oder `blocks.gallery` | Präsentation + eigene Fotos |
| 6 | **Videos** | Bewegtbild aus dem Alltag, hochkant für Social-Herkunft | `blocks.stories` (Hochformat) bzw. `blocks.youtube-video` (Querformat) | Neu zu produzieren |
| 7 | **Meinungen** | Ärzt:innen, die schon da sind, kommen zu Wort | `blocks.employee-list` (Team) bzw. `blocks.reviews` (Zitate) | Neu einzuholen |
| 8 | **Verdienst und Karrieremodell** | Zahlen und Perspektive | `blocks.text-content` oder `blocks.process-steps` | Präsentation + Abstimmung |
| 9 | **Standorte** | Wo man arbeiten kann | `blocks.location-map` oder `blocks.location-teasers` | Vorhanden in Strapi |
| 10 | **FAQ** | Einwände abräumen (Dienstplan, Weiterbildungszeit, Wechsel aus der Klinik) | `blocks.faq` | Präsentation + Rihem/Hessam |
| 11 | **Bewerben (CTA)** | Abschluss | `blocks.final-cta` — **vorerst Platzhalter** | siehe unten |

Alle genannten Blöcke sind im Store bereits implementiert (`BlockRenderer` in
`app/components/block/BlockRenderer.vue`) und in der Dynamic Zone der
`pages`-Collection verfügbar. Für die Struktur muss also **nichts neu gebaut**
werden — die Seite wird in Strapi zusammengesetzt.

### Zum CTA

Der Bewerben-CTA gehört inhaltlich zu **#102** (Bewerbungsformular →
HubSpot-Pipeline, Benachrichtigung an Jenny) und wird dort umgesetzt. In dieser
Seite steht vorerst nur der Platzhalter: ein `blocks.final-cta` mit
Bewerben-Button. Bis #102 fertig ist, kann der Button auf das bestehende Ziel
der Arzt-Stellenanzeige zeigen
(`https://recruiting.myhealthandbeauty.com/docs1/`, gepflegt am Job
`arzt-aerztin-mwd`). Das ist eine Übergangslösung, keine Entscheidung für #102.

## Technische Umsetzung (in dieser Session gebaut)

- Route: `app/pages/karriere/aerzte.vue` → `/karriere/aerzte`
- Inhalte: Strapi-Collection `pages`, Eintrag mit **Slug `karriere-aerzte`**.
  Redaktion pflegt Blöcke, Texte, Videos und SEO ohne Deploy.
  Der Eintrag ist angelegt: `documentId zsv06zditubao6x2mbrvfa9w` (id 713),
  **Status Entwurf** (`publishedAt: null`), `blocks` noch leer, `seo` als
  Entwurfstext gefüllt, `excludeFromSitemap` vorsorglich auf `true`.
  Solange er Entwurf ist, bleibt `/karriere/aerzte` öffentlich 404 und ist nur
  über die Strapi-Vorschau sichtbar.
- SEO: kommt aus dem `seo`-Feld des Strapi-Eintrags (`setPageSeo`).
- Sprachpfade in `nuxt.config.ts`: `/en/careers/doctors`,
  `/tr/kariyer/doktorlar`, `/ar/masar-mihani/atibba`, `/fr/carrieres/medecins`,
  `/nl/carriere/artsen`.
- ISR: bereits von der bestehenden Regel `/karriere/**` (12 h) abgedeckt.
- Solange der Strapi-Eintrag fehlt, liefert die Route sauber 404. Die Seite geht
  live, sobald der Eintrag angelegt und veröffentlicht ist.

**Noch offen (bewusst nicht gemacht):** Eintrag in `server/routes/sitemap.xml.ts`.
Der Eintrag käme in `ROUTE_MAP` und in die `staticRoutes`-Liste — aber erst,
wenn die Seite tatsächlich Inhalt hat, sonst steht eine 404-URL in der Sitemap.

## Was fehlt, damit die Texte geschrieben werden können

1. **`Ausbildungskonzept_Aerzte-2.pptx`** — die Präsentation aus der Mail vom
   12.08.2026. Ohne sie sind die Abschnitte 1, 3, 4, 5, 8 und 10 nicht
   befüllbar, ohne etwas zu erfinden. Bitte an Benjamin: Datei bereitstellen
   (Mail weiterleiten oder in Google Drive ablegen).
2. **Videos** (Abschnitt 6) — existieren noch nicht, müssen produziert werden.
   Hochformat, weil der Traffic aus Social kommt.
3. **Meinungen** (Abschnitt 7) — Zitate und Freigaben von Ärzt:innen, die heute
   schon da sind.
4. **Verdienst/Karrieremodell** (Abschnitt 8) — belastbare Zahlen und deren
   Freigabe. Die bestehende Stellenanzeige nennt nur einen Stundenlohn-Rahmen.
5. **Freigabe der fertigen Texte durch Hessam/Rihem** — Akzeptanzkriterium des
   Tickets.
