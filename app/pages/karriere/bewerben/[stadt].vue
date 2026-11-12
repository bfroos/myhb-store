<template>
  <!--
    Recruiting-Funnel Aerzte fuer Meta-Anzeigen, eine Seite je Stadt.
    Ersetzt den Perspective-Funnel recruiting.myhealthandbeauty.com/docs1 und
    folgt ihm Seite fuer Seite (Start mit erster Frage, "Warum MY",
    "Ein typischer Tag", Fragen, Kontakt). Aufbau und Look wie die
    Partnerpraxis-Seite (assets/css/partner-seite.css, Klassen .pp),
    Bilder vom eigenen Shooting. Die Bewerbung landet im Bewerber-Board der
    App. noindex: nur fuer Anzeigen-Traffic.
  -->
  <div class="pp rf">
    <!-- ============ Seite 1: Start ============ -->
    <template v-if="seite === 'start'">
      <section class="pp__hero">
        <div class="pp__breite pp__heroRaster">
          <div class="pp__heroText">
            <p class="pp__eyebrow">Arzt (m/w/d) · {{ stadt.name }} · Keine Unterlagen nötig</p>
            <h1>Bewirb dich in 2 Minuten als Arzt in der Ästhetischen Medizin in {{ stadt.name }}</h1>
            <p class="pp__lead">Sichere dir eine attraktive Fixvergütung plus Provision!</p>
            <div class="rf__frageKarte">
              <FunnelFrageBlock :frage="FUNNEL_FRAGEN[0]!" :antworten="antworten" @gewaehlt="weiterNachFrage" />
            </div>
          </div>
          <img class="pp__heroBild" v-bind="B.team" fetchpriority="high">
          <ul class="pp__fakten pp__vollbreit" role="list">
            <li><strong>2 Minuten</strong><span>dauert die Bewerbung</span></li>
            <li><strong>Kein Lebenslauf</strong><span>und kein Anschreiben nötig</span></li>
            <li><strong>Fix + Provision</strong><span>faire Vergütung</span></li>
            <li><strong>Max. 2 Wochen</strong><span>bis zur Entscheidung</span></li>
          </ul>
        </div>
      </section>

      <section class="pp__abschnitt">
        <div class="pp__breite pp__zwei pp__zwei--bild">
          <img class="pp__bild" v-bind="B.beratung" loading="lazy">
          <div>
            <p class="pp__eyebrow">Über MY</p>
            <h2>Gestalte die Zukunft der Schönheit mit uns.</h2>
            <div class="pp__text">
              <p>
                MY HEALTH &amp; BEAUTY ist das, was entsteht, wenn leidenschaftliche Menschen zusammenkommen, um
                ästhetische Behandlungen revolutionär zu gestalten. Unsere Werte sind uns wichtig und spiegeln sich in
                allem wider, was wir tun.
              </p>
              <p>
                Wir glauben, dass jeder Zugang zu hochwertigen Beauty-Behandlungen haben sollte. Begleite uns auf
                unserer Mission, die Schönheitsbranche mit unserem innovativen Walk-in-Konzept zu verändern.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="pp__abschnitt pp__abschnitt--hell">
        <div class="pp__breite">
          <p class="pp__eyebrow">Deine Vorteile</p>
          <h2>Diese Vorteile erwarten dich</h2>
          <p class="pp__text pp__text--schmal">
            Wir suchen leidenschaftliche Menschen, denen Qualität und Patientenzufriedenheit am Herzen liegt. Bei uns
            erwartet dich eine Kultur der Innovation und Professionalität – mit dem Raum, den du brauchst, um dich
            fachlich und persönlich weiterzuentwickeln.
          </p>
          <img class="pp__band" v-bind="B.empfang" loading="lazy">
          <ul class="pp__karten pp__karten--drei" role="list">
            <li v-for="(k, i) in VORTEILE_START" :key="k.titel" class="pp__karte">
              <span class="pp__nummer">{{ i + 1 }}</span>
              <h3>{{ k.titel }}</h3>
              <p>{{ k.text }}</p>
            </li>
          </ul>
          <div class="rf__mitte">
            <button type="button" class="pp__knopf" @click="nachOben">Bewirb dich in nur 2 Minuten</button>
            <p class="rf__klein">Ohne Bewerbungsschreiben oder Lebenslauf</p>
          </div>
        </div>
      </section>

      <section class="pp__abschnitt">
        <div class="pp__breite pp__zwei">
          <div>
            <p class="pp__eyebrow">Aus dem Team</p>
            <h2>So arbeiten wir bei MY HEALTH &amp; BEAUTY</h2>
            <p class="pp__text">
              Mit unserem innovativen Walk-in-Konzept können Kunden während ihrer Mittagspause oder beim Shopping
              spontan zu uns kommen. Unsere Welt braucht mehr Flexibilität und Zugänglichkeit in der Ästhetik – genau
              das bieten wir.
            </p>
          </div>
          <div class="rf__videos">
            <VimeoVideo v-for="v in FUNNEL_VIDEOS" :key="v.id" :id="v.id" :titel="v.titel" :poster="v.poster" />
          </div>
        </div>
      </section>

      <section class="pp__abschnitt pp__abschnitt--puder">
        <div class="pp__breite">
          <p class="pp__eyebrow">So geht es weiter</p>
          <h2>6 Schritte, um unserem Team beizutreten</h2>
          <p class="pp__text pp__text--schmal">
            Unser Ziel ist es, den Bewerbungsprozess unkompliziert zu gestalten und auf maximal 2 Wochen zu verkürzen,
            damit wir gemeinsam herausfinden, ob wir gut zueinander passen.
          </p>
          <ol class="pp__schritte rf__schritte">
            <li v-for="k in SCHRITTE" :key="k.titel">
              <strong>{{ k.titel }}</strong>
              <span>{{ k.text }}</span>
            </li>
          </ol>
        </div>
      </section>

      <section class="pp__abschnitt">
        <div class="pp__breite">
          <p class="pp__eyebrow">Deine Lounge</p>
          <h2>Unsere Lounge in {{ stadt.name }}: ein moderner Wohlfühlort</h2>
          <p class="pp__text pp__text--schmal">
            Unsere stilvoll eingerichteten Lounges bieten die perfekte Atmosphäre für entspannte und professionelle
            Behandlungen in bester Lage.
          </p>
          <img class="pp__band" v-bind="B.lounge" loading="lazy">
        </div>
      </section>

      <section class="pp__abschnitt pp__abschnitt--dunkel pp__mitte">
        <div class="pp__breite">
          <h2>Bewirb dich jetzt in nur 2 Minuten als Ästhetischer Arzt (m/w/d)</h2>
          <p class="pp__text">
            Wir glauben, dass qualifizierte Fachkräfte die Freiheit brauchen, ihre Expertise voll zu entfalten.
            Begleite uns auf unserer Mission, die Ästhetikbranche mit unserem Walk-in-Konzept zu revolutionieren.
          </p>
          <button type="button" class="pp__knopf pp__knopf--hell" @click="nachOben">Jetzt bewerben</button>
        </div>
      </section>
    </template>

    <!-- ============ Seite 2: Warum MY ============ -->
    <template v-else-if="seite === 'warum'">
      <section class="pp__hero">
        <div class="pp__breite pp__heroRaster">
          <div class="pp__heroText">
            <p class="pp__eyebrow">Schritt 2 von 4 · Lerne uns kennen</p>
            <h1>Warum du zu MY kommen solltest</h1>
            <p class="pp__lead">
              Wir suchen Menschen, die Gesundheit und Schönheit zugänglich machen möchten. In unserem innovativen
              Walk-in-Konzept findest du eine Kultur der professionellen Exzellenz und menschlichen Verbindung.
            </p>
            <div class="pp__knoepfe">
              <button type="button" class="pp__knopf" @click="geheZu('tag')">Weiter zur nächsten Seite</button>
            </div>
          </div>
          <img class="pp__heroBild" v-bind="B.aerzte" fetchpriority="high">
        </div>
      </section>

      <section class="pp__abschnitt pp__abschnitt--hell">
        <div class="pp__breite">
          <p class="pp__eyebrow">Das bekommst du</p>
          <h2>Acht Gründe für MY HEALTH &amp; BEAUTY</h2>
          <ul class="pp__karten" role="list">
            <li v-for="(k, i) in VORTEILE_WARUM" :key="k.titel" class="pp__karte">
              <span class="pp__nummer">{{ i + 1 }}</span>
              <h3>{{ k.titel }}</h3>
              <p>{{ k.text }}</p>
            </li>
          </ul>
        </div>
      </section>

      <section class="pp__abschnitt">
        <div class="pp__breite pp__zwei pp__zwei--bild">
          <div>
            <p class="pp__eyebrow">Über uns</p>
            <h2>Ästhetische Medizin so zugänglich wie ein Friseurbesuch</h2>
            <div class="pp__text">
              <p>
                Unsere Mission ist es, ästhetische und Wellness-Behandlungen für jeden zugänglich zu machen. Mit unserem
                Walk-in-Konzept haben wir bereits mehrere Lounges in deutschen Großstädten eröffnet – darunter
                {{ stadt.name }} – und ermöglichen Menschen hochwertige Behandlungen wie Botox, Hyaluronfiller,
                Mesotherapie und Vitamin-Infusionen ohne Terminvereinbarung.
              </p>
              <p>
                Wir wachsen kontinuierlich und eröffnen neue Standorte in ganz Deutschland. Jetzt suchen wir die
                richtigen Menschen, die mit uns die Zukunft der ästhetischen Medizin gestalten möchten.
              </p>
            </div>
          </div>
          <img class="pp__bild" v-bind="B.gruender" loading="lazy">
        </div>
      </section>

      <section class="pp__abschnitt pp__abschnitt--dunkel">
        <div class="pp__breite rf__zitat">
          <p class="pp__eyebrow">Unsere Vision</p>
          <blockquote>
            „In unseren modernen Lounges verbinden wir medizinische Exzellenz mit menschlicher Wärme und geben unseren
            Mitarbeitenden die Freiheit, ihr Bestes zu geben. Werde Teil eines Teams, das die Zukunft der ästhetischen
            Medizin neu definiert!“
          </blockquote>
          <p class="rf__autor">Michael Auf der Mauer, Gründer</p>
          <button type="button" class="pp__knopf pp__knopf--hell" @click="geheZu('tag')">Weiter zur nächsten Seite</button>
        </div>
      </section>
    </template>

    <!-- ============ Seite 3: Ein typischer Tag ============ -->
    <template v-else-if="seite === 'tag'">
      <section class="pp__hero">
        <div class="pp__breite pp__heroRaster">
          <div class="pp__heroText">
            <p class="pp__eyebrow">Schritt 3 von 4 · Deine Rolle</p>
            <h1>Ein typischer Tag als Arzt bei MY</h1>
            <p class="pp__lead">
              Du arbeitest direkt mit unseren Kunden in {{ stadt.name }} und sorgst dafür, dass sie mit einem Lächeln
              unsere Lounge verlassen – ohne Terminzwang, mit professioneller Beratung und hochwertigen Behandlungen.
            </p>
            <div class="pp__knoepfe">
              <button type="button" class="pp__knopf" @click="geheZu('fragen')">Lass uns herausfinden, ob wir zusammenpassen</button>
            </div>
          </div>
          <img class="pp__heroBild" v-bind="B.behandlung" fetchpriority="high">
        </div>
      </section>

      <section class="pp__abschnitt">
        <div class="pp__breite pp__zwei pp__zwei--bild">
          <div>
            <p class="pp__eyebrow">Was du tun wirst</p>
            <h2>Deine Aufgaben in der Lounge</h2>
            <ul class="pp__liste" role="list">
              <li v-for="t in AUFGABEN" :key="t"><span>{{ t }}</span></li>
            </ul>
          </div>
          <img class="pp__bild" v-bind="B.infusion" loading="lazy">
        </div>
      </section>

      <section class="pp__abschnitt pp__abschnitt--dunkel">
        <div class="pp__breite pp__zwei">
          <div>
            <p class="pp__eyebrow">Wer du bist</p>
            <h2>Das bringst du mit</h2>
          </div>
          <ul class="pp__haekchen" role="list">
            <li v-for="t in PROFIL" :key="t">{{ t }}</li>
          </ul>
        </div>
      </section>

      <section class="pp__abschnitt pp__abschnitt--puder">
        <div class="pp__breite pp__zwei">
          <div>
            <p class="pp__eyebrow">Was deine Kollegen sagen</p>
            <h2>Ein engagiertes Team aus medizinischen Experten</h2>
            <p class="pp__text">
              Unsere Mission ist es, hochwertige ästhetische Behandlungen für jeden zugänglich zu machen – ohne
              Terminzwang, dafür mit maximaler Flexibilität.
            </p>
            <button type="button" class="pp__knopf" @click="geheZu('fragen')">Lass uns herausfinden, ob wir zusammenpassen</button>
          </div>
          <div class="rf__videos">
            <VimeoVideo v-for="v in FUNNEL_VIDEOS" :key="v.id" :id="v.id" :titel="v.titel" :poster="v.poster" />
          </div>
        </div>
      </section>
    </template>

    <!-- ============ Fragen ============ -->
    <section v-else-if="seite === 'fragen'" class="pp__hero rf__fokus">
      <div class="pp__breite">
        <div class="pp__formular">
          <div class="rf__fortschritt" :aria-label="`Frage ${frageIndex} von ${FUNNEL_FRAGEN.length - 1}`">
            <span :style="{ width: `${(frageIndex / FUNNEL_FRAGEN.length) * 100}%` }" />
          </div>
          <p class="pp__eyebrow">Frage {{ frageIndex }} von {{ FUNNEL_FRAGEN.length - 1 }}</p>
          <FunnelFrageBlock :key="frageIndex" :frage="FUNNEL_FRAGEN[frageIndex]!" :antworten="antworten" @gewaehlt="weiterNachFrage" />
          <button type="button" class="rf__zurueck" @click="zurueck">Zurück</button>
        </div>
      </div>
    </section>

    <!-- ============ Kontakt ============ -->
    <section v-else class="pp__hero rf__fokus">
      <div class="pp__breite">
        <div class="pp__formular">
          <div v-if="erfolg" class="rf__danke">
            <p class="pp__eyebrow">Bewerbung eingegangen</p>
            <h2>Danke, {{ form.vorname }}!</h2>
            <p class="pp__text">
              Deine Bewerbung ist bei uns. Unser Recruiting meldet sich in den nächsten Tagen telefonisch bei dir.
            </p>
          </div>
          <form v-else class="pp__form" novalidate @submit.prevent="absenden">
            <div class="rf__fortschritt"><span style="width: 100%" /></div>
            <p class="pp__eyebrow">Letzter Schritt</p>
            <h2>Perfekt! Du könntest ein echter Game-Changer für unser Team sein!</h2>
            <p class="pp__text">Wie können wir dich am besten erreichen, um das Gespräch zu beginnen?</p>
            <Message v-if="fehler" severity="error" class="pp__meldung">{{ fehler }}</Message>
            <div class="pp__reihe">
              <div class="pp__feld">
                <label for="rf-vorname">Vorname</label>
                <InputText id="rf-vorname" v-model="form.vorname" autocomplete="given-name" />
              </div>
              <div class="pp__feld">
                <label for="rf-nachname">Nachname</label>
                <InputText id="rf-nachname" v-model="form.nachname" autocomplete="family-name" />
              </div>
            </div>
            <div class="pp__reihe">
              <div class="pp__feld">
                <label for="rf-email">E-Mail</label>
                <InputText id="rf-email" v-model="form.email" type="email" autocomplete="email" />
              </div>
              <div class="pp__feld">
                <label for="rf-telefon">Telefon (für den Rückruf)</label>
                <InputText id="rf-telefon" v-model="form.telefon" type="tel" inputmode="tel" autocomplete="tel" />
              </div>
            </div>
            <div class="pp__feld">
              <label for="rf-wohnort">Aktueller Wohnort</label>
              <InputText id="rf-wohnort" v-model="form.wohnort" autocomplete="address-level2" />
            </div>
            <div class="pp__honeypot" aria-hidden="true">
              <input v-model="form.website" type="text" tabindex="-1" autocomplete="off">
            </div>
            <label class="pp__einwilligung">
              <Checkbox v-model="form.datenschutz" binary />
              <span>
                Ich habe die <NuxtLinkLocale to="/p/datenschutz" target="_blank">Datenschutzerklärung</NuxtLinkLocale>
                gelesen und akzeptiere sie.
              </span>
            </label>
            <button type="submit" class="pp__knopf" :disabled="laedt">
              {{ laedt ? "Wird gesendet …" : "Jetzt zur MY HEALTH & BEAUTY Familie" }}
            </button>
            <p class="rf__klein">
              Deine Daten sind bei uns sicher – wir nutzen sie ausschließlich für deinen Bewerbungsprozess und
              behandeln sie vertraulich.
            </p>
            <button type="button" class="rf__zurueck" @click="zurueck">Zurück</button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, ref as vueRef } from "vue";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import {
  FUNNEL_FRAGEN,
  MEHRFACH_TRENNER,
  type FunnelFrage,
  pruefeKurzbewerbung,
  stadtAusSlug,
  trackingAusQuery,
} from "#shared/recruitingFunnel";
import {
  AUFGABEN,
  FUNNEL_BILDER as B,
  FUNNEL_VIDEOS,
  PROFIL,
  SCHRITTE,
  VORTEILE_START,
  VORTEILE_WARUM,
} from "#shared/recruitingFunnelInhalt";

