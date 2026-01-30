import type { ProductDto, TreatmentPageDto } from "../dto/collections";
import { CardElevation, ColorTheme } from "../dto/enums";

export function mapProductPageBlocks(
  product: ProductDto,
  relatedTreatmentTeasers: TreatmentPageDto[] = [],
) {
  const { t } = useI18n();

  const blocks = {
    productHero: buildProductHeroModel(),
    textContent: buildTextContentModel(),
    treatmentTeasers: buildTreatmentTeasersModel(),
  };

  function buildProductHeroModel() {
    return {
      manufacturerName: product.manufacturer?.name ?? "",
      productName: product.name,
      variants: product.variants ?? [],
      images: product.images ?? [],
      cardSettings: {
        elevation: CardElevation.LARGE,
      },
    };
  }

  function buildTextContentModel() {
    return {
      headline: t("productPage.productDescription"),
      content: product.description,
      cardSettings: {
        colorTheme: ColorTheme.SOFT,
      },
    };
  }

  function buildTreatmentTeasersModel() {
    if (!relatedTreatmentTeasers || relatedTreatmentTeasers.length === 0) {
      return undefined;
    }

    const headline = `${t("blocks.productHero.treatmentsWith")} ${
      product.manufacturer?.name
    } ${product.name}`;

    return {
      headline: headline,
      treatmentPages: relatedTreatmentTeasers,
      showShortDescriptions: true,
      showPrices: true,
      showDescriptions: true,
      cardSettings: {
        colorTheme: ColorTheme.STRONG,
      },
    };
  }

  return blocks;
}
