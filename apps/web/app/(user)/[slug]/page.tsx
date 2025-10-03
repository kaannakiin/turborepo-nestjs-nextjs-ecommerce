import { Stack } from "@mantine/core";
import { QueryClient } from "@repo/shared";
import { $Enums, ProductPageDataType } from "@repo/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { BreadcrumbList, Product, WithContext } from "schema-dts";
import { Params, SearchParams } from "../../../types/GlobalTypes";
import ProductsCarousels from "../components/ProductsCarousels";
import ProductAssetViewer from "./components/ProductAssetViewer";
import ProductRightSection from "./components/ProductRightSection";

const queryClient = new QueryClient();

const findSelectedVariant = cache(
  (
    product: ProductPageDataType,
    searchParams: Record<string, string | undefined>,
    locale: $Enums.Locale = "TR"
  ) => {
    if (!product.isVariant || !product.variantCombinations.length) {
      return null;
    }

    const combinations = product.variantCombinations;

    if (Object.keys(searchParams).length === 0) {
      return combinations[0] || null;
    }

    // Her kombinasyonu kontrol et
    for (const combination of combinations) {
      let isMatch = true;

      // Bu kombinasyonun tüm variant group'larını kontrol et
      for (const option of combination.options) {
        const variantGroup =
          option.productVariantOption.variantOption.variantGroup;
        const variantOption = option.productVariantOption.variantOption;

        // Variant group'un translation'ını bul
        const groupTranslation = variantGroup.translations.find(
          (t) => t.locale === locale
        );

        // Variant option'ın translation'ını bul
        const optionTranslation = variantOption.translations.find(
          (t) => t.locale === locale
        );

        if (!groupTranslation || !optionTranslation) continue;

        // Search params'ta bu variant group için bir değer var mı?
        const searchValue =
          searchParams[groupTranslation.slug] ||
          searchParams[groupTranslation.name.toLowerCase()];

        if (searchValue) {
          // Search value ile option translation'ı eşleşiyor mu?
          const isOptionMatch =
            optionTranslation.slug === searchValue ||
            optionTranslation.name.toLowerCase() === searchValue.toLowerCase();

          if (!isOptionMatch) {
            isMatch = false;
            break;
          }
        }
      }

      if (isMatch) {
        return combination;
      }
    }

    // Hiçbir kombinasyon eşleşmezse, ilk kombinasyonu döndür
    return combinations[0] || null;
  }
);

