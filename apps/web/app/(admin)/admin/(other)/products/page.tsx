"use client";

import TableAsset from "@/(admin)/components/TableAsset";
import GlobalLoader from "@/components/GlobalLoader";
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Indicator,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedState, useDisclosure } from "@mantine/hooks";
import { keepPreviousData, useInfiniteQuery } from "@repo/shared";
import {
  productFilterDefaultValues,
  ProductFilterFormValues,
} from "@repo/types";
import {
  IconAdjustmentsHorizontal,
  IconAlertCircle,
  IconFileArrowLeft,
  IconFileArrowRight,
  IconFilter2Bolt,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductGqlModel } from "../../../../../src/gql/graphql";
import FilterModal from "./components/FilterModal";
import { fetchProducts } from "./helper/graphql-admin-products";

export const getProductDisplayImage = (product: ProductGqlModel) => {
  if (product.assets && product.assets.length > 0) {
    return product.assets[0].asset.url;
  }
  if (product.variantCombinations && product.variantCombinations.length > 0) {
    const variantWithImage = product.variantCombinations.find(
      (v) => v.assets && v.assets.length > 0
    );
    if (variantWithImage) {
      return variantWithImage.assets[0].asset.url;
    }
  }
  return "/placeholder-image.png";
};

export const getProductStockStatus = (product: ProductGqlModel) => {
  if (!product.isVariant) {
    return product.stock > 0 ? product.stock : "Tükendi";
  }
  const stocks = product.variantCombinations.map((v) => v.stock);
  if (stocks.length === 0) return "Stok Yok";

  const totalStock = stocks.reduce((a, b) => a + b, 0);
  if (totalStock === 0) return "Tükendi";

  const min = Math.min(...stocks);
  const max = Math.max(...stocks);

  if (min === max) return min;
  return `${min} - ${max}`;
};

