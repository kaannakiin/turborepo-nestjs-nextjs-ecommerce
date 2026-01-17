'use client';

import TableAsset from '@/(admin)/components/TableAsset';
import Pagination from '@/components/Pagination';
import SearchInput from '../../../../../components/SearchInput';
import {
  useProductList,
  BulkActionPayload,
  useProductBulkAction,
} from '@hooks/admin/useProducts';
import { getBulkActionConfig } from '@lib/ui/bulk-action.helper';
import {
  getPriceRange,
  getProductAsset,
  getProductName,
  getProductStatus,
  getStockRange,
} from '@lib/product-helper';
import {
  ActionIcon,
  Alert,
  AspectRatio,
  Badge,
  Button,
  Card,
  Center,
  Checkbox,
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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Locale } from '@repo/database/client';
import { DateFormatter } from '@repo/shared';
import { ProductBulkAction } from '@repo/types';
import {
  IconAdjustments,
  IconCheck,
  IconEdit,
  IconPackage,
  IconPlus,
} from '@tabler/icons-react';
import { Route } from 'next';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductActionsGroup from './product-actions/ProductActionsGroup';

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
  const [selectedProductIDs, setSelectedProductIDs] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState<ProductBulkAction | null>(
    null,
  );
  const [opened, { open, close }] = useDisclosure(false);
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setSelectedProductIDs([]);
  }, [page, search]);

  const onClick = (productId: string) => {
    push(`/admin/product-list/products/${productId}` as Route);
  };

  const { mutate: executeBulkAction, isPending } = useProductBulkAction({
    needsRefresh: true,
    onSuccess: () => {
      setSelectedProductIDs([]);
      setCurrentAction(null);
    },
  });

  const onSelect = (productId: string) => {
    setSelectedProductIDs((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const { data, isLoading, isFetching, error } = useProductList(
    search || undefined,
    page,
  );

  const onAction = (action: ProductBulkAction) => {
    const config = getBulkActionConfig(action);

    if (config.needsModal) {
      setCurrentAction(action);

      return;
    }

    executeBulkAction({
      action,
      productIds: selectedProductIDs,
    });
  };
  const handleModalConfirm = (extraData?: Partial<BulkActionPayload>) => {
    if (!currentAction) return;

    executeBulkAction({
      action: currentAction,
      productIds: selectedProductIDs,
      ...extraData,
    });
  };

  if (error) {
    return (
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={4}>Ürün Listesi</Title>
          <Group gap="md">
            <Button onClick={open} leftSection={<IconPlus size={16} />}>
              Ürün Ekle
            </Button>
            <SearchInput placeholder="Ürün ara..." />
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
      <Stack gap={'md'}>
        <Stack gap={'xs'}>
          <Group justify="space-between" align="center">
            <Title order={4}>Ürün Listesi</Title>
            <Group gap="md">
              <ProductActionsGroup
                selectedIds={selectedProductIDs}
                onAction={(action) => {
                  onAction(action);
                }}
              />
              <Button onClick={open} leftSection={<IconPlus size={16} />}>
                Ürün Ekle
              </Button>
              <SearchInput />
            </Group>
          </Group>
        </Stack>

        <Table.ScrollContainer minWidth={800}>
          <Table
            striped
            highlightOnHover
            highlightOnHoverColor="primary.0"
            style={{
              opacity: isFetching ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={20}>
                  <Checkbox
                    checked={
                      selectedProductIDs.length === data?.products.length &&
                      data?.products.length > 0
                    }
                    indeterminate={
                      selectedProductIDs.length > 0 &&
                      selectedProductIDs.length < (data?.products.length || 0)
                    }
                    onChange={() => {
                      if (selectedProductIDs.length === data?.products.length) {
                        setSelectedProductIDs([]);
                      } else {
                        setSelectedProductIDs(
                          data?.products.map((p) => p.id) || [],
                        );
                      }
                    }}
                  />
                </Table.Th>
                <Table.Th>Görsel</Table.Th>
                <Table.Th>Ürün Adı</Table.Th>
                <Table.Th>Fiyat</Table.Th>
                <Table.Th>Stok</Table.Th>
                <Table.Th>Tarih</Table.Th>
                <Table.Th w={50}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                : data?.products.map((product) => {
                    const locale: Locale = 'TR';
                    const currency = 'TRY';

                    const name = getProductName(product, locale);
                    const asset = getProductAsset(product);
                    const status = getProductStatus(product);
                    const stock = getStockRange(product);
                    const price = getPriceRange(product, currency, locale);

                    return (
                      <Table.Tr
                        key={product.id}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(product.id);
                        }}
                      >
                        <Table.Td>
                          <Checkbox
                            checked={selectedProductIDs.includes(product.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              onSelect(product.id);
                            }}
                          />
                        </Table.Td>
                        <Table.Td onClick={(e) => e.stopPropagation()}>
                          <Group gap={'md'} align="center">
                            <AspectRatio ratio={1} maw={40}>
                              <TableAsset
                                type={asset?.type || 'IMAGE'}
                                url={asset?.url || 'https://placehold.co/40x40'}
                              />
                            </AspectRatio>
                            {status === 'active' ? (
                              <Badge color="green">Aktif</Badge>
                            ) : status === 'partial' ? (
                              <Badge color="yellow">Kısmen Aktif</Badge>
                            ) : (
                              <Badge color="red">Pasif</Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          {name}
                          {product?.variants?.length > 1 && (
                            <Text fz={'xs'} c={'dimmed'}>
                              {`${product.variants.length} Varyant`}
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>{price.display}</Table.Td>
                        <Table.Td>{stock.display}</Table.Td>
                        <Table.Td>
                          {DateFormatter.shortDate(product.createdAt)}
                        </Table.Td>
                        <Table.Td onClick={(e) => e.stopPropagation()}>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => onClick(product.id)}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
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
                    ? 'Arama kriterlerine uygun ürün bulunamadı'
                    : 'Henüz ürün bulunmuyor'}
                </Text>
              </Stack>
            </Center>
          )}
        </Table.ScrollContainer>

        {data?.pagination && data?.pagination.totalPages > 1 && (
          <Pagination total={data.pagination.totalPages} />
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
              href={'/admin/product-list/products/new' as Route}
              onClick={close}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
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
              href={'/admin/product-list/products/new?variant=true' as Route}
              onClick={close}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
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
