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

      <ThemeFormCard title="Görünüm Sayıları">
        <Group grow>
          <Controller
            control={control}
            name="breakPoints.mobile"
            render={({ field }) => (
              <NumberInput
                label="Mobil"
                min={1}
                max={10}
                value={field.value || 2}
                onChange={(value) =>
                  handleFieldChange('breakPoints', {
                    ...typedData.breakPoints,
                    mobile: value as number,
                  })
                }
              />
            )}
          />
          <Controller
            control={control}
            name="breakPoints.tablet"
            render={({ field }) => (
              <NumberInput
                label="Tablet"
                min={1}
                max={10}
                value={field.value || 4}
                onChange={(value) =>
                  handleFieldChange('breakPoints', {
                    ...typedData.breakPoints,
                    tablet: value as number,
                  })
                }
              />
            )}
          />
          <Controller
            control={control}
            name="breakPoints.desktop"
            render={({ field }) => (
              <NumberInput
                label="Masaüstü"
                min={1}
                max={10}
                value={field.value || 6}
                onChange={(value) =>
                  handleFieldChange('breakPoints', {
                    ...typedData.breakPoints,
                    desktop: value as number,
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
