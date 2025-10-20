"use client";
import fetchWrapper from "@lib/fetchWrapper";
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Paper,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Control, Controller, useFieldArray, useQuery } from "@repo/shared";
import {
  DiscountItem,
  FilterOperators,
  MainDiscount,
  SelectDataType,
} from "@repo/types";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import DiscountModal from "./DiscountModal";

const getSelectDataLabel = (
  value: SelectDataType,
  type: "select" | "button"
) => {
  if (type === "button") {
    switch (value) {
      case "product":
        return "Ürün Ekle";
      case "brand":
        return "Marka Ekle";
      case "category":
        return "Kategori Ekle";
    }
  }
  switch (value) {
    case "product":
      return "Ürünler";
    case "brand":
      return "Markalar";
    case "category":
      return "Kategoriler";
  }
};

const fetchDiscountData = async (
  type: SelectDataType
): Promise<DiscountItem[]> => {
  const endpoints = {
    category: "/admin/products/categories/get-all-category-and-its-subs",
    brand: "/admin/products/brands/get-all-brands-and-its-subs",
    product: "/admin/products/get-all-products-and-its-subs",
  };

  const response = await fetchWrapper.get<DiscountItem[]>(endpoints[type]);
  if (!response.success) {
    throw new Error("Veri alınırken bir hata oluştu");
  }
  return response.data as DiscountItem[];
};

interface DiscountConditionFormProps {
  control: Control<MainDiscount>;
}

