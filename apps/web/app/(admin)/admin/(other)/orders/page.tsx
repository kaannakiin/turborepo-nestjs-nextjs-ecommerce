"use client";
import CustomSearchInput from "@/components/CustomSearchInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import {
  getOrderStatusInfos,
  getOrderStatusPageLabel,
  getPaymentStatusInfos,
} from "@lib/helpers";
import {
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
import { GetOrderReturnType } from "@repo/types";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useRouter, useSearchParams } from "next/navigation";
import {
  $Enums,
  OrderStatus,
} from "../../../../../../../packages/database/generated/prisma";

ModuleRegistry.registerModules([AllCommunityModule]);

const AdminOrdersPage = () => {
  const { refresh, replace } = useRouter();
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
      const res = await fetchWrapper.post<GetOrderReturnType>(
        "/admin/orders/get-orders",
        {
          body: JSON.stringify({
            page: pageParam || 1,
            ...(osParam !== undefined && { orderStatus: osParam }),
            ...(psParam !== undefined && { paymentStatus: psParam }),
            ...(search && { search }),
          }),
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
              const statusInt = getOrderStatusInt(val as OrderStatus);
              pageSearchParams.set("os", statusInt.toString());
            }
            pageSearchParams.delete("page");
            replace(`?${pageSearchParams.toString()}`);
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="all">Tümü</Tabs.Tab>
            {Object.entries(OrderStatus).map(([key, value]) => (
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
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.orders &&
              data?.orders.length > 0 &&
              data.orders.map((order) => (
                <Table.Tr key={order.id}>
                  <Table.Td>{order.orderNumber}</Table.Td>
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
                  <Table.Td>{getOrderStatusInfos(order.orderStatus)}</Table.Td>
                  <Table.Td>
                    {getPaymentStatusInfos(order.paymentStatus)}
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
};

export default AdminOrdersPage;
