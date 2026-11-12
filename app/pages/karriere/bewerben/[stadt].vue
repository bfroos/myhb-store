<template>
  <!--
    Recruiting-Funnel Aerzte fuer Meta-Anzeigen, eine Seite je Stadt
    (shared/recruitingFunnel.ts). Ersetzt den Perspective-Funnel
    recruiting.myhealthandbeauty.com/docs1 und folgt ihm Seite fuer Seite:
    Start mit erster Frage, "Warum MY", "Ein typischer Tag", vier Fragen
    (+ Approbation), Kontakt. Texte aus Perspective uebernommen, um die Stadt
    ergaenzt. Die Bewerbung landet im Bewerber-Board der App. noindex.
  -->
  <section class="funnel theme-light">
    <!-- Seite 1: Start, erste Frage direkt oben wie bei Perspective -->
    <template v-if="seite === 'start'">
      <header class="funnel__hero">
        <p class="funnel__eyebrow">Keine Bewerbungsunterlagen erforderlich</p>
        <h1 class="funnel__headline">
          Bewirb dich in nur 2 Minuten als Arzt in der Ästhetischen Medizin in {{ stadt.name }}
        </h1>
        <p class="funnel__lead">(m/w/d) und sichere dir eine attraktive Fixvergütung plus Provision!</p>
      </header>

      <div class="funnel__card">
        <FunnelFrageBlock :frage="FUNNEL_FRAGEN[0]!" :antworten="antworten" @gewaehlt="weiterNachFrage" />
      </div>

      <div class="funnel__block">
        <h2 class="funnel__h2">Gestalte die Zukunft der Schönheit mit uns.</h2>
        <p>
          MY HEALTH &amp; BEAUTY ist das, was entsteht, wenn leidenschaftliche Menschen zusammenkommen, um ästhetische
          Behandlungen revolutionär zu gestalten. Unsere Werte sind uns wichtig und spiegeln sich in allem wider, was
          wir tun. Wir glauben, dass jeder Zugang zu hochwertigen Beauty-Behandlungen haben sollte. Begleite uns auf
          unserer Mission, die Schönheitsbranche mit unserem innovativen Walk-in-Konzept zu verändern.
        </p>
      </div>

      <div class="funnel__block">
        <h2 class="funnel__h2">Diese Vorteile erwarten dich:</h2>
        <p>
          Wir suchen leidenschaftliche Menschen, denen Qualität und Patientenzufriedenheit am Herzen liegt. Bei uns
          erwartet dich eine Kultur der Innovation und Professionalität – mit dem Raum, den du brauchst, um dich
          fachlich und persönlich weiterzuentwickeln.
        </p>
        <ul class="funnel__grid">
          <li v-for="v in VORTEILE_START" :key="v.titel">
            <strong>{{ v.titel }}</strong>
            <span>{{ v.text }}</span>
          </li>
        </ul>
      </div>

      <div class="funnel__block">
        <h2 class="funnel__h2">Unser Ziel ist es, Schönheitsbehandlungen zugänglich und bequem zu machen.</h2>
        <p>
          Wir sind fasziniert von der Idee, dass Schönheitsbehandlungen nicht kompliziert oder zeitaufwendig sein
          müssen. Mit unserem innovativen Walk-in-Konzept können Kunden während ihrer Mittagspause oder beim Shopping
          spontan zu uns kommen. Unsere Welt braucht mehr Flexibilität und Zugänglichkeit in der Ästhetik – genau das
          bieten wir.
        </p>
      </div>

      <div class="funnel__block">
        <h2 class="funnel__h2">6 Schritte, um unserem Team beizutreten.</h2>
        <p>
          Unser Ziel ist es, den Bewerbungsprozess unkompliziert zu gestalten und auf maximal 2 Wochen zu verkürzen,
          damit wir gemeinsam herausfinden, ob wir gut zueinander passen.
        </p>
        <ol class="funnel__steps">
          <li v-for="s in SCHRITTE" :key="s.titel">
            <strong>{{ s.titel }}</strong>
            <span>{{ s.text }}</span>
          </li>
        </ol>
      </div>

      <div class="funnel__block">
        <h2 class="funnel__h2">Unsere Lounge in {{ stadt.name }}: ein moderner Wohlfühlort.</h2>
        <p>
          Unsere stilvoll eingerichteten Lounges bieten die perfekte Atmosphäre für entspannte und professionelle
          Behandlungen in bester Lage.
        </p>
      </div>

      <div class="funnel__block funnel__block--cta">
        <h2 class="funnel__h2">
          Bewirb dich jetzt in nur 2 Minuten als Ästhetischer Arzt (m/w/d) und sichere dir ein attraktives Gehalt plus
          Provision!
        </h2>
        <p>
          Wir glauben, dass qualifizierte Fachkräfte die Freiheit brauchen, ihre Expertise voll zu entfalten. Begleite
          uns auf unserer Mission, die Ästhetikbranche mit unserem innovativen Walk-in-Konzept zu revolutionieren.
        </p>
        <UiAtomBaseButton size="lg" @click="nachOben">Bewirb dich in nur 2 Minuten</UiAtomBaseButton>
        <p class="funnel__hint">Ohne Bewerbungsschreiben oder Lebenslauf</p>
      </div>
    </template>

    <!-- Seite 2: Warum du zu MY kommen solltest -->
    <template v-else-if="seite === 'warum'">
      <header class="funnel__hero">
        <h1 class="funnel__headline">Warum du zu MY kommen solltest</h1>
        <p class="funnel__lead">
          Wir suchen Menschen, die Gesundheit und Schönheit zugänglich machen möchten. In unserem innovativen
          Walk-in-Konzept findest du eine Kultur der professionellen Exzellenz und menschlichen Verbindung.
        </p>
        <UiAtomBaseButton size="lg" @click="geheZu('tag')">Weiter zur nächsten Seite</UiAtomBaseButton>
      </header>
      <ul class="funnel__grid">
        <li v-for="v in VORTEILE_WARUM" :key="v.titel">
          <strong>{{ v.titel }}</strong>
          <span>{{ v.text }}</span>
        </li>
      </ul>
      <div class="funnel__block">
        <h2 class="funnel__h2">Über uns</h2>
        <p>
          Unsere Mission ist es, ästhetische und Wellness-Behandlungen für jeden zugänglich zu machen. Mit unserem
          revolutionären Walk-in-Konzept haben wir bereits mehrere Lounges in deutschen Großstädten eröffnet – darunter
          {{ stadt.name }} – und ermöglichen Menschen, hochwertige Behandlungen wie Botox, Hyaluronfiller,
          Mesotherapie und Vitamin-Infusionen ohne Terminvereinbarung zu erhalten.
        </p>
        <p>
          Wir wachsen kontinuierlich und eröffnen neue Standorte in ganz Deutschland. Jetzt suchen wir die richtigen
          Menschen, die mit uns die Zukunft der ästhetischen Medizin gestalten möchten.
        </p>
        <h2 class="funnel__h2">Unsere Vision</h2>
        <p>
          Unser Walk-in-Modell bricht mit starren Terminsystemen und macht professionelle ästhetische Medizin so
          zugänglich wie einen Friseurbesuch. In unseren modernen Lounges verbinden wir medizinische Exzellenz mit
          menschlicher Wärme und geben unseren Mitarbeitenden die Freiheit, ihr Bestes zu geben. Werde Teil eines
          Teams, das die Zukunft der ästhetischen Medizin neu definiert!
        </p>
        <p class="funnel__signatur">Michael Auf der Mauer, Gründer</p>
      </div>
      <UiAtomBaseButton size="lg" @click="geheZu('tag')">Weiter zur nächsten Seite</UiAtomBaseButton>
    </template>

    <!-- Seite 3: Ein typischer Tag -->
    <template v-else-if="seite === 'tag'">
      <header class="funnel__hero">
        <h1 class="funnel__headline">Ein typischer Tag als Ästhetik-Experte bei MY HEALTH &amp; BEAUTY</h1>
        <p class="funnel__lead">
          Es ist uns wichtig, Menschen dabei zu helfen, sich in ihrer Haut wohlzufühlen – ohne Terminzwang, dafür mit
          professioneller Beratung und hochwertigen Behandlungen. Du arbeitest direkt mit unseren Kunden zusammen und
          sorgst dafür, dass sie mit einem Lächeln unsere Lounge in {{ stadt.name }} verlassen.
        </p>
        <UiAtomBaseButton size="lg" @click="geheZu('fragen')">Lass uns herausfinden, ob wir zusammenpassen</UiAtomBaseButton>
      </header>
      <div class="funnel__block">
        <h2 class="funnel__h2">Was du tun wirst</h2>
        <ul class="funnel__liste">
          <li v-for="t in AUFGABEN" :key="t">{{ t }}</li>
        </ul>
        <h2 class="funnel__h2">Wer du bist</h2>
        <ul class="funnel__liste">
          <li v-for="t in PROFIL" :key="t">{{ t }}</li>
        </ul>
      </div>
      <UiAtomBaseButton size="lg" @click="geheZu('fragen')">Lass uns herausfinden, ob wir zusammenpassen</UiAtomBaseButton>
    </template>

    <!-- Fragen 2–6 -->
    <div v-else-if="seite === 'fragen'" class="funnel__card">
      <p class="funnel__zaehler">Frage {{ frageIndex }} von {{ FUNNEL_FRAGEN.length - 1 }}</p>
      <FunnelFrageBlock :key="frageIndex" :frage="FUNNEL_FRAGEN[frageIndex]!" :antworten="antworten" @gewaehlt="weiterNachFrage" />
      <button type="button" class="funnel__back" @click="zurueck">Zurück</button>
    </div>

    <!-- Kontakt -->
    <div v-else class="funnel__card">
      <Message v-if="erfolg" severity="success" class="funnel__message">
        <strong>Danke, {{ form.vorname }}!</strong><br>
        Deine Bewerbung ist bei uns. Unser Recruiting meldet sich in den nächsten Tagen telefonisch bei dir.
      </Message>
      <form v-else class="funnel__form" novalidate @submit.prevent="absenden">
        <h2 class="funnel__question">Perfekt! Du könntest ein echter Game-Changer für unser Team sein!</h2>
        <p>Wie können wir dich am besten erreichen, um das Gespräch zu beginnen?</p>
        <Message v-if="fehler" severity="error" class="funnel__message">{{ fehler }}</Message>
        <div class="funnel__row">
          <InputText v-model="form.vorname" placeholder="Vorname" autocomplete="given-name" aria-label="Vorname" />
          <InputText v-model="form.nachname" placeholder="Nachname" autocomplete="family-name" aria-label="Nachname" />
        </div>
        <InputText v-model="form.email" type="email" placeholder="Deine E-Mail-Adresse" autocomplete="email" aria-label="E-Mail" />
        <InputText v-model="form.telefon" type="tel" inputmode="tel" placeholder="Deine Telefonnummer" autocomplete="tel" aria-label="Telefon" />
        <InputText v-model="form.wohnort" placeholder="Aktueller Wohnort" autocomplete="address-level2" aria-label="Wohnort" />
        <div class="funnel__honeypot" aria-hidden="true">
          <input v-model="form.website" type="text" tabindex="-1" autocomplete="off">
        </div>
        <label class="funnel__consent">
          <Checkbox v-model="form.datenschutz" binary />
          <span>
            Ich habe die <NuxtLinkLocale to="/p/datenschutz" target="_blank">Datenschutzerklärung</NuxtLinkLocale>
            gelesen und akzeptiere sie.
          </span>
        </label>
        <UiAtomBaseButton type="submit" size="lg" :disabled="laedt">
          {{ laedt ? "Wird gesendet …" : "Jetzt zur MY HEALTH & BEAUTY Familie" }}
        </UiAtomBaseButton>
        <p class="funnel__hint">
          Deine Daten sind bei uns sicher – wir nutzen sie ausschließlich für deinen Bewerbungsprozess und behandeln sie
          vertraulich.
        </p>
        <button type="button" class="funnel__back" @click="zurueck">Zurück</button>
      </form>
    </div>
  </section>
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

