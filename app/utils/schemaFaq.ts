import { strapiRichTextToPlainText } from "~/utils/schemaShared";
import type { StrapiRichText } from "~/lib/strapi/dto/types";

type FaqItem = {
  question: string;
  answer: StrapiRichText;
};

/**
 * Schema.org FAQPage — aktiviert FAQ Rich Results in Google.
 * Seite nimmt damit deutlich mehr Platz in den Suchergebnissen ein → höhere CTR.
 */
export function buildFaqPageSchema(
  faqs: FaqItem[],
): Record<string, unknown> | null {
  if (!faqs || faqs.length === 0) return null;

  const mainEntity = faqs
    .map((faq) => {
      const answerText = strapiRichTextToPlainText(faq.answer);
      if (!faq.question || !answerText) return null;

      return {
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answerText,
        },
      };
    })
    .filter(Boolean);

  if (mainEntity.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}
