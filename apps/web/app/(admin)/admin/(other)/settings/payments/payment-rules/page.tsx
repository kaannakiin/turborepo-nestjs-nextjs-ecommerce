'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import {
  useDeletePaymentRule,
  usePaymentRules,
} from '@hooks/admin/usePaymentRules';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FormCard from '../../../../../../components/cards/FormCard';

const PaymentRulesPage = () => {
  const { push } = useRouter();
  const { data, isLoading } = usePaymentRules();
  const deleteMutation = useDeletePaymentRule();

  const handleDelete = (id: string) => {
    if (confirm('Bu kuralı silmek istediğinizden emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <Stack gap="xl">
        <FormCard
          title={
            <Group p="md" justify="space-between" align="center">
              <Title order={4}>Ödeme Kuralları</Title>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() =>
                  push('/admin/settings/payments/payment-rules/new' as Route)
                }
              >
                Yeni Kural Ekle
              </Button>
            </Group>
          }
        >
          {!data?.data?.length ? (
            <div className="flex flex-col min-h-24 justify-center items-center gap-3">
              <Text fz="lg" fw={700}>
                Henüz bir ödeme kuralı eklenmedi
              </Text>
              <Text size="sm" c="dimmed" className="text-center">
                Ödeme kuralları ile farklı koşullara göre hangi ödeme
                yöntemlerinin kullanılacağını belirleyebilirsiniz.
              </Text>
              <Button
                variant="filled"
                leftSection={<IconPlus size={16} />}
                onClick={() =>
                  push('/admin/settings/payments/payment-rules/new' as Route)
                }
              >
                Kural Oluştur
              </Button>
            </div>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Öncelik</Table.Th>
                  <Table.Th>Kural Adı</Table.Th>
                  <Table.Th>Durum</Table.Th>
                  <Table.Th>Varsayılan</Table.Th>
                  <Table.Th align="right">İşlemler</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.data.map((rule) => (
                  <Table.Tr key={rule.id}>
                    <Table.Td>
                      <Badge variant="light" color="gray">
                        {rule.priority}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>{rule.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={rule.isActive ? 'green' : 'red'}>
                        {rule.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {rule.isDefault && (
                        <Badge color="blue" variant="light">
                          Varsayılan
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group justify="flex-end">
                        <Menu position="bottom-end">
                          <Menu.Target>
                            <ActionIcon variant="subtle">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                              component={Link}
                              href={
                                `/admin/settings/payments/payment-rules/${rule.id}` as Route
                              }
                            >
                              Düzenle
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => handleDelete(rule.id)}
                            >
                              Sil
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </FormCard>
      </Stack>
    </>
  );
};

export default PaymentRulesPage;