/* Texte aus dem Perspective-Funnel (docs1, Stand 12.11.2026). */
const VORTEILE_START = [
  { titel: "Höchste Qualitätsstandards", text: "Wir verwenden nur premium Produkte und modernste Behandlungsmethoden, damit unsere Kunden strahlend zufrieden unsere Lounges verlassen." },
  { titel: "Arbeite in unseren modernen Lounges", text: "Unsere stilvoll eingerichteten Lounges in deutschen Großstädten bieten ein professionelles und angenehmes Arbeitsumfeld." },
  { titel: "Modernste Ausstattung", text: "Wir stellen dir erstklassige medizinische Geräte und hochwertige Behandlungsprodukte zur Verfügung." },
  { titel: "Kontinuierliche Weiterbildung", text: "Regelmäßige Schulungen zu neuen Behandlungsmethoden und Techniken halten dich auf dem neuesten Stand der Ästhetik." },
  { titel: "Attraktives Vergütungspaket", text: "Festes Gehalt plus leistungsabhängige Provisionen – deine Expertise wird fair belohnt." },
  { titel: "Eigenverantwortliches Arbeiten", text: "Du übernimmst Verantwortung für deine Kunden und gestaltest deren Behandlungserlebnis eigenständig mit." },
  { titel: "Professionelles Team", text: "Arbeite mit qualifizierten Kollegen zusammen, die deine Leidenschaft für Ästhetik und Kundenzufriedenheit teilen." },
  { titel: "Flexible Arbeitszeiten", text: "Unser Walk-in-Konzept ermöglicht eine abwechslungsreiche Tagesgestaltung mit verschiedenen Behandlungen und Kunden." },
  { titel: "Team-Events", text: "Regelmäßige Schulungsveranstaltungen und Team-Events stärken den Zusammenhalt und den fachlichen Austausch." },
];

