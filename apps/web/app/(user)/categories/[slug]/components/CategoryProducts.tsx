"use client";
import { Center, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@repo/shared";
import { $Enums, CategoryPageProductsReturnType } from "@repo/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import GlobalLoadingOverlay from "../../../../components/GlobalLoadingOverlay";
import CategoryPageProductCard from "./CategoryPageProductCard";
import fetchWrapper from "@lib/fetchWrapper";

interface CategoryProductsProps {
  categoryId: string;
  locale?: $Enums.Locale;
}

const CategoryProducts = ({
  categoryId,
  locale = "TR",
}: CategoryProductsProps) => {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") as string) || 1;
  const containerRef = useRef<HTMLDivElement>(null);

  const { ref, entry } = useIntersection({
    root: containerRef.current,
    threshold: 0.1,
  });

  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: [
      "category-products",
      categoryId,
      searchParams.toString(),
      locale,
    ],
    queryFn: async ({ pageParam = page }) => {
      // URL parametrelerini kopyala ve page'i güncelle
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", pageParam.toString());

      const res = await fetchWrapper.get<CategoryPageProductsReturnType>(
        `/users/categories/get-products-categories/${categoryId}?${params.toString()}`
      );

      if (!res.success) {
        throw new Error("Ürünler yüklenirken bir hata oluştu");
      }
      return res.data as CategoryPageProductsReturnType;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: page,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Intersection observer ile otomatik yükleme
  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = data?.pages.flatMap((page) => page.products) || [];

  if (isLoading) {
    return <GlobalLoadingOverlay />;
  }

  if (error) {
    return (
      <Center h={200}>
        <Text c="red">
          Ürünler yüklenirken bir hata oluştu: {error.message}
        </Text>
      </Center>
    );
  }

  return (
    <Stack gap="xl" className="space-y-6 min-h-screen" ref={containerRef}>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allProducts &&
          allProducts.length > 0 &&
          allProducts.map((product) => (
            <CategoryPageProductCard
              key={`${product.productId}-${product.combinationInfo ? product.combinationInfo.variantId : ""}`}
              product={product}
            />
          ))}
      </div>
      {/* Loading indicator for infinite scroll */}
      {isFetchingNextPage && (
        <Center>
          <Loader type="bars" c={"primary"} />
        </Center>
      )}

      {/* Empty state */}
      {!isLoading && allProducts.length === 0 && (
        <Center h={200}>
          <Text>Bu kategoride ürün bulunamadı</Text>
        </Center>
      )}

      {/* Intersection observer trigger element */}
      <div ref={ref} style={{ height: 1 }} />
    </Stack>
  );
};

export default CategoryProducts;
