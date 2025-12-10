"use client";

import CustomImage from "@/components/CustomImage";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import {
  ActionIcon,
  Alert,
  AspectRatio,
  Badge,
  Button,
  Group,
  Indicator,
  Pagination,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedState, useDisclosure } from "@mantine/hooks";
import { keepPreviousData, useQuery } from "@repo/shared";
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
  IconSortAscending,
  IconSortDescending,
  IconX,
} from "@tabler/icons-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ProductGqlModel } from "../../../../../src/gql/graphql";
import FilterModal from "./components/FilterModal";
import { fetchProducts } from "./helper/graphql-admin-products";

const getProductDisplayImage = (product: ProductGqlModel): string | null => {
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
  return null;
};

const getProductStockStatus = (product: ProductGqlModel) => {
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const searchParams = useSearchParams();
  const [search, setSearch] = useDebouncedState<string>(
    searchParams.get("search") || "",
    500
  );
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page") as string) || 1
  );
  const [limit, setLimit] = useState<number>(
    Number(searchParams.get("limit") as string) || 50
  );
  const [filters, setFilters] = useState<ProductFilterFormValues>(
    productFilterDefaultValues
  );

  const [opened, { open, close }] = useDisclosure(false);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["admin-products", filters, search, page, limit],
    queryFn: () => fetchProducts({ page, filters, search, limit }),
    placeholderData: keepPreviousData,
  });

  const columns: ColumnDef<ProductGqlModel>[] = [
    {
      accessorKey: "assets",
      header: "Görsel",
      cell: (info) => {
        const product = info.row.original;
        const imageUrl = getProductDisplayImage(product);
        return (
          <AspectRatio ratio={1} maw={40}>
            <CustomImage
              className="w-full h-full"
              src={
                imageUrl
                  ? imageUrl
                  : "https://placehold.co/600x400?text=Placeholder"
              }
            />
          </AspectRatio>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Ürün Adı",
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

  const table = useReactTable<ProductGqlModel>({
    data: data?.items || [],
    columns,
    manualPagination: true,
    state: {
      pagination: {
        pageIndex: data?.pagination?.currentPage
          ? data.pagination.currentPage - 1
          : 0,
        pageSize: limit,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

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
          <>
            {isFetching && !isLoading && <GlobalLoadingOverlay />}
            {isLoading ? (
              <Stack>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Group key={i} justify="space-between">
                    <Skeleton height={50} width="10%" radius="xl" />
                    <Skeleton height={50} width="40%" radius="xl" />
                    <Skeleton height={50} width="20%" radius="xl" />
                    <Skeleton height={50} width="20%" radius="xl" />
                  </Group>
                ))}
              </Stack>
            ) : (
              <Table
                stickyHeader
                striped
                highlightOnHover
                highlightOnHoverColor="admin.0"
              >
                <Table.Thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <Table.Tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <Table.Th
                          key={header.id}
                          colSpan={header.colSpan}
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <Group gap={"xs"} align="center" justify="flex-start">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <IconSortAscending />,
                              desc: <IconSortDescending />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </Group>
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Thead>
                <Table.Tbody>
                  {table.getRowModel().rows?.map((row) => (
                    <Table.Tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <Table.Td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </>
        )}
        {data?.pagination && (
          <Pagination
            value={data?.pagination?.currentPage}
            onChange={(value) => {
              setPage(value);
            }}
            total={data?.pagination.totalPages}
          />
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
