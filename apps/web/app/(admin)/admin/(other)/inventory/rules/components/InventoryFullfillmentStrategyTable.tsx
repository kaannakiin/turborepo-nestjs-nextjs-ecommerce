'use client';

import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import TableSkeleton from '@/components/TableSkeleton';
import { useInvetoryRule } from '@hooks/admin/useInventory';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { DateFormatter } from '@repo/shared';
import {
  IconAlertCircle,
  IconCheck,
  IconEdit,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { Route } from 'next';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const InventoryFullfillmentStrategyTable = () => {
  const searchParams = useSearchParams();
  const search = (searchParams.get('search') as string) || '';
  const router = useRouter();
  const page = parseInt((searchParams.get('page') as string) || '1', 10);

  const { data, isLoading, isError, error } = useInvetoryRule({
    page,
    take: 20,
    search,
  });

  const rows = data?.data.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <div className="flex flex-col">
          <Text fw={500} size="sm">
            {item.name}
          </Text>
          <Text c="dimmed" size="xs" truncate="end" maw={200}>
            {item.description || '-'}
          </Text>
        </div>
      </Table.Td>

      <Table.Td>
        <Badge variant="light" color="blue">
          {item.type}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          {item.isDefault && (
            <Tooltip label="Varsayılan Strateji">
              <Badge color="orange" variant="filled" size="sm">
                DEFAULT
              </Badge>
            </Tooltip>
          )}
          {item.isActive ? (
            <Badge color="green" variant="dot" size="sm">
              Aktif
            </Badge>
          ) : (
            <Badge color="gray" variant="dot" size="sm">
              Pasif
            </Badge>
          )}
        </Group>
      </Table.Td>

      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Dropship İzni">
            {item.allowDropship ? (
              <IconCheck size={18} className="text-teal-600" />
            ) : (
              <IconX size={18} className="text-gray-400" />
            )}
          </Tooltip>
          <Tooltip label="Stoksuz Satış (Backorder)">
            {item.allowBackorder ? (
              <IconCheck size={18} className="text-teal-600" />
            ) : (
              <IconX size={18} className="text-gray-400" />
            )}
          </Tooltip>
        </Group>
      </Table.Td>

      <Table.Td>
        <Text size="xs" c="dimmed">
          {DateFormatter.withDay(item.updatedAt)}
        </Text>
      </Table.Td>

      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon
            onClick={() => {
              router.push(('/admin/inventory/rules/' + item.id) as Route);
            }}
            variant="subtle"
            color="gray"
          >
            <IconEdit style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red">
            <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group align="center" justify="space-between" className="w-full">
        <Group>
          <Title order={3}>Envanter Stratejileri</Title>
        </Group>
        <Group>
          <Button
            variant="outline"
            component={Link}
            href={'/admin/inventory/rules/new' as Route}
          >
            Yeni Strateji Oluştur
          </Button>
          <SearchInput />
        </Group>
      </Group>

      {isError && (
        <Alert
          variant="light"
          color="red"
          title="Hata Oluştu"
          icon={<IconAlertCircle />}
        >
          Veriler yüklenirken bir sorun oluştu:{' '}
          {error instanceof Error ? error.message : 'Bilinmeyen hata'}
        </Alert>
      )}

      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Strateji Adı</Table.Th>
              <Table.Th>Tip</Table.Th>
              <Table.Th>Durum</Table.Th>
              <Table.Th>Ayarlar (Drop/Back)</Table.Th>
              <Table.Th>Son Güncelleme</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>İşlemler</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? <TableSkeleton lenght={5} /> : rows}
            {!isLoading && data?.data.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                    <IconAlertCircle
                      size={32}
                      stroke={1.5}
                      className="mb-2 opacity-50"
                    />
                    <Text>Kayıt bulunamadı.</Text>
                  </div>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {!isLoading && data?.pagination && data.pagination.totalPages > 1 && (
        <Pagination total={data.pagination.totalPages} />
      )}
    </Stack>
  );
};

export default InventoryFullfillmentStrategyTable;
