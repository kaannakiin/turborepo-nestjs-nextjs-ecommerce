'use client';

import {
  Box,
  Button,
  ColorInput,
  Group,
  NumberInput,
  Select,
  Slider,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import {
  ColorPickerInput,
  MantineSizeInput,
  MantineTextAlignSizeInput,
} from '@repo/ui/inputs';
import { Controller } from '@repo/shared';
import {
  DesignEmailSignupSchema,
  DesignEmailSignupSchemaInputType,
  MantineSize,
  TextAlign,
} from '@repo/types';
import { IconUpload } from '@tabler/icons-react';
import { useComponentForm } from '../../hooks/useComponentForm';
import { ComponentFormProps } from '../../registry/registry-types';
import { ThemeFormCard } from '@repo/ui/cards';

const EmailSignupForm = ({ uniqueId }: ComponentFormProps) => {
  const { control, handleFieldChange, data } = useComponentForm<
    typeof DesignEmailSignupSchema
  >(DesignEmailSignupSchema, uniqueId);

  if (!data) return null;

  const typedData = data as DesignEmailSignupSchemaInputType;

  return (
    <Stack gap="md">
      <ThemeFormCard title="İçerik">
        <Stack gap="xs">
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <TextInput
                label="Başlık"
                placeholder="Bültenimize Abone Olun"
                value={field.value ?? ''}
                onChange={(e) =>
                  handleFieldChange('title', e.target.value || null)
                }
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="subtitle"
            render={({ field, fieldState }) => (
              <Textarea
                label="Alt Başlık"
                placeholder="En güncel kampanyalardan haberdar olun"
                value={field.value ?? ''}
                onChange={(e) =>
                  handleFieldChange('subtitle', e.target.value || null)
                }
                error={fieldState.error?.message}
                autosize
                minRows={2}
              />
            )}
          />
          <Controller
            control={control}
            name="placeholderText"
            render={({ field, fieldState }) => (
              <TextInput
                label="Input Placeholder"
                value={field.value ?? ''}
                onChange={(e) =>
                  handleFieldChange('placeholderText', e.target.value)
                }
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="buttonText"
            render={({ field, fieldState }) => (
              <TextInput
                label="Buton Yazısı"
                value={field.value ?? ''}
                onChange={(e) =>
                  handleFieldChange('buttonText', e.target.value)
                }
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="successMessage"
            render={({ field, fieldState }) => (
              <TextInput
                label="Başarı Mesajı"
                value={field.value ?? ''}
                onChange={(e) =>
                  handleFieldChange('successMessage', e.target.value)
                }
                error={fieldState.error?.message}
              />
            )}
          />
        </Stack>
      </ThemeFormCard>

      <ThemeFormCard title="Arkaplan">
        <Stack gap="xs">
          <Box>
            <Text size="sm" mb={4}>
              Arkaplan Görseli
            </Text>
            <Box
              style={{
                border: '2px dashed var(--mantine-color-gray-4)',
                borderRadius: 'var(--mantine-radius-md)',
                padding: 'var(--mantine-spacing-md)',
                textAlign: 'center',
              }}
            >
              <Button variant="light" leftSection={<IconUpload size={16} />}>
                Görsel Yükle
              </Button>
            </Box>
          </Box>
          <Controller
            control={control}
            name="backgroundColor"
            render={({ field }) => (
              <ColorPickerInput
                label="Arkaplan Rengi"
                value={field.value ?? ''}
                onChange={(value) =>
                  handleFieldChange('backgroundColor', value || null)
                }
              />
            )}
          />
          {typedData.backgroundImage && (
            <Controller
              control={control}
              name="overlayOpacity"
              render={({ field }) => (
                <Stack gap={4}>
                  <Text size="sm">Overlay Opaklığı: {field.value}%</Text>
                  <Slider
                    min={0}
                    max={100}
                    value={field.value}
                    onChange={(value) =>
                      handleFieldChange('overlayOpacity', value)
                    }
                  />
                </Stack>
              )}
            />
          )}
        </Stack>
      </ThemeFormCard>

      <ThemeFormCard title="Başlık Stilleri">
        <Stack gap="xs">
          <Group grow>
            <Controller
              control={control}
              name="titleColor"
              render={({ field }) => (
                <ColorPickerInput
                  label="Başlık Rengi"
                  value={field.value ?? ''}
                  onChange={(value) =>
                    handleFieldChange('titleColor', value || null)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="titleSize"
              render={({ field }) => (
                <MantineSizeInput
                  label="Başlık Boyutu"
                  value={field.value}
                  onChange={(value) =>
                    handleFieldChange('titleSize', value as MantineSize)
                  }
                />
              )}
            />
          </Group>
          <Group grow>
            <Controller
              control={control}
              name="subtitleColor"
              render={({ field }) => (
                <ColorPickerInput
                  label="Alt Başlık Rengi"
                  value={field.value ?? ''}
                  onChange={(value) =>
                    handleFieldChange('subtitleColor', value || null)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="subtitleSize"
              render={({ field }) => (
                <MantineSizeInput
                  label="Alt Başlık Boyutu"
                  value={field.value}
                  onChange={(value) =>
                    handleFieldChange('subtitleSize', value as MantineSize)
                  }
                />
              )}
            />
          </Group>
        </Stack>
      </ThemeFormCard>

      <ThemeFormCard title="Buton Stilleri">
        <Stack gap="xs">
          <Group grow>
            <Controller
              control={control}
              name="buttonColor"
              render={({ field }) => (
                <ColorPickerInput
                  label="Buton Rengi"
                  value={field.value ?? ''}
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
                  label="Buton Yazı Rengi"
                  value={field.value ?? ''}
                  onChange={(value) =>
                    handleFieldChange('buttonTextColor', value || null)
                  }
                />
              )}
            />
          </Group>
        </Stack>
      </ThemeFormCard>

      <ThemeFormCard title="Layout">
        <Stack gap="xs">
          <Controller
            control={control}
            name="alignment"
            render={({ field }) => (
              <MantineTextAlignSizeInput
                label="İçerik Hizalama"
                value={field.value}
                onChange={(value) =>
                  handleFieldChange('alignment', value as TextAlign)
                }
              />
            )}
          />
          <Controller
            control={control}
            name="compact"
            render={({ field }) => (
              <Switch
                label="Kompakt Mod"
                description="Input ve buton yan yana gösterilir"
                checked={field.value}
                onChange={(e) =>
                  handleFieldChange('compact', e.currentTarget.checked)
                }
              />
            )}
          />
          <Controller
            control={control}
            name="minHeight"
            render={({ field, fieldState }) => (
              <NumberInput
                label="Minimum Yükseklik (px)"
                min={100}
                max={800}
                value={field.value}
                onChange={(value) =>
                  handleFieldChange('minHeight', value as number)
                }
                error={fieldState.error?.message}
              />
            )}
          />
        </Stack>
      </ThemeFormCard>

      <ThemeFormCard title="Boşluklar">
        <Stack gap="xs">
          <Group grow>
            <Controller
              control={control}
              name="paddingVertical"
              render={({ field, fieldState }) => (
                <NumberInput
                  label="Dikey Padding (px)"
                  min={0}
                  max={200}
                  value={field.value}
                  onChange={(value) =>
                    handleFieldChange('paddingVertical', value as number)
                  }
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="paddingHorizontal"
              render={({ field, fieldState }) => (
                <NumberInput
                  label="Yatay Padding (px)"
                  min={0}
                  max={200}
                  value={field.value}
                  onChange={(value) =>
                    handleFieldChange('paddingHorizontal', value as number)
                  }
                  error={fieldState.error?.message}
                />
              )}
            />
          </Group>
        </Stack>
      </ThemeFormCard>
    </Stack>
  );
};

export default EmailSignupForm;
