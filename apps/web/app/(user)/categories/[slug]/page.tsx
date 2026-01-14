import InfinityQueryPage from '@/components/pages/store-components/InfinityQueryPage';
import StoreNotFound from '@/components/pages/store-components/StoreNotFound';
import { getQueryClient } from '@lib/serverQueryClient';
import { generateCategoryJsonLd } from '@lib/ui/json-ld-generator';
import {
  getOgImageUrl,
  getServerSideAllSearchParams,
} from '@lib/ui/product-helper';
import { ApiError, createServerFetch } from '@lib/wrappers/fetchWrapper';
import { Currency, Locale } from '@repo/database/client';
import { dehydrate, HydrationBoundary } from '@repo/shared';
import { CategoryProductsResponse, FiltersResponse } from '@repo/types';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { cache } from 'react';
import { Params, SearchParams } from 'types/GlobalTypes';

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
    locale: Locale,
  ) => {
    const cookieStore = await cookies();
    const api = createServerFetch().setCookies(cookieStore);

    const productsUrl = queryString
      ? `/categories/${slug}?${queryString}&page=${page}`
      : `/categories/${slug}?page=${page}`;

    const filtersUrl = queryString
      ? `/categories/${slug}/filters?${queryString}`
      : `/categories/${slug}/filters`;

    const [productsRes, filtersRes] = await Promise.all([
      api.get<CategoryProductsResponse>(productsUrl),
      api.get<FiltersResponse>(filtersUrl),
    ]);

    if (!productsRes.success) {
      throw new Error((productsRes as ApiError).error || 'Ürünler alınamadı');
    }

    if (!filtersRes.success) {
      throw new Error((filtersRes as ApiError).error || 'Filtreler alınamadı');
    }

    return {
      products: productsRes.data,
      filters: filtersRes.data,
      slug,
      currentPage: page,
      cacheKeyParams: queryString,
      currency,
      locale,
    };
  },
);

async function parseArgs(params: Params, searchParams: SearchParams) {
  const slug = (await params).slug as string;
  const pageParamsObj = await searchParams;
  const cookieStore = await cookies();

  const currentPage = Number((pageParamsObj.page as string) || '1');

  const cacheKeyParams =
    getServerSideAllSearchParams(pageParamsObj, ['page']) || '';

  const currency = (cookieStore.get('currency')?.value as Currency) || 'TRY';
  const locale = (cookieStore.get('locale')?.value as Locale) || 'TR';

  return { slug, currentPage, cacheKeyParams, currency, locale };
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  try {
    const { slug, currentPage, cacheKeyParams, currency, locale } =
      await parseArgs(params, searchParams);

    const { products } = await getCategoryData(
      slug,
      currentPage,
      cacheKeyParams,
      currency,
      locale,
    );

    const { treeNode, pagination } = products;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const categoryUrl = `${baseUrl}/categories/${slug}`;

    const title = treeNode.metaTitle || treeNode.name;
    const description =
      treeNode.metaDescription ||
      `${treeNode.name} kategorisinde ${pagination.totalCount} ürün. En uygun fiyatlarla hemen alışverişe başla!`;

    const ogImage = treeNode.imageUrl ? getOgImageUrl(treeNode.imageUrl) : null;

    const metadata: Metadata = {
      title,
      description,

      alternates: {
        canonical: categoryUrl,
      },
      openGraph: {
        type: 'website',
        locale: locale === 'TR' ? 'tr_TR' : 'en_US',
        url: categoryUrl,
        title,
        description,
        ...(ogImage && {
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: treeNode.name,
              type: 'image/jpeg',
            },
          ],
        }),
      },

      twitter: {
        card: ogImage ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(ogImage && {
          images: [ogImage],
        }),
      },

      other: {
        'product:category': treeNode.name,
        'product:availability': 'in stock',
        ...(currentPage > 1 && {
          'og:url': `${categoryUrl}?page=${currentPage}`,
        }),
      },
    };

    return metadata;
  } catch (error) {
    return {
      title: 'Kategori Bulunamadı',
      description: 'Aradığınız kategori bulunamadı.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

const CategoryPage = async ({ params, searchParams }: Props) => {
  const { slug, cacheKeyParams, currency, locale } = await parseArgs(
    params,
    searchParams,
  );

  const data = await getCategoryData(slug, 1, cacheKeyParams, currency, locale);

  if (!data.products || !data.filters) {
    return <StoreNotFound type="category" />;
  }

  const { products, filters } = data;
  const queryClient = getQueryClient();
  const endPoint = 'categories';

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

  const jsonLd = generateCategoryJsonLd(
    products,
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    currency,
    locale,
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
        endPoint="categories"
        staleTime={1000 * 60 * 5}
      />
    </HydrationBoundary>
  );
};

export default CategoryPage;
