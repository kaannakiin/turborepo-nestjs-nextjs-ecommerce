"use client";
import CustomPagination from "@/components/CustomPagination";
import CustomSearchInput from "@/components/CustomSearchInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import { getCartStatusColor, getCartStatusLabel } from "@lib/helpers";
import {
  Badge,
  Button,
  Group,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { $Enums, CartStatus } from "@repo/database/client";
import {
  DateFormatter,
  getCartStatusByValue,
  getCartStatusSelectLabel,
  getCartStatusSortValue,
  useQuery,
} from "@repo/shared";
import { GetAllCartsReturnType } from "@repo/types";
import { useRouter, useSearchParams } from "next/navigation";
import CustomDateFilters from "../components/CustomDateFilters";
import { Route } from "next";

const AdminCartsPage = () => {
  const { replace, push } = useRouter();
  const searchParams = useSearchParams();

  const search = (searchParams.get("search") as string) || null;
  const page = parseInt((searchParams.get("page") as string) || "1", 10);
  const limit = parseInt((searchParams.get("limit") as string) || "14", 10);
  const startDate = searchParams.get("startDate") || null;
  const endDate = searchParams.get("endDate") || null;
  const status =
    parseInt((searchParams.get("status") as string) || null) || null;
  const hasActiveFilters = !!(
    search ||
    startDate ||
    endDate ||
    status ||
    page > 1
  );

  const { isLoading, data } = useQuery({
    queryKey: [
      "admin-user-carts",
      { page, limit, search, startDate, endDate, status },
    ],
    queryFn: async () => {
      const cartStatus = status ? getCartStatusByValue(status) : null;
      const response = await fetchWrapper.get<GetAllCartsReturnType>(
        "/admin/carts",
        {
          params: {
            page,
            limit,
            search,
            startDate,
            endDate,
            ...(cartStatus ? { status: cartStatus } : {}),
          },
        }
      );

      if (!response.success) {
        const errorResponse = response as ApiError;
        throw new Error(errorResponse.error || "Failed to fetch carts");
      }
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch carts");
      }
      return response.data.data;
    },
  });

  const clearFilters = () => {
    replace("?");
  };

  if (isLoading) {
    return <GlobalLoadingOverlay />;
  }

  if (data && data.carts.length === 0 && !hasActiveFilters) {
    return (
      <Stack gap={"lg"}>
        <Group justify="space-between" align="center">
          <Group>
            <Title order={3}>Kullanıcı Sepetleri</Title>
          </Group>
          <Group gap={"xs"}>
            <Select
              value={status ? getCartStatusByValue(status) : null}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e === null) {
                  params.delete("status");
                  replace(`?${params.toString()}`);
                  return;
                }

                params.set(
                  "status",
                  getCartStatusSortValue(e as $Enums.CartStatus).toString()
                );

                replace(`?${params.toString()}`);
              }}
              placeholder="Duruma Göre Filtrele"
              data={Object.values(CartStatus).map((status) => ({
                label: getCartStatusSelectLabel(status),
                value: status,
              }))}
            />
            <CustomDateFilters />
            <CustomSearchInput />
          </Group>
        </Group>
        <Stack align="center" gap="md" py="xl">
          <Text size="lg" c="dimmed">
            Mağazanızda henüz bir sepet oluşturulmadı.
          </Text>
        </Stack>
      </Stack>
    );
  }

  if (data && data.carts.length === 0 && hasActiveFilters) {
    return (
      <Stack gap={"lg"}>
        <Group justify="space-between" align="center">
          <Group>
            <Title order={3}>Kullanıcı Sepetleri</Title>
          </Group>
          <Group gap={"xs"}>
            <Select
              value={status ? getCartStatusByValue(status) : null}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e === null) {
                  params.delete("status");
                  replace(`?${params.toString()}`);
                  return;
                }

                params.set(
                  "status",
                  getCartStatusSortValue(e as $Enums.CartStatus).toString()
                );

                replace(`?${params.toString()}`);
              }}
              placeholder="Duruma Göre Filtrele"
              data={Object.values(CartStatus).map((status) => ({
                label: getCartStatusSelectLabel(status),
                value: status,
              }))}
            />
            <CustomDateFilters />
            <CustomSearchInput />
          </Group>
        </Group>
        <Stack align="center" gap="md" py="xl">
          <Text size="lg" c="dimmed">
            Seçtiğiniz parametrelere uygun sepet bulunamadı.
          </Text>
          <Button onClick={clearFilters} variant="light">
            Filtreleri Temizle
          </Button>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack gap={"lg"}>
      <Group justify="space-between" align="center">
        <Group>
          <Title order={3}>Kullanıcı Sepetleri</Title>
        </Group>
        <Group gap={"xs"}>
          <Select
            value={status ? getCartStatusByValue(status) : null}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              if (e === null) {
                params.delete("status");
                replace(`?${params.toString()}`);
                return;
              }

              params.set(
                "status",
                getCartStatusSortValue(e as $Enums.CartStatus).toString()
              );

              replace(`?${params.toString()}`);
            }}
            placeholder="Duruma Göre Filtrele"
            clearable
            data={Object.values(CartStatus).map((status) => ({
              label: getCartStatusSelectLabel(status),
              value: status,
            }))}
          />
          <CustomDateFilters />
          <CustomSearchInput />
        </Group>
      </Group>

      <Table.ScrollContainer minWidth={800}>
        <Table
          verticalSpacing={"xs"}
          highlightOnHover
          highlightOnHoverColor="admin.0"
          className="cursor-pointer"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Kullanıcı</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Ürün Sayısı</Table.Th>
              <Table.Th>Sipariş Denemesi</Table.Th>
              <Table.Th>Durum</Table.Th>
              <Table.Th>Oluşturulma Tarihi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.carts.map((cart, index) => {
              const label = getCartStatusLabel(cart.status);
              const color = getCartStatusColor(cart.status);

              return (
                <Table.Tr
                  key={cart.id}
                  onClick={() => {
                    push(`/admin/carts/${cart.id}` as Route);
                  }}
                >
                  <Table.Td>
                    {cart.user?.name} {cart.user?.surname}
                  </Table.Td>
                  <Table.Td>{cart.user?.email}</Table.Td>
                  <Table.Td>{cart._count.items}</Table.Td>
                  <Table.Td>{cart._count.orderAttempts}</Table.Td>
                  <Table.Td>
                    <Badge color={color}>{label}</Badge>
                  </Table.Td>
                  <Table.Td>
                    {DateFormatter.withTime(cart.createdAt, cart.locale)}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {data && data.pagination && (
        <CustomPagination total={data.pagination.totalPages} />
      )}
    </Stack>
  );
};

export default AdminCartsPage;
