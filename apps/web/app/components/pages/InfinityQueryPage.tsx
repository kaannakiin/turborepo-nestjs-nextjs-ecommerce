"use client";

import fetchWrapper from "@lib/wrappers/fetchWrapper";
import { Button, Loader, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { QueryKey, useInfiniteQuery } from "@repo/shared";
import { CategoryPageReturnType } from "@repo/types";
import { usePathname } from "next/navigation"; // useSearchParams sildik (burada lazım değil)
import { useEffect, useRef } from "react";

interface InfinityQueryPageProps {
  slug: string;
  initialUrlParams: string;
  initialPage: number;
  endPoint: string;
  queryKey: QueryKey;
}

const PageChunk = ({
  pageData,
  pageNumber,
  onInView,
}: {
  pageData: CategoryPageReturnType;
  pageNumber: number;
  onInView: (page: number) => void;
}) => {
  const { ref, entry } = useIntersection({
    threshold: 0,
    rootMargin: "-45% 0px -45% 0px", // Ekranın tam ortasını ince bir çizgi yapar
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      onInView(pageNumber);
    }
  }, [entry?.isIntersecting, pageNumber, onInView]);

  const variants = pageData.products.flatMap((product) =>
    product.variants.map((variant) => ({
      ...variant,
      product,
    }))
  );

  return (
    <div ref={ref} data-page={pageNumber}>
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
        {variants.map((variant, index) => (
          <Paper
            key={`${variant.id}-${index}`}
            p="md"
            radius="md"
            withBorder
            style={{
              height: "400px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text size="xs" c="dimmed">
              Sayfa {pageNumber}
            </Text>
            <Text fw={500} ta="center" size="sm">
              {variant.product?.translations?.[0]?.name || variant.sku}
            </Text>
            {/* ... Diğer alanlar ... */}
          </Paper>
        ))}
      </SimpleGrid>
    </div>
  );
};

const InfinityQueryPage = ({
  slug,
  initialUrlParams,
  initialPage,
  endPoint,
  queryKey,
}: InfinityQueryPageProps) => {
  const pathname = usePathname();
  // useSearchParams'ı sildim çünkü handlePageChange içinde window.location kullanacağız.
  // Eğer başka filtreler için lazımsa tutabilirsin ama page kontrolünde kullanma.

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePageChange = (page: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      // -----------------------------------------------------------
      // KRİTİK DÜZELTME: window.location.search kullanıyoruz.
      // -----------------------------------------------------------
      const currentParams = new URLSearchParams(window.location.search);
      const currentUrlPage = Number(currentParams.get("page") || "1");

      if (currentUrlPage !== page) {
        if (page === 1) {
          currentParams.delete("page");
        } else {
          currentParams.set("page", page.toString());
        }

        const paramsString = currentParams.toString();
        const newUrl = paramsString ? `${pathname}?${paramsString}` : pathname;

        window.history.replaceState(
          { ...window.history.state, as: newUrl, url: newUrl },
          "",
          newUrl
        );
      }
    }, 150);
  };

  const { ref: bottomRef, entry } = useIntersection({
    threshold: 0,
    rootMargin: "100px",
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
  } = useInfiniteQuery({
    queryKey,
    initialPageParam: initialPage,
    queryFn: async ({ pageParam }) => {
      const queryString = initialUrlParams
        ? `${initialUrlParams}&page=${pageParam}`
        : `page=${pageParam}`;

      const url = `/${endPoint}/${slug}?${queryString}`;
      const response = await fetchWrapper.get<CategoryPageReturnType>(url);

      if (!response.success) throw new Error("Veri alınamadı");
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.totalPages) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.pagination.currentPage > 1) {
        return firstPage.pagination.currentPage - 1;
      }
      return undefined;
    },
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Stack gap="md" p="md">
      {hasPreviousPage && (
        <Button
          onClick={() => fetchPreviousPage()}
          loading={isFetchingPreviousPage}
          variant="light"
          fullWidth
          maw={300}
          mx="auto"
        >
          Önceki Ürünleri Yükle
        </Button>
      )}

      <Stack gap="xl">
        {data?.pages.map((page) => (
          <PageChunk
            key={page.pagination.currentPage}
            pageData={page}
            pageNumber={page.pagination.currentPage}
            onInView={handlePageChange}
          />
        ))}
      </Stack>

      <div
        ref={bottomRef}
        style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isFetchingNextPage && <Loader size="sm" />}
        {!hasNextPage && data?.pages.length && (
          <Text c="dimmed" size="sm">
            Tüm varyantlar yüklendi
          </Text>
        )}
      </div>
    </Stack>
  );
};

export default InfinityQueryPage;
