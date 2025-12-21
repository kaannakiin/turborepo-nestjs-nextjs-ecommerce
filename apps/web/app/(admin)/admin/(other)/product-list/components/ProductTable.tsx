"use client";

import TableAsset from "@/(admin)/components/TableAsset";
import CustomPagination from "@/components/CustomPagination";
import fetchWrapper from "@lib/wrappers/fetchWrapper";
import {
  Alert,
  AspectRatio,
  Button,
  Card,
  Center,
  Group,
  List,
  Modal,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Locale } from "@repo/database";
import { useQuery } from "@repo/shared";
import { AdminProductTableProductData, Pagination } from "@repo/types";
import {
  IconAdjustments,
  IconCheck,
  IconPackage,
  IconPlus,
} from "@tabler/icons-react";
import { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import CustomSearchInput from "../../../../../components/CustomSearchInput";

type ProductsResponse = {
  products: AdminProductTableProductData[];
  pagination?: Pagination;
};

const fetchProducts = async (
  search?: string,
  page: number = 1,
  limit = 20
): Promise<ProductsResponse> => {
  const response = await fetchWrapper.get<ProductsResponse>(`/admin/products`, {
    params: {
      search: search?.trim(),
      page,
      limit,
    },
  });

  if (!response.success) {
    throw new Error("Ürünler yüklenirken hata oluştu");
  }

  return response.data;
};

// Skeleton Row Component
const SkeletonRow = () => (
  <Table.Tr>
    <Table.Td>
      <Skeleton height={40} width={40} />
    </Table.Td>
    <Table.Td>
      <Stack gap="xs">
        <Skeleton height={16} width="60%" />
        <Skeleton height={12} width="40%" />
      </Stack>
    </Table.Td>
    <Table.Td>
      <Skeleton height={16} width={80} />
    </Table.Td>
    <Table.Td>
      <Skeleton height={16} width={40} />
    </Table.Td>
    <Table.Td>
      <Skeleton height={16} width={100} />
    </Table.Td>
  </Table.Tr>
);

const ProductTable = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["admin-products", search, page],
    queryFn: () => fetchProducts(search || undefined, page),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  if (error) {
    return (
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={4}>Ürün Listesi</Title>
          <Group gap="md">
            <Button onClick={open} leftSection={<IconPlus size={16} />}>
              Ürün Ekle
            </Button>
            <CustomSearchInput placeholder="Ürün ara..." />
          </Group>
        </Group>

        <Alert color="red" title="Hata">
          Ürünler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
        </Alert>
      </Stack>
    );
  }

  return (
    <>
      <Stack gap={"md"}>
        <Group justify="space-between" align="center">
          <Title order={4}>Ürün Listesi</Title>
          <Group gap="md">
            <Button onClick={open} leftSection={<IconPlus size={16} />}>
              Ürün Ekle
            </Button>
            <CustomSearchInput />
          </Group>
        </Group>

        <Table.ScrollContainer minWidth={800}>
          <Table
            striped
            highlightOnHover
            highlightOnHoverColor="primary.0"
            style={{
              opacity: isFetching ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Görsel</Table.Th>
                <Table.Th>Ürün Adı</Table.Th>
                <Table.Th>Fiyat</Table.Th>
                <Table.Th>Stok</Table.Th>
                <Table.Th>Tarih</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                : data?.products.map((product) => {
                    const locale: Locale = "TR";
                    const currency = "TRY";

                    const name =
                      product.translations.find((t) => t.locale === locale)
                        ?.name ||
                      product.translations[0]?.name ||
                      "İsimsiz Ürün";

                    const defaultVariant = product.variants.find(
                      (v) => v.isDefault
                    );
                    const firstImageVariant = product.variants.find(
                      (v) => v.assets.length > 0
                    );

                    const asset =
                      product.assets[0]?.asset ||
                      defaultVariant?.assets[0]?.asset ||
                      firstImageVariant?.assets[0]?.asset ||
                      null;

                    const allVariants = product.variants;

                    const stocks = allVariants.map((v) => v.stock);
                    const minStock =
                      stocks.length > 0 ? Math.min(...stocks) : 0;
                    const maxStock =
                      stocks.length > 0 ? Math.max(...stocks) : 0;

                    const renderStock = () => {
                      if (stocks.length === 0) return 0;

                      if (minStock === maxStock) {
                        return minStock;
                      }

                      return `${minStock} - ${maxStock}`;
                    };

                    const prices = allVariants
                      .map(
                        (v) =>
                          v.prices.find((p) => p.currency === currency)?.price
                      )
                      .filter(
                        (p): p is number => p !== undefined && p !== null
                      );

                    const minPrice =
                      prices.length > 0 ? Math.min(...prices) : 0;
                    const maxPrice =
                      prices.length > 0 ? Math.max(...prices) : 0;

                    const renderPrice = () => {
                      if (prices.length === 0) return "-";

                      const format = (val: number) =>
                        new Intl.NumberFormat(locale, {
                          style: "currency",
                          currency,
                        }).format(val);

                      if (minPrice === maxPrice) {
                        return format(minPrice);
                      }
                      return `${format(minPrice)} - ${format(maxPrice)}`;
                    };

                    return (
                      <Table.Tr
                        key={product.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          push(
                            `/admin/product-list/products/${product.id}` as Route
                          );
                        }}
                      >
                        <Table.Td onClick={(e) => e.stopPropagation()}>
                          <AspectRatio ratio={1} maw={40}>
                            <TableAsset
                              type={asset?.type || "IMAGE"}
                              url={asset?.url || "https://placehold.co/40x40"}
                            />
                          </AspectRatio>
                        </Table.Td>
                        <Table.Td>
                          {name}
                          {product?.variants?.length > 1 && (
                            <Text fz={"xs"} c={"dimmed"}>
                              {`${product.variants.length} Varyant`}
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>{renderPrice()}</Table.Td>
                        <Table.Td>{renderStock()}</Table.Td>
                        <Table.Td>
                          {new Date(product.createdAt).toLocaleDateString(
                            locale
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
            </Table.Tbody>
          </Table>

          {!isLoading && data?.products.length === 0 && (
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconPackage size={48} color="gray" />
                <Text size="lg" c="dimmed">
                  {search
                    ? "Arama kriterlerine uygun ürün bulunamadı"
                    : "Henüz ürün bulunmuyor"}
                </Text>
              </Stack>
            </Center>
          )}
        </Table.ScrollContainer>

        {data?.pagination && data?.pagination.totalPages > 1 && (
          <CustomPagination total={data.pagination.totalPages} />
        )}
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        centered
        title={
          <Group gap="sm">
            <IconPlus size={20} />
            <Text fw={600}>Yeni Ürün Oluştur</Text>
          </Group>
        }
        size="lg"
        radius="md"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack gap="xl" p="lg">
          <SimpleGrid cols={{ xs: 1, sm: 2 }}>
            <Card
              shadow="sm"
              padding="xl"
              radius="md"
              withBorder
              component={Link}
              href={"/admin/product-list/products/new" as Route}
              onClick={close}
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                textDecoration: "none",
              }}
              className="hover-card"
            >
              <Stack align="center" gap="md">
                <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                  <IconPackage size={28} />
                </ThemeIcon>

                <Stack gap="xs" align="center">
                  <Text fw={600} size="lg">
                    Basit Ürün
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Tek seçeneği olan standart ürünler
                  </Text>
                </Stack>

                <List
                  size="xs"
                  c="dimmed"
                  spacing="xs"
                  center
                  icon={
                    <ThemeIcon
                      size={16}
                      radius="xl"
                      color="blue"
                      variant="light"
                    >
                      <IconCheck size={10} />
                    </ThemeIcon>
                  }
                >
                  <List.Item>Hızlı kurulum</List.Item>
                  <List.Item>Tek fiyat & stok</List.Item>
                  <List.Item>Basit yönetim</List.Item>
                </List>
              </Stack>
            </Card>

            <Card
              shadow="sm"
              padding="xl"
              radius="md"
              withBorder
              component={Link}
              href={"/admin/product-list/products/new?variant=true" as Route}
              onClick={close}
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                textDecoration: "none",
              }}
              className="hover-card"
            >
              <Stack align="center" gap="md">
                <ThemeIcon size="xl" radius="md" variant="light" color="orange">
                  <IconAdjustments size={28} />
                </ThemeIcon>

                <Stack gap="xs" align="center">
                  <Text fw={600} size="lg">
                    Varyantlı Ürün
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Farklı seçeneklere sahip ürünler
                  </Text>
                </Stack>

                <List
                  size="xs"
                  c="dimmed"
                  spacing="xs"
                  center
                  icon={
                    <ThemeIcon
                      size={16}
                      radius="xl"
                      color="orange"
                      variant="light"
                    >
                      <IconCheck size={10} />
                    </ThemeIcon>
                  }
                >
                  <List.Item>Renk & beden seçenekleri</List.Item>
                  <List.Item>Farklı fiyatlandırma</List.Item>
                  <List.Item>Stok yönetimi</List.Item>
                </List>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      </Modal>

      <style>{`
        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </>
  );
};

export default ProductTable;
