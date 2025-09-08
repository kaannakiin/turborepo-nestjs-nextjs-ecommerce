"use client";
import {
  Button,
  Checkbox,
  Center,
  Divider,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useQuery } from "@repo/shared";
import { CategoryIdAndName } from "@repo/types";
import { IconCategory } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import GlobalLoadingOverlay from "../../../../../components/GlobalLoadingOverlay";

interface CategoriesModalProps {
  opened: boolean;
  onClose: () => void;
  includedCategoryIds: string[];
  onSelectionChange?: (categoryIds: string[]) => void;
}

const CategoriesModal = ({
  opened,
  onClose,
  includedCategoryIds,
  onSelectionChange,
}: CategoriesModalProps) => {
  const [selectedCategoryIds, setSelectedCategoryIds] =
    useState<string[]>(includedCategoryIds);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["get-categories-only-id-and-name"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/categories/get-all-categories-only-id-and-name`,
        { method: "GET", credentials: "include" }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data as CategoryIdAndName[];
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    setSelectedCategoryIds(includedCategoryIds);
  }, [includedCategoryIds]);

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategoryIds((prev) => [...new Set([...prev, categoryId])]);
    } else {
      setSelectedCategoryIds((prev) => prev.filter((id) => id !== categoryId));
    }
  };

  const handleSave = () => {
    onSelectionChange?.(selectedCategoryIds);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: "100%" }}>
          <Text fw={600}>Kategori Seç</Text>
          {selectedCategoryIds.length > 0 && (
            <Text size="sm" c="dimmed">
              {selectedCategoryIds.length} kategori seçili
            </Text>
          )}
        </Group>
      }
      centered
      scrollAreaComponent={ScrollArea.Autosize}
      size="lg"
      className="relative"
    >
      {isLoading || isFetching ? (
        <GlobalLoadingOverlay />
      ) : error ? (
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconCategory size={48} color="var(--mantine-color-red-6)" />
            <Text c="red" fw={500}>
              Kategoriler yüklenirken bir hata oluştu
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin
            </Text>
          </Stack>
        </Center>
      ) : !data || data.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconCategory size={48} color="var(--mantine-color-gray-6)" />
            <Text fw={500} c="dimmed">
              Henüz kategori bulunamadı
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Önce kategori ekledikten sonra buradan seçim yapabilirsiniz
            </Text>
          </Stack>
        </Center>
      ) : (
        <>
          <ScrollArea.Autosize mah={400}>
            <Stack gap="xs">
              {data.map((category) => (
                <Group gap="md" align="center" key={category.id}>
                  <Checkbox
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={(event) =>
                      handleCategoryToggle(
                        category.id,
                        event.currentTarget.checked
                      )
                    }
                    label={
                      <Text fz="sm" tt="capitalize">
                        {category.name}
                      </Text>
                    }
                  />
                </Group>
              ))}
            </Stack>
          </ScrollArea.Autosize>

          <Divider my="md" />
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={onClose}>
              İptal
            </Button>
            <Button onClick={handleSave}>Seçimi Kaydet</Button>
          </Group>
        </>
      )}
    </Modal>
  );
};
export default CategoriesModal;