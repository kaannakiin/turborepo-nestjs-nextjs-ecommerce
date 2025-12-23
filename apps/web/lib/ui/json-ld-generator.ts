import { Currency, Locale } from "@repo/database";
import {
  InfinityScrollPageReturnType,
  TreeNode,
  UiProductType,
} from "@repo/types";
import {
  AggregateOffer,
  BreadcrumbList,
  CollectionPage,
  ListItem,
  Offer,
  Product as SchemaProduct,
  WithContext,
} from "schema-dts";

export type PageType = "category" | "brand" | "tag";

interface JsonLdGeneratorOptions {
  data: InfinityScrollPageReturnType;
  baseUrl: string;
  currency: Currency;
  locale: Locale;
  pageType: PageType;
}

export const generatePageJsonLd = ({
  data,
  baseUrl,
  currency,
  locale,
  pageType,
}: JsonLdGeneratorOptions): WithContext<CollectionPage> => {
  const { treeNode, products, pagination } = data;

  const breadcrumbList = buildBreadcrumbList(
    treeNode,
    baseUrl,
    locale,
    pageType
  );

  const productListItems: ListItem[] = products.map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: mapProductToSchema(product, baseUrl, currency, locale),
  }));

  const pageUrl = buildPageUrl(treeNode, baseUrl, locale, pageType);

  const schema: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: treeNode.metaTitle || treeNode.name,
    description: treeNode.metaDescription || treeNode.description,
    url: pageUrl,
    breadcrumb: breadcrumbList,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: productListItems,
      numberOfItems: pagination.totalCount,
    },
  };

  return schema;
};

const buildPageUrl = (
  node: TreeNode,
  baseUrl: string,
  locale: Locale,
  pageType: PageType
): string => {
  const localePrefix = locale === "TR" ? "" : `${locale.toLowerCase()}/`;
  const typePrefix = getTypePrefix(pageType);

  return `${baseUrl}/${localePrefix}${typePrefix}${node.slug}`;
};

const getTypePrefix = (pageType: PageType): string => {
  switch (pageType) {
    case "category":
      return "categories/";
    case "brand":
      return "brands/";
    case "tag":
      return "tags/";
    default:
      return "";
  }
};

const buildBreadcrumbList = (
  node: TreeNode,
  baseUrl: string,
  locale: Locale,
  pageType: PageType
): BreadcrumbList => {
  const itemListElement: ListItem[] = [];
  const path: TreeNode[] = [];

  let current: TreeNode | undefined = node;
  while (current) {
    path.unshift(current);
    current = current.parent;
  }

  itemListElement.push({
    "@type": "ListItem",
    position: 1,
    name: "Home",
    item: baseUrl,
  });

  const typeLabel = getTypeLabel(pageType, locale);
  if (typeLabel) {
    itemListElement.push({
      "@type": "ListItem",
      position: 2,
      name: typeLabel,
      item: `${baseUrl}/${locale === "TR" ? "" : `${locale.toLowerCase()}/`}${getTypePrefix(pageType)}`,
    });
  }

  const startPosition = typeLabel ? 3 : 2;
  path.forEach((item, index) => {
    itemListElement.push({
      "@type": "ListItem",
      position: startPosition + index,
      name: item.name,
      item: buildPageUrl(item, baseUrl, locale, pageType),
    });
  });

  return {
    "@type": "BreadcrumbList",
    itemListElement,
  };
};

const getTypeLabel = (pageType: PageType, locale: Locale): string | null => {
  const labels: Record<PageType, Record<Locale, string | null>> = {
    category: { TR: null, EN: null, DE: null },
    brand: { TR: "Markalar", EN: "Brands", DE: "Marken" },
    tag: { TR: "Etiketler", EN: "Tags", DE: "Tags" },
  };

  return labels[pageType]?.[locale] ?? null;
};

const mapProductToSchema = (
  product: UiProductType,
  baseUrl: string,
  currency: Currency,
  locale: Locale
): SchemaProduct => {
  const translation = product.translations.find((t) => t.locale === locale);
  const mainImage = product.assets.find((a) => a.order === 0)?.asset?.url;

  const prices = product.variants
    .filter((v) => v.active && v.stock > 0)
    .flatMap((v) => v.prices)
    .filter((p) => p.currency === currency)
    .map((p) => p.discountedPrice || p.price);

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const brandName =
    product.brand?.translations.find((t) => t.locale === locale)?.name ||
    "Brand";

  let offers: Offer | AggregateOffer;

  if (minPrice !== maxPrice && prices.length > 1) {
    offers = {
      "@type": "AggregateOffer",
      lowPrice: minPrice,
      highPrice: maxPrice,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      offerCount: prices.length,
    };
  } else {
    offers = {
      "@type": "Offer",
      price: minPrice,
      priceCurrency: currency,
      availability:
        prices.length > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: `${baseUrl}/p/${translation?.slug || product.id}`,
    };
  }

  return {
    "@type": "Product",
    name: translation?.name || "Product",
    description: translation?.description || undefined,
    image: mainImage ? [mainImage] : undefined,
    sku: product.variants[0]?.sku || product.id,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers,
  };
};

export const generateCategoryJsonLd = (
  data: InfinityScrollPageReturnType,
  baseUrl: string,
  currency: Currency,
  locale: Locale
) =>
  generatePageJsonLd({ data, baseUrl, currency, locale, pageType: "category" });

export const generateBrandJsonLd = (
  data: InfinityScrollPageReturnType,
  baseUrl: string,
  currency: Currency,
  locale: Locale
) => generatePageJsonLd({ data, baseUrl, currency, locale, pageType: "brand" });

export const generateTagJsonLd = (
  data: InfinityScrollPageReturnType,
  baseUrl: string,
  currency: Currency,
  locale: Locale
) => generatePageJsonLd({ data, baseUrl, currency, locale, pageType: "tag" });
