"use client";

import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Modal,
  Popover,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { DateFormatter, useQuery } from "@repo/shared";
import { Cuid2ZodType, DiscountTableData } from "@repo/types";
import {
  IconChevronRight,
  IconEdit,
  IconInfoCircle,
  IconSparkles,
  IconTicket,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  getCouponGenerationTypeLabel,
  getCouponGenerationTypeTooltip,
  getDiscountTypeLabel,
} from "../../../../../../lib/helpers";
import CustomSearchInput from "../../../../../components/CustomSearchInput";
import GlobalLoadingOverlay from "../../../../../components/GlobalLoadingOverlay";
import DiscountGenericTypeModal from "./DiscountGenericTypeModal";

const DiscountTable = () => {
  const searchParams = useSearchParams();
  const search = (searchParams.get("search") as string) || "";
  const page = parseInt(searchParams.get("page") as string) || 1;
  const { push } = useRouter();
  const [opened, { open, close }] = useDisclosure();
  const [openedDiscountPopover, setOpenedDiscountPopover] = useState<
    Record<Cuid2ZodType, boolean>
  >({});
  const [loading, setLoading] = useState(false);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["discounts-for-admin", search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (page) params.append("page", page.toString());
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/discounts/get-all-discounts-for-admin?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch discounts");
      const data = (await response.json()) as {
        discounts: DiscountTableData[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
      };
      return data;
    },
    refetchOnWindowFocus: false,
    gcTime: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <Stack gap={"lg"}>
        {(isFetching || isLoading || loading) && <GlobalLoadingOverlay />}
        <Group justify="space-between" align="center">
          <Title order={4}>İndirim ve Kampanyalar</Title>
          <Group gap={"md"} align="center">
            <Button onClick={open} variant="subtle">
              Yeni İndirim Ekle
            </Button>
            <CustomSearchInput />
          </Group>
        </Group>
        <Table.ScrollContainer minWidth={800}>
          <Table
            verticalSpacing={"md"}
            highlightOnHover
            highlightOnHoverColor="admin.0"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>İndirim Başlığı</Table.Th>
                <Table.Th>İndirim Türü</Table.Th>
                <Table.Th>Kullanım</Table.Th>
                <Table.Th>Oluşturulma Tarihi</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data &&
                data.discounts.length > 0 &&
                data.discounts.map((discount) => (
                  <Table.Tr key={discount.id}>
                    <Table.Td>
                      {discount.translations.find((t) => t.locale === "TR")
                        ?.discountTitle ||
                        discount.translations[0]?.discountTitle ||
                        "Başlıksız İndirim"}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={"xs"}>
                        <Text fz={"sm"}>
                          {getDiscountTypeLabel(discount.type)}
                        </Text>
                        <Tooltip
                          className="cursor-pointer"
                          label={getCouponGenerationTypeTooltip(
                            discount.couponGeneration
                          )}
                        >
                          <Badge>
                            {getCouponGenerationTypeLabel(
                              discount.couponGeneration
                            )}
                          </Badge>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                    <Table.Td>{discount._count.usage}</Table.Td>
                    <Table.Td>
                      {DateFormatter.withTime(discount.createdAt)}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={"xs"} align="center">
                        <ActionIcon
                          onClick={() => {
                            push(`/admin/store/discounts/${discount.id}`);
                          }}
                          variant="transparent"
                          size={"sm"}
                        >
                          <IconEdit />
                        </ActionIcon>
                        <Popover
                          opened={openedDiscountPopover[discount.id]}
                          onChange={(open) => {
                            setOpenedDiscountPopover((prev) => ({
                              ...prev,
                              [discount.id]: open,
                            }));
                          }}
                        >
                          <Popover.Target>
                            <ActionIcon
                              variant="subtle"
                              c={"red"}
                              color="red"
                              size={"sm"}
                              onClick={() => {
                                setOpenedDiscountPopover((prev) => ({
                                  ...prev,
                                  [discount.id]: true,
                                }));
                              }}
                            >
                              <IconTrash />
                            </ActionIcon>
                          </Popover.Target>
                          <Popover.Dropdown>
                            <Stack gap={"sm"}>
                              <Text size="sm">
                                Bu indirimi silmek istediğinize emin misiniz?
                              </Text>
                              <Group justify="flex-end" gap={"xs"}>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => {
                                    setOpenedDiscountPopover((prev) => ({
                                      ...prev,
                                      [discount.id]: false,
                                    }));
                                  }}
                                >
                                  İptal
                                </Button>
                                <Button
                                  variant="filled"
                                  color="red"
                                  size="xs"
                                  onClick={async () => {
                                    try {
                                      setLoading(true);
                                      const response = await fetch(
                                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/discounts/delete-discount/${discount.id}`,
                                        {
                                          method: "DELETE",
                                          credentials: "include",
                                        }
                                      );
                                      if (!response.ok) {
                                        const error = await response.text();
                                        notifications.show({
                                          message:
                                            error ||
                                            "İndirim silinirken bir hata oluştu",
                                          color: "red",
                                          autoClose: 3000,
                                          icon: <IconX color="red" />,
                                        });
                                        return;
                                      }
                                      setOpenedDiscountPopover((prev) => ({
                                        ...prev,
                                        [discount.id]: false,
                                      }));
                                      notifications.show({
                                        message: "İndirim başarıyla silindi",
                                        color: "green",
                                        autoClose: 3000,
                                      });
                                      refetch();
                                    } catch (error) {
                                      console.error(error);
                                    } finally {
                                      setLoading(false);
                                    }
                                  }}
                                >
                                  Sil
                                </Button>
                              </Group>
                            </Stack>
                          </Popover.Dropdown>
                        </Popover>
                        <Badge
                          c={discount.isActive ? "green" : "red"}
                          variant="light"
                        >
                          {discount.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Stack>
      <DiscountGenericTypeModal onClose={close} opened={opened} />
    </>
  );
};

export default DiscountTable;
