import InfinityQueryPage from "@/components/pages/InfinityQueryPage";
import { generateCategoryJsonLd } from "@lib/ui/json-ld-generator";
import { getServerSideAllSearchParams } from "@lib/ui/product-helper";
import { ApiError, createServerFetch } from "@lib/wrappers/fetchWrapper";
import { Currency, Locale } from "@repo/database";
import { dehydrate, HydrationBoundary, QueryClient } from "@repo/shared";
import { CategoryPageReturnType } from "@repo/types";
import { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { cache } from "react";
import { Params, SearchParams } from "types/GlobalTypes";

interface Props {
  params: Params;
  searchParams: SearchParams;
}

const getCategoryLoader = cache(
  async (params: Params, searchParams: SearchParams) => {
    const slug = (await params).slug as string;
    const pageParamsObj = await searchParams;
    const cookieStore = await cookies();

    const currentPage = Number((pageParamsObj.page as string) || "1");
    const cacheKeyParams = getServerSideAllSearchParams(pageParamsObj, [
      "page",
    ]);

    const fetchParams = cacheKeyParams
      ? `${cacheKeyParams}&page=${currentPage}`
      : `page=${currentPage}`;

    const api = createServerFetch().setCookies(cookieStore);
    const res = await api.get<CategoryPageReturnType>(
      `/categories/${slug}${fetchParams ? `?${fetchParams}` : ""}`
    );

    if (!res.success) {
      throw new Error((res as ApiError).error || "Kategori verisi alınamadı");
    }

    return {
      data: res.data,
      slug,
      currentPage,
      cacheKeyParams,
      currency: (cookieStore.get("currency")?.value as Currency) || "TRY",
      locale: (cookieStore.get("locale")?.value as Locale) || "TR",
    };
  }
);

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { data } = await getCategoryLoader(params, searchParams);

  return {
    title: data.category.metaTitle || data.category.categoryName,
    description: data.category.metaDescription,
  };
}

const CategoryPage = async ({ params, searchParams }: Props) => {
  const { data, slug, currentPage, cacheKeyParams, currency, locale } =
    await getCategoryLoader(params, searchParams);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 15,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 2,
      },
    },
  });
  const endPoint = "categories";
  const queryKey = [`${endPoint}-infinite`, slug, cacheKeyParams];

  queryClient.setQueryData(queryKey, {
    pages: [data],
    pageParams: [currentPage],
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
        initialPage={currentPage}
        endPoint="categories"
      />
    </HydrationBoundary>
  );
};

export default CategoryPage;
