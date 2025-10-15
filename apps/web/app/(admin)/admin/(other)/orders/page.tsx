"use client";
import CustomPagination from "@/components/CustomPagination";
import CustomSearchInput from "@/components/CustomSearchInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import {
  getOrderStatusColor,
  getOrderStatusInfos,
  getOrderStatusPageLabel,
  getPaymentStatusColor,
  getPaymentStatusInfos,
} from "@lib/helpers";
import {
  ActionIcon,
  Badge,
  Divider,
  Group,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import {
  DateFormatter,
  getOrderStatusFromInt,
  getOrderStatusInt,
  getPaymentStatusInt,
  useQuery,
} from "@repo/shared";
import { $Enums, GetOrdersReturnType } from "@repo/types";
import { IconFileDescriptionFilled } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";

const AdminOrdersPage = () => {
  const { replace, push } = useRouter();
  const params = useSearchParams();
  const page = parseInt(params.get("page") || "1", 10) || 1;
  const osParam = params.get("os")
    ? parseInt(params.get("os") as string, 10)
    : undefined;
  const psParam = params.get("ps")
    ? parseInt(params.get("ps") as string, 10)
    : undefined;
  const search = params.get("search") || undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", { osParam, psParam, search, page }],
    queryFn: async ({ pageParam }) => {
      const res = await fetchWrapper.post<GetOrdersReturnType>(
        "/admin/orders/get-orders",
        {
          page: pageParam || 1,
          ...(osParam !== undefined && { orderStatus: osParam }),
          ...(psParam !== undefined && { paymentStatus: psParam }),
          ...(search && { search }),
        }
      );
      if (!res.success || !res.data.success || !res.data.orders) {
        return null;
      }
      return res.data;
    },
  });

  return (
    <Stack gap={"xl"}>
      {isLoading && <GlobalLoadingOverlay />}
      <Stack gap={"xs"}>
        <Tabs
          variant="pills"
          value={osParam ? getOrderStatusFromInt(osParam) : "all"}
          onChange={(val) => {
            const pageSearchParams = new URLSearchParams(params.toString());
            if (val === "all") {
              pageSearchParams.delete("os");
            } else {
              const statusInt = getOrderStatusInt(val as $Enums.OrderStatus);
              pageSearchParams.set("os", statusInt.toString());
            }
            pageSearchParams.delete("page");
            replace(`?${pageSearchParams.toString()}`);
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="all">Tümü</Tabs.Tab>
            {Object.entries($Enums.OrderStatus).map(([key, value]) => (
              <Tabs.Tab key={key} value={value}>
                {getOrderStatusPageLabel(value)}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
        <Divider my={"xs"} />
        <Group gap={"xl"} justify="space-between">
          <Title order={3}>Siparişler</Title>
          <Group gap={"md"}>
            <Select
              data={[
                { label: "Tümü", value: "all" },
                ...Object.values($Enums.PaymentStatus).map((data) => ({
                  label: getPaymentStatusInfos(data),
                  value: getPaymentStatusInt(data).toString(),
                })),
              ]}
              placeholder="Ödeme Durumu"
              allowDeselect={false}
              defaultValue={psParam?.toString() || "all"}
              onChange={(e) => {
                if (e === "all") {
                  const pageSearchParams = new URLSearchParams(
                    params.toString()
                  );
                  pageSearchParams.delete("ps");
                  pageSearchParams.delete("page");
                  replace(`?${pageSearchParams.toString()}`);
                } else {
                  const pageSearchParams = new URLSearchParams(
                    params.toString()
                  );
                  pageSearchParams.set("ps", e || "all");
                  pageSearchParams.delete("page");
                  replace(`?${pageSearchParams.toString()}`);
                }
              }}
            />
            <CustomSearchInput
              variant="filled"
              placeholder="Tabloda Arama Yapın"
            />
          </Group>
        </Group>
      </Stack>
      <Table.ScrollContainer minWidth={800}>
        <Table
          highlightOnHover
          highlightOnHoverColor="admin.0"
          verticalSpacing={"md"}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Sipariş Numarası</Table.Th>
              <Table.Th>Tarih</Table.Th>
              <Table.Th>Müşteri</Table.Th>
              <Table.Th>Sipariş Durumu</Table.Th>
              <Table.Th>Ödeme Durumu</Table.Th>
              <Table.Th w={24} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.orders &&
              data?.orders.length > 0 &&
              data.orders.map((order) => (
                <Table.Tr
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => push(`/admin/orders/${order.orderNumber}`)}
                >
                  <Table.Td w="18%">
                    <Group gap={"xs"} align="center">
                      <Text fw={700} fz={"md"}>
                        {order.orderNumber}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{DateFormatter.withTime(order.createdAt)}</Table.Td>
                  <Table.Td>
                    {order.user ? (
                      <Text tt={"capitalize"}>
                        {order.user.name + " " + order.user.surname}
                      </Text>
                    ) : (
                      <Text>Bilinmiyor</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={getOrderStatusColor(order.orderStatus)}
                      variant="filled"
                      radius={"sm"}
                      size="md"
                    >
                      {getOrderStatusInfos(order.orderStatus)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={getPaymentStatusColor(order.paymentStatus)}
                      variant="light"
                      radius={"sm"}
                      size="md"
                    >
                      {getPaymentStatusInfos(order.paymentStatus)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="transparent"
                      size={"lg"}
                      onClick={(e) => {
                        e.stopPropagation();
                        push(`/admin/orders/${order.orderNumber}`);
                      }}
                    >
                      <IconFileDescriptionFilled />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {data?.pagination && data.pagination.totalItems > 0 && (
        <CustomPagination total={data.pagination.totalPages} />
      )}
    </Stack>
  );
};

export default AdminOrdersPage;
