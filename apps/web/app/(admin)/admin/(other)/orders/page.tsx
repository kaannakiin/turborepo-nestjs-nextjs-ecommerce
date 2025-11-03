"use client";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomPagination from "@/components/CustomPagination";
import CustomSearchInput from "@/components/CustomSearchInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper, { ApiError } from "@lib/fetchWrapper";
import {
  ActionIcon,
  Alert,
  Badge,
  Divider,
  Group,
  HoverCard,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  DateFormatter,
  getOrderStatusBadge,
  getOrderStatusOptions,
  useQuery,
} from "@repo/shared";
import { AdminGetOrdersReturnType } from "@repo/types";
import {
  IconAddressBook,
  IconAlertCircle,
  IconEye,
  IconInbox,
  IconSearch,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminOrderAddressCard from "./components/AdminOrderAddressCard";
import AdminOrderItemCard from "./components/AdminOrderItemCard";

const AdminOrdersPage = () => {
  const searchParams = useSearchParams();
  const { replace, push } = useRouter();

  const hasFilters = searchParams.has("status") || searchParams.has("search");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-orders", searchParams.toString()],
    queryFn: async () => {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.has("page")) {
        params.set("page", "1");
      }
      if (!params.has("limit")) {
        params.set("limit", "10");
      }

      const res = await fetchWrapper.get<AdminGetOrdersReturnType>(
        `/admin/orders?${params.toString()}`
      );

      if (res.success) {
        return res.data;
      }

      const errorResponse = res as ApiError;
      throw new Error(errorResponse.error || "Bilinmeyen bir hata oluştu");
    },
    gcTime: 0,
    staleTime: 0,
  });

  if (error) {
    return (
      <Stack gap="md">
        <Group className="w-full" align="center" justify="space-between">
          <Title order={2}>Siparişler</Title>
        </Group>
        <Divider />
        <Alert
          icon={<IconAlertCircle size={20} />}
          title="Hata Oluştu"
          color="red"
          variant="filled"
        >
          {error instanceof Error
            ? error.message
            : "Siparişler yüklenirken bir hata oluştu. Lütfen tekrar deneyin."}
        </Alert>
      </Stack>
    );
  }

  if (!isLoading && data?.orders && data.orders.length === 0 && !hasFilters) {
    return (
      <Stack gap="md">
        <Group className="w-full" align="center" justify="space-between">
          <Title order={2}>Siparişler</Title>
          <Group align="center" gap="md">
            <Select
              value={searchParams.get("status") || "all"}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("page");
                if (e && e !== "all") {
                  params.set("status", e);
                } else {
                  params.delete("status");
                }
                replace(`?${params.toString()}`);
              }}
              data={[
                { value: "all", label: "Tümü" },
                ...getOrderStatusOptions(),
              ]}
            />
            <CustomSearchInput />
          </Group>
        </Group>
        <Divider />
        <Stack align="center" justify="center" gap="md" py={60}>
          <IconInbox size={64} stroke={1.5} color="gray" />
          <Title order={3} c="dimmed">
            Henüz sipariş yok
          </Title>
          <Text c="dimmed" size="sm">
            İlk siparişiniz oluşturulduğunda burada görünecektir.
          </Text>
        </Stack>
      </Stack>
    );
  }

  if (!isLoading && data?.orders && data.orders.length === 0 && hasFilters) {
    return (
      <Stack gap="md">
        <Group className="w-full" align="center" justify="space-between">
          <Title order={2}>Siparişler</Title>
          <Group align="center" gap="md">
            <Select
              value={searchParams.get("status") || "all"}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("page");
                if (e && e !== "all") {
                  params.set("status", e);
                } else {
                  params.delete("status");
                }
                replace(`?${params.toString()}`);
              }}
              data={[
                { value: "all", label: "Tümü" },
                ...getOrderStatusOptions(),
              ]}
            />
            <CustomSearchInput />
          </Group>
        </Group>
        <Divider />
        <Stack align="center" justify="center" gap="md" py={60}>
          <IconSearch size={64} stroke={1.5} color="gray" />
          <Title order={3} c="dimmed">
            Sonuç bulunamadı
          </Title>
          <Text c="dimmed" size="sm">
            Arama kriterlerinize uygun sipariş bulunamadı. Lütfen farklı
            filtreler deneyin.
          </Text>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {isLoading && <GlobalLoadingOverlay />}
      <Group className="w-full" align="center" justify="space-between">
        <Title order={2}>Siparişler</Title>
        <Group align="center" gap="md">
          <Select
            value={searchParams.get("status") || "all"}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("page");
              if (e && e !== "all") {
                params.set("status", e);
              } else {
                params.delete("status");
              }
              replace(`?${params.toString()}`);
            }}
            data={[{ value: "all", label: "Tümü" }, ...getOrderStatusOptions()]}
          />
          <CustomSearchInput />
        </Group>
      </Group>

      <Table.ScrollContainer minWidth={800}>
        <Table
          highlightOnHover
          highlightOnHoverColor="admin.0"
          verticalSpacing={"md"}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Sipariş No</Table.Th>
              <Table.Th>Müşteri</Table.Th>
              <Table.Th>Ürünler</Table.Th>
              <Table.Th>Toplam</Table.Th>
              <Table.Th>Durum</Table.Th>
              <Table.Th>Tarih</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.orders?.map((order) => {
              const { label, color } = getOrderStatusBadge(order.orderStatus);

              const shippingAddress = order.shippingAddressSnapshot;
              const billingAddress = order.billingAddressSnapshot;

              return (
                <Table.Tr key={order.id}>
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {order.orderNumber}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text size="sm" fw={500}>
                        {order.user?.name} {order.user?.surname}
                      </Text>
                      {order.user?.email && (
                        <Text size="xs" c="dimmed">
                          {order.user.email}
                        </Text>
                      )}
                      {order.user?.phone && (
                        <Text size="xs" c="dimmed">
                          {order.user.phone}
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td className="text-left">
                    <Stack gap={4}>
                      <HoverCard shadow="md" withArrow openDelay={200}>
                        <HoverCard.Target>
                          <Text fz={"md"} style={{ cursor: "pointer" }}>
                            {order.itemSchema.length} ürün
                          </Text>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                          <ScrollArea h={400} scrollbarSize={4}>
                            <Stack gap={"md"} px={"xs"}>
                              {order.itemSchema.map((item) => (
                                <AdminOrderItemCard
                                  key={item.id}
                                  item={item}
                                  locale={order.locale}
                                  currency={order.currency}
                                />
                              ))}
                            </Stack>
                          </ScrollArea>
                        </HoverCard.Dropdown>
                      </HoverCard>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <ProductPriceFormatter
                        price={order.totalFinalPrice}
                        currency={order.currency}
                      />
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={color}>
                      {label}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{DateFormatter.withTime(order.createdAt)}</Table.Td>
                  <Table.Td>
                    <Group align="center" gap="xs">
                      <Tooltip label="Siparişi Görüntüle">
                        <ActionIcon
                          variant="subtle"
                          onClick={() => {
                            push(`/admin/orders/${order.orderNumber}`);
                          }}
                        >
                          <IconEye />
                        </ActionIcon>
                      </Tooltip>

                      <HoverCard
                        shadow="md"
                        withArrow
                        openDelay={200}
                        width={500}
                      >
                        <HoverCard.Target>
                          <Tooltip label="Adres Bilgileri">
                            <ActionIcon variant="subtle">
                              <IconAddressBook />
                            </ActionIcon>
                          </Tooltip>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                          <Stack gap="md">
                            {shippingAddress && (
                              <AdminOrderAddressCard
                                shippingAddress={shippingAddress}
                              />
                            )}

                            {billingAddress && (
                              <AdminOrderAddressCard
                                shippingAddress={billingAddress}
                                isBilling={true}
                                title="Fatura Adresi"
                              />
                            )}

                            {!shippingAddress && !billingAddress && (
                              <Text size="sm" c="dimmed" ta="center">
                                Adres bilgisi bulunamadı
                              </Text>
                            )}
                          </Stack>
                        </HoverCard.Dropdown>
                      </HoverCard>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <CustomPagination total={data.pagination.totalPages} />
      )}
    </Stack>
  );
};

export default AdminOrdersPage;
