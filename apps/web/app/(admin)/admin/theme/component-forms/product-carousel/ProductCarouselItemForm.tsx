'use client';

import { useProductList } from '@hooks/admin/useProducts';
import { Button, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Controller } from '@repo/shared';
import {
  AdminProductTableProductData,
  DesignProductCarouselProductSchema,
  DesignProductCarouselProductSchemaInputType,
} from '@repo/types';
import { ColorPickerInput } from '@repo/ui/inputs';
import { ProductsModal } from '@repo/ui/modals';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useItemForm } from '../../hooks/useComponentForm';
import { ItemFormProps } from '../../registry/registry-types';

const ProductCarouselItemForm = ({
  uniqueId,
  parentUniqueId,
}: ItemFormProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: productsData, isLoading } = useProductList(search, page);

  const { control, handleFieldChange, data } = useItemForm<
    typeof DesignProductCarouselProductSchema
  >(DesignProductCarouselProductSchema, uniqueId, parentUniqueId);

  if (!data) return null;

  const typedData = data as DesignProductCarouselProductSchemaInputType;

  const handleProductSelect = (
    items: { product: AdminProductTableProductData; variantId: string }[],
  ) => {
    if (items.length > 0) {
      handleFieldChange('productData', items[0].product);
      close();
    }
  };

  return (
    <Stack gap="md">
      <Stack gap="xs">
        <Text size="sm" fw={500}>
          Ürün Seçimi
        </Text>
        {typedData.productData ? (
          <TextInput
            readOnly
            value={
              typedData.productData.translations[0]?.name || 'İsimsiz Ürün'
            }
            rightSectionWidth={100}
            rightSection={
              <Button variant="subtle" size="compact-xs" onClick={open}>
                Degistir
              </Button>
            }
          />
        ) : (
          <Button
            variant="light"
            leftSection={<IconSearch size={16} />}
            fullWidth
            onClick={open}
          >
            Ürün Seç
          </Button>
        )}
      </Stack>

      <Controller
        control={control}
        name="isCustomBadgeActive"
        render={({ field }) => (
          <Switch
            label="Ozel Badge"
            checked={field.value}
            onChange={(e) =>
              handleFieldChange('isCustomBadgeActive', e.currentTarget.checked)
            }
          />
        )}
      />

      {typedData.isCustomBadgeActive && (
        <>
          <Controller
            control={control}
            name="customBadgeText"
            render={({ field, fieldState }) => (
              <TextInput
                label="Badge Yazisi"
                placeholder="Ornegin: Yeni, Indirimli"
                error={fieldState.error?.message}
                value={field.value || ''}
                onChange={(e) =>
                  handleFieldChange('customBadgeText', e.target.value || null)
                }
              />
            )}
          />

          <Controller
            control={control}
            name="customBadgeColor"
            render={({ field }) => (
              <ColorPickerInput
                label="Badge Rengi"
                value={field.value || ''}
                onChange={(value) =>
                  handleFieldChange('customBadgeColor', value || null)
                }
              />
            )}
          />
        </>
      )}

      {opened && (
        <ProductsModal
          opened={opened}
          onClose={close}
          data={{
            products: productsData?.products || [],
            pagination: productsData?.pagination,
          }}
          isLoading={isLoading}
          onSearch={setSearch}
          onPageChange={setPage}
          onSubmit={handleProductSelect}
          selectedItems={[]}
          multiple={false}
        />
      )}
    </Stack>
  );
};

export default ProductCarouselItemForm;
