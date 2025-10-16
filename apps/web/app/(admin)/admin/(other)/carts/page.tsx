"use client";
import CustomDateInputs from "@/(admin)/components/CustomDateInputs";
import CustomSearchInput from "@/components/CustomSearchInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { getCartStatusLabel } from "@lib/helpers";
import { Divider, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { useQuery, $Enums } from "@repo/shared";
import { useRouter, useSearchParams } from "next/navigation";
import CartsTable from "./components/CartsTable";
import StatusIndicators from "./components/StatusIndicators";
import { AdminCartTableData } from "@repo/types";
import CustomPagination from "@/components/CustomPagination";
import { IconShoppingBag } from "@tabler/icons-react";
import fetchWrapper from "@lib/fetchWrapper";

const AdminCartsPage = () => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const status = searchParams.get("status") || null;
  const search = searchParams.get("search") || null;
  const startDate = searchParams.get("startDate") || null;
  const endDate = searchParams.get("endDate") || null;
  const page = parseInt(searchParams.get("page") as string) || 1;
  const { data, isLoading, isPending } = useQuery({
    queryKey: [
      "carts-admin-list",
      { status, search, startDate, endDate, page },
    ],
    queryFn: async () => {
      const params = {
        status: status && status !== "all" ? status : undefined,
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: page,
      };

      const req = await fetchWrapper.get<{
        carts: AdminCartTableData[];
        success: boolean;
        message: string;
        pagination?: {
          totalItems: number;
          totalPages: number;
          currentPage: number;
          itemsPerPage: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      }>(`/cart-v2/admin-cart-list`, {
        params,
      });
      if (!req.success) {
        throw new Error("Failed to fetch carts");
      }
      return req.data;
    },
  });

  if (isLoading || isPending) {
    return <GlobalLoadingOverlay />;
  }
  if (!data || !data.success) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Stack gap={"lg"} align="center">
          <ThemeIcon variant="transparent" color="dimmed" size={"xl"}>
            <IconShoppingBag size={42} />
          </ThemeIcon>
          <Text fz={"lg"} c={"dimmed"}>
            Mağazanızda herhangi bir oluşturulmuş sepet bulunmamaktadır.
          </Text>
        </Stack>
      </div>
    );
  }

  const activeFilterExists =
    status !== null || !!search || !!startDate || !!endDate;
  return (
    <div className="flex flex-col gap-3 p-4">
      <Group justify="space-between" align="center">
        <Title order={4}>Sepetler</Title>
        <Group gap={"xs"} align="end">
          <CustomDateInputs
            defaultStartDate={startDate ? new Date(startDate) : null}
            defaultEndDate={endDate ? new Date(endDate) : null}
            onDateChange={(start, endDate) => {
              const params = new URLSearchParams(searchParams.toString());
              if (start) {
                params.set("startDate", start.toISOString());
              } else {
                params.delete("startDate");
              }
              if (endDate) {
                params.set("endDate", endDate.toISOString());
              } else {
                params.delete("endDate");
              }
              replace(`?${params.toString()}`);
            }}
          />
          <CustomSearchInput />
        </Group>
      </Group>
      <Group className="w-full" align="center">
        <StatusIndicators
          defaultValue="all"
          queryKey="status"
          value={searchParams.get("status") || "all"}
          onChange={(value) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === "all") {
              params.delete("status");
            } else {
              params.set("status", value as $Enums.CartStatus);
            }
            replace(`?${params.toString()}`);
          }}
          data={[
            { name: "Hepsi", slug: "all" },
            ...Object.values($Enums.CartStatus).map((status) => ({
              name: getCartStatusLabel(status),
              slug: status,
            })),
          ]}
        />
      </Group>
      <Divider />
      <CartsTable data={data.carts} activeFilters={activeFilterExists} />
      {data.pagination && data.pagination?.totalPages > 1 && (
        <CustomPagination total={data.pagination?.totalPages} />
      )}
    </div>
  );
};

export default AdminCartsPage;
