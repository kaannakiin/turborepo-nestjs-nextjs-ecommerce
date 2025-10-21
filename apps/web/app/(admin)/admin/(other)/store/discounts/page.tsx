"use client";

import CustomSearchInput from "@/components/CustomSearchInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import { getDiscountTypeLabel } from "@lib/helpers";
import {
  ActionIcon,
  Button,
  Group,
  Select,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import { $Enums } from "@repo/database";
import { DateFormatter, useQuery } from "@repo/shared";
import { GetAllDiscountReturnType } from "@repo/types";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";

const AdminDiscountsPage = () => {
  const searchParams = useSearchParams();
  const { push, replace } = useRouter();
  const typeParam = searchParams.get("type") as $Enums.DiscountType | null;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const { data, isLoading } = useQuery({
    queryKey: [
      "admin-discounts",
      { ...(typeParam ? { type: typeParam } : {}), page },
    ],
    queryFn: async () => {
      const res = await fetchWrapper.get<GetAllDiscountReturnType>(
        `/admin/discounts/get-discounts?${new URLSearchParams({
          ...(typeParam ? { type: typeParam } : {}),
          page: page.toString(),
        })}`
      );
      if (!res.success) {
        throw new Error("Failed to fetch discounts");
      }
      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      return res.data;
    },
  });
  if (isLoading) {
    return <GlobalLoadingOverlay />;
  }

  if (!data) {
    return <div></div>;
  }
  const { data: discounts, pagination } = data;

  return (
    <>
      <Stack gap={"md"}>
        <Group justify="space-between" align="center">
          <Title order={3}>İndirimler</Title>
          <Group gap={"sm"}>
            <Button
              variant="outline"
              onClick={() => {
                push("/admin/store/discounts/new");
              }}
            >
              Yeni İndirim Oluştur
            </Button>
            <Select
              data={Object.values($Enums.DiscountType).map((type) => ({
                label: getDiscountTypeLabel(type),
                value: type,
              }))}
              variant="filled"
              rightSectionPointerEvents="all"
              value={typeParam || undefined}
              onChange={(value) => {
                const params = new URLSearchParams(searchParams.toString());
                if (value) {
                  params.set("type", value);
                } else {
                  params.delete("type");
                }
                replace(`?${params.toString()}`);
              }}
            />
            <CustomSearchInput variant="filled" />
          </Group>
        </Group>
        <Table.ScrollContainer minWidth={800}>
          <Table
            verticalSpacing={"sm"}
            highlightOnHover
            highlightOnHoverColor="admin.0"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Başlık</Table.Th>
                <Table.Th>Tür</Table.Th>
                <Table.Th>Kullanılan</Table.Th>
                <Table.Th>Tarih</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {discounts &&
                discounts.length > 0 &&
                discounts.map((discount) => (
                  <Table.Tr key={discount.id}>
                    <Table.Td>{discount.title}</Table.Td>
                    <Table.Td>{getDiscountTypeLabel(discount.type)}</Table.Td>
                    <Table.Td>
                      {discount._count.usages > 0
                        ? discount._count.usages
                        : "Kullanılmadı"}
                    </Table.Td>
                    <Table.Td>
                      {DateFormatter.withTime(discount.createdAt)}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={"sm"}>
                        <ActionIcon
                          variant="transparent"
                          onClick={() => {
                            push(`/admin/store/discounts/${discount.id}`);
                          }}
                        >
                          <IconEdit />
                        </ActionIcon>
                        <ActionIcon variant="transparent" color="red">
                          <IconTrash />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Stack>
    </>
  );
};

export default AdminDiscountsPage;
