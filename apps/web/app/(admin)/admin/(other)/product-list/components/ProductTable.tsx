"use client";

import fetchWrapper from "@lib/wrappers/fetchWrapper";
import {
  Alert,
  AspectRatio,
  Button,
  Card,
  Center,
  Group,
  List,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  SimpleGrid,
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@repo/shared";
import { AdminProductTableProductData, Pagination } from "@repo/types";
import {
  IconAdjustments,
  IconCheck,
  IconPackage,
  IconPlus,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import CustomSearchInput from "../../../../../components/CustomSearchInput";
import TableAsset from "@/(admin)/components/TableAsset";
import { Locale } from "@repo/database";
import CustomPagination from "@/components/CustomPagination";
import { Route } from "next";
import Link from "next/link";

type ProductsResponse = {
  products: AdminProductTableProductData[];
  pagination?: Pagination;
};

const fetchProducts = async (
  search?: string,
  page: number = 1
): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page.toString());

  const response = await fetchWrapper.get<ProductsResponse>(
    `/admin/products/get-products?${params.toString()}`
  );

  if (!response.success) {
    throw new Error("Ürünler yüklenirken hata oluştu");
  }

  return response.data;
};

const ProductTable = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const { data, isLoading, error } = useQuery({
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
          <Table striped highlightOnHover highlightOnHoverColor="primary.0">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Görsel</Table.Th>
                <Table.Th>Ürün Adı</Table.Th>
                <Table.Th>Fiyat</Table.Th>
                <Table.Th>Stok</Table.Th>
                <Table.Th>Tarih</Table.Th>
                <Table.Th>İşlemler</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.products.map((product) => {
                const locale: Locale = "TR";
                const currency = "TRY";

                const name =
                  product.translations.find((t) => t.locale === locale)?.name ||
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

                const activeVariants = product.variants.filter((v) => v.active);

                const variantsToCheck =
                  activeVariants.length > 0 ? activeVariants : product.variants;

                const stocks = variantsToCheck.map((v) => v.stock);
                const minStock = Math.min(...stocks);
                const maxStock = Math.max(...stocks);

                const prices = variantsToCheck
                  .map(
                    (v) => v.prices.find((p) => p.currency === currency)?.price
                  )
                  .filter((p): p is number => p !== undefined);

                const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

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

                const renderStock = () => {

                  if (stocks.length === 0) return 0;
                  if (minStock === maxStock) {
                    return minStock;
                  }
                  return `${minStock} - ${maxStock}`;
                };

                return (
                  <Table.Tr key={product.id}>
                    <Table.Td>
                      <AspectRatio ratio={1} maw={40}>
                        <TableAsset
                          type={asset?.type || "IMAGE"}
                          url={asset?.url || "https://placehold.co/40x40"}
                        />
                      </AspectRatio>
                    </Table.Td>
                    <Table.Td>{name}</Table.Td>
                    <Table.Td>{renderPrice()}</Table.Td>
                    <Table.Td>{renderStock()}</Table.Td>
                    <Table.Td>
                      {new Date(product.createdAt).toLocaleDateString(locale)}
                    </Table.Td>
                    <Table.Td></Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
          {data?.products.length === 0 && !isLoading && (
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
              href={"/admin/product-list/create-basic/new" as Route}
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
              href={"/admin/product-list/create-variant/new" as Route}
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
