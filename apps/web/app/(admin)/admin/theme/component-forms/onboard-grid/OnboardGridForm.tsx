'use client';

import { Group, NumberInput, Stack, Textarea, TextInput } from '@mantine/core';
import { Controller } from '@repo/shared';
import {
  DesignOnboardGridSchema,
  DesignOnboardGridSchemaInputType,
} from '@repo/types';
import { ThemeFormCard } from '@repo/ui/cards';
import { ColorPickerInput } from '@repo/ui/inputs';
import { useComponentForm } from '../../hooks/useComponentForm';
import { ComponentFormProps } from '../../registry/registry-types';

const OnboardGridForm = ({ uniqueId }: ComponentFormProps) => {
  const { control, handleFieldChange, data } = useComponentForm<
    typeof DesignOnboardGridSchema
  >(DesignOnboardGridSchema, uniqueId);

  if (!data) return null;

  const typedData = data as DesignOnboardGridSchemaInputType;

  return (
    <Stack gap="md">
      {/* Başlık ve Açıklama */}
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <TextInput
            label="Başlık"
            placeholder="Grid başlığı"
            error={fieldState.error?.message}
            value={field.value || ''}
            onChange={(e) => handleFieldChange('title', e.target.value || null)}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <Textarea
            label="Açıklama"
            placeholder="Grid açıklaması"
            error={fieldState.error?.message}
            value={field.value || ''}
            onChange={(e) =>
              handleFieldChange('description', e.target.value || null)
            }
            minRows={2}
          />
        )}
      />

      <Group grow>
        <Controller
          control={control}
          name="titleColor"
          render={({ field }) => (
            <ColorPickerInput
              label="Başlık Rengi"
              value={field.value || ''}
              onChange={(value) =>
                handleFieldChange('titleColor', value || null)
              }
            />
          )}
        />
        <Controller
          control={control}
          name="descriptionColor"
          render={({ field }) => (
            <ColorPickerInput
              label="Açıklama Rengi"
              value={field.value || ''}
              onChange={(value) =>
                handleFieldChange('descriptionColor', value || null)
              }
            />
          )}
        />
      </Group>

      <ThemeFormCard title="Sütun Sayıları">
        <Group grow>
          <Controller
            control={control}
            name="breakPoints.mobile"
            render={({ field }) => (
              <NumberInput
                label="Mobil"
                min={1}
                max={10}
                value={field.value || 1}
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
                value={field.value || 2}
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
                value={field.value || 3}
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
    </Stack>
  );
};

export default OnboardGridForm;
