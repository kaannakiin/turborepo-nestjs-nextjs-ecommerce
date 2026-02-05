'use client';

import { NumberInput, Stack, Switch } from '@mantine/core';
import { Controller } from '@repo/shared';
import { DesignSliderSchema, DesignSliderSchemaInputType } from '@repo/types';
import { ThemeFormCard } from '@repo/ui/cards';
import { useComponentForm } from '../../hooks/useComponentForm';
import { ComponentFormProps } from '../../registry/registry-types';

const SliderForm = ({ uniqueId }: ComponentFormProps) => {
  const { control, handleFieldChange, data } = useComponentForm<
    typeof DesignSliderSchema
  >(DesignSliderSchema, uniqueId);

  if (!data) return null;

  const typedData = data as DesignSliderSchemaInputType;

  return (
    <Stack gap="md">
      <ThemeFormCard title="Otomatik Oynatma">
        <Stack gap="xs">
          <Controller
            control={control}
            name="autoplay"
            render={({ field }) => (
              <Switch
                label="Otomatik Oynat"
                checked={field.value}
                onChange={(e) =>
                  handleFieldChange('autoplay', e.currentTarget.checked)
                }
              />
            )}
          />
          {typedData.autoplay && (
            <Controller
              control={control}
              name="autoplayInterval"
              render={({ field }) => (
                <NumberInput
                  label="Aralik (ms)"
                  min={1000}
                  max={30000}
                  step={500}
                  value={field.value}
                  onChange={(value) =>
                    handleFieldChange('autoplayInterval', value as number)
                  }
                />
              )}
            />
          )}
        </Stack>
      </ThemeFormCard>

      <ThemeFormCard title="Navigasyon">
        <Stack gap="xs">
          <Controller
            control={control}
            name="showArrows"
            render={({ field }) => (
              <Switch
                label="Oklari Goster"
                checked={field.value}
                onChange={(e) =>
                  handleFieldChange('showArrows', e.currentTarget.checked)
                }
              />
            )}
          />
          <Controller
            control={control}
            name="showDots"
            render={({ field }) => (
              <Switch
                label="Noktalari Goster"
                checked={field.value}
                onChange={(e) =>
                  handleFieldChange('showDots', e.currentTarget.checked)
                }
              />
            )}
          />
        </Stack>
      </ThemeFormCard>
    </Stack>
  );
};

export default SliderForm;