const AdminProductsPage = () => {
  const searchParams = useSearchParams();

  const [search, setSearch] = useDebouncedState<string>(
    searchParams.get("search") || "",
    500
  );

  const initialPage = Number(searchParams.get("page") as string) || 1;

  const [limit] = useState<number>(
    Number(searchParams.get("limit") as string) || 20
  );

  const [filters, setFilters] = useState<ProductFilterFormValues>(
    productFilterDefaultValues
  );

  const [opened, { open, close }] = useDisclosure(false);

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["admin-products", filters, search],
    queryFn: ({ pageParam }) =>
      fetchProducts({ pageParam: pageParam as number, filters, search, limit }),
    initialPageParam: initialPage,
    getPreviousPageParam: (firstPage) => {
      if (firstPage.pagination.currentPage > 1) {
        return firstPage.pagination.currentPage - 1;
      }
      return undefined;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.totalPages) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    placeholderData: keepPreviousData,
  });

  const flatData = data?.pages.flatMap((page) => page.items) || [];

  const columns: ColumnDef<ProductGqlModel>[] = [
    {
      accessorKey: "assets",
      header: "Görsel",
      size: 80,
      cell: (info) => {
        const product = info.row.original;
        const imageUrl = getProductDisplayImage(product);
        return "";
        // return <TableAsset type="IMAGE" url={imageUrl} />;
      },
    },
    {
      accessorKey: "name",
      header: "Ürün Adı",
      size: 300,
      cell: (info) => {
        const product = info.row.original;
        const name = product.translations?.[0]?.name || "-";
        return (
          <Text fw={500} size="sm" lineClamp={2}>
            {name}
          </Text>
        );
      },
    },
    {
      accessorKey: "stock",
      header: "Stok",
      size: 120,
      cell: (info) => {
        const status = getProductStockStatus(info.row.original);
        const isOutOfStock = status === "Tükendi" || status === "Stok Yok";
        return (
          <Badge
            color={isOutOfStock ? "red" : "blue"}
            variant="light"
            size="sm"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Tarih",
      size: 120,
      cell: (info) => {
        const date = new Date(info.getValue() as string);
        return <Text size="sm">{date.toLocaleDateString("tr-TR")}</Text>;
      },
    },
  ];

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 70,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  useEffect(() => {
    if (!virtualItems.length) return;

    const firstItem = virtualItems[0];
    const lastItem = virtualItems[virtualItems.length - 1];

    if (firstItem.index === 0 && hasPreviousPage && !isFetchingPreviousPage) {
      setTimeout(() => {
        fetchPreviousPage();
      }, 0);
    }

    if (
      lastItem.index >= flatData.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      setTimeout(() => {
        fetchNextPage();
      }, 0);
    }
  }, [
    virtualItems,
    hasPreviousPage,
    hasNextPage,
    fetchPreviousPage,
    fetchNextPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
    flatData.length,
  ]);

  const handleClear = () => {
    setFilters(productFilterDefaultValues);
    setSearch("");
  };

  const handleApply = (newFilters: ProductFilterFormValues) => {
    setFilters(newFilters);
    close();
  };

  const isFilterActive = (filters: ProductFilterFormValues) => {
    return (
      (filters.brandIds?.length ?? 0) > 0 ||
      (filters.categoryIds?.length ?? 0) > 0 ||
      (filters.tagIds?.length ?? 0) > 0 ||
      (filters.minPrice !== null && filters.minPrice !== undefined) ||
      (filters.maxPrice !== null && filters.maxPrice !== undefined) ||
      filters.hasStock !== null ||
      filters.isActive !== null ||
      filters.isVariant !== null ||
      (filters.isSavedFilter === true && !!filters.saveFilterName)
    );
  };
  const hasActiveFilter = isFilterActive(filters);

  return (
    <>
      <Stack gap={"lg"} h="100%">
        <Group justify="space-between" align="center">
          <Title order={3}>Ürünler</Title>
          <Group>
            <Button
              variant="light"
              leftSection={<IconFileArrowRight size={20} />}
            >
              Dışa Aktar
            </Button>
            <Button
              variant="light"
              leftSection={<IconFileArrowLeft size={20} />}
            >
              İçe Aktar
            </Button>
            <Button variant="filled">Ürün Ekle</Button>
          </Group>
        </Group>

        <Group justify="space-between" align="center">
          <Group gap={"xs"}>
            <TextInput
              placeholder="Ürün Ara"
              defaultValue={search}
              leftSection={<IconSearch size={20} />}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Indicator
              disabled={!hasActiveFilter}
              processing
              color="blue"
              position="top-start"
              size={10}
            >
              <Button
                variant="light"
                leftSection={<IconFilter2Bolt size={20} />}
                onClick={open}
              >
                Filtrele
              </Button>
            </Indicator>
            {(hasActiveFilter || search) && (
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconX size={20} />}
                onClick={handleClear}
              >
                Temizle
              </Button>
            )}
          </Group>
          <ActionIcon variant="light" size="lg">
            <IconAdjustmentsHorizontal />
          </ActionIcon>
        </Group>

        {isError && (
          <Alert
            variant="light"
            color="red"
            title="Hata"
            icon={<IconAlertCircle />}
          >
            {error?.message}
          </Alert>
        )}

        {!isError && (
          <Box
            className="flex-1 border border-gray-200 rounded-md bg-white overflow-hidden flex flex-col"
            style={{ minHeight: "600px" }}
          >
            <Box
              component="div"
              className="grid bg-gray-50 border-b border-gray-200"
              style={{
                gridTemplateColumns: columns
                  .map((c) =>
                    typeof c.size === "number" ? `${c.size}px` : "1fr"
                  )
                  .join(" "),
                paddingRight: "8px",
              }}
            >
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <Box
                    key={header.id}
                    className="p-3 text-sm font-semibold text-gray-600 truncate"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </Box>
                ))
              )}
            </Box>

            <div
              ref={tableContainerRef}
              style={{
                overflow: "auto",
                height: "600px",
                position: "relative",
              }}
            >
              {isFetchingPreviousPage && <GlobalLoader />}

              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {isLoading && rows.length === 0 ? (
                  <GlobalLoader />
                ) : (
                  rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                      <Box
                        key={row.id}
                        className="grid hover:bg-gray-50 transition-colors border-b border-gray-100 items-center"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                          gridTemplateColumns: columns
                            .map((c) =>
                              typeof c.size === "number" ? `${c.size}px` : "1fr"
                            )
                            .join(" "),
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <Box key={cell.id} className="px-3 truncate">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </Box>
                        ))}
                      </Box>
                    );
                  })
                )}
              </div>

              {isFetchingNextPage && <GlobalLoader />}
            </div>
          </Box>
        )}
      </Stack>

      <FilterModal
        opened={opened}
        onClose={close}
        onApply={handleApply}
        initialValues={filters}
      />
    </>
  );
};

export default AdminProductsPage;
