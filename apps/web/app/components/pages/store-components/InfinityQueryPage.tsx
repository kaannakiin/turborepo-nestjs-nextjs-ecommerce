"use client";

import fetchWrapper from "@lib/wrappers/fetchWrapper";
import { Box, SimpleGrid, Skeleton, Stack, Text } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import {
  getParamKey,
  getSortIndexFromQuery,
  ProductPageSortOption,
  useInfiniteQuery,
  useQuery,
} from "@repo/shared";
import { CategoryProductsResponse, FiltersResponse } from "@repo/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import QueryFilters from "./QueryFilters";
import StoreBreadcrumb from "./StoreBreadcrumb";
import StoreProductCard from "./StoreProductCard";
import StoreEmptyProducts from "./StoreEmptyProducts";
import { Route } from "next";

interface InfinityQueryPageProps {
  slug: string;
  initialUrlParams: string;
  endPoint: string;
  productsQueryKey: string[];
  filtersQueryKey: string[];
  staleTime?: number;
}

const ProductCardSkeleton = () => <Skeleton height={400} radius="md" />;

const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <SimpleGrid cols={{ base: 2, md: 4, lg: 4, xl: 5 }} spacing="md">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </SimpleGrid>
);

const InfinityQueryPage = ({
  slug,
  initialUrlParams,
  endPoint,
  productsQueryKey,
  filtersQueryKey,
  staleTime,
}: InfinityQueryPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentParams, setCurrentParams] = useState(initialUrlParams);

  const { ref: bottomRef, entry } = useIntersection({
    threshold: 0,
    rootMargin: "100px",
  });

  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: productsQueryKey,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const queryString = currentParams
        ? `${currentParams}&${getParamKey("page")}=${pageParam}`
        : `${getParamKey("page")}=${pageParam}`;

      const url = `/${endPoint}/${slug}?${queryString}`;
      const response = await fetchWrapper.get<CategoryProductsResponse>(url);

      if (!response.success) throw new Error("Veri alınamadı");
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.totalPages) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    staleTime,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: filtersData } = useQuery({
    queryKey: filtersQueryKey,
    queryFn: async () => {
      const queryString = currentParams || "";
      const url = `/${endPoint}/${slug}/filters${queryString ? `?${queryString}` : ""}`;

      const response = await fetchWrapper.get<FiltersResponse>(url);

      if (!response.success) throw new Error("Filtreler alınamadı");
      return response.data;
    },
    staleTime,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(getParamKey("page"));

    const newParams = params.toString();
    if (newParams !== currentParams) {
      setCurrentParams(newParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filters = filtersData;
  const treeNode = productsData?.pages[0]?.treeNode;
  const pagination = productsData?.pages[0]?.pagination;
  const currentSortIndex = searchParams.get(getParamKey("sort"));
  const currentSort = currentSortIndex
    ? getSortIndexFromQuery(parseInt(currentSortIndex))
    : ProductPageSortOption.NEWEST;

  const displayItems = productsData?.pages.flatMap((page) =>
    page.products.flatMap((product) => {
      if (product.visibleAllCombinations) {
        return product.variants.map((variant) => ({
          variant,
          product,

          key: variant.id,
        }));
      } else {
        const firstVariant = product.variants[0];
        if (!firstVariant) return [];

        return [
          {
            variant: firstVariant,
            product,

            key: product.id,
          },
        ];
      }
    })
  );
  const handleClearFilters = () => {
    router.push(`/${endPoint}/${slug}` as Route, { scroll: false });
  };

  const handleFilterChange = (newParams: URLSearchParams) => {
    router.push(`?${newParams.toString()}`, { scroll: false });
  };
  const hasFilters = currentParams.length > 0;

  const pageType =
    endPoint === "categories"
      ? "categories"
      : endPoint === "brands"
        ? "brands"
        : "tags";

  return (
    <Stack className="w-full  max-w-[1500px] lg:mx-auto px-4" gap="lg">
      {treeNode && <StoreBreadcrumb treeNode={treeNode} pageType={pageType} />}

      <Box className="flex justify-between items-center">
        <Text c="dimmed" size="sm">
          {pagination?.totalCount || 0} Sonuç
        </Text>

        {filters && (
          <QueryFilters
            filters={filters as FiltersResponse}
            currentSort={currentSort}
            onFilterChange={handleFilterChange}
            pageType={pageType}
            treeNode={treeNode}
          />
        )}
      </Box>

      {displayItems && displayItems.length === 0 ? (
        <StoreEmptyProducts
          hasFilters={hasFilters}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <>
          <SimpleGrid cols={{ base: 2, md: 4, lg: 4, xl: 5 }} spacing="md">
            {displayItems?.map(({ variant, product, key }) => (
              <StoreProductCard key={key} product={product} variant={variant} />
            ))}
          </SimpleGrid>

          {isFetchingNextPage && <ProductGridSkeleton count={4} />}

          <div
            ref={bottomRef}
            className="h-5 flex items-center justify-center"
          />
        </>
      )}
      {isFetchingNextPage && <ProductGridSkeleton count={4} />}

      <div ref={bottomRef} className="h-5 flex items-center justify-center" />
    </Stack>
  );
};

export default InfinityQueryPage;
