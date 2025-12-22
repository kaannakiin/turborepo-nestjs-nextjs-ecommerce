import {
  WithContext,
  CollectionPage,
  ListItem,
  BreadcrumbList,
  Offer,
  AggregateOffer,
  Product as SchemaProduct,
  ImageObject,
} from "schema-dts";
import { Currency, Locale } from "@repo/database";
import {
  CategoryPageReturnType,
  CategoryTreeData,
  UiProductType,
} from "@repo/types";

/**
 * Bu fonksiyon Category Page verisini alır ve Google uyumlu JSON-LD döndürür.
 * * @param data - Senin hazırladığın CategoryPageReturnType verisi
 * @param baseUrl - Sitenin kök adresi (örn: https://mysite.com)
 * @param currency - Aktif para birimi (Fiyat hesaplaması için)
 * @param locale - Aktif dil
 */
export const generateCategoryJsonLd = (
  data: CategoryPageReturnType,
  baseUrl: string,
  currency: Currency,
  locale: Locale
): WithContext<CollectionPage> => {
  const { category, products } = data;

  const breadcrumbList = buildBreadcrumbList(category, baseUrl, locale);

  const productListItems: ListItem[] = products.map((product, index) => {
    return {
      "@type": "ListItem",
      position: index + 1,
      item: mapProductToSchema(product, baseUrl, currency, locale),
    };
  });

  const schema: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.metaTitle || category.categoryName,
    description: category.metaDescription || category.description,
    url: `${baseUrl}/${locale === "TR" ? "" : locale + "/"}${category.categorySlug}`,
    breadcrumb: breadcrumbList,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: productListItems,
      numberOfItems: data.pagination.totalCount,
    },
  };

  return schema;
};

/**
 * Tekil bir ürünü Schema Product objesine çevirir.
 */
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

    category: product.taxonomyCategoryId || undefined,
    offers: offers,
  };
};

/**
 * Kategori ağacını yukarı doğru tarayarak Breadcrumb oluşturur.
 */
const buildBreadcrumbList = (
  category: CategoryTreeData,
  baseUrl: string,
  locale: Locale
): BreadcrumbList => {
  const itemListElement: ListItem[] = [];
  let current: CategoryTreeData | undefined = category;
  const path: CategoryTreeData[] = [];

  while (current) {
    path.unshift(current);
    current = current.parentCategory;
  }

  itemListElement.push({
    "@type": "ListItem",
    position: 1,
    name: "Home",
    item: baseUrl,
  });

  path.forEach((cat, index) => {
    itemListElement.push({
      "@type": "ListItem",
      position: index + 2,
      name: cat.categoryName,
      item: `${baseUrl}/${locale === "TR" ? "" : locale + "/"}${cat.categorySlug}`,
    });
  });

  return {
    "@type": "BreadcrumbList",
    itemListElement,
  };
};