const SCHRITTE = [
  { titel: "Bewirb dich für die Position", text: "Teile uns dein Interesse mit – egal ob über unsere Website, LinkedIn oder direkt im Gespräch." },
  { titel: "Erstes Kennenlernen", text: "Ein kurzes Gespräch hilft uns beiden, die wichtigsten Fragen zu klären und uns gegenseitig kennenzulernen." },
  { titel: "Fachliche Qualifikation", text: "Wir besprechen deine Erfahrungen und prüfen deine fachlichen Qualifikationen für ästhetische Behandlungen." },
  { titel: "Praktische Einschätzung", text: "Eine kurze praktische Demonstration hilft uns zu sehen, ob du dich in deinem Fachgebiet wohlfühlst." },
  { titel: "Lerne dein Team kennen", text: "Jetzt kannst du deine zukünftigen Kollegen und unsere Lounge-Atmosphäre persönlich erleben." },
  { titel: "Willkommen im Team!", text: "Wir bereiten bereits dein Onboarding und die Einarbeitung in unsere Behandlungsstandards vor." },
];

const VORTEILE_WARUM = [
  { titel: "Echte Wirkung? Jeden Tag!", text: "Du hilfst Menschen dabei, sich selbstbewusster und wohler zu fühlen. Jede Behandlung macht einen direkten Unterschied im Leben unserer Kunden." },
  { titel: "Flexible Arbeitszeiten", text: "Arbeite in einem der modernsten Lounge-Konzepte Deutschlands mit flexiblen Schichten, die sich deinem Lebensstil anpassen." },
  { titel: "Modernste Medizintechnik", text: "Arbeite mit modernster Ausstattung für ästhetische Behandlungen – von Botox und Hyaluronfillern bis hin zu Mesotherapie und Vitamininfusionen – in erstklassigen Behandlungsräumen." },
  { titel: "Fortbildung & Entwicklung", text: "Regelmäßige Schulungen in neuesten Behandlungsmethoden und Zertifizierungen halten dich an der Spitze der ästhetischen Medizin." },
  { titel: "Attraktive Vergütung", text: "Wettbewerbsfähiges Gehalt plus erfolgsabhängige Boni und Mitarbeiterrabatte auf alle Behandlungen für dich und deine Familie." },
  { titel: "Professionelle Autonomie", text: "Du arbeitest eigenverantwortlich mit direktem Patientenkontakt und kannst deine medizinische Expertise voll entfalten." },
  { titel: "Herzliches Team", text: "Unser Motto: Professionell, zugänglich und menschlich. Wir schaffen eine Atmosphäre, in der sich sowohl Team als auch Kunden wohlfühlen." },
  { titel: "Team Events", text: "Regelmäßige Fortbildungen und Teamevents stärken unseren Zusammenhalt und erweitern dein berufliches Netzwerk." },
];

