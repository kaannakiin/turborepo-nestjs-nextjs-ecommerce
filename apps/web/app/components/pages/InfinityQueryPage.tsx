"use client";

import fetchWrapper from "@lib/wrappers/fetchWrapper";
import {
  Box,
  Button,
  Group,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure, useIntersection } from "@mantine/hooks";
import { QueryKey, useInfiniteQuery } from "@repo/shared";
import { InfinityScrollPageReturnType } from "@repo/types";
import { IconAdjustments, IconAdjustmentsOff } from "@tabler/icons-react";
import { useEffect } from "react";
import QueryFilters from "./QueryFilters";
import StoreProductCard from "./StoreProductCard";
import classes from "./InfinityQueryPage.module.css";

interface InfinityQueryPageProps {
  slug: string;
  initialUrlParams: string;
  endPoint: string;
  queryKey: QueryKey;
  staleTime?: number;
}

const ProductCardSkeleton = () => <Skeleton height={400} radius="md" />;

const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </SimpleGrid>
);

const InfinityQueryPage = ({
  slug,
  initialUrlParams,
  endPoint,
  queryKey,
  staleTime,
}: InfinityQueryPageProps) => {
  const [filtersOpened, { toggle: toggleFilters, close: closeFilters }] =
    useDisclosure(true);

  const { ref: bottomRef, entry } = useIntersection({
    threshold: 0,
    rootMargin: "100px",
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey,
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const queryString = initialUrlParams
          ? `${initialUrlParams}&page=${pageParam}`
          : `page=${pageParam}`;

        const url = `/${endPoint}/${slug}?${queryString}`;
        const response =
          await fetchWrapper.get<InfinityScrollPageReturnType>(url);

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
    });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const filters = data?.pages[0]?.filters;
  const pagination = data?.pages[0]?.pagination;

  const allVariants = data?.pages.flatMap((page) =>
    page.products.flatMap((product) =>
      product.variants.map((variant) => ({
        variant,
        product,
      }))
    )
  );

  return (
    <Box p="md">
      <Group justify="space-between" mb="md">
        <Text c="dimmed" size="sm">
          {pagination?.totalCount || 0} Sonuç
        </Text>

        <Group gap="sm">
          <Button
            variant="subtle"
            color="gray"
            rightSection={
              filtersOpened ? (
                <IconAdjustmentsOff size={18} />
              ) : (
                <IconAdjustments size={18} />
              )
            }
            onClick={toggleFilters}
            visibleFrom="md"
          >
            {filtersOpened ? "Filtreleri Gizle" : "Filtreleri Göster"}
          </Button>

          <Button
            variant="outline"
            color="gray"
            rightSection={<IconAdjustments size={18} />}
            onClick={toggleFilters}
            hiddenFrom="md"
          >
            Filtre
          </Button>

          <Select
            placeholder="Sıralama"
            data={[
              { value: "newest", label: "En Yeni" },
              { value: "price_asc", label: "Fiyat: Düşükten Yükseğe" },
              { value: "price_desc", label: "Fiyat: Yüksekten Düşüğe" },
              { value: "discount", label: "İndirim Oranı" },
            ]}
            w={{ base: 130, sm: 200 }}
            size="sm"
          />
        </Group>
      </Group>

      <Box className={classes.container}>
        <Box
          className={classes.sidebar}
          data-opened={filtersOpened}
          visibleFrom="md"
        >
          {filters && (
            <QueryFilters
              filters={filters}
              opened={filtersOpened}
              onClose={closeFilters}
            />
          )}
        </Box>

        <Box className={classes.content}>
          <Stack gap="md">
            <SimpleGrid
              cols={{ base: 2, sm: 3, lg: filtersOpened ? 3 : 4 }}
              spacing="md"
            >
              {allVariants?.map(({ variant, product }, index) => (
                <StoreProductCard
                  key={`${variant.id}-${index}`}
                  product={product}
                  variant={variant}
                />
              ))}
            </SimpleGrid>

            {isFetchingNextPage && <ProductGridSkeleton count={4} />}

            <div
              ref={bottomRef}
              style={{
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!hasNextPage && allVariants?.length ? (
                <Text c="dimmed" size="sm">
                  {pagination?.totalCount} ürün bulundu.
                </Text>
              ) : null}
            </div>
          </Stack>
        </Box>
      </Box>

      {filters && (
        <QueryFilters
          filters={filters}
          opened={filtersOpened}
          onClose={closeFilters}
          isMobileDrawer
        />
      )}
    </Box>
  );
};

export default InfinityQueryPage;
