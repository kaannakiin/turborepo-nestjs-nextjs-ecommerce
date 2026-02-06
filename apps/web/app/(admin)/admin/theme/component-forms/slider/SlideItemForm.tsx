'use client';

import { useDeleteAsset } from '@hooks/admin/useImage';
import { Group, Stack, Switch, TextInput } from '@mantine/core';
import { Controller } from '@repo/shared';
import { DesignSliderSlideSchema } from '@repo/types';
import { ThemeFormCard } from '@repo/ui/cards';
import { ColorPickerInput, FileInput } from '@repo/ui/inputs';
import { useItemForm } from '../../hooks/useComponentForm';
import { ItemFormProps } from '../../registry/registry-types';

const SlideItemForm = ({ uniqueId, parentUniqueId }: ItemFormProps) => {
  const { control, handleFieldChange, data } = useItemForm<
    typeof DesignSliderSlideSchema
  >(DesignSliderSlideSchema, uniqueId, parentUniqueId);

  const { deleteAsset } = useDeleteAsset();

  if (!data) return null;

  return (
    <Stack gap="md">
      <ThemeFormCard title="Görseller">
        <Controller
          control={control}
          name="image"
          render={({ field: { onChange, ...field } }) => (
            <FileInput
              accept={['IMAGE', 'VIDEO']}
              multiple={false}
              value={field.value}
              label="Masaüstü Görseli"
              existingFiles={
                data.existingAsset
                  ? [
                      {
                        url: data.existingAsset.url,
                        type: data.existingAsset.type,
                      },
                    ]
                  : undefined
              }
              onChange={(file) =>
                handleFieldChange('image', file as File | null)
              }
              removeExistingFileFn={async (url) => {
                await deleteAsset(url);
                handleFieldChange('existingAsset', null);
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="mobileAsset"
          render={({ field: { onChange, ...field } }) => (
            <FileInput
              accept={['IMAGE', 'VIDEO']}
              multiple={false}
              value={field.value}
              label="Mobil Görseli"
              existingFiles={
                data.mobileExistingAsset
                  ? [
                      {
                        url: data.mobileExistingAsset.url,
                        type: data.mobileExistingAsset.type,
                      },
                    ]
                  : undefined
              }
              onChange={(file) => {
                handleFieldChange('mobileAsset', file as File | null);
              }}
              removeExistingFileFn={async (url) => {
                await deleteAsset(url);
                handleFieldChange('mobileExistingAsset', null);
              }}
            />
          )}
        />
      </ThemeFormCard>

      <Controller
        control={control}
        name="withOverlay"
        render={({ field }) => (
          <Switch
            label="Overlay Göster"
            description="Görsel üzerine koyu gradient ekler"
            checked={field.value || false}
            onChange={(e) =>
              handleFieldChange('withOverlay', e.currentTarget.checked)
            }
          />
        )}
      />

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
