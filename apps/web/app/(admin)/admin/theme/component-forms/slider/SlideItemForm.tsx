'use client';

import { Box, Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { ThemeFormCard } from '@repo/ui/cards';
import { ColorPickerInput } from '@repo/ui/inputs';
import { Controller } from '@repo/shared';
import {
  DesignSliderSlideSchema,
  DesignSliderSlideSchemaInputType,
} from '@repo/types';
import { IconUpload } from '@tabler/icons-react';
import { useItemForm } from '../../hooks/useComponentForm';
import { ItemFormProps } from '../../registry/registry-types';

const SlideItemForm = ({ uniqueId, parentUniqueId }: ItemFormProps) => {
  const { control, handleFieldChange, data } = useItemForm<
    typeof DesignSliderSlideSchema
  >(DesignSliderSlideSchema, uniqueId, parentUniqueId);

  if (!data) return null;

  const typedData = data as DesignSliderSlideSchemaInputType;

  return (
    <Stack gap="md">
      {/* Image Upload */}
      <ThemeFormCard title="Gorsel">
        <Box
          style={{
            border: '2px dashed var(--mantine-color-gray-4)',
            borderRadius: 'var(--mantine-radius-md)',
            padding: 'var(--mantine-spacing-xl)',
            textAlign: 'center',
          }}
        >
          <Button variant="light" leftSection={<IconUpload size={16} />}>
            Gorsel Yukle
          </Button>
        </Box>
      </ThemeFormCard>

      {/* Title */}
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <TextInput
            label="Baslik"
            placeholder="Slayt basligi"
            error={fieldState.error?.message}
            value={field.value || ''}
            onChange={(e) => handleFieldChange('title', e.target.value || null)}
          />
        )}
      />

      {/* Subtitle */}
      <Controller
        control={control}
        name="subtitle"
        render={({ field, fieldState }) => (
          <TextInput
            label="Alt Baslik"
            placeholder="Slayt alt basligi"
            error={fieldState.error?.message}
            value={field.value || ''}
            onChange={(e) =>
              handleFieldChange('subtitle', e.target.value || null)
            }
          />
        )}
      />

      {/* Button */}
      <ThemeFormCard title="Buton">
        <Stack gap="xs">
          <Controller
            control={control}
            name="buttonText"
            render={({ field, fieldState }) => (
              <TextInput
                label="Buton Yazisi"
                placeholder="Daha Fazla"
                error={fieldState.error?.message}
                value={field.value || ''}
                onChange={(e) =>
                  handleFieldChange('buttonText', e.target.value || null)
                }
              />
            )}
          />
          <Controller
            control={control}
            name="buttonLink"
            render={({ field, fieldState }) => (
              <TextInput
                label="Buton Linki"
                placeholder="https://..."
                error={fieldState.error?.message}
                value={field.value || ''}
                onChange={(e) =>
                  handleFieldChange('buttonLink', e.target.value || null)
                }
              />
            )}
          />
        </Stack>
      </ThemeFormCard>

      {/* Colors */}
      <ThemeFormCard title="Renkler">
        <Stack gap="xs">
          <Group grow>
            <Controller
              control={control}
              name="titleColor"
              render={({ field }) => (
                <ColorPickerInput
                  label="Baslik"
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
                  label="Alt Baslik"
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
              name="buttonColor"
              render={({ field }) => (
                <ColorPickerInput
                  label="Buton"
                  value={field.value || ''}
                  onChange={(value) =>
                    handleFieldChange('buttonColor', value || null)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="buttonTextColor"
              render={({ field }) => (
                <ColorPickerInput
                  label="Buton Yazisi"
                  value={field.value || ''}
                  onChange={(value) =>
                    handleFieldChange('buttonTextColor', value || null)
                  }
                />
              )}
            />
          </Group>
        </Stack>
      </ThemeFormCard>
    </Stack>
  );
};

export default SlideItemForm;
