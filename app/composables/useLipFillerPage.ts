import type { SharedSeoDto } from "~/lib/strapi/dto/components";

export function useLipFillerPage() {
  const { t } = useI18n();
  
  // Fixed blocks data (hardcoded LP content)
  const fixedBlocks = ref({
    hero: {
      headline: "Lippenaufpolsterung – Natürliche volle Lippen",
      subline: "Board-zertifizierte Ärzte • Transparente Preise • 30-Tage Garantie",
      text: "Echte Patienten-Ergebnisse. Keine künstliche Optik. Ab €299.",
      trustBadges: ["1000+ zufriedene Patienten", "30-Tage Zufriedenheitsgarantie"],
      ctaText: "Kostenlose Beratung buchen",
      ctaLink: "#booking"
    },
    beforeAfter: {
      headline: "Echte Ergebnisse von echten Patienten",
      description: "Natürliche Volumensteigerung in 15-30 Minuten"
    },
    benefits: {
      headline: "Warum professionelle Lippenaufpolsterung?",
      items: [
        {
          icon: "💋",
          title: "Volle, definierte Lippen",
          description: "Natürliche Volumensteigerung für mehr Ausstrahlung"
        },
        {
          icon: "⚡",
          title: "Schnell & unkompliziert",
          description: "Nur 15-30 Minuten. Walk-in, walk-out. Sofort einsatzfähig."
        },
        {
          icon: "🎯",
          title: "Natürliche Ergebnisse",
          description: "Kein Fake-Look. Wir stärken deine Lippen genau richtig."
        },
        {
          icon: "🛡️",
          title: "Sicher & reversibel",
          description: "Hyaluronsäure. Körperverträglich. Kann aufgelöst werden."
        },
        {
          icon: "💰",
          title: "Flexible Finanzierung",
          description: "Zahlungsplan ab €49/Monat. Keine versteckten Kosten."
        },
        {
          icon: "📞",
          title: "Virtual Consultation",
          description: "Online-Beratung mit Arzt. Kostenlos. Unverbindlich."
        }
      ]
    },
    pricing: {
      headline: "Klare Preise – Keine Überraschungen",
      items: [
        {
          name: "Subtle Hydration",
          amount: "€299",
          volume: "0.5 mL",
          description: "Perfekt für erste Mal",
          features: ["Hauch von Volumen", "Natürlicher Look", "Hält 3-4 Monate"]
        },
        {
          name: "Full Volume",
          amount: "€499",
          volume: "1 mL",
          description: "Perfektes Gleichgewicht (TOP SELLER)",
          features: ["Sichtbares Volumen", "Ausgewogene Form", "Hält 3-4 Monate"],
          featured: true
        },
        {
          name: "Ultimate Fuller",
          amount: "€699",
          volume: "1.5 mL",
          description: "Maximum Confidence",
          features: ["Dramatisches Volumen", "Luxe Lippen-Look", "Hält 4-6 Monate"]
        }
      ]
    },
    testimonials: {
      headline: "Was unsere Patienten sagen",
      items: [
        {
          name: "Claire S.",
          age: 32,
          rating: 5,
          text: "Meine Lippen sehen natürlich aus – nicht gemacht. Ich traue mich wieder zu lachen!"
        },
        {
          name: "Regina M.",
          age: 48,
          rating: 5,
          text: "Nach meiner Scheidung wollte ich mich wieder jung fühlen. Das ist nicht dramatisch, aber ich FÜHLE den Unterschied."
        },
        {
          name: "Bella L.",
          age: 26,
          rating: 5,
          text: "Definitionen sind alles! Meine Lippen sind jetzt ein echtes Statement."
        },
        {
          name: "Teresa K.",
          age: 52,
          rating: 5,
          text: "Ich war skeptisch, aber die Beratung war sehr wissenschaftlich. Ich fühle mich jetzt authentischer."
        }
      ]
    },
    faq: {
      headline: "Häufig gestellte Fragen",
      items: [
        {
          question: "Wird es schmerzhaft sein?",
          answer: "Nein. Wir verwenden topisches Anästhetikum + feine Kanüle. Nur leichtes Druckgefühl."
        },
        {
          question: "Wie lange halten die Ergebnisse?",
          answer: "Typischerweise 3-4 Monate. Bei regelmäßiger Wartung erhalten viele Patienten langfristige Ergebnisse."
        },
        {
          question: "Blutergüsse oder Schwellungen?",
          answer: "Minimal. Mit Kanülen-Technik reduzieren wir Blutergüsse um ~80%. Kleine Schwellungen für 24-48h sind normal."
        },
        {
          question: "Was, wenn ich es nicht mag?",
          answer: "Das ist reversibel. Hyaluronsäure kann mit Enzym aufgelöst werden. Kostenlose Anpassungen für 30 Tage."
        },
        {
          question: "Können das Anfänger machen?",
          answer: "Absolut. Wir empfehlen oft mit 0.5mL anzufangen und nach 2 Wochen zu schauen."
        },
        {
          question: "Ist Virtual Consultation wirklich kostenlos?",
          answer: "Ja, 100% kostenlos. Der Arzt analysiert deine Lippen online, bespricht Optionen und beantwortet Fragen."
        }
      ]
    },
    guarantee: {
      headline: "30-Tage Zufriedenheitsgarantie",
      icon: "🛡️",
      description: "Du bist nicht 100% begeistert? Kostenlose Überarbeitung oder Geld zurück.",
      items: [
        "✓ Kostenlose Folge-Termine (bis du zufrieden bist)",
        "✓ Filler kann ohne Kosten aufgelöst werden",
        "✓ 24/7 Support für alle Fragen",
        "✓ Transparent: Was du zahlst, ist was du bekommst"
      ]
    },
    booking: {
      headline: "Bereit für volle Lippen?",
      subheadline: "Kostenlose Beratung buchen",
      note: "Limitierte Verfügbarkeit: Nur 3 Plätze pro Monat"
    }
  });

  const breadcrumbItems = ref([
    { label: "Home", to: "/" },
    { label: "Behandlungen", to: "/behandlungen" },
    { label: "Lippenaufpolsterung", to: null }
  ]);

  const seo = ref<SharedSeoDto>({
    metaTitle: "Lippenaufpolsterung | Natürliche Ergebnisse | My Health & Beauty",
    metaDescription: "Professionelle Lippenaufpolsterung mit natürlichen Ergebnissen. Board-zertifizierte Ärzte, transparente Preise, 30-Tage Garantie.",
    keywords: "Lippenaufpolsterung, Lip Filler, Lippen vergrößern, Hyaluronsäure"
  });

  return {
    fixedBlocks,
    breadcrumbItems,
    seo
  };
}
