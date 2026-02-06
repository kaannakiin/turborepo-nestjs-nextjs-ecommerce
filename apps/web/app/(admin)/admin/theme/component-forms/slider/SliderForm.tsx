'use client';

import { NumberInput, Stack, Switch } from '@mantine/core';
import { Controller } from '@repo/shared';
import {
  AspectRatio,
  DesignSliderSchema,
  DesignSliderSchemaInputType,
} from '@repo/types';
import { ThemeFormCard } from '@repo/ui/cards';
import { AspectRatioInput } from '@repo/ui/inputs';
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
      <ThemeFormCard title="Genel">
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
          <Controller
            control={control}
            name="aspectRatio"
            render={({ field }) => (
              <AspectRatioInput
                value={field.value}
                label="Masaüstü En-Boy Orani"
                onChange={(value) =>
                  handleFieldChange('aspectRatio', value as AspectRatio)
                }
              />
            )}
          />
          <Controller
            control={control}
            name="mobileAspectRatio"
            render={({ field }) => (
              <AspectRatioInput
                value={field.value}
                label="Mobil En-Boy Orani"
                onChange={(value) =>
                  handleFieldChange('mobileAspectRatio', value as AspectRatio)
                }
              />
            )}
          />
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
