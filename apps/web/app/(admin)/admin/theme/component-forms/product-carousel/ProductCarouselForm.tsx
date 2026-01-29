'use client';

import { Group, NumberInput, Stack, Switch, TextInput } from '@mantine/core';
import { Controller } from '@repo/shared';
import {
  DesignProductCarouselSchema,
  DesignProductCarouselSchemaInputType,
  MantineSize,
} from '@repo/types';
import { ThemeFormCard } from '@repo/ui/cards';
import { ColorPickerInput, MantineSizeInput } from '@repo/ui/inputs';
import { useComponentForm } from '../../hooks/useComponentForm';
import { ComponentFormProps } from '../../registry/registry-types';

const ProductCarouselForm = ({ uniqueId }: ComponentFormProps) => {
  const { control, handleFieldChange, data } = useComponentForm<
    typeof DesignProductCarouselSchema
  >(DesignProductCarouselSchema, uniqueId);

  if (!data) return null;

  const typedData = data as DesignProductCarouselSchemaInputType;

  return (
    <Stack gap="md">
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <TextInput
            label="Baslik"
            placeholder="Karusel basligi"
            error={fieldState.error?.message}
            value={field.value || ''}
            onChange={(e) => handleFieldChange('title', e.target.value || null)}
          />
        )}
      />

      <Controller
        control={control}
        name="subtitle"
        render={({ field, fieldState }) => (
          <TextInput
            label="Alt Baslik"
            placeholder="Karusel alt basligi"
            error={fieldState.error?.message}
            value={field.value || ''}
            onChange={(e) =>
              handleFieldChange('subtitle', e.target.value || null)
            }
          />
        )}
      />

      <Group grow>
        <Controller
          control={control}
          name="titleColor"
          render={({ field }) => (
            <ColorPickerInput
              label="Baslik Rengi"
              value={field.value || ''}
              onChange={(value) =>
                handleFieldChange('titleColor', value || null)
              }
            />
          )}
        />
        <Controller
          control={control}
          name="subtitleColor"
          render={({ field }) => (
            <ColorPickerInput
              label="Alt Baslik Rengi"
              value={field.value || ''}
              onChange={(value) =>
                handleFieldChange('subtitleColor', value || null)
              }
            />
          )}
        />
      </Group>

      <Group grow>
        <Controller
          control={control}
          name="titleSize"
          render={({ field }) => (
            <MantineSizeInput
              label="Baslik Boyutu"
              value={field.value}
              onChange={(value) =>
                handleFieldChange('titleSize', value as MantineSize)
              }
            />
          )}
        />
        <Controller
          control={control}
          name="subtitleSize"
          render={({ field }) => (
            <MantineSizeInput
              label="Alt Baslik Boyutu"
              value={field.value}
              onChange={(value) =>
                handleFieldChange('subtitleSize', value as MantineSize)
              }
            />
          )}
        />
      </Group>

      <Controller
        control={control}
        name="backgroundColor"
        render={({ field }) => (
          <ColorPickerInput
            label="Arka Plan Rengi"
            value={field.value || ''}
            onChange={(value) =>
              handleFieldChange('backgroundColor', value || null)
            }
          />
        )}
      />

      <ThemeFormCard title="Gorunum Sayilari">
        <Group grow>
          <Controller
            control={control}
            name="viewCounts.mobileProductCount"
            render={({ field }) => (
              <NumberInput
                label="Mobil"
                min={1}
                max={12}
                value={field.value || 2}
                onChange={(value) =>
                  handleFieldChange('viewCounts', {
                    mobileProductCount: value as number,
                    tabletProductCount:
                      typedData.viewCounts?.tabletProductCount ?? 4,
                    desktopProductCount:
                      typedData.viewCounts?.desktopProductCount ?? 6,
                  })
                }
              />
            )}
          />
          <Controller
            control={control}
            name="viewCounts.tabletProductCount"
            render={({ field }) => (
              <NumberInput
                label="Tablet"
                min={1}
                max={12}
                value={field.value || 4}
                onChange={(value) =>
                  handleFieldChange('viewCounts', {
                    mobileProductCount:
                      typedData.viewCounts?.mobileProductCount ?? 2,
                    tabletProductCount: value as number,
                    desktopProductCount:
                      typedData.viewCounts?.desktopProductCount ?? 6,
                  })
                }
              />
            )}
          />
          <Controller
            control={control}
            name="viewCounts.desktopProductCount"
            render={({ field }) => (
              <NumberInput
                label="Masaustu"
                min={1}
                max={12}
                value={field.value || 6}
                onChange={(value) =>
                  handleFieldChange('viewCounts', {
                    mobileProductCount:
                      typedData.viewCounts?.mobileProductCount ?? 2,
                    tabletProductCount:
                      typedData.viewCounts?.tabletProductCount ?? 4,
                    desktopProductCount: value as number,
                  })
                }
              />
            )}
          />
        </Group>
      </ThemeFormCard>

      <ThemeFormCard title="Gorunum Secenekleri">
        <Stack gap="xs">
          <Controller
            control={control}
            name="showPrice"
            render={({ field }) => (
              <Switch
                label="Fiyat Goster"
                checked={field.value}
                onChange={(e) =>
                  handleFieldChange('showPrice', e.currentTarget.checked)
                }
              />
            )}
          />
          <Controller
            control={control}
            name="showAddToCartButton"
            render={({ field }) => (
              <Switch
                label="Sepete Ekle Butonu"
                checked={field.value}
                onChange={(e) =>
                  handleFieldChange(
                    'showAddToCartButton',
                    e.currentTarget.checked,
                  )
                }
              />
            )}
          />
        </Stack>
      </ThemeFormCard>
    </Stack>
  );
};

export default ProductCarouselForm;
