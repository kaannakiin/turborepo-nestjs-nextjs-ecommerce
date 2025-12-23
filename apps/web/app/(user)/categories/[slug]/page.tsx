import InfinityQueryPage from "@/components/pages/InfinityQueryPage";
import { getQueryClient } from "@lib/serverQueryClient";
import { generateCategoryJsonLd } from "@lib/ui/json-ld-generator";
import { getServerSideAllSearchParams } from "@lib/ui/product-helper";
import { ApiError, createServerFetch } from "@lib/wrappers/fetchWrapper";
import { Currency, Locale } from "@repo/database";
import { dehydrate, HydrationBoundary } from "@repo/shared";
import { InfinityScrollPageReturnType } from "@repo/types";
import { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { cache } from "react";
import { Params, SearchParams } from "types/GlobalTypes";

interface Props {
  params: Params;
  searchParams: SearchParams;
}

const getCategoryData = cache(
  async (
    slug: string,
    page: number,
    queryString: string,
    currency: Currency,
    locale: Locale
  ) => {
    const cookieStore = await cookies();
    const api = createServerFetch().setCookies(cookieStore);

    const fetchUrl = queryString
      ? `/categories/${slug}?${queryString}&page=${page}`
      : `/categories/${slug}?page=${page}`;

    const res = await api.get<InfinityScrollPageReturnType>(fetchUrl);

    if (!res.success) {
      throw new Error((res as ApiError).error || "Kategori verisi alınamadı");
    }

    return {
      data: res.data,
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
  const { slug, currentPage, cacheKeyParams, currency, locale } =
    await parseArgs(params, searchParams);

  const { data } = await getCategoryData(
    slug,
    currentPage,
    cacheKeyParams,
    currency,
    locale
  );

  return {
    title: data.treeNode.metaTitle || data.treeNode.name,
    description: data.treeNode.metaDescription,
  };
}

const CategoryPage = async ({ params, searchParams }: Props) => {
  const { slug, cacheKeyParams, currency, locale } = await parseArgs(
    params,
    searchParams
  );

  const { data } = await getCategoryData(
    slug,
    1,
    cacheKeyParams,
    currency,
    locale
  );

  const queryClient = getQueryClient();

  const endPoint = "categories";

  const queryKey = [`${endPoint}-infinite`, slug, cacheKeyParams];

  queryClient.setQueryData(queryKey, {
    pages: [data],
    pageParams: [1],
  });

  const jsonLd = generateCategoryJsonLd(
    data,
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
        queryKey={queryKey}
        initialUrlParams={cacheKeyParams}
        endPoint="categories"
        staleTime={1000 * 60 * 5}
      />
    </HydrationBoundary>
  );
};

export default CategoryPage;