definePageMeta({ layout: "landing" });

const route = useRoute();
const gefunden = stadtAusSlug(String(route.params.stadt ?? ""));
if (!gefunden) {
  throw createError({ statusCode: 404, statusMessage: "Not found", fatal: true });
}
const stadt = gefunden;

useHead({
  title: `Arzt (m/w/d) in ${stadt.name} – Ästhetische Medizin | MY HEALTH & BEAUTY`,
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

/* Eine Frage mit Klickantworten; bei Mehrfachauswahl mit "Weiter". */
const FunnelFrageBlock = defineComponent({
  props: {
    frage: { type: Object as () => FunnelFrage, required: true },
    antworten: { type: Object as () => Record<string, string>, required: true },
  },
  emits: ["gewaehlt"],
  setup(props, { emit }) {
    const auswahl = vueRef<string[]>(
      props.frage.mehrfach && props.antworten[props.frage.id]
        ? props.antworten[props.frage.id]!.split(MEHRFACH_TRENNER)
        : [],
    );
    const klick = (o: string) => {
      if (!props.frage.mehrfach) {
        props.antworten[props.frage.id] = o;
        emit("gewaehlt");
        return;
      }
      auswahl.value = auswahl.value.includes(o)
        ? auswahl.value.filter((x) => x !== o)
        : [...auswahl.value, o];
    };
    const fertig = () => {
      if (!auswahl.value.length) return;
      props.antworten[props.frage.id] = props.frage.optionen
        .filter((o) => auswahl.value.includes(o))
        .join(MEHRFACH_TRENNER);
      emit("gewaehlt");
    };
    return () => h("div", { class: "rf__frage" }, [
      h("h2", { class: "rf__frageTitel" }, props.frage.frage),
      props.frage.hinweis ? h("p", { class: "rf__klein" }, props.frage.hinweis) : null,
      h("div", { class: ["rf__optionen", { "rf__optionen--zwei": props.frage.optionen.length === 2 }] },
        props.frage.optionen.map((o) => {
          const aktiv = props.frage.mehrfach
            ? auswahl.value.includes(o)
            : props.antworten[props.frage.id] === o;
          return h("button", {
            type: "button",
            class: ["rf__option", { "rf__option--aktiv": aktiv, "rf__option--mehrfach": props.frage.mehrfach }],
            "aria-pressed": aktiv,
            onClick: () => klick(o),
          }, o);
        })),
      props.frage.mehrfach
        ? h("button", {
            type: "button",
            class: "pp__knopf",
            disabled: !auswahl.value.length,
            onClick: fertig,
          }, "Weiter")
        : null,
    ]);
  },
});

/*
 * Vimeo erst nach Klick laden (Zwei-Klick-Loesung), mit dnt=1: vorher geht
 * keine Anfrage an Vimeo, danach setzt Vimeo keine Tracking-Cookies.
 */
const VimeoVideo = defineComponent({
  props: {
    id: { type: String, required: true },
    titel: { type: String, required: true },
    poster: { type: String, required: true },
  },
  setup(props) {
    const aktiv = vueRef(false);
    return () => h("div", { class: "rf__video" }, aktiv.value
      ? [h("iframe", {
          src: `https://player.vimeo.com/video/${props.id}?dnt=1&autoplay=1&title=0&byline=0&portrait=0`,
          title: props.titel,
          allow: "autoplay; fullscreen; picture-in-picture",
          allowfullscreen: true,
          loading: "lazy",
        })]
      : [
          h("img", { src: props.poster, alt: "", loading: "lazy" }),
          h("button", {
            type: "button",
            class: "rf__play",
            "aria-label": `Video abspielen: ${props.titel}`,
            onClick: () => { aktiv.value = true; },
          }, [h("span", { class: "rf__playIcon", "aria-hidden": "true" }, "▶")]),
          h("p", { class: "rf__videoHinweis" }, "Beim Abspielen lädt das Video von Vimeo."),
        ]);
  },
});

const { trackCareerApply } = useGoogleAnalytics();

// Kampagne aus dem Anzeigenlink merken, bevor jemand weiterklickt.
const tracking = trackingAusQuery(route.query as Record<string, unknown>);

type Seite = "start" | "warum" | "tag" | "fragen" | "kontakt";
const seite = ref<Seite>("start");
const frageIndex = ref(1);
const antworten = reactive<Record<string, string>>({});
const verlauf: Array<{ seite: Seite; frage: number }> = [];

const form = reactive({
  vorname: "",
  nachname: "",
  email: "",
  telefon: "",
  wohnort: "",
  datenschutz: false,
  website: "",
});
const laedt = ref(false);
const fehler = ref<string | null>(null);
const erfolg = ref(false);

function nachOben() {
  if (import.meta.client) window.scrollTo({ top: 0, behavior: "smooth" });
}

function geheZu(neu: Seite) {
  verlauf.push({ seite: seite.value, frage: frageIndex.value });
  seite.value = neu;
  if (import.meta.client) window.scrollTo({ top: 0 });
}

function weiterNachFrage() {
  if (seite.value === "start") return geheZu("warum");
  if (frageIndex.value < FUNNEL_FRAGEN.length - 1) {
    verlauf.push({ seite: "fragen", frage: frageIndex.value });
    frageIndex.value++;
    return;
  }
  geheZu("kontakt");
}

function zurueck() {
  const vorher = verlauf.pop();
  if (!vorher) return;
  seite.value = vorher.seite;
  frageIndex.value = vorher.frage;
}

async function absenden() {
  fehler.value = pruefeKurzbewerbung({ ...form, antworten });
  if (fehler.value) return;
  laedt.value = true;
  try {
    await $fetch("/api/karriere/kurzbewerbung", {
      method: "POST",
      body: { ...form, stadt: stadt.slug, antworten, tracking },
    });
    erfolg.value = true;
    trackCareerApply({ job_type: "arzt", location_slug: stadt.slug });
    // Meta-Pixel (ueber GTM/Cookiebot geladen, nur mit Einwilligung): Lead fuer die Kampagnenoptimierung.
    (window as any).fbq?.("track", "Lead", { content_name: `recruiting-${stadt.slug}` });
  } catch (e: any) {
    fehler.value = e?.data?.statusMessage || e?.statusMessage || "Das hat nicht geklappt. Bitte versuche es noch einmal.";
  } finally {
    laedt.value = false;
  }
}
</script>

<style src="~/assets/css/partner-seite.css"></style>
<style>
/* Ergaenzungen fuer den Recruiting-Funnel, alles unter .rf */
.rf .pp__heroText { gap: 20px; }
.rf__frageKarte {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(17, 17, 17, 0.06);
}
.rf__frage { display: grid; gap: 16px; }
.rf__frageTitel {
  margin: 0;
  font-size: clamp(20px, 2.2vw, 26px);
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.rf__optionen { display: grid; gap: 10px; }
.rf__option {
  font: inherit;
  font-size: 16px;
  font-weight: 600;
  text-align: left;
  min-height: 56px;
  padding: 14px 20px;
  border: 1.5px solid var(--pp-linie);
  border-radius: 14px;
  background: #fff;
  color: var(--pp-schwarz);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
}
.rf__option:hover { border-color: var(--pp-schwarz); transform: translateY(-1px); }
.rf__option--aktiv { border-color: var(--pp-schwarz); background: var(--pp-puder); }
.rf__option--mehrfach { padding-left: 52px; position: relative; }
.rf__option--mehrfach::before {
  content: "";
  position: absolute;
  left: 18px;
  top: 50%;
  width: 20px;
  height: 20px;
  margin-top: -10px;
  border: 1.5px solid var(--pp-akzent);
  border-radius: 6px;
  background: #fff;
}
.rf__option--mehrfach.rf__option--aktiv::before {
  content: "✓";
  display: grid;
  place-items: center;
  background: var(--pp-schwarz);
  border-color: var(--pp-schwarz);
  color: #fff;
  font-size: 13px;
}
.rf__klein { margin: 0; font-size: 14px; color: var(--pp-leise); line-height: 1.5; }
.rf__mitte { display: grid; justify-items: center; gap: 10px; margin-top: 40px; text-align: center; }
.rf__fokus { min-height: 70vh; }
.rf__fokus .pp__formular { max-width: 680px; display: grid; gap: 16px; }
.rf__fokus .pp__formular h2 { margin: 0; }
.rf__fortschritt { height: 6px; border-radius: 3px; background: var(--pp-linie); overflow: hidden; }
.rf__fortschritt span { display: block; height: 100%; background: var(--pp-schwarz); transition: width 0.3s ease; }
.rf__zurueck {
  justify-self: start;
  font: inherit;
  font-size: 14px;
  background: none;
  border: 0;
  padding: 0;
  color: var(--pp-leise);
  text-decoration: underline;
  cursor: pointer;
}
.rf__danke { display: grid; gap: 12px; }
.rf__videos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.rf__video {
  position: relative;
  aspect-ratio: 9 / 16;
  border-radius: 20px;
  overflow: hidden;
  background: var(--pp-schwarz);
}
.rf__video img,
.rf__video iframe { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; }
.rf__video img { opacity: 0.75; }
.rf__play {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: none;
  border: 0;
  cursor: pointer;
}
.rf__playIcon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fff;
  color: var(--pp-schwarz);
  font-size: 22px;
  padding-left: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
.rf__videoHinweis {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 10px;
  margin: 0;
  font-size: 11px;
  color: #fff;
  text-align: center;
  pointer-events: none;
}
.rf__zitat { display: grid; gap: 20px; max-width: 860px; }
.rf__zitat blockquote {
  margin: 0;
  font-size: clamp(22px, 2.6vw, 32px);
  line-height: 1.35;
  font-weight: 600;
  letter-spacing: -0.3px;
}
.rf__autor { margin: 0; color: #d8bfb2; font-weight: 700; }
.rf__zitat .pp__knopf { justify-self: start; }
@media (min-width: 760px) {
  .rf__optionen--zwei { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rf__schritte { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
