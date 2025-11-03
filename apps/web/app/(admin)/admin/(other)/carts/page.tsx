"use client";
import CustomPagination from "@/components/CustomPagination";
import CustomSearchInput from "@/components/CustomSearchInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper, { ApiError } from "@lib/fetchWrapper";
import { getCartStatusColor, getCartStatusLabel } from "@lib/helpers";
import { Badge, Button, Group, Stack, Table, Text, Title } from "@mantine/core";
import { useQuery } from "@repo/shared";
import { GetAllCartsReturnType } from "@repo/types";
import { useRouter, useSearchParams } from "next/navigation";
import CustomDateFilters from "../components/CustomDateFilters";

const AdminCartsPage = () => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  const search = (searchParams.get("search") as string) || null;
  const page = parseInt((searchParams.get("page") as string) || "1", 10);
  const limit = parseInt((searchParams.get("limit") as string) || "10", 10);
  const startDate = searchParams.get("startDate") || null;
  const endDate = searchParams.get("endDate") || null;

  const hasActiveFilters = !!(search || startDate || endDate || page > 1);

  const { isLoading, data } = useQuery({
    queryKey: ["admin-user-carts", { page, limit, search, startDate, endDate }],
    queryFn: async () => {
      const response = await fetchWrapper.get<GetAllCartsReturnType>(
        "/admin/carts",
        {
          params: { page, limit, search, startDate, endDate },
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

  if (data && data.carts.length === 0 && hasActiveFilters) {
    return (
      <Stack gap={"lg"}>
        <Group justify="space-between" align="center">
          <Group>
            <Title order={3}>Kullanıcı Sepetleri</Title>
          </Group>
          <Group gap={"xs"}>
            <CustomDateFilters />
            <CustomSearchInput />
          </Group>
        </Group>
        <Stack align="center" gap="md" py="xl">
          <Text size="lg" c="dimmed">
            Arama kriterlerinize uygun sepet bulunamadı.
          </Text>
          <Button onClick={clearFilters} variant="light">
            Parametreleri Temizle
          </Button>
        </Stack>
      </Stack>
    );
  }

  if (data && data.carts.length === 0 && !hasActiveFilters) {
    return (
      <Stack gap={"lg"}>
        <Group justify="space-between" align="center">
          <Group>
            <Title order={3}>Kullanıcı Sepetleri</Title>
          </Group>
          <Group gap={"xs"}>
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

  return (
    <Stack gap={"lg"}>
      <Group justify="space-between" align="center">
        <Group>
          <Title order={3}>Kullanıcı Sepetleri</Title>
        </Group>
        <Group gap={"xs"}>
          <CustomDateFilters />
          <CustomSearchInput />
        </Group>
      </Group>

      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing={"lg"}>
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
            {data?.carts.map((cart) => {
              const label = getCartStatusLabel(cart.status);
              const color = getCartStatusColor(cart.status);

              return (
                <Table.Tr key={cart.id}>
                  <Table.Td>
                    {cart.user?.name} {cart.user?.surname}
                  </Table.Td>
                  <Table.Td>{cart.user?.email}</Table.Td>
                  <Table.Td>{cart._count.items}</Table.Td>
                  <Table.Td>{cart._count.orderAttempts}</Table.Td>
                  <Table.Td>
                    <Badge color={color}>{label}</Badge>
                  </Table.Td>
                  <Table.Td>{new Date().toLocaleDateString("tr-TR")}</Table.Td>
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
