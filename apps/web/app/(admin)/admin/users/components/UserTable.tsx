"use client";

import {
  Badge,
  Button,
  Checkbox,
  Group,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import { useQuery } from "@repo/shared";
import { GetUsersQueriesReturnType, SortAdminUserTable } from "@repo/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  getSortAdminUserTableLabels,
  getUserRoleLabels,
} from "../../../../../lib/helpers";
import CustomSearchInput from "../../../../components/CustomSearchInput";
import GlobalLoadingOverlay from "../../../../components/GlobalLoadingOverlay";
import CustomPagination from "../../../../components/CustomPagination";

const UserTable = () => {
  const SEARCH_PARAM_KEY = "search";
  const SELECT_PARAM_KEY = "sort";
  const PAGINATION_PARAM_KEY = "page";
  const searchParams = useSearchParams();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const searchValue = searchParams.get(SEARCH_PARAM_KEY) || "";
  const sortValue = searchParams.get(SELECT_PARAM_KEY) || "";
  const pageValue =
    parseInt(searchParams.get(PAGINATION_PARAM_KEY) as string) || 1;
  const { replace } = useRouter();
  const { data, isLoading, isPending, isError, refetch, isFetching } = useQuery(
    {
      queryKey: ["users", searchValue, sortValue, pageValue],
      queryFn: async () => {
        const fetchSearchParams = new URLSearchParams();
        if (searchValue) fetchSearchParams.append("search", searchValue);
        if (sortValue) fetchSearchParams.append("sortBy", sortValue);
        if (pageValue) fetchSearchParams.append("page", pageValue.toString());

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/get-users${
            fetchSearchParams.toString()
              ? `?${fetchSearchParams.toString()}`
              : ""
          }`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response?.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }
        const data = (await response.json()) as GetUsersQueriesReturnType;
        return data;
      },
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 5,
    }
  );

  // Hata durumunu önce kontrol et
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

  // Loading durumunu hata kontrolünden sonra kontrol et
  if (isLoading || isPending || (isFetching && !data)) {
    return <GlobalLoadingOverlay />;
  }

  return (
    <Stack gap="lg">
      <Group align="center" justify="space-between">
        <Title order={3}>Kullanıcılar ({data.users.length})</Title>
        <CustomSearchInput
          searchKey={SEARCH_PARAM_KEY}
          placeholder="Kullanıcı ara"
          radius="md"
          c="admin"
          color="admin"
          isSortActive
          selectProps={{
            selectkey: SELECT_PARAM_KEY,
            data: Object.values(SortAdminUserTable).map((sort) => ({
              label: getSortAdminUserTableLabels(sort),
              value: sort,
            })),
            placeholder: "Sırala",
            clearable: true,
          }}
        />
      </Group>
      {data?.users?.length > 0 ? (
        <Table.ScrollContainer minWidth={800}>
          <Table
            striped
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
                        selectedRows.filter((id) => id !== user.id)
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
                            selectedRows.filter((id) => id !== user.id)
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
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <div className="flex items-center justify-center">
          <Stack gap={"xs"}>
            <Title order={4}>Kullanıcı Bulunamadı</Title>
            <Button
              onClick={() => {
                replace("?");
              }}
              color="admin"
            >
              Filtreleri Temizle
            </Button>
          </Stack>
        </div>
      )}
      {data?.users?.length > 0 && (
        <CustomPagination
          total={data?.pagination?.totalPages || 1}
          color="admin"
        />
      )}{" "}
    </Stack>
  );
};

export default UserTable;
