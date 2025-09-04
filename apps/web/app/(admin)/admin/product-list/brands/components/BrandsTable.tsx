"use client";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Group,
  Popover,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import {
  DateFormatter,
  useMutation,
  useQuery,
  useQueryClient,
} from "@repo/shared";
import { $Enums, AdminBrandTableData, BrandsResponse } from "@repo/types";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import CustomPagination from "../../../../../components/CustomPagination";
import CustomSearchInput from "../../../../../components/CustomSearchInput";
import GlobalLoadingOverlay from "../../../../../components/GlobalLoadingOverlay";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import TableAsset from "../../../../components/TableAsset";

const BrandsTable = () => {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const queryClient = useQueryClient();

  const [openedDeletePopover, setOpenedDeletePopover] = useState<
    Record<string, boolean>
  >({});

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [
      "admin-brands",
      searchParams.get("search") || undefined,
      parseInt(searchParams.get("page") as string) || 1,
    ],
    queryFn: async ({ queryKey }) => {
      const [, search, page] = queryKey;
      const params = new URLSearchParams();
      if (search) params.set("search", search as string);
      params.set("page", page.toString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/brands/get-all-brands?${params}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch brands: ${response.status}`);
      }

      return response.json() as Promise<BrandsResponse>;
    },
    refetchOnWindowFocus: false,
    gcTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 30, // 30 seconds
  });

  // Delete mutation
  const deleteBrandMutation = useMutation({
    mutationFn: async (brandId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/brands/delete-brand/${brandId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to delete brand: ${response.status}`
        );
      }

      return response.json();
    },
    onSuccess: (data, brandId) => {
      // Close popover
      setOpenedDeletePopover((prev) => ({
        ...prev,
        [brandId]: false,
      }));

      // Show success notification
      notifications.show({
        title: "Başarılı",
        message: data.message || "Marka başarıyla silindi",
        color: "green",
        autoClose: 3000,
      });

      // Invalidate and refetch brands
      queryClient.invalidateQueries({
        queryKey: ["admin-brands"],
      });
    },
    onError: (error: Error, brandId) => {
      setOpenedDeletePopover((prev) => ({
        ...prev,
        [brandId]: false,
      }));

      // Show error notification
      notifications.show({
        title: "Hata",
        message: error.message || "Marka silinirken bir hata oluştu",
        color: "red",
        autoClose: 5000,
      });
    },
  });

  const getBrandName = (
    brand:
      | Pick<AdminBrandTableData, "translations">
      | Pick<AdminBrandTableData["parentBrand"], "translations">,
    locale: $Enums.Locale = "TR"
  ) => {
    if (!brand || !brand.translations) return "İsimsiz Marka";
    const translation = brand.translations.find((t) => t.locale === locale);
    return translation?.name || brand.translations[0]?.name || "İsimsiz Marka";
  };

  const handleDeleteBrand = (brandId: string) => {
    deleteBrandMutation.mutate(brandId);
  };

  if (isError) {
    return (
      <Stack gap="lg" align="center" py="xl">
        <Text c="red" size="lg">
          Markalar yüklenirken bir hata oluştu
        </Text>
        <Button variant="light" onClick={() => window.location.reload()}>
          Tekrar Dene
        </Button>
      </Stack>
    );
  }

  return (
    <>
      {(isLoading || isFetching || deleteBrandMutation.isPending) && (
        <GlobalLoadingOverlay />
      )}

      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={4}>Markalar</Title>
          <Group gap="lg">
            <Button component={Link} href="/admin/product-list/brands/new">
              Yeni Marka Ekle
            </Button>
            <CustomSearchInput />
          </Group>
        </Group>

        <Table.ScrollContainer minWidth={800}>
          <Table
            striped
            highlightOnHover
            highlightOnHoverColor="admin.0"
            verticalSpacing={"md"}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Resim</Table.Th>
                <Table.Th>Marka Adı</Table.Th>
                <Table.Th>Ebeveyn Marka</Table.Th>
                <Table.Th>Alt Markalar</Table.Th>
                <Table.Th>Ürün Sayısı</Table.Th>
                <Table.Th>Oluşturulma Tarihi</Table.Th>
                <Table.Th>İşlemler</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.data.map((brand) => (
                <Table.Tr key={brand.id}>
                  <Table.Td>
                    <TableAsset type="IMAGE" url={brand.image?.url} />
                  </Table.Td>

                  <Table.Td>
                    <Text fw={500}>{getBrandName(brand)}</Text>
                  </Table.Td>

                  <Table.Td>
                    {brand.parentBrand ? (
                      <Text size="sm" c="dimmed">
                        {getBrandName(brand.parentBrand, "TR")}
                      </Text>
                    ) : (
                      <Text size="sm" c="dimmed" fs="italic">
                        Ana Marka
                      </Text>
                    )}
                  </Table.Td>

                  <Table.Td>
                    <Badge variant="light" size="sm">
                      {brand._count?.childBrands || 0}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Badge variant="outline" size="sm">
                      {brand._count?.products || 0}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {DateFormatter.shortDateTime(brand.createdAt)}
                    </Text>
                  </Table.Td>

                  <Table.Td align="center">
                    <Group gap="xs">
                      <ActionIcon
                        size={"sm"}
                        variant="transparent"
                        onClick={() =>
                          push(`/admin/product-list/brands/${brand.id}`)
                        }
                      >
                        <IconEdit />
                      </ActionIcon>

                      <Popover
                        opened={openedDeletePopover[brand.id] || false}
                        onClose={() =>
                          setOpenedDeletePopover((prev) => ({
                            ...prev,
                            [brand.id]: false,
                          }))
                        }
                        withArrow
                        position="bottom"
                        disabled={deleteBrandMutation.isPending}
                      >
                        <Popover.Target>
                          <ActionIcon
                            size={"sm"}
                            variant="transparent"
                            c={"red"}
                            onClick={() => {
                              setOpenedDeletePopover((prev) => ({
                                ...prev,
                                [brand.id]: !prev[brand.id],
                              }));
                            }}
                            disabled={deleteBrandMutation.isPending}
                          >
                            <IconTrash />
                          </ActionIcon>
                        </Popover.Target>

                        <Popover.Dropdown>
                          <Stack gap="sm">
                            <Text size="sm">
                              <Text fw={600} span>
                                &quot;{getBrandName(brand)}&quot;
                              </Text>{" "}
                              markasını silmek istediğinize emin misiniz?
                            </Text>

                            {brand._count?.products > 0 && (
                              <Text size="xs" c="orange">
                                ⚠️ Bu markaya bağlı {brand._count.products} ürün
                                var. Ürünlerin marka bağlantısı kaldırılacak.
                              </Text>
                            )}

                            {brand._count?.childBrands > 0 && (
                              <Text size="xs" c="blue">
                                ℹ️ {brand._count.childBrands} alt marka ana
                                marka yapılacak.
                              </Text>
                            )}

                            <Group justify="flex-end" gap="xs" mt="sm">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                  setOpenedDeletePopover((prev) => ({
                                    ...prev,
                                    [brand.id]: false,
                                  }))
                                }
                                disabled={deleteBrandMutation.isPending}
                              >
                                İptal
                              </Button>
                              <Button
                                size="xs"
                                color="red"
                                onClick={() => handleDeleteBrand(brand.id)}
                                loading={deleteBrandMutation.isPending}
                              >
                                Sil
                              </Button>
                            </Group>
                          </Stack>
                        </Popover.Dropdown>
                      </Popover>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}

              {data?.data.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text ta="center" c="dimmed" py="xl">
                      {searchParams.get("search")
                        ? "Arama kriterinize uygun marka bulunamadı"
                        : "Henüz marka eklenmemiş"}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {data?.pagination && data.pagination.totalPages > 1 && (
          <CustomPagination total={data.pagination.totalPages} />
        )}
      </Stack>
    </>
  );
};

export default BrandsTable;
