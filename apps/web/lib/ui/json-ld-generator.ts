import { Currency, Locale } from "@repo/database/client";
import {
  BaseNode,
  BrandProductsResponse,
  CategoryProductsResponse,
  TagProductsResponse,
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
  node: BaseNode & { parent?: BaseNode };
  products: UiProductType[];
  pagination: { totalCount: number };
  baseUrl: string;
  currency: Currency;
  locale: Locale;
  pageType: PageType;
}

export const generatePageJsonLd = ({
  node,
  products,
  pagination,
  baseUrl,
  currency,
  locale,
  pageType,
}: JsonLdGeneratorOptions): WithContext<CollectionPage> => {
  const breadcrumbList = buildBreadcrumbList(node, baseUrl, locale, pageType);

  const productListItems: ListItem[] = products.map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: mapProductToSchema(product, baseUrl, currency, locale),
  }));

  const pageUrl = buildPageUrl(node.slug, baseUrl, locale, pageType);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: node.metaTitle || node.name,
    description: node.metaDescription || node.description,
    url: pageUrl,
    breadcrumb: breadcrumbList,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: productListItems,
      numberOfItems: pagination.totalCount,
    },
  };
};

export const generateCategoryJsonLd = (
  data: CategoryProductsResponse,
  baseUrl: string,
  currency: Currency,
  locale: Locale
) =>
  generatePageJsonLd({
    node: data.treeNode,
    products: data.products,
    pagination: data.pagination,
    baseUrl,
    currency,
    locale,
    pageType: "category",
  });

export const generateBrandJsonLd = (
  data: BrandProductsResponse,
  baseUrl: string,
  currency: Currency,
  locale: Locale
) =>
  generatePageJsonLd({
    node: data.brand,
    products: data.products,
    pagination: data.pagination,
    baseUrl,
    currency,
    locale,
    pageType: "brand",
  });

export const generateTagJsonLd = (
  data: TagProductsResponse,
  baseUrl: string,
  currency: Currency,
  locale: Locale
) =>
  generatePageJsonLd({
    node: data.tag,
    products: data.products,
    pagination: data.pagination,
    baseUrl,
    currency,
    locale,
    pageType: "tag",
  });

const buildPageUrl = (
  slug: string,
  baseUrl: string,
  locale: Locale,
  pageType: PageType
): string => {
  const localePrefix = locale === "TR" ? "" : `${locale.toLowerCase()}/`;
  const typePrefix = getTypePrefix(pageType);

  return `${baseUrl}/${localePrefix}${typePrefix}${slug}`;
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
  node: BaseNode & { parent?: BaseNode },
  baseUrl: string,
  locale: Locale,
  pageType: PageType
): BreadcrumbList => {
  const itemListElement: ListItem[] = [];

  const path: BaseNode[] = [];
  let current: (BaseNode & { parent?: BaseNode }) | undefined = node;
  while (current) {
    path.unshift(current);
    current = current.parent as (BaseNode & { parent?: BaseNode }) | undefined;
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
      item: `${baseUrl}/${locale === "TR" ? "" : `${locale.toLowerCase()}/`}${getTypePrefix(pageType).slice(0, -1)}`,
    });
  }

  const startPosition = typeLabel ? 3 : 2;
  path.forEach((item, index) => {
    itemListElement.push({
      "@type": "ListItem",
      position: startPosition + index,
      name: item.name,
      item: buildPageUrl(item.slug, baseUrl, locale, pageType),
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