const dataQuery = cache(
  async (
    slug: string,
    allPageSearchParams: Record<string, string | undefined>
  ) => {
    const data: ProductPageDataType = await queryClient.fetchQuery({
      queryKey: ["get-product", slug, Object.values(allPageSearchParams)],
      queryFn: async () => {
        const productRes = await fetch(
          `${process.env.BACKEND_URL}/users/products/get-product/${slug}?${new URLSearchParams(
            allPageSearchParams as Record<string, string>
          ).toString()}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Cache-Control": "max-age=300",
            },
          }
        );
        if (!productRes.ok) {
          return null;
        }
        const data = (await productRes.json()) as ProductPageDataType;

        if (!data) {
          return null;
        }

        return data;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
    return data;
  }
);

const getOpenGraphImageUrl = (originalUrl: string): string => {
  return originalUrl.replace(/\.webp$/, "-og.jpg");
};

type SelectedVariant = NonNullable<ReturnType<typeof findSelectedVariant>>;
type ProductTranslation = ProductPageDataType["translations"][0];
type VariantTranslation = SelectedVariant["translations"][0];
type ProductMedia = { url: string; type: $Enums.AssetType }[];
type SelectedVariantPrice = SelectedVariant["prices"][0];

// JSON-LD schema oluşturan helper function
const generateProductJsonLd = (
  data: ProductPageDataType,
  selectedVariant: SelectedVariant | null,
  selectedVariantPrice: SelectedVariantPrice | undefined,
  productTranslation: ProductTranslation,
  selectedVariantTranslation: VariantTranslation | undefined,
  productMedia: ProductMedia,
  slug: string,
  allPageSearchParams: Record<string, string | undefined>
): WithContext<Product> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const productUrl = `${baseUrl}/products/${slug}${
    Object.keys(allPageSearchParams).length > 0
      ? `?${new URLSearchParams(allPageSearchParams as Record<string, string>).toString()}`
      : ""
  }`;

  // Brand bilgisini type-safe olarak al
  const brandTranslation =
    data.brand?.translations?.find((tr) => tr.locale === "TR") ||
    data.brand?.translations?.[0];
  const brandName = brandTranslation?.name || "Unknown Brand";

  // Kategori bilgisini type-safe olarak al
  const categoryTranslation =
    data.categories?.[0]?.category?.translations?.find(
      (t) => t.locale === "TR"
    ) || data.categories?.[0]?.category?.translations?.[0];
  const categoryName = categoryTranslation?.name || "Genel";

  // Ürün görsellerini hazırla
  const images = productMedia
    .filter((media) => media.type === $Enums.AssetType.IMAGE)
    .map((media) => media.url);

  // Ürün özelliklerini variant'tan al
  const additionalProperties =
    selectedVariant?.options
      ?.map((option) => {
        const variantOption = option.productVariantOption.variantOption;
        const groupTranslation =
          variantOption.variantGroup.translations.find(
            (t) => t.locale === "TR"
          ) || variantOption.variantGroup.translations[0];
        const optionTranslation =
          variantOption.translations.find((t) => t.locale === "TR") ||
          variantOption.translations[0];

        return {
          "@type": "PropertyValue" as const,
          name: groupTranslation?.name || "",
          value: optionTranslation?.name || "",
        };
      })
      .filter((prop) => prop.name && prop.value) || [];

  // Ana product translation kontrolü
  const productName =
    selectedVariantTranslation?.description || productTranslation.name;
  const productDescription =
    selectedVariantTranslation?.description ||
    productTranslation.description ||
    productTranslation.name;

  const jsonLd: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description: productDescription,
    image: images,
    url: productUrl,
    sku: selectedVariant?.sku || data.sku || data.id,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    category: categoryName,
    ...(additionalProperties.length > 0 && {
      additionalProperty: additionalProperties,
    }),
    // Taxonomy category bilgisi varsa ekle
    ...(data.taxonomyCategory && {
      productID: data.taxonomyCategory.googleId,
    }),
    productID: data.id,
  };

  return jsonLd;
};

const generateBreadcrumbJsonLd = (
  data: ProductPageDataType,
  productTranslation: ProductTranslation,
  slug: string
): WithContext<BreadcrumbList> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  const breadcrumbItems = [
    {
      "@type": "ListItem" as const,
      position: 1,
      name: "Ana Sayfa",
      item: baseUrl,
    },
  ];

  // Kategori varsa ekle
  const mainCategory = data.categories?.[0]?.category;
  if (mainCategory) {
    const categoryTranslation =
      mainCategory.translations?.find((t) => t.locale === "TR") ||
      mainCategory.translations?.[0];
    if (categoryTranslation) {
      breadcrumbItems.push({
        "@type": "ListItem",
        position: breadcrumbItems.length + 1,
        name: categoryTranslation.name,
        item: `${baseUrl}/categories/${categoryTranslation.slug}`,
      });
    }
  }

  breadcrumbItems.push({
    "@type": "ListItem",
    position: breadcrumbItems.length + 1,
    name: productTranslation.name,
    item: `${baseUrl}/${slug}`,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };
};

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const pageSearchParams = await searchParams;

  if (!slug) {
    return notFound();
  }

  const allPageSearchParams = Object.fromEntries(
    Object.entries(pageSearchParams).map(([key, value]) => [
      key,
      (value as string) ?? undefined,
    ])
  );

  const data = await dataQuery(slug, allPageSearchParams);

  if (!data) {
    return notFound();
  }

  const selectedVariant = findSelectedVariant(data, allPageSearchParams);
  const productMedia: ProductMedia = [
    ...(selectedVariant?.assets?.map((asset) => ({
      url: asset.asset.url,
      type: asset.asset.type,
    })) || []),
    ...(data.assets?.map((asset) => ({
      url: asset.asset.url,
      type: asset.asset.type,
    })) || []),
  ];
  const currency: $Enums.Currency = "TRY";
  const locale: $Enums.Locale = "TR";

  const selectedVariantPrice =
    selectedVariant?.prices.find((price) => price.currency === currency) ||
    selectedVariant?.prices[0];

  const selectedVariantTranslation =
    selectedVariant?.translations.find((tr) => tr.locale === locale) ||
    selectedVariant?.translations[0];

  const productTranslation =
    data.translations.find((tr) => tr.locale === locale) ||
    data.translations[0];

  if (!productTranslation) {
    return notFound();
  }

  // OpenGraph image'ı için ilk resmi al ve formatını düzenle
  const ogImageUrl = productMedia[0]?.url
    ? getOpenGraphImageUrl(productMedia[0].url)
    : undefined;

  // JSON-LD Schema'larını oluştur
  const productJsonLd = generateProductJsonLd(
    data,
    selectedVariant,
    selectedVariantPrice,
    productTranslation,
    selectedVariantTranslation,
    productMedia,
    slug,
    allPageSearchParams
  );

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    data,
    productTranslation,
    slug
  );

  return {
    title:
      selectedVariantTranslation?.metaTitle ||
      productTranslation.metaTitle ||
      productTranslation.name,
    description:
      selectedVariantTranslation?.metaDescription ||
      productTranslation.metaDescription ||
      productTranslation.name,
    openGraph: {
      type: "website",
      title:
        selectedVariantTranslation?.metaTitle ||
        productTranslation.metaTitle ||
        productTranslation.name,
      description:
        selectedVariantTranslation?.metaDescription ||
        productTranslation.metaDescription ||
        productTranslation.name,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}${
        Object.keys(allPageSearchParams).length > 0
          ? `?${new URLSearchParams(allPageSearchParams as Record<string, string>).toString()}`
          : ""
      }`,
      siteName: "Your Site Name",
      locale: locale === "TR" ? "tr_TR" : "en_US",
      ...(ogImageUrl && {
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: productTranslation.name,
            type: "image/jpeg",
          },
          ...productMedia.slice(1, 4).map((media) => ({
            url: getOpenGraphImageUrl(media.url),
            width: 1200,
            height: 630,
            alt: productTranslation.name,
            type: "image/jpeg",
          })),
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      site: "@yourhandle",
      creator: "@yourhandle",
      title:
        selectedVariantTranslation?.metaTitle ||
        productTranslation.metaTitle ||
        productTranslation.name,
      description:
        selectedVariantTranslation?.metaDescription ||
        productTranslation.metaDescription ||
        productTranslation.name,
      ...(ogImageUrl && {
        images: [ogImageUrl],
      }),
    },
    // JSON-LD Schema'larını ekle
    other: {
      "application/ld+json": JSON.stringify([productJsonLd, breadcrumbJsonLd]),
    },
  };
}

const UserProductPage = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const { slug } = await params;
  const pageSearchParams = await searchParams;

  if (!slug) {
    return notFound();
  }

  const allPageSearchParams = Object.fromEntries(
    Object.entries(pageSearchParams).map(([key, value]) => [
      key,
      (value as string) ?? undefined,
    ])
  );

  const data: ProductPageDataType = await queryClient.fetchQuery({
    queryKey: ["get-product", slug, Object.values(allPageSearchParams)],
    queryFn: async () => {
      const productRes = await fetch(
        `${process.env.BACKEND_URL}/users/products/get-product/${slug}?${new URLSearchParams(
          allPageSearchParams as Record<string, string>
        ).toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Cache-Control": "max-age=300",
          },
        }
      );
      if (!productRes.ok) {
        return null;
      }
      const data = (await productRes.json()) as ProductPageDataType;

      if (!data) {
        return null;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  if (!data || (!data.isVariant && !data.variantCombinations.length)) {
    return notFound();
  }

  const selectedVariant = findSelectedVariant(data, allPageSearchParams);
  const productMedia: ProductMedia = [
    ...(selectedVariant?.assets?.map((asset) => ({
      url: asset.asset.url,
      type: asset.asset.type,
    })) || []),
    ...(data.assets?.map((asset) => ({
      url: asset.asset.url,
      type: asset.asset.type,
    })) || []),
  ];
  const currency: $Enums.Currency = "TRY";
  const locale: $Enums.Locale = "TR";

  const selectedVariantPrice =
    selectedVariant?.prices.find((price) => price.currency === currency) ||
    selectedVariant?.prices[0];

  const selectedVariantTranslation =
    selectedVariant?.translations.find((tr) => tr.locale === locale) ||
    selectedVariant?.translations[0];

  const productTranslation =
    data.translations.find((tr) => tr.locale === locale) ||
    data.translations[0];

  return (
    <>
      <Stack
        gap={"lg"}
        className="w-full min-h-full max-w-[1250px] lg:mx-auto flex my-4"
      >
        <div className="min-w-full min-h-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="w-full lg:col-span-7 lg:px-4">
            <ProductAssetViewer assets={productMedia} />
          </div>
          <div className="w-full lg:col-span-5 px-4">
            <div className="lg:sticky lg:top-8">
              <ProductRightSection
                groups={data.variantGroups}
                productId={data.id}
                selectedVariant={selectedVariant}
                selectedVariantPrice={selectedVariantPrice}
                productTranslation={productTranslation}
                selectedVariantTranslation={selectedVariantTranslation}
              />
            </div>
          </div>
        </div>
      </Stack>
      <ProductsCarousels
        title="Benzer Ürünler"
        stackClassName="px-4"
        productId={data.id}
      />
    </>
  );
};

export default UserProductPage;
