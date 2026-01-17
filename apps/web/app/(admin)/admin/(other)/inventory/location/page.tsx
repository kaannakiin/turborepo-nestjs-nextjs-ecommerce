'use client';

import Loader from '@/components/Loader';
import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import { useInventoryLocations } from '@hooks/admin/useInventory';
import { Box, Button, Group, Select, Stack, Text, Title } from '@mantine/core';
import { LocationType } from '@repo/database/client';
import { getInventoryLocationTypeLabel } from '@repo/shared';
import { IconPackage, IconPlus } from '@tabler/icons-react';
import { Route } from 'next';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import InventoryTable from '../components/InventoryTable';

const AdminInventoryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '24');
  const search = searchParams.get('search') || undefined;
  const type = (searchParams.get('type') as LocationType) || undefined;

  const { data, isLoading, isError } = useInventoryLocations({
    page,
    limit,
    search,
    type,
  });
  const isSearchParamsExists = search || type;

  const handleTypeFilter = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('type', value);
    } else {
      params.delete('type');
    }
    params.set('page', '1');
    router.replace(`?${params.toString()}`);
  };

  return (
    <Box className="flex flex-col gap-4 ">
      <Group justify="space-between" align="center">
        <div>
          <Title order={3}>Stok Lokasyonları</Title>
          <Text size="sm" c="dimmed">
            Depo ve mağaza lokasyonlarını yönetin
          </Text>
        </div>
        <Group>
          <SearchInput
            placeholder="Lokasyon ara..."
            searchKey="search"
            style={{ width: 300 }}
          />
          <Select
            placeholder="Tür filtrele"
            clearable
            value={type || null}
            onChange={handleTypeFilter}
            data={Object.entries(LocationType).map(([value, label]) => ({
              value,
              label: getInventoryLocationTypeLabel(label),
            }))}
            style={{ width: 180 }}
          />
          <Button
            component={Link}
            href={'/admin/inventory/location/new' as Route}
            leftSection={<IconPlus size={18} />}
          >
            Lokasyon Ekle
          </Button>
        </Group>
      </Group>

      <>
        {isLoading ? (
          <Loader />
        ) : isError ? (
          <Stack align="center" justify="center" py="xl">
            <Text c="red">Veriler yüklenirken bir hata oluştu</Text>
          </Stack>
        ) : !data?.data.length ? (
          <Stack align="center" justify="center" py="xl">
            <IconPackage size={48} stroke={1.5} color="gray" />
            <Text c="dimmed">
              {isSearchParamsExists
                ? 'Aramanıza veya filtrelerinize uyan lokasyon bulunamadı.'
                : 'Henüz eklenmiş bir stok lokasyonu yok.'}
            </Text>
            <Button
              component={Link}
              href={'/admin/inventory/location/new' as Route}
              variant="light"
              leftSection={<IconPlus size={16} />}
            >
              {isSearchParamsExists
                ? 'Yeni lokasyon ekle'
                : 'İlk lokasyonunu ekle'}
            </Button>
            {isSearchParamsExists && (
              <Button
                variant="outline"
                onClick={() => {
                  router.replace('/admin/inventory/location' as Route);
                }}
              >
                Fitreleri temizle
              </Button>
            )}
          </Stack>
        ) : (
          <InventoryTable data={data} />
        )}
      </>

      {data && data.pagination?.totalPages > 1 && (
        <Pagination total={data.pagination.totalPages} />
      )}
    </Box>
  );
};

export default AdminInventoryPage;
