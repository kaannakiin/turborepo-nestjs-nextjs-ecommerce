"use client";

import TableAsset from "@/(admin)/components/TableAsset";
import CustomSearchInput from "@/components/CustomSearchInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Group,
  Pagination,
  Popover,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { DateFormatter, useQuery, useQueryClient } from "@repo/shared";
import { AdminCategoryTableReturnType } from "@repo/types";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const getTurkishTranslation = (
  translations: AdminCategoryTableReturnType["categories"][number]["translations"]
) => {
  return translations.find((t) => t.locale === "TR") || translations[0];
};

const getParentCategoryName = (
  parentCategory: AdminCategoryTableReturnType["categories"][number]["parentCategory"]
) => {
  if (!parentCategory) return "Ana Kategori";
  const trTranslation =
    parentCategory.translations.find((t) => t.locale === "TR") ||
    parentCategory.translations[0];
  return trTranslation?.name || "Bilinmeyen";
};

const fetchCategories = async (
  search: string,
  page: number,
  limit: number
): Promise<AdminCategoryTableReturnType> => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const response = await fetchWrapper.get<AdminCategoryTableReturnType>(
    `/admin/products/categories?${params}`
  );

  if (!response.success) {
    throw new Error("Kategoriler yüklenirken bir hata oluştu");
  }

  return response.data;
};

const deleteCategory = async (id: string) => {
  const response = await fetchWrapper.delete<{
    success: boolean;
    message: string;
  }>(`/admin/products/categories/delete-category/${id}`);

  if (!response.success) {
    const error = response as ApiError;
    throw new Error(error.error || "Kategori silinirken bir hata oluştu");
  }

  return response.data;
};

const useCategories = (search: string, page: number, limit: number) => {
  return useQuery({
    queryKey: ["categories", search, page, limit],
    queryFn: () => fetchCategories(search, page, limit),
  });
};

const AdminCategoryTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePopoverOpened, setDeletePopoverOpened] = useState<string | null>(
    null
  );

  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useCategories(
    searchParams.get("search") || "",
    currentPage,
    20
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setIsDeleting(true);
      const result = await deleteCategory(id);

      notifications.show({
        title: "Başarılı",
        message: "Kategori başarıyla silindi",
        color: "green",
        autoClose: 3000,
      });

      queryClient.invalidateQueries({ queryKey: ["categories"] });

      setDeletePopoverOpened(null);
    } catch (error) {
      console.error("Delete error:", error);
      notifications.show({
        title: "Hata",
        message:
          error instanceof Error
            ? error.message
            : "Kategori silinirken bir hata oluştu",
        color: "red",
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || isDeleting) {
    return <GlobalLoadingOverlay />;
  }

  if (error) {
    return (
      <Stack gap={"lg"}>
        <Group justify="space-between" align="center">
          <Title order={4}>Kategoriler</Title>
          <Group gap="lg">
            <Button
              component={Link}
              href={"/admin/product-list/categories/new" as Route}
            >
              Yeni Kategori Ekle
            </Button>
            <CustomSearchInput />
          </Group>
        </Group>
        <Center h={300}>
          <Stack align="center" gap="md">
            <Text c="red">Kategoriler yüklenirken bir hata oluştu</Text>
            <Button onClick={() => refetch()}>Tekrar Dene</Button>
          </Stack>
        </Center>
      </Stack>
    );
  }

  const categories = data?.categories || [];
  const pagination = data?.pagination;

  return (
    <Stack gap={"lg"}>
      <Group justify="space-between" align="center">
        <Title order={4}>Kategoriler</Title>
        <Group gap="lg">
          <Button
            component={Link}
            href={"/admin/product-list/categories/new" as Route}
          >
            Yeni Kategori Ekle
          </Button>
          <CustomSearchInput />
        </Group>
      </Group>

      <Table.ScrollContainer minWidth={800}>
        <Table striped highlightOnHover highlightOnHoverColor="admin.0">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Resim</Table.Th>
              <Table.Th>Kategori Adı</Table.Th>
              <Table.Th>Ebeveyn Kategori</Table.Th>
              <Table.Th>Alt Kategoriler</Table.Th>
              <Table.Th>Ürün Sayısı</Table.Th>
              <Table.Th>Oluşturulma Tarihi</Table.Th>
              <Table.Th>İşlemler</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {categories.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Center h={100}>
                    <Text c="dimmed">
                      {searchParams.get("search")
                        ? "Arama kriterlerine uygun kategori bulunamadı"
                        : "Henüz kategori eklenmemiş"}
                    </Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              categories.map((category) => {
                const trTranslation = getTurkishTranslation(
                  category.translations
                );

                return (
                  <Table.Tr key={category.id}>
                    <Table.Td
                      style={{
                        width: 120,
                        maxHeight: 120,
                        position: "relative",
                      }}
                    >
                      <TableAsset url={category.image?.url} type="IMAGE" />
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>{trTranslation?.name || "İsimsiz"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {getParentCategoryName(category.parentCategory)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {category._count.childCategories}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="green">
                        {category._count.products}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {DateFormatter.shortDateTime(category.createdAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          component={Link}
                          size={"sm"}
                          href={
                            `/admin/product-list/categories/${category.id}` as Route
                          }
                        >
                          <IconEdit />
                        </ActionIcon>

                        <Popover
                          opened={deletePopoverOpened === category.id}
                          onChange={() => setDeletePopoverOpened(null)}
                          position="top"
                          withArrow
                          shadow="md"
                        >
                          <Popover.Target>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size={"sm"}
                              onClick={() =>
                                setDeletePopoverOpened(category.id)
                              }
                            >
                              <IconTrash />
                            </ActionIcon>
                          </Popover.Target>
                          <Popover.Dropdown>
                            <Stack gap="sm" w={200}>
                              <Text size="sm" fw={500}>
                                Kategoriyi Sil
                              </Text>
                              <Text size="xs" c="dimmed">
                                &quot;{trTranslation?.name}&quot; kategorisini
                                silmek istediğinizden emin misiniz?
                              </Text>
                              <Group gap="xs" justify="flex-end">
                                <Button
                                  size="xs"
                                  variant="subtle"
                                  onClick={() => setDeletePopoverOpened(null)}
                                >
                                  İptal
                                </Button>
                                <Button
                                  size="xs"
                                  color="red"
                                  onClick={() =>
                                    handleDeleteCategory(category.id)
                                  }
                                  loading={isDeleting}
                                >
                                  Evet, Sil
                                </Button>
                              </Group>
                            </Stack>
                          </Popover.Dropdown>
                        </Popover>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {pagination && pagination.totalPages > 1 && (
        <Group justify="center">
          <Pagination
            total={pagination.totalPages}
            value={currentPage}
            onChange={handlePageChange}
            size="sm"
          />
        </Group>
      )}
    </Stack>
  );
};

export default AdminCategoryTable;
