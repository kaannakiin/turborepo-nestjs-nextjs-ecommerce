'use client';

import { useHierarchy } from '@hooks/admin/useHierarchy';
import {
  Group,
  SegmentedControl,
  Stack,
  Textarea,
  TextInput,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Controller } from '@repo/shared';
import {
  BRAND_BASE_SLUG,
  CATEGORY_BASE_SLUG,
  DesignOnboardGridItemBaseSchema,
  OnboardGridItemLinkType,
  TAG_BASE_SLUG,
} from '@repo/types';
import { ThemeFormCard } from '@repo/ui/cards';
import { AspectRatioInput, ColorPickerInput, FileInput } from '@repo/ui/inputs';
import { DataSelectModal } from '@repo/ui/modals';
import { useMemo } from 'react';
import { useItemForm } from '../../hooks/useComponentForm';
import { ItemFormProps } from '../../registry/registry-types';

const OnboardGridItemForm = ({ uniqueId, parentUniqueId }: ItemFormProps) => {
  const { control, handleFieldChange, data } = useItemForm<
    typeof DesignOnboardGridItemBaseSchema
  >(DesignOnboardGridItemBaseSchema, uniqueId, parentUniqueId);

  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const hierarchyType = useMemo(() => {
    if (!data?.linkType) return undefined;

    switch (data.linkType) {
      case OnboardGridItemLinkType.BRAND:
        return 'brands' as const;
      case OnboardGridItemLinkType.CATEGORY:
        return 'categories' as const;
      case OnboardGridItemLinkType.TAG:
        return 'tags' as const;
      default:
        return undefined;
    }
  }, [data?.linkType]);

  const { data: hierarchyData, isLoading: isLoadingHierarchy } = useHierarchy(
    hierarchyType || 'brands',
    {
      enabled: modalOpened && !!hierarchyType,
    },
  );

  const currentEntityId = useMemo(() => {
    if (!data?.linkType) return null;
    switch (data.linkType) {
      case OnboardGridItemLinkType.BRAND:
        return data.brandId;
      case OnboardGridItemLinkType.CATEGORY:
        return data.categoryId;
      case OnboardGridItemLinkType.TAG:
        return data.tagId;
      default:
        return null;
    }
  }, [data?.linkType, data?.brandId, data?.categoryId, data?.tagId]);

  const hasEntitySelected = useMemo(() => {
    return !!currentEntityId;
  }, [currentEntityId]);

  const handleEntitySelect = (
    items: Array<{ id: string; name: string; slug: string }>,
  ) => {
    if (items.length === 0) return;

    const selected = items[0];
    const linkType = data?.linkType;

    handleFieldChange('brandId', null);
    handleFieldChange('categoryId', null);
    handleFieldChange('tagId', null);

    let fullSlug = '';
    if (linkType === OnboardGridItemLinkType.BRAND) {
      handleFieldChange('brandId', selected.id);
      fullSlug = `/${BRAND_BASE_SLUG}/${selected.slug}`;
    } else if (linkType === OnboardGridItemLinkType.CATEGORY) {
      handleFieldChange('categoryId', selected.id);
      fullSlug = `/${CATEGORY_BASE_SLUG}/${selected.slug}`;
    } else if (linkType === OnboardGridItemLinkType.TAG) {
      handleFieldChange('tagId', selected.id);
      fullSlug = `/${TAG_BASE_SLUG}/${selected.slug}`;
    }

    handleFieldChange('title', selected.name);
    handleFieldChange('slug', fullSlug);
    closeModal();
  };

  const handleClearEntity = () => {
    handleFieldChange('brandId', null);
    handleFieldChange('categoryId', null);
    handleFieldChange('tagId', null);
  };

  const getModalTitle = () => {
    switch (data?.linkType) {
      case OnboardGridItemLinkType.BRAND:
        return 'Marka Seç';
      case OnboardGridItemLinkType.CATEGORY:
        return 'Kategori Seç';
      case OnboardGridItemLinkType.TAG:
        return 'Etiket Seç';
      default:
        return 'Seç';
    }
  };

  if (!data) return null;

  return (
    <Stack gap="md">
      <ThemeFormCard title="Görsel">
        <Stack gap="xs">
          <Controller
            control={control}
            name="customImage"
            render={({ field }) => (
              <FileInput
                accept={['IMAGE', 'VIDEO']}
                multiple={false}
                value={field.value}
                existingFiles={
                  data.existingImage
                    ? [
                        {
                          url: data.existingImage.url,
                          type: data.existingImage.type,
                        },
                      ]
                    : undefined
                }
                onChange={(file) =>
                  handleFieldChange('customImage', file as File | null)
                }
                removeExistingFileFn={async () => {
                  handleFieldChange('existingImage', null);
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="aspectRatio"
            render={({ field }) => <AspectRatioInput {...field} />}
          />
        </Stack>
      </ThemeFormCard>

      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <TextInput
            label="Başlık"
            placeholder="Grid öğesi başlığı"
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
            placeholder="Grid öğesi açıklaması"
            error={fieldState.error?.message}
            value={field.value || ''}
            onChange={(e) =>
              handleFieldChange('description', e.target.value || null)
            }
            minRows={3}
          />
        )}
      />

      <ThemeFormCard title="Yönlendirme">
        <Stack gap="xs">
          <Controller
            control={control}
            name="slug"
            render={({ field, fieldState }) => (
              <TextInput
                label="Slug"
                placeholder="/collections/yeni-sezon"
                error={fieldState.error?.message}
                value={field.value || ''}
                onChange={(e) =>
                  handleFieldChange('slug', e.target.value || null)
                }
              />
            )}
          />
          <Controller
            control={control}
            name="customUrl"
            render={({ field, fieldState }) => (
              <TextInput
                label="Özel URL"
                placeholder="https://..."
                error={fieldState.error?.message}
                value={field.value || ''}
                onChange={(e) =>
                  handleFieldChange('customUrl', e.target.value || null)
                }
              />
            )}
          />
        </Stack>
      </ThemeFormCard>

      <ThemeFormCard title="Buton">
        <Controller
          control={control}
          name="buttonText"
          render={({ field, fieldState }) => (
            <TextInput
              label="Buton Yazısı"
              placeholder="Keşfet"
              error={fieldState.error?.message}
              value={field.value || ''}
              onChange={(e) =>
                handleFieldChange('buttonText', e.target.value || null)
              }
            />
          )}
        />
      </ThemeFormCard>

      <ThemeFormCard title="Bağlantı">
        <Stack gap="xs">
          <Controller
            control={control}
            name="linkType"
            render={({ field }) => (
              <SegmentedControl
                data={[
                  { label: 'Marka', value: OnboardGridItemLinkType.BRAND },
                  {
                    label: 'Kategori',
                    value: OnboardGridItemLinkType.CATEGORY,
                  },
                  { label: 'Etiket', value: OnboardGridItemLinkType.TAG },
                ]}
                value={field.value || ''}
                onChange={(value) => {
                  handleFieldChange(
                    'linkType',
                    value as
                      | typeof OnboardGridItemLinkType.BRAND
                      | typeof OnboardGridItemLinkType.CATEGORY
                      | typeof OnboardGridItemLinkType.TAG,
                  );
                  handleFieldChange('brandId', null);
                  handleFieldChange('categoryId', null);
                  handleFieldChange('tagId', null);
                  handleFieldChange('slug', null);
                  handleFieldChange('customUrl', null);
                  handleFieldChange('title', '');
                }}
              />
            )}
          />

          {data.linkType && (
            <Stack gap="xs">
              {hasEntitySelected ? (
                <Group>
                  <Button
                    variant="default"
                    onClick={openModal}
                    style={{ flex: 1 }}
                  >
                    Değiştir
                  </Button>
                  <Button
                    variant="subtle"
                    color="red"
                    onClick={handleClearEntity}
                  >
                    Temizle
                  </Button>
                </Group>
              ) : (
                <Button onClick={openModal} fullWidth>
                  {data.linkType === OnboardGridItemLinkType.BRAND &&
                    'Marka Seç'}
                  {data.linkType === OnboardGridItemLinkType.CATEGORY &&
                    'Kategori Seç'}
                  {data.linkType === OnboardGridItemLinkType.TAG &&
                    'Etiket Seç'}
                </Button>
              )}
            </Stack>
          )}
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
                  label="Başlık"
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
                  label="Açıklama"
                  value={field.value || ''}
                  onChange={(value) =>
                    handleFieldChange('descriptionColor', value || null)
                  }
                />
              )}
            />
          </Group>
          <Group grow>
            <Controller
              control={control}
              name="buttonTextColor"
              render={({ field }) => (
                <ColorPickerInput
                  label="Buton Yazısı"
                  value={field.value || ''}
                  onChange={(value) =>
                    handleFieldChange('buttonTextColor', value || null)
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="buttonBackgroundColor"
              render={({ field }) => (
                <ColorPickerInput
                  label="Buton Arkaplan"
                  value={field.value || ''}
                  onChange={(value) =>
                    handleFieldChange('buttonBackgroundColor', value || null)
                  }
                />
              )}
            />
          </Group>
        </Stack>
      </ThemeFormCard>

      <DataSelectModal
        opened={modalOpened}
        onClose={closeModal}
        title={getModalTitle()}
        data={hierarchyData || []}
        isLoading={isLoadingHierarchy}
        selectedIds={currentEntityId ? [currentEntityId] : []}
        onSubmit={handleEntitySelect}
        idKey="id"
        labelKey="name"
        multiple={false}
      />
    </Stack>
  );
};

export default OnboardGridItemForm;
