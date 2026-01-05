import InfinityQueryPage from "@/components/pages/store-components/InfinityQueryPage";
import StoreNotFound from "@/components/pages/store-components/StoreNotFound";
import { getQueryClient } from "@lib/serverQueryClient";
import { generateBrandJsonLd } from "@lib/ui/json-ld-generator";
import {
  getOgImageUrl,
  getServerSideAllSearchParams,
} from "@lib/ui/product-helper";
import { ApiError, createServerFetch } from "@lib/wrappers/fetchWrapper";
import { Currency, Locale } from "@repo/database/client";
import { dehydrate, HydrationBoundary } from "@repo/shared";
import { BrandProductsResponse, FiltersResponse } from "@repo/types";
import { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { cache } from "react";
import { Params, SearchParams } from "types/GlobalTypes";

interface Props {
  params: Params;
  searchParams: SearchParams;
}

const getBrandData = cache(
  async (
    slug: string,
    page: number,
    queryString: string,
    currency: Currency,
    locale: Locale
  ) => {
    const cookieStore = await cookies();
    const api = createServerFetch().setCookies(cookieStore);

    const productsUrl = queryString
      ? `/brands/${slug}?${queryString}&page=${page}`
      : `/brands/${slug}?page=${page}`;

    const filtersUrl = queryString
      ? `/brands/${slug}/filters?${queryString}`
      : `/brands/${slug}/filters`;

    const [productsRes, filtersRes] = await Promise.all([
      api.get<BrandProductsResponse>(productsUrl),
      api.get<FiltersResponse>(filtersUrl),
    ]);

    if (!productsRes.success) {
      return {
        error: (productsRes as ApiError).error || "Marka bulunamadı",
        products: null,
        filters: null,
      };
    }

    if (!filtersRes.success) {
      return {
        error: (filtersRes as ApiError).error || "Filtreler alınamadı",
        products: null,
        filters: null,
      };
    }

    return {
      error: null,
      products: productsRes.data,
      filters: filtersRes.data,
      slug,
      currentPage: page,
      cacheKeyParams: queryString,
      currency,
      locale,
    };
  }
);

async function parseArgs(params: Params, searchParams: SearchParams) {
  const slug = (await params).slug as string;
  const pageParamsObj = await searchParams;
  const cookieStore = await cookies();

  const currentPage = Number((pageParamsObj.page as string) || "1");

  const cacheKeyParams =
    getServerSideAllSearchParams(pageParamsObj, ["page"]) || "";

  const currency = (cookieStore.get("currency")?.value as Currency) || "TRY";
  const locale = (cookieStore.get("locale")?.value as Locale) || "TR";

  return { slug, currentPage, cacheKeyParams, currency, locale };
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  try {
    const { slug, currentPage, cacheKeyParams, currency, locale } =
      await parseArgs(params, searchParams);

    const data = await getBrandData(
      slug,
      currentPage,
      cacheKeyParams,
      currency,
      locale
    );

    if (data.error || !data.products) {
      return {
        title: "Marka Bulunamadı",
        description: "Aradığınız marka bulunamadı.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const { brand, pagination } = data.products;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const brandUrl = `${baseUrl}/brands/${slug}`;

    const title = brand.metaTitle || brand.name;
    const description =
      brand.metaDescription ||
      `${brand.name} markasında ${pagination.totalCount} ürün. En uygun fiyatlarla hemen alışverişe başla!`;

    const ogImage = brand.imageUrl ? getOgImageUrl(brand.imageUrl) : null;

    return {
      title,
      description,
      alternates: {
        canonical: brandUrl,
      },
      openGraph: {
        type: "website",
        locale: locale === "TR" ? "tr_TR" : "en_US",
        url: brandUrl,
        title,
        description,
        ...(ogImage && {
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: brand.name,
              type: "image/jpeg",
            },
          ],
        }),
      },
      twitter: {
        card: ogImage ? "summary_large_image" : "summary",
        title,
        description,
        ...(ogImage && {
          images: [ogImage],
        }),
      },
      other: {
        "product:brand": brand.name,
        "product:availability": "in stock",
        ...(currentPage > 1 && {
          "og:url": `${brandUrl}?page=${currentPage}`,
        }),
      },
    };
  } catch (error) {
    return {
      title: "Marka Bulunamadı",
      description: "Aradığınız marka bulunamadı.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

const BrandPage = async ({ params, searchParams }: Props) => {
  const { slug, cacheKeyParams, currency, locale } = await parseArgs(
    params,
    searchParams
  );

  const data = await getBrandData(slug, 1, cacheKeyParams, currency, locale);

  if (data.error || !data.products || !data.filters) {
    return <StoreNotFound type="brand" />;
  }

  const { products, filters } = data;

  const queryClient = getQueryClient();
  const endPoint = "brands";

  const productsQueryKey = [
    `${endPoint}-products-infinite`,
    slug,
    cacheKeyParams,
  ];
  const filtersQueryKey = [`${endPoint}-filters`, slug, cacheKeyParams];

  queryClient.setQueryData(productsQueryKey, {
    pages: [products],
    pageParams: [1],
  });
  queryClient.setQueryData(filtersQueryKey, filters);

  const jsonLd = generateBrandJsonLd(
    products,
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    currency,
    locale
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <InfinityQueryPage
        slug={slug}
        productsQueryKey={productsQueryKey}
        filtersQueryKey={filtersQueryKey}
        initialUrlParams={cacheKeyParams}
        endPoint="brands"
        staleTime={1000 * 60 * 5}
      />
    </HydrationBoundary>
  );
};

export default BrandPage;
