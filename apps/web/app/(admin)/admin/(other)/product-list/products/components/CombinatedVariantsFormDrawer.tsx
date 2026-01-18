'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import SeoCard from '@/components/SeoCard';
import {
  Button,
  Drawer,
  DrawerProps,
  Group,
  InputError,
  InputLabel,
  SimpleGrid,
  Stack,
  Switch,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  Control,
  Controller,
  UseFormGetValues,
  UseFormSetValue,
  useWatch,
} from '@repo/shared';
import { VariantProductZodType } from '@repo/types';
import dynamic from 'next/dynamic';
import ProductDropzone from '../../components/ProductDropzone';
import PriceNumberInput from '../../../../../../components/inputs/PriceNumberInput';
import { useDeleteProductAsset } from '@hooks/admin/useProducts';

const GlobalTextEditor = dynamic(
  () => import('../../../../../../components/TextEditor'),
  {
    ssr: false,
    loading: () => <LoadingOverlay />,
  },
);

interface CombinatedVariantsFormDrawerProps extends Pick<
  DrawerProps,
  'opened' | 'onClose'
> {
  control: Control<VariantProductZodType>;
  selectedIndex: number;
  onSave?: () => void;
  setValue: UseFormSetValue<VariantProductZodType>;
  getValues: UseFormGetValues<VariantProductZodType>;
}

