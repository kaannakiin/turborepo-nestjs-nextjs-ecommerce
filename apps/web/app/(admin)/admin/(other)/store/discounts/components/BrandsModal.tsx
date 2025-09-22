"use client";
import {
  Button,
  Center,
  Checkbox,
  Divider,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useQuery } from "@repo/shared";
import { BrandIdAndName } from "@repo/types";
import { useEffect, useState } from "react";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";

interface BrandsModalProps {
  opened: boolean;
  onClose: () => void;
  includedBrandIds: string[];
  onSelectionChange?: (brandIds: string[]) => void;
}

const BrandsModal = ({
  opened,
  onClose,
  includedBrandIds,
  onSelectionChange,
}: BrandsModalProps) => {
  const [selectedBrandIds, setSelectedBrandIds] =
    useState<string[]>(includedBrandIds);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["get-brands-only-id-and-name"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/brands/get-all-brands-only-id-and-name`,
        { method: "GET", credentials: "include" }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data as BrandIdAndName[];
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    setSelectedBrandIds(includedBrandIds);
  }, [includedBrandIds]);

  const handleBrandToggle = (brandId: string, checked: boolean) => {
    if (checked) {
      setSelectedBrandIds((prev) => [...new Set([...prev, brandId])]);
    } else {
      setSelectedBrandIds((prev) => prev.filter((id) => id !== brandId));
    }
  };

  const handleSave = () => {
    onSelectionChange?.(selectedBrandIds);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: "100%" }}>
          <Text fw={600}>Marka Seç</Text>
          {selectedBrandIds.length > 0 && (
            <Text size="sm" c="dimmed">
              {selectedBrandIds.length} marka seçili
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
            <Text c="red" fw={500}>
              Markalar yüklenirken bir hata oluştu
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin
            </Text>
          </Stack>
        </Center>
      ) : !data || data.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="md">
            <Text fw={500} c="dimmed">
              Henüz marka bulunamadı
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Önce marka ekledikten sonra buradan seçim yapabilirsiniz
            </Text>
          </Stack>
        </Center>
      ) : (
        <>
          <ScrollArea.Autosize mah={400}>
            <Stack gap="md">
              {data.map((brand) => (
                <Checkbox
                  key={brand.id}
                  checked={selectedBrandIds.includes(brand.id)}
                  onChange={(event) =>
                    handleBrandToggle(brand.id, event.currentTarget.checked)
                  }
                  label={
                    <Text fz="sm" tt="capitalize">
                      {brand.name}
                    </Text>
                  }
                />
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
export default BrandsModal;