const DiscountConditionForm = ({ control }: DiscountConditionFormProps) => {
  const [selectData, setSelectData] = useState<SelectDataType>("product");
  const [opened, { open, close }] = useDisclosure(false);
  const [activeType, setActiveType] = useState<SelectDataType | null>(null);

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "conditions.conditions",
  });

  // Her veri türü için ayrı useQuery hook'ları
  const useDiscountData = (type: SelectDataType) => {
    return useQuery({
      queryKey: ["discount-data", type],
      queryFn: () => fetchDiscountData(type),
      enabled: !!fields.find((f) => f.type === type) || activeType === type,
      staleTime: Infinity, // Veriyi bir kere çektikten sonra tekrar çekme
    });
  };

  const { data: productData, isLoading: isProductLoading } =
    useDiscountData("product");
  const { data: brandData, isLoading: isBrandLoading } =
    useDiscountData("brand");
  const { data: categoryData, isLoading: isCategoryLoading } =
    useDiscountData("category");

  // Helper function to get data for a specific type
  const getDataForType = (
    type: SelectDataType | null
  ): DiscountItem[] | undefined => {
    if (!type) return undefined;
    switch (type) {
      case "product":
        return productData;
      case "brand":
        return brandData;
      case "category":
        return categoryData;
      default:
        return undefined;
    }
  };

  const getIsLoadingForType = (type: SelectDataType | null): boolean => {
    if (!type) return false;
    switch (type) {
      case "product":
        return isProductLoading;
      case "brand":
        return isBrandLoading;
      case "category":
        return isCategoryLoading;
      default:
        return false;
    }
  };

  const getAllChildIds = (item: DiscountItem): string[] => {
    const ids = [item.id];
    if (item.sub) {
      item.sub.forEach((child) => {
        ids.push(...getAllChildIds(child));
      });
    }
    return ids;
  };

  // ID'lerden breadcrumb path'ini bul
  const findBreadcrumbPath = (
    items: DiscountItem[],
    targetId: string,
    currentPath: string[] = []
  ): string[] | null => {
    for (const item of items) {
      const newPath = [...currentPath, item.name];

      if (item.id === targetId) {
        return newPath;
      }

      if (item.sub && item.sub.length > 0) {
        const found = findBreadcrumbPath(item.sub, targetId, newPath);
        if (found) return found;
      }
    }
    return null;
  };

  // Item'ı ID'ye göre bul
  const findItemById = (
    items: DiscountItem[],
    targetId: string
  ): DiscountItem | null => {
    for (const item of items) {
      if (item.id === targetId) {
        return item;
      }
      if (item.sub && item.sub.length > 0) {
        const found = findItemById(item.sub, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Optimize edilmiş seçimleri filtrele (parent seçiliyse child'ları gösterme)
  const getOptimizedSelections = (
    selectedIds: string[],
    allData: DiscountItem[]
  ): string[] => {
    if (!selectedIds || selectedIds.length === 0) return [];
    const optimized = new Set<string>();

    // Bir item'ın başka seçili item'ların child'ı olup olmadığını kontrol et
    const isChildOfAnySelected = (itemId: string): boolean => {
      for (const selectedId of selectedIds) {
        if (selectedId === itemId) continue;
        const selectedItem = findItemById(allData, selectedId);
        if (selectedItem) {
          const childIds = getAllChildIds(selectedItem).slice(1); // Kendisi hariç
          if (childIds.includes(itemId)) {
            return true;
          }
        }
      }
      return false;
    };

    selectedIds.forEach((id) => {
      if (!isChildOfAnySelected(id)) {
        optimized.add(id);
      }
    });

    return Array.from(optimized);
  };

  const findConditionIndexByType = (type: SelectDataType): number => {
    return fields.findIndex((field) => field.type === type);
  };

  const handleOpenModal = () => {
    setActiveType(selectData);
    open();
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    if (!activeType) return;

    const existingIndex = findConditionIndexByType(activeType);

    if (existingIndex !== -1) {
      // Eğer hiç ID kalmadıysa koşulu kaldır
      if (selectedIds.length === 0) {
        remove(existingIndex);
      } else {
        const currentCondition = fields[existingIndex];
        update(existingIndex, {
          ...currentCondition,
          ids: selectedIds,
        });
      }
    } else if (selectedIds.length > 0) {
      append({
        operator: "AND",
        type: activeType,
        ids: selectedIds,
      });
    }
  };

  const renderBreadcrumbs = (ids: string[] | null, type: SelectDataType) => {
    const dataForType = getDataForType(type);
    if (!dataForType || !ids || ids.length === 0) {
      // Veri henüz yüklenmediyse veya ID yoksa bir yüklenme göstergesi veya mesaj gösterilebilir
      return (
        <Text size="sm" c="dimmed">
          Seçimler yükleniyor...
        </Text>
      );
    }

    const optimizedIds = getOptimizedSelections(ids, dataForType);

    return (
      <Stack gap="xs" mt="xs">
        {optimizedIds.slice(0, 5).map((id) => {
          const path = findBreadcrumbPath(dataForType, id);
          if (!path) return null;

          return (
            <Group key={id} gap={4} bg="gray.1" p={"sm"} className="rounded-md">
              {path.map((name, idx) => (
                <Group key={idx} gap={4}>
                  <Text size="sm">{name}</Text>
                  {idx < path.length - 1 && <Text c="dimmed">&gt;</Text>}
                </Group>
              ))}
            </Group>
          );
        })}
        {optimizedIds.length > 5 && (
          <Text size="xs" c="dimmed">
            ... ve {optimizedIds.length - 5} tane daha
          </Text>
        )}
      </Stack>
    );
  };

  const getSelectedIdsForModal = (): string[] => {
    if (!activeType) return [];
    const condition = fields.find((field) => field.type === activeType);
    return condition?.ids || [];
  };

  const existingTypes = fields.map((f) => f.type);
  const availableSelectData = [
    { value: "product", label: getSelectDataLabel("product", "select") },
    { value: "category", label: getSelectDataLabel("category", "select") },
    { value: "brand", label: getSelectDataLabel("brand", "select") },
  ].filter((item) => !existingTypes.includes(item.value as SelectDataType));

  return (
    <>
      <Stack gap="md">
        {availableSelectData.length > 0 && (
          <>
            <Divider label="Yeni Koşul Ekle" labelPosition="center" />
            <Group gap="md" className="w-fit">
              <Select
                data={availableSelectData}
                value={selectData}
                onChange={(value) => setSelectData(value as SelectDataType)}
                placeholder="Koşul türü seçin"
                style={{ flex: 1 }}
              />
              <Button onClick={handleOpenModal}>
                {getSelectDataLabel(selectData, "button")}
              </Button>
            </Group>
          </>
        )}

        <Stack gap="sm">
          {fields.map((field, index) => {
            if (!field.type) return null;
            const showOperator = index > 0;

            return (
              <div key={field.id}>
                {showOperator && (
                  <Group justify="center" my="xs">
                    <Controller
                      control={control}
                      name={`conditions.conditions.${index}.operator`}
                      render={({ field: controllerField }) => (
                        <Select
                          {...controllerField}
                          data={[
                            { value: FilterOperators.AND, label: "VE (AND)" },
                            { value: FilterOperators.OR, label: "VEYA (OR)" },
                          ]}
                          allowDeselect={false}
                        />
                      )}
                    />
                  </Group>
                )}
                <Paper p="md" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">
                      {getSelectDataLabel(field.type, "select")}
                    </Text>
                    <Group gap={"xs"}>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => {
                          setActiveType(field.type as SelectDataType);
                          open();
                        }}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => remove(index)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  {renderBreadcrumbs(field.ids, field.type)}
                </Paper>
              </div>
            );
          })}
        </Stack>

        {availableSelectData.length === 0 && fields.length > 0 && (
          <Text size="sm" c="dimmed" ta="center" mt="md">
            Tüm koşul türleri eklendi (Maksimum 3)
          </Text>
        )}
      </Stack>

      <DiscountModal
        opened={opened}
        onClose={() => {
          close();
          setActiveType(null);
        }}
        data={getDataForType(activeType) || []}
        isLoading={getIsLoadingForType(activeType)}
        selectedItems={getSelectedIdsForModal()}
        onSave={handleSelectionChange}
        modalProps={{
          title: `${getSelectDataLabel(activeType || selectData, "select")} Seçin`,
        }}
        dataTitle={
          activeType ? getSelectDataLabel(activeType, "select") : undefined
        }
      />
    </>
  );
};

export default DiscountConditionForm;