const AUFGABEN = [
  "Du führst professionelle Botox- und Filler-Behandlungen durch und berätst Kunden zu den optimalen Behandlungsoptionen für ihre individuellen Wünsche",
  "Du bietest Mesotherapie, PRP-Haartherapie und hochdosierte Vitamin-Infusionen an – immer mit höchsten Sicherheits- und Qualitätsstandards",
  "Du sorgst für eine entspannte Atmosphäre in unseren Walk-in-Lounges und machst jeden Besuch zu einem positiven Erlebnis",
  "Du dokumentierst Behandlungen sorgfältig und stellst sicher, dass alle medizinischen Standards eingehalten werden",
  "Du arbeitest eigenverantwortlich und flexibel – perfekt für die spontanen Bedürfnisse unserer Kunden im Walk-in-Modell",
  "Du hilfst beim Aufbau neuer Standorte mit und bringst deine Expertise in die Weiterentwicklung unseres Lounge-Konzepts ein",
];

const PROFIL = [
  "Du hast eine medizinische Ausbildung und Leidenschaft für ästhetische Medizin und Wellness",
  "Du kommunizierst einfühlsam mit Kunden und schaffst Vertrauen durch deine professionelle, zugängliche Art",
  "Du arbeitest gerne eigenständig und kannst flexibel auf spontane Walk-in-Kunden eingehen",
  "Du erkennst individuelle Bedürfnisse und findest innovative Lösungen für Schönheits- und Wellness-Ziele",
  "Du sprichst fließend Deutsch und hast idealerweise Erfahrung mit ästhetischen Behandlungen",
  "Kein Muss, aber ein Vorteil: Erfahrung mit Vitamin-Therapien oder innovativen Wellness-Konzepten",
];

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
    return () => h("div", { class: "funnel__frage" }, [
      h("h2", { class: "funnel__question" }, props.frage.frage),
      props.frage.hinweis ? h("p", { class: "funnel__hint" }, props.frage.hinweis) : null,
      h("div", { class: "funnel__options" }, props.frage.optionen.map((o) => {
        const aktiv = props.frage.mehrfach
          ? auswahl.value.includes(o)
          : props.antworten[props.frage.id] === o;
        return h("button", {
          type: "button",
          class: ["funnel__option", { "funnel__option--active": aktiv }],
          "aria-pressed": aktiv,
          onClick: () => klick(o),
        }, o);
      })),
      props.frage.mehrfach
        ? h("button", {
            type: "button",
            class: "funnel__weiter",
            disabled: !auswahl.value.length,
            onClick: fertig,
          }, "Weiter")
        : null,
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
  nachOben();
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

<style scoped>
.funnel {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-400) var(--container-pad) var(--space-800);
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
}

.funnel__hero {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  text-align: center;
  align-items: center;
}

.funnel__eyebrow {
  margin: 0;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.funnel__headline {
  margin: 0;
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  font-weight: var(--font-bold);
}

.funnel__lead {
  margin: 0;
}

.funnel__h2 {
  margin: 0 0 var(--space-300);
  font-size: var(--font-xl);
  line-height: var(--line-xl);
  font-weight: var(--font-bold);
}

.funnel__block p {
  margin: 0 0 var(--space-300);
}

.funnel__block--cta {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.funnel__grid {
  list-style: none;
  margin: var(--space-300) 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-300);
}

.funnel__grid li,
.funnel__steps li {
  display: flex;
  flex-direction: column;
  gap: var(--space-100, 4px);
  padding: var(--space-400);
  border-radius: var(--border-radius-card);
  background: var(--card-color-bg);
  box-shadow: var(--shadow-1);
}

.funnel__steps {
  margin: var(--space-300) 0 0;
  padding-left: 1.4em;
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.funnel__liste {
  margin: 0 0 var(--space-400);
  padding-left: 1.2em;
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
}

.funnel__signatur {
  font-style: italic;
  color: var(--color-text-light);
}

.funnel__hint {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--color-text-light);
}

.funnel__zaehler {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--color-text-light);
}

.funnel__card {
  background: var(--card-color-bg);
  border-radius: var(--border-radius-card);
  box-shadow: var(--shadow-1);
  padding: var(--space-card-pad);
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}

.funnel__card :deep(.funnel__frage) {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.funnel__question,
.funnel__card :deep(.funnel__question) {
  margin: 0;
  font-size: var(--font-xl);
  line-height: var(--line-xl);
  font-weight: var(--font-bold);
}

.funnel__card :deep(.funnel__options) {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.funnel__card :deep(.funnel__option) {
  font: inherit;
  text-align: left;
  padding: var(--space-400);
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--border-radius-card);
  background: var(--color-bg, #fff);
  color: var(--color-text);
  cursor: pointer;
}

.funnel__card :deep(.funnel__option:hover),
.funnel__card :deep(.funnel__option--active) {
  border-color: var(--color-primary, currentColor);
  box-shadow: inset 0 0 0 1px var(--color-primary, currentColor);
}

.funnel__card :deep(.funnel__weiter) {
  font: inherit;
  font-weight: var(--font-bold);
  padding: var(--space-300) var(--space-500);
  border: 0;
  border-radius: var(--border-radius-card);
  background: var(--color-primary, #111);
  color: var(--color-on-primary, #fff);
  cursor: pointer;
  align-self: flex-start;
}

.funnel__card :deep(.funnel__weiter:disabled) {
  opacity: 0.4;
  cursor: default;
}

.funnel__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.funnel__form p {
  margin: 0;
}

.funnel__form :deep(.p-inputtext) {
  width: 100%;
}

.funnel__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-300);
}

.funnel__consent {
  display: flex;
  align-items: flex-start;
  gap: var(--space-300);
  font-size: var(--font-xs);
  line-height: var(--line-xs);
}

.funnel__consent a {
  text-decoration: underline;
}

.funnel__back {
  align-self: flex-start;
  font: inherit;
  font-size: var(--font-sm);
  background: none;
  border: 0;
  padding: 0;
  color: var(--color-text-light);
  text-decoration: underline;
  cursor: pointer;
}

.funnel__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.funnel__message {
  margin: 0;
}
</style>
