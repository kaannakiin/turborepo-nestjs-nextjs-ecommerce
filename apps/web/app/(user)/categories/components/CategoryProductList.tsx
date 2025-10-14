"use client";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import { Button, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@repo/shared";
import { GetCategoryProductsResponse } from "@repo/types";
import { ReadonlyURLSearchParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useEffect } from "react";
import CategoryPageProductCard from "./CategoryPageProductCard";

interface CategoryProductListProps {
  categoryIds: string[];
  searchParams: ReadonlyURLSearchParams;
}

const CategoryProductList = ({
  categoryIds,
  searchParams,
}: CategoryProductListProps) => {
  const router = useRouter();
  const { entry: nextEntry, ref: nextRef } = useIntersection();
  const { ref: previousRef } = useIntersection();

  const filterQueryWithoutPageAndSort: Record<
    string,
    string | string[] | undefined
  > = Array.from(searchParams.keys()).reduce(
    (acc, key) => {
      if (key !== "page" && key !== "sort") {
        const value = searchParams.getAll(key);
        acc[key] = value.length > 1 ? value : value[0];
      }
      return acc;
    },
    {} as Record<string, string | string[] | undefined>
  );

  const hasFilters = Object.keys(filterQueryWithoutPageAndSort).length > 0;

  const pageParam = parseInt((searchParams.get("page") as string) || "1");
  const sortParam = parseInt((searchParams.get("sort") as string) || "1");

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
    queryKey: [
      "get-category-products",
      categoryIds,
      filterQueryWithoutPageAndSort,
      sortParam,
      pageParam,
    ],
    retry: 2,
    queryFn: async ({ pageParam }) => {
      const response = await fetchWrapper.post<GetCategoryProductsResponse>(
        "/user-categories/get-category-products",
        {
          categoryIds,
          page: pageParam,
          sort: sortParam,
          query: filterQueryWithoutPageAndSort,
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
    initialPageParam: pageParam,
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

  useEffect(() => {
    if (nextEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [nextEntry, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = data?.pages.flatMap((page) => page.products) || [];

  if (isLoading) {
    return <GlobalLoadingOverlay />;
  }

  // Eğer hiç ürün yoksa ve filtre de yoksa notFound
  if (allProducts.length === 0 && !hasFilters) {
    notFound();
  }

  const handleClearFilters = () => {
    // Sadece sort parametresini koru, diğerlerini temizle
    const currentPath = window.location.pathname;
    const sortValue = searchParams.get("sort");
    const newUrl = sortValue ? `${currentPath}?sort=${sortValue}` : currentPath;
    router.push(newUrl);
  };

  return (
    <Stack className="flex-1 min-h-screen" gap={"lg"}>
      {allProducts.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center gap-4 py-10">
          <Text size="lg" c="dimmed">
            Aradığınız kriterlere uygun ürün bulunamadı
          </Text>
          {hasFilters && (
            <Button
              onClick={handleClearFilters}
              variant="filled"
              size="md"
              color="black"
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>
      ) : (
        <>
          {hasPreviousPage && (
            <div
              ref={previousRef}
              className="h-10 w-full flex items-center justify-center"
            >
              {isFetchingPreviousPage ? (
                <Loader c={"primary"} type="bars" z={1000} />
              ) : (
                <Button
                  onClick={() => {
                    fetchPreviousPage();
                  }}
                  variant="filled"
                >
                  Önceki Sayfayı Yükle
                </Button>
              )}
            </div>
          )}
          <SimpleGrid
            cols={{
              base: 2,
              xs: 2,
              md: 4,
              lg: 4,
            }}
            className="space-y-4"
            spacing={"md"}
          >
            {allProducts.length > 0 &&
              allProducts.map((product) => (
                <CategoryPageProductCard product={product} key={product.id} />
              ))}
          </SimpleGrid>
          {hasNextPage && (
            <div
              ref={nextRef}
              className="h-10 w-full flex items-center justify-center"
            >
              {isFetchingNextPage && (
                <Loader c={"primary"} type="bars" z={1000} />
              )}
            </div>
          )}
        </>
      )}
    </Stack>
  );
};

export default CategoryProductList;
