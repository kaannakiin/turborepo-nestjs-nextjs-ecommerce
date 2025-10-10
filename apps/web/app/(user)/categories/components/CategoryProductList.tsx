"use client";
import GlobalLoader from "@/components/GlobalLoader";
import fetchWrapper from "@lib/fetchWrapper";
import { Button, SimpleGrid, Stack } from "@mantine/core";
import { useInfiniteQuery } from "@repo/shared";
import { GetCategoryProductsResponse } from "@repo/types";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import CategoryPageProductCard from "./CategoryPageProductCard";

interface CategoryProductListProps {
  categoryIds: string[];
}

const CategoryProductList = ({ categoryIds }: CategoryProductListProps) => {
  const searchParams = useSearchParams();

  const queryParams = useMemo(
    () => Object.fromEntries([...searchParams]),
    [searchParams]
  );

  const filterQuery = { ...queryParams };
  delete filterQuery.page;
  delete filterQuery.sort;

  const {
    data,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useInfiniteQuery({
    queryKey: ["get-category-products", categoryIds, queryParams],
    queryFn: async ({ pageParam }) => {
      const response = await fetchWrapper.post<GetCategoryProductsResponse>(
        "/user-categories/get-category-products",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryIds,
            page: pageParam,
            sort: Number(queryParams.sort) || 1,
            query: filterQuery,
          }),
        }
      );
      if (
        !response.success ||
        !response.data.success ||
        !response.data.products
      ) {
        throw new Error("Ürünler getirilemedi veya bulunamadı.");
      }
      return response.data;
    },
    initialPageParam: Number(queryParams.page) || 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage?.pagination?.hasPreviousPage) {
        return firstPage.pagination.currentPage - 1;
      }
      return undefined;
    },
    refetchOnWindowFocus: false,
  });

  const allProducts = data?.pages.flatMap((page) => page.products) || [];

  return (
    <Stack className="flex-1 min-h-screen">
      {hasPreviousPage && (
        <div style={{ height: "40px", textAlign: "center" }}>
          {/* {isFetchingPreviousPage && <GlobalLoader />} */}
          <Button
            onClick={async () => {
              await fetchPreviousPage();
            }}
          >
            Önceki Sayfayı yükel
          </Button>
        </div>
      )}

      <SimpleGrid
        cols={{
          xs: 2,
          md: 3,
          lg: 3,
        }}
        style={{
          transition: "opacity 0.2s ease-in-out",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {allProducts.length > 0 &&
          allProducts.map((product) => (
            <CategoryPageProductCard product={product} key={product.id} />
          ))}
      </SimpleGrid>

      {hasNextPage && (
        <div style={{ height: "40px", textAlign: "center" }}>
          {isFetchingNextPage && <GlobalLoader />}
        </div>
      )}
    </Stack>
  );
};

export default CategoryProductList;
