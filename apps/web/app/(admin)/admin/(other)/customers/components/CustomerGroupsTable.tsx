'use client';

import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import { useGetCustomerSegments } from '@hooks/admin/useAdminCustomer';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { DateFormatter } from '@repo/shared';
import {
  IconBrain,
  IconClock,
  IconEdit,
  IconManualGearbox,
  IconTrash,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { Route } from 'next';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface SegmentWithCount {
  id: string;
  name: string;
  description?: string | null;
  type: 'MANUAL' | 'SMART';
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    users: number;
  };
}

const CustomerSegmentsTable = () => {
  const searchParams = useSearchParams();

  const { data, isLoading, isError } = useGetCustomerSegments(
    parseInt(searchParams.get('page') as string) || 1,
    20,
    (searchParams.get('search') as string) || undefined,
  );

  const renderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <Table.Tr key={index}>
          <Table.Td>
            <Skeleton height={20} width={150} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width={80} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width={50} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width={120} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width={120} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width={60} />
          </Table.Td>
        </Table.Tr>
      ));
    }

    if (isError || !data?.groups?.length) {
      return (
        <Table.Tr>
          <Table.Td colSpan={6}>
            <Stack align="center" py="xl" gap="xs">
              <ThemeIcon size={48} variant="light" color="gray" radius="xl">
                <IconUsers size={24} />
              </ThemeIcon>
              <Text c="dimmed">
                {isError
                  ? 'Segmentler yüklenirken bir hata oluştu.'
                  : 'Henüz herhangi bir müşteri segmenti oluşturulmamış.'}
              </Text>
            </Stack>
          </Table.Td>
        </Table.Tr>
      );
    }

    return (data.groups as unknown as SegmentWithCount[]).map((segment) => {
      const isManual = segment.type === 'MANUAL';

      return (
        <Table.Tr key={segment.id}>
          <Table.Td>
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon
                variant="light"
                color={isManual ? 'teal' : 'violet'}
                size="lg"
                radius="md"
              >
                {isManual ? (
                  <IconManualGearbox size={18} />
                ) : (
                  <IconBrain size={18} />
                )}
              </ThemeIcon>
              <div>
                <Text fw={600} size="sm" c="dark.3">
                  {segment.name}
                </Text>
                {segment.description && (
                  <Text size="xs" c="dimmed" lineClamp={1} maw={300}>
                    {segment.description}
                  </Text>
                )}
              </div>
            </Group>
          </Table.Td>

          <Table.Td>
            <Badge color={isManual ? 'teal' : 'violet'} variant="dot" size="sm">
              {isManual ? 'Manuel Grup' : 'Akıllı Segment'}
            </Badge>
          </Table.Td>

          <Table.Td>
            <Group gap={6}>
              <IconUser size={14} className="text-gray-400" />
              {isManual ? (
                <Text size="sm" fw={500}>
                  {segment._count?.users || 0}
                </Text>
              ) : (
                <Tooltip label="Kriterlere göre anlık hesaplanır">
                  <Badge variant="outline" color="gray" size="xs">
                    Dinamik
                  </Badge>
                </Tooltip>
              )}
            </Group>
          </Table.Td>

          <Table.Td>
            <Group gap={6}>
              <IconClock size={14} className="text-gray-400" />
              <Text size="sm" c="dimmed">
                {DateFormatter.forDashboard(segment.updatedAt)}
              </Text>
            </Group>
          </Table.Td>

          <Table.Td>
            <Text size="sm" c="dimmed">
              {DateFormatter.forDashboard(segment.createdAt)}
            </Text>
          </Table.Td>

          <Table.Td>
            <Group gap="xs">
              <Tooltip label="Düzenle">
                <ActionIcon
                  variant="light"
                  color="blue"
                  component={Link}
                  href={
                    `/admin/customers/customer-groups/${segment.id}` as Route
                  }
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Sil">
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={() => {
                    console.log('Delete clicked', segment.id);
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Table.Td>
        </Table.Tr>
      );
    });
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={3}>Müşteri Segmentleri</Title>
          <Text size="sm" c="dimmed">
            Müşterilerinizi gruplayarak özel kampanyalar oluşturun.
          </Text>
        </div>
        <Group gap={'md'}>
          <SearchInput placeholder="Segment Ara..." />
          <Button
            leftSection={<IconUsers size={18} />}
            variant="filled"
            component={Link}
            href={'/admin/customers/customer-groups/new' as Route}
          >
            Yeni Segment Oluştur
          </Button>
        </Group>
      </Group>

      <Stack gap="md">
        <Table.ScrollContainer minWidth={900}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Segment Bilgisi</Table.Th>
                <Table.Th>Tür</Table.Th>
                <Table.Th>Kişi Sayısı</Table.Th>
                <Table.Th>Son Güncelleme</Table.Th>
                <Table.Th>Oluşturulma</Table.Th>
                <Table.Th style={{ width: 100 }}>İşlemler</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{renderTableBody()}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {data?.pagination && data.pagination.totalPages > 1 && (
          <Group justify="flex-end">
            <Pagination total={data?.pagination.totalPages} />
          </Group>
        )}
      </Stack>
    </Stack>
  );
};

export default CustomerSegmentsTable;