const CombinatedVariantsFormDrawer = ({
  opened,
  onClose,
  control,
  selectedIndex,
  onSave,
  setValue,
  getValues,
}: CombinatedVariantsFormDrawerProps) => {
  const deleteProductAssetMutation = useDeleteProductAsset();

  const handleSave = () => {
    onSave?.();
    onClose();
  };

  const existingImages =
    useWatch({
      control,
      name: `combinatedVariants.${selectedIndex}.existingImages`,
    }) || [];

  const images =
    useWatch({
      control,
      name: `combinatedVariants.${selectedIndex}.images`,
    }) || [];

  const handleAddImages = (files: File[]) => {
    const currentExisting =
      getValues(`combinatedVariants.${selectedIndex}.existingImages`) || [];
    const currentImages =
      getValues(`combinatedVariants.${selectedIndex}.images`) || [];

    const currentTotalCount = currentExisting.length + currentImages.length;

    const newFormattedImages = files.map((file, index) => ({
      file,
      order: currentTotalCount + index,
    }));

    setValue(
      `combinatedVariants.${selectedIndex}.images`,
      [...currentImages, ...newFormattedImages],
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
  };

  const handleRemoveNewImage = (file: File) => {
    const currentImages =
      getValues(`combinatedVariants.${selectedIndex}.images`) || [];
    const filteredImages = currentImages.filter((img) => img.file !== file);

    setValue(`combinatedVariants.${selectedIndex}.images`, filteredImages, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleRemoveExistingImage = async (imageUrl: string) => {
    try {
      await deleteProductAssetMutation.mutateAsync(imageUrl);

      const currentExisting =
        getValues(`combinatedVariants.${selectedIndex}.existingImages`) || [];
      const filteredExisting = currentExisting.filter(
        (img) => img.url !== imageUrl,
      );

      setValue(
        `combinatedVariants.${selectedIndex}.existingImages`,
        filteredExisting,
        {
          shouldValidate: true,
          shouldDirty: true,
        },
      );
    } catch (error) {
      notifications.show({
        title: 'Silme Hatası!',
        message: 'Ürün görseli silinirken bir hata oluştu.',
        color: 'red',
        autoClose: 3000,
      });
      throw error;
    }
  };

  const handleReorder = (
    newOrderList: Array<{
      url: string;
      order: number;
      file?: File;
      isNew: boolean;
    }>,
  ) => {
    const currentExistingImages =
      getValues(`combinatedVariants.${selectedIndex}.existingImages`) || [];
    const currentImages =
      getValues(`combinatedVariants.${selectedIndex}.images`) || [];

    const updatedExistingImages: typeof existingImages = [];
    const updatedNewImages: typeof images = [];

    newOrderList.forEach((item) => {
      if (item.isNew && item.file) {
        updatedNewImages.push({
          file: item.file,
          order: item.order,
        });
      } else {
        const originalImg = currentExistingImages.find(
          (img) => img.url === item.url,
        );

        if (originalImg) {
          updatedExistingImages.push({
            ...originalImg,
            order: item.order,
          });
        } else {
          console.warn(`Reorder uyuşmazlığı: ${item.url} bulunamadı.`);
        }
      }
    });

    setValue(
      `combinatedVariants.${selectedIndex}.existingImages`,
      updatedExistingImages,
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      },
    );

    setValue(`combinatedVariants.${selectedIndex}.images`, updatedNewImages, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };
  return (
    <Drawer
      keepMounted
      opened={opened}
      onClose={onClose}
      position="bottom"
      transitionProps={{
        transition: 'slide-up',
        duration: 400,
      }}
      size="90%"
      title="Varyant Kombinasyonu Düzenle"
      classNames={{
        title: 'text-lg font-semibold',
        header: 'border-b border-gray-400',
        body: 'pt-2',
      }}
    >
      <Stack gap="lg">
        <div>
          <Title order={4} mb="md">
            Temel Bilgiler
          </Title>
          <SimpleGrid cols={{ xs: 1, md: 2 }} spacing="md">
            <Controller
              control={control}
              name={`combinatedVariants.${selectedIndex}.sku`}
              render={({ field, fieldState }) => (
                <TextInput
                  label="SKU"
                  placeholder="Ürün kodunu giriniz"
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value || ''}
                />
              )}
            />

            <Controller
              control={control}
              name={`combinatedVariants.${selectedIndex}.barcode`}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Barkod"
                  placeholder="Barkod numarasını giriniz"
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value || ''}
                />
              )}
            />
          </SimpleGrid>
        </div>
        <div>
          <Title order={4} mb={'md'}>
            Açıklama
          </Title>
          <Controller
            control={control}
            name={`combinatedVariants.${selectedIndex}.translations.0.description`}
            render={({ field, fieldState }) => (
              <GlobalTextEditor
                renderLabel={false}
                {...field}
                value={field.value ?? ''}
                error={fieldState.error?.message}
                placeholder="Varyant kombinasyonlarını düzenleyebilirsiniz. Yapay zekadan yardım almak için /ai yazabilirsiniz."
              />
            )}
          />
        </div>
        <div>
          <Title order={4} mb="md">
            Fiyat Bilgileri
          </Title>
          <SimpleGrid cols={{ xs: 1, md: 3 }} spacing="md">
            <Controller
              control={control}
              name={`combinatedVariants.${selectedIndex}.prices.0.price`}
              render={({ field, fieldState }) => (
                <PriceNumberInput
                  label="Satış Fiyatı"
                  error={fieldState.error?.message}
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name={`combinatedVariants.${selectedIndex}.prices.0.discountPrice`}
              render={({ field, fieldState }) => (
                <PriceNumberInput
                  label="İndirimli Fiyat"
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value || undefined}
                />
              )}
            />

            <Controller
              control={control}
              name={`combinatedVariants.${selectedIndex}.prices.0.buyedPrice`}
              render={({ field, fieldState }) => (
                <PriceNumberInput
                  label="Alış Fiyatı"
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value || undefined}
                />
              )}
            />
          </SimpleGrid>
        </div>

        <div>
          <InputLabel mb="xs">Varyant Resimleri</InputLabel>
          <Controller
            control={control}
            name={`combinatedVariants.${selectedIndex}.images`}
            render={({ fieldState }) => (
              <>
                <ProductDropzone
                  existingImages={existingImages}
                  images={images}
                  onAddImages={handleAddImages}
                  onRemoveNewImage={handleRemoveNewImage}
                  onRemoveExistingImage={handleRemoveExistingImage}
                  onReorder={handleReorder}
                />
                {fieldState.error?.message && (
                  <InputError>{fieldState.error?.message}</InputError>
                )}
              </>
            )}
          />
        </div>

        <SeoCard
          control={control}
          metaTitleFieldName={`combinatedVariants.${selectedIndex}.translations.0.metaTitle`}
          metaDescriptionFieldName={`combinatedVariants.${selectedIndex}.translations.0.metaDescription`}
        />

        <div>
          <Title order={4} mb="md">
            Durum
          </Title>
          <Controller
            control={control}
            name={`combinatedVariants.${selectedIndex}.active`}
            render={({ field: { value, ...field } }) => (
              <Switch
                {...field}
                checked={value}
                label={value ? 'Aktif' : 'Pasif'}
                description="Bu varyantın satışta olup olmadığını belirler"
                size="md"
              />
            )}
          />
        </div>

        <Group justify="flex-end" mt="xl">
          <Button variant="light" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={handleSave}>Kaydet</Button>
        </Group>
      </Stack>
    </Drawer>
  );
};

export default CombinatedVariantsFormDrawer;
