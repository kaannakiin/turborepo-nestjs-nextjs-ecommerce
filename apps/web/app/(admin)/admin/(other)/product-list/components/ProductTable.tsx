"use client";

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  List,
  Modal,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DateFormatter, useQuery } from "@repo/shared";
import { AdminProductTableData } from "@repo/types";
import {
  IconAdjustments,
  IconCheck,
  IconEdit,
  IconPackage,
  IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CustomPagination from "../../../../../components/CustomPagination";
import CustomSearchInput from "../../../../../components/CustomSearchInput";
import GlobalLoadingOverlay from "../../../../../components/GlobalLoadingOverlay";
import TableAsset from "../../../../components/TableAsset";

type ProductsResponse = {
  products: AdminProductTableData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const fetchProducts = async (
  search?: string,
  page: number = 1
): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page.toString());

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/get-products?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Ürünler yüklenirken hata oluştu");
  }

  return response.json();
};

const ProductTable = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products", search, page],
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
    <Stack gap="lg">
      {isLoading && <GlobalLoadingOverlay />}

      <Group justify="space-between" align="center">
        <Title order={4}>Ürün Listesi</Title>
        <Group gap="md">
          <Button onClick={open} leftSection={<IconPlus size={16} />}>
            Ürün Ekle
          </Button>
          <CustomSearchInput />
        </Group>
      </Group>

      <Table.ScrollContainer minWidth={700} style={{ position: "relative" }}>
        <Table striped highlightOnHover verticalSpacing="md">
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
            {data?.products.map((product) => (
              <Table.Tr key={product.id}>
                <Table.Td
                  style={{ width: 120, maxHeight: 120, position: "relative" }}
                >
                  {product.finalImage && (
                    <TableAsset type="IMAGE" url={product.finalImage} />
                  )}
                </Table.Td>
                <Table.Td>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>
                      {product.translations[0]?.name || "İsimsiz Ürün"}
                    </Text>
                    {product.isVariant &&
                      product._count.variantCombinations > 0 && (
                        <Text size="xs" c="dimmed">
                          {product._count.variantCombinations} varyant
                        </Text>
                      )}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {product.priceDisplay}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={
                      parseInt(product.stockDisplay.split(" ")[0]) > 0
                        ? "green"
                        : "red"
                    }
                    variant="light"
                    size="md"
                    radius={0}
                  >
                    <Text fz={"xs"} fw={700}>
                      {product.stockDisplay}
                    </Text>
                  </Badge>
                </Table.Td>

                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {DateFormatter.shortDate(product.createdAt)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      component={Link}
                      href={
                        product.isVariant
                          ? `/admin//product-list/create-variant/${product.id}`
                          : `/admin//product-list/create-basic/${product.id}`
                      }
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
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

      {data && data.pagination.totalPages > 1 && (
        <CustomPagination total={data.pagination.total} />
      )}

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
              href="/admin/product-list/create-basic/new"
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
              href="/admin/product-list/create-variant/new"
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
    </Stack>
  );
};

export default ProductTable;
