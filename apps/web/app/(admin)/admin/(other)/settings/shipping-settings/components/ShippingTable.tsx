'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import { useCargoZones } from '@hooks/admin/useShipping';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { DateFormatter } from '@repo/shared';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';

const ShippingTable = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || undefined;

  const { isLoading, isPending, isFetching, data } = useCargoZones(
    page,
    10,
    search,
  );

  if (isLoading || isPending || isFetching) {
    return <LoadingOverlay />;
  }

  const dataExists = data && data.data && data.data.length > 0;
  const hasData = data?.data && data.data.length > 0;

  return (
    <Card>
      <Card.Section className="border-b border-b-gray-400">
        <Group p={'md'} justify="space-between" align="center">
          <Stack gap={'xs'}>
            <Title order={4}>Kargo Bölgeleri</Title>
            <Text c="dimmed" size="sm">
              Kargo fiyatlarınızı ve ücretsiz kargo şartlarınızı buradan
              belirleyebilirsiniz.
            </Text>
          </Stack>
          <Group gap={'md'}>
            {hasData && <SearchInput searchKey="search" />}
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => push('/admin/settings/shipping-settings/new')}
            >
              Yeni Kargo Seti Ekle
            </Button>
          </Group>
        </Group>
      </Card.Section>

      <Card.Section>
        {dataExists ? (
          <>
            <Table.ScrollContainer minWidth={800} py={'md'}>
              <Table
                highlightOnHover
                highlightOnHoverColor="admin.0"
                verticalSpacing={'sm'}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Kargo Bölgesi</Table.Th>
                    <Table.Th>Kural Sayısı</Table.Th>
                    <Table.Th>Oluşturma Tarihi</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.data?.map((zone) => (
                    <Table.Tr key={zone.id}>
                      <Table.Td maw={180}>
                        <Group gap={'xs'} wrap="wrap">
                          {zone.locations.slice(0, 5).map((loc) => (
                            <Badge radius={0} variant="outline" key={loc.id}>
                              {loc.country.emoji}{' '}
                              {loc.country.translations[0]?.name ||
                                loc.country.name}
                            </Badge>
                          ))}
                          {zone.locations.length > 5 && (
                            <Badge radius={0} variant="filled" color="gray">
                              +{zone.locations.length - 5} daha
                            </Badge>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>{zone.rules.length} kural</Table.Td>
                      <Table.Td>
                        <Text>{DateFormatter.withDay(zone.createdAt)}</Text>
                      </Table.Td>
                      <Table.Td align="right">
                        <ActionIcon
                          variant="transparent"
                          size="md"
                          onClick={() =>
                            push(`/admin/settings/shipping-settings/${zone.id}`)
                          }
                        >
                          <IconEdit />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            {data.pagination && data.pagination.totalPages > 1 && (
              <Group justify="center" py={'md'}>
                <Pagination
                  total={data.pagination.totalPages}
                  paginationKey="page"
                />
              </Group>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center flex-col gap-3 py-10 bg-gray-50">
            <Text c="dimmed">
              {search
                ? 'Arama sonucu bulunamadı'
                : 'Henüz bir kargo bölgesi oluşturulmamış'}
            </Text>
            {!search && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => push('/admin/settings/shipping-settings/new')}
              >
                Yeni Kargo Seti Ekle
              </Button>
            )}
          </div>
        )}
      </Card.Section>
    </Card>
  );
};

export default ShippingTable;
