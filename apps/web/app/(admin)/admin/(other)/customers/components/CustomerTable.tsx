'use client';

import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useGetCustomerList } from '@hooks/admin/useAdminCustomer';
import { getSortAdminUserTableLabels, getUserRoleLabels } from '@lib/helpers';
import {
  Badge,
  Button,
  Checkbox,
  Group,
  Menu,
  Stack,
  Table,
  Title,
} from '@mantine/core';
import { UserRole } from '@repo/database/client';
import {
  PAGINATION_PARAM_KEY,
  SEARCH_PARAM_KEY,
  SELECT_PARAM_KEY,
  SortAdminUserTable,
} from '@repo/types';
import {
  IconDots,
  IconTrash,
  IconUserEdit,
  IconUsers,
} from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const UserTable = () => {
  const searchParams = useSearchParams();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const searchValue = searchParams.get(SEARCH_PARAM_KEY) || '';
  const sortValue =
    searchParams.get(SELECT_PARAM_KEY) || SortAdminUserTable.nameAsc;
  const pageValue =
    parseInt(searchParams.get(PAGINATION_PARAM_KEY) as string) || 1;

  const { replace } = useRouter();

  const { data, isLoading, isPending, isError, refetch, isFetching } =
    useGetCustomerList(
      pageValue,
      20,
      searchValue,
      sortValue as SortAdminUserTable,
    );

  const handleBulkUpdateRole = (role: UserRole) => {
    console.log('Bulk Update Role:', role, 'Selected IDs:', selectedRows);
    // Burada mutation çağrısı yapacaksın
    // bulkUpdateRoleMutation.mutate({ action: "UPDATE_ROLE", ids: selectedRows, role })
  };

  const handleBulkUpdateGroup = () => {
    console.log('Bulk Update Group - Selected IDs:', selectedRows);
    // Grup seçimi için modal aç
  };

  const handleBulkDelete = () => {
    console.log('Bulk Delete - Selected IDs:', selectedRows);
    // Silme onayı için modal aç
  };

  if (isError) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">
          Kullanıcılar yüklenirken hata oluştu
        </p>
        <Button onClick={() => refetch()}>Tekrar Dene</Button>
      </div>
    );
  }

  if (isLoading || isPending || (isFetching && !data)) {
    return <LoadingOverlay />;
  }

  return (
    <Stack gap="lg">
      <Group align="center" justify="space-between">
        <Title order={3}>Kullanıcılar ({data.users.length})</Title>
        <Group gap="sm">
          {selectedRows.length > 0 && (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button
                  color="admin"
                  leftSection={<IconDots size={18} />}
                  variant="light"
                >
                  Toplu İşlem ({selectedRows.length})
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{selectedRows.length} kullanıcı seçildi</Menu.Label>

                {/* Rol Değiştir - Submenu */}
                <Menu.Sub openDelay={120} closeDelay={150}>
                  <Menu.Sub.Target>
                    <Menu.Sub.Item leftSection={<IconUserEdit size={16} />}>
                      Rol Değiştir
                    </Menu.Sub.Item>
                  </Menu.Sub.Target>

                  <Menu.Sub.Dropdown>
                    <Menu.Item
                      onClick={() => handleBulkUpdateRole(UserRole.USER)}
                    >
                      {getUserRoleLabels(UserRole.USER)}
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => handleBulkUpdateRole(UserRole.ADMIN)}
                    >
                      {getUserRoleLabels(UserRole.ADMIN)}
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => handleBulkUpdateRole(UserRole.OWNER)}
                    >
                      {getUserRoleLabels(UserRole.OWNER)}
                    </Menu.Item>
                  </Menu.Sub.Dropdown>
                </Menu.Sub>

                {/* Gruba Ekle */}
                <Menu.Item
                  leftSection={<IconUsers size={16} />}
                  onClick={handleBulkUpdateGroup}
                >
                  Gruba Ekle
                </Menu.Item>

                <Menu.Divider />

                {/* Sil */}
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleBulkDelete}
                >
                  Sil
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
          <SearchInput
            searchKey={SEARCH_PARAM_KEY}
            placeholder="Müşteri ara"
            radius="md"
            c="admin"
            color="admin"
            isSortActive
            selectProps={{
              selectkey: SELECT_PARAM_KEY,
              defaultValue: sortValue,
              data: Object.values(SortAdminUserTable).map((sort) => ({
                label: getSortAdminUserTableLabels(sort),
                value: sort,
              })),
              placeholder: 'Sırala',
              clearable: true,
            }}
          />
        </Group>
      </Group>
      {data?.users?.length > 0 ? (
        <Table.ScrollContainer minWidth={800}>
          <Table
            highlightOnHover
            verticalSpacing="sm"
            highlightOnHoverColor="admin.0"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    aria-label="Select all users"
                    color="admin"
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < data.users.length
                    }
                    checked={selectedRows.length === data.users.length}
                    onChange={(event) => {
                      if (event.currentTarget.checked) {
                        setSelectedRows(data.users.map((user) => user.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </Table.Th>
                <Table.Th>İsim</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Telefon</Table.Th>
                <Table.Th>Rol</Table.Th>
                <Table.Th>Kayıt Tarihi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.users.map((user) => (
                <Table.Tr
                  key={user.id}
                  onClick={() => {
                    if (selectedRows.includes(user.id)) {
                      setSelectedRows(
                        selectedRows.filter((id) => id !== user.id),
                      );
                    } else {
                      setSelectedRows([...selectedRows, user.id]);
                    }
                  }}
                >
                  <Table.Td>
                    <Checkbox
                      aria-label={`Select ${user.name} ${user.surname}`}
                      color="admin"
                      checked={selectedRows.includes(user.id)}
                      onChange={() => {
                        if (selectedRows.includes(user.id)) {
                          setSelectedRows(
                            selectedRows.filter((id) => id !== user.id),
                          );
                        } else {
                          setSelectedRows([...selectedRows, user.id]);
                        }
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    {user.name} {user.surname}
                  </Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>{user.phone}</Table.Td>
                  <Table.Td>
                    <Badge color="admin" radius="0">
                      {getUserRoleLabels(user.role)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <div className="flex items-center justify-center">
          <Stack gap={'xs'}>
            <Title order={4}>Müşteri Bulunamadı</Title>
            <Button
              onClick={() => {
                replace('?');
              }}
              color="admin"
            >
              Filtreleri Temizle
            </Button>
          </Stack>
        </div>
      )}
      {data?.pagination?.totalPages > 1 && (
        <Pagination total={data?.pagination?.totalPages || 1} color="admin" />
      )}
    </Stack>
  );
};

export default UserTable;
