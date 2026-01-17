'use client';

import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Paper,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DiscountConditionType, LogicalOperator } from '@repo/database/client';
import { Control, Controller, useFieldArray } from '@repo/shared';
import { DiscountItem, MainDiscount } from '@repo/types';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import DiscountModal from './DiscountModal';
import { useDiscountConditionData } from '@hooks/admin/useAdminDiscounts';

const getSelectDataLabel = (
  value: DiscountConditionType,
  type: 'select' | 'button',
) => {
  if (type === 'button') {
    switch (value) {
      case 'PRODUCT':
        return 'Ürün Ekle';
      case 'BRAND':
        return 'Marka Ekle';
      case 'CATEGORY':
        return 'Kategori Ekle';
    }
  }
  switch (value) {
    case 'PRODUCT':
      return 'Ürünler';
    case 'BRAND':
      return 'Markalar';
    case 'CATEGORY':
      return 'Kategoriler';
  }
};

interface DiscountConditionFormProps {
  control: Control<MainDiscount>;
}

const DiscountConditionForm = ({ control }: DiscountConditionFormProps) => {
  const [selectData, setSelectData] =
    useState<DiscountConditionType>('PRODUCT');
  const [opened, { open, close }] = useDisclosure(false);
  const [activeType, setActiveType] = useState<DiscountConditionType | null>(
    null,
  );

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'conditions.conditions',
  });

  const useDiscountData = (type: DiscountConditionType) => {
    return useDiscountConditionData(type);
  };

  const { data: productData, isLoading: isProductLoading } =
    useDiscountData('PRODUCT');
  const { data: brandData, isLoading: isBrandLoading } =
    useDiscountData('BRAND');
  const { data: categoryData, isLoading: isCategoryLoading } =
    useDiscountData('CATEGORY');

  const productLookups = useMemo(() => {
    if (!productData) return { productIds: new Set(), variantIds: new Set() };
    const productIds = new Set(productData.map((p) => p.id));
    const variantIds = new Set(
      productData.flatMap((p) => (p.sub || []).map((v) => v.id)),
    );
    return { productIds, variantIds };
  }, [productData]);

  const getDataForType = (
    type: DiscountConditionType | null,
  ): DiscountItem[] | undefined => {
    if (!type) return undefined;
    switch (type) {
      case 'PRODUCT':
        return productData;
      case 'BRAND':
        return brandData;
      case 'CATEGORY':
        return categoryData;
      default:
        return undefined;
    }
  };

  const getIsLoadingForType = (type: DiscountConditionType | null): boolean => {
    if (!type) return false;
    switch (type) {
      case 'PRODUCT':
        return isProductLoading;
      case 'BRAND':
        return isBrandLoading;
      case 'CATEGORY':
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

  const findBreadcrumbPath = (
    items: DiscountItem[],
    targetId: string,
    currentPath: string[] = [],
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

  const findItemById = (
    items: DiscountItem[],
    targetId: string,
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

  const getOptimizedSelections = (
    selectedIds: string[],
    allData: DiscountItem[],
  ): string[] => {
    if (!selectedIds || selectedIds.length === 0) return [];
    const optimized = new Set<string>();

    const isChildOfAnySelected = (itemId: string): boolean => {
      for (const selectedId of selectedIds) {
        if (selectedId === itemId) continue;
        const selectedItem = findItemById(allData, selectedId);
        if (selectedItem) {
          const childIds = getAllChildIds(selectedItem).slice(1);
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

  const findConditionIndexByType = (type: DiscountConditionType): number => {
    return fields.findIndex((field) => field.type === type);
  };

  const handleOpenModal = () => {
    setActiveType(selectData);
    open();
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    if (!activeType) return;

    const existingIndex = findConditionIndexByType(activeType);

    if (activeType === 'CATEGORY' || activeType === 'BRAND') {
      if (existingIndex !== -1) {
        if (selectedIds.length === 0) {
          remove(existingIndex);
        } else {
          update(existingIndex, {
            ...fields[existingIndex],
            ids: selectedIds,
            subIds: null,
          });
        }
      } else if (selectedIds.length > 0) {
        append({
          operator: 'AND',
          type: activeType,
          ids: selectedIds,
          subIds: null,
        });
      }
      return;
    }

    if (activeType === 'PRODUCT') {
      const mainIds = selectedIds.filter((id) =>
        productLookups.productIds.has(id),
      );
      const subIds = selectedIds.filter((id) =>
        productLookups.variantIds.has(id),
      );

      const totalSelected = mainIds.length + subIds.length;

      if (existingIndex !== -1) {
        if (totalSelected === 0) {
          remove(existingIndex);
        } else {
          update(existingIndex, {
            ...fields[existingIndex],
            ids: mainIds.length > 0 ? mainIds : null,
            subIds: subIds.length > 0 ? subIds : null,
          });
        }
      } else if (totalSelected > 0) {
        append({
          operator: 'AND',
          type: 'PRODUCT',
          ids: mainIds.length > 0 ? mainIds : null,
          subIds: subIds.length > 0 ? subIds : null,
        });
      }
    }
  };

  const renderBreadcrumbs = (
    field: (typeof fields)[number],
    type: DiscountConditionType,
  ) => {
    const dataForType = getDataForType(type);

    let allIds: string[] = [];
    if (type === 'PRODUCT') {
      allIds = [...(field.ids || []), ...(field.subIds || [])];
    } else {
      allIds = field.ids || [];
    }

    if (!dataForType || allIds.length === 0) {
      if (getIsLoadingForType(type)) {
        return (
          <Text size="sm" c="dimmed">
            Veri yükleniyor...
          </Text>
        );
      }
      return (
        <Text size="sm" c="dimmed">
          Seçim yapılmadı veya bulunamadı.
        </Text>
      );
    }

    const optimizedIds = getOptimizedSelections(allIds, dataForType);
    if (optimizedIds.length === 0 && allIds.length > 0) {
      // Bu durum, sadece child'lar seçildiğinde ve parent optimize edildiğinde oluşabilir.
      return (
        <Text size="sm" c="dimmed">
          Alt öğeler seçili ({allIds.length} adet).
        </Text>
      );
    }

    return (
      <Stack gap="xs" mt="xs">
        {optimizedIds.slice(0, 5).map((id) => {
          const path = findBreadcrumbPath(dataForType, id);
          if (!path) {
            console.warn(`Breadcrumb path bulunamadı: ID=${id}, Type=${type}`);
            return (
              <Text key={id} size="xs" c="red">
                ID: {id} (Path bulunamadı)
              </Text>
            );
          }

          return (
            <Group key={id} gap={4} bg="gray.1" p={'sm'} className="rounded-md">
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
    if (!condition) return [];

    if (activeType === 'PRODUCT') {
      return [...(condition.ids || []), ...(condition.subIds || [])];
    }
    return condition.ids || [];
  };

  const existingTypes = fields.map((f) => f.type);
  const availableSelectData: Array<{
    value: DiscountConditionType;
    label: string;
  }> = [
    {
      value: 'PRODUCT' as DiscountConditionType,
      label: getSelectDataLabel('PRODUCT', 'select'),
    },
    {
      value: 'CATEGORY' as DiscountConditionType,
      label: getSelectDataLabel('CATEGORY', 'select'),
    },
    {
      value: 'BRAND' as DiscountConditionType,
      label: getSelectDataLabel('BRAND', 'select'),
    },
  ].filter(
    (item) => !existingTypes.includes(item.value as DiscountConditionType),
  );

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
                onChange={(value) =>
                  setSelectData(value as DiscountConditionType)
                }
                placeholder="Koşul türü seçin"
                style={{ flex: 1 }}
              />
              <Button onClick={handleOpenModal}>
                {getSelectDataLabel(selectData, 'button')}
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
                            {
                              value: LogicalOperator.AND,
                              label: 'VE (AND)',
                            },
                            {
                              value: LogicalOperator.OR,
                              label: 'VEYA (OR)',
                            },
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
                      {getSelectDataLabel(field.type, 'select')}
                    </Text>
                    <Group gap={'xs'}>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => {
                          setActiveType(field.type as DiscountConditionType);
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
                  {renderBreadcrumbs(field, field.type)}
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
        subAsVariantsMode={activeType === 'PRODUCT'}
        modalProps={{
          title: `${getSelectDataLabel(activeType || selectData, 'select')} Seçin`,
        }}
        dataTitle={
          activeType ? getSelectDataLabel(activeType, 'select') : undefined
        }
      />
    </>
  );
};

export default DiscountConditionForm;
