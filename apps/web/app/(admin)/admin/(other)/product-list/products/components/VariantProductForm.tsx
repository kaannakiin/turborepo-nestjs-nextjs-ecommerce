'use client';

import AdminBrandDataSelect from '@/components/inputs/admin/AdminBrandDataSelect';
import AdminCategoryDataSelect from '@/components/inputs/admin/AdminCategoryDataSelect';
import AdminTagDataSelect from '@/components/inputs/admin/AdminTagDataSelect';
import { getProductTypeLabel } from '@lib/helpers';
import {
  useCreateOrUpdateVariantProduct,
  useUploadProductImage,
  useUploadVariantOptionFile,
  useDeleteProductAsset,
} from '@hooks/admin/useProducts';
import {
  Button,
  Grid,
  Group,
  InputError,
  InputLabel,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ProductType } from '@repo/database/client';
import {
  Controller,
  createId,
  MutationFunctionContext,
  slugify,
  SubmitHandler,
  useForm,
  useMutation,
  useWatch,
  zodResolver,
} from '@repo/shared';
import { VariantProductSchema, VariantProductZodType } from '@repo/types';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import LoadingOverlay from '../../../../../../components/LoadingOverlay';
import SeoCard from '../../../../../../components/SeoCard';
import TaxonomySelect from '../../../components/TaxonomySelect';
import ProductDropzone from '../../components/ProductDropzone';
import ExistingVariantCard from './ExistingVariantCard';

const GlobalTextEditor = dynamic(
  () => import('../../../../../../components/TextEditor'),
  {
    ssr: false,
    loading: () => <LoadingOverlay />,
  },
);

interface VariantProductFormProps {
  defaultValues?: VariantProductZodType;
}

const VariantProductForm = ({ defaultValues }: VariantProductFormProps) => {
  const createOrUpdateProductMutation = useCreateOrUpdateVariantProduct();
  const uploadProductImageMutation = useUploadProductImage();
  const uploadVariantOptionFileMutation = useUploadVariantOptionFile();
  const deleteProductAssetMutation = useDeleteProductAsset();

  const {
    control,
    formState: { isSubmitting, errors },
    handleSubmit,
    setValue,
    getValues,
  } = useForm<VariantProductZodType>({
    resolver: zodResolver(VariantProductSchema),
    defaultValues: defaultValues || {
      uniqueId: createId(),
      type: 'PHYSICAL',
      combinatedVariants: [],
      existingImages: [],
      existingVariants: [],
      visibleAllCombinations: false,
      active: true,
      brandId: null,
      categories: [],
      tagIds: [],
      googleTaxonomyId: null,
      images: [],
      translations: [
        {
          locale: 'TR',
          name: '',
          slug: '',
          description: null,
          metaDescription: null,
          metaTitle: null,
        },
      ],
    },
  });
  const existingImages = useWatch({ control, name: 'existingImages' }) || [];
  const images = useWatch({ control, name: 'images' }) || [];
  const { push } = useRouter();

  const createOrUpdateVariantProductMutation = useMutation({
    mutationFn: async (data: VariantProductZodType) => {
      const { images, existingImages, combinatedVariants, ...productData } =
        data;

      const cleanCombinatedVariants = combinatedVariants.map(
        ({
          images: variantImages,
          existingImages: variantExistingImages,
          ...variant
        }) => variant,
      );

      const cleanExistingVariants = data.existingVariants.map(
        ({ options, ...variant }) => ({
          ...variant,
          options: options.map(({ file, ...option }) => option),
        }),
      );

      const mainDataResponse = await createOrUpdateProductMutation.mutateAsync({
        ...productData,
        combinatedVariants: cleanCombinatedVariants,
        existingVariants: cleanExistingVariants,
      });

      const { combinations, productId } = mainDataResponse;

      return { data, productId, combinations };
    },

    onSuccess: async (result, variables, _m, context) => {
      const { data, productId, combinations } = result;

      notifications.show({
        title: 'Başarılı!',
        message: defaultValues
          ? 'Ürün başarıyla güncellendi.'
          : 'Ürün başarıyla kaydedildi.',
        color: 'green',
      });
      uploadAllImagesInBackground(data, productId, combinations, context);

      // Cache'i invalidate et ve yüklenmeyi bekle
      await context.client.invalidateQueries({
        queryKey: ['admin-products'],
      });
      await context.client.invalidateQueries({
        queryKey: ['admin-product', productId],
      });

      push('/admin/product-list');
    },

    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'İnternet bağlantınızı kontrol edin.';

      notifications.show({
        title: 'Bağlantı Hatası!',
        message: errorMessage,
        color: 'red',
      });
    },
  });
  console.log(errors);

  const onSubmit: SubmitHandler<VariantProductZodType> = async (data) => {
    createOrUpdateVariantProductMutation.mutate(data);
  };

  const uploadAllImagesInBackground = async (
    formData: VariantProductZodType,
    productId: string,
    updatedCombinations: { id: string; sku: string | null }[],
    context: MutationFunctionContext,
  ) => {
    const errors: Array<{ title: string; message: string }> = [];

    try {
      if (formData.images && formData.images.length > 0) {
        const productImageResults = await Promise.allSettled(
          formData.images.map(async (imageItem) => {
            return uploadProductImageMutation.mutateAsync({
              file: imageItem.file,
              productId,
              order: imageItem.order,
            });
          }),
        );

        productImageResults.forEach((result, index) => {
          // fulfilled olarak dönüyor ama success: false olabilir
          if (
            result.status === 'fulfilled' &&
            result.value?.success === false
          ) {
            const errorMessage = result.value?.error || 'Bilinmeyen hata';
            errors.push({
              title: `Ürün Görseli ${index + 1}`,
              message: errorMessage,
            });
          } else if (result.status === 'rejected') {
            let errorMessage = 'Bilinmeyen hata';

            if (result.reason?.value?.error) {
              errorMessage = result.reason.value.error;
            } else if (result.reason instanceof Error) {
              errorMessage = result.reason.message;
            } else if (typeof result.reason === 'string') {
              errorMessage = result.reason;
            }

            errors.push({
              title: `Ürün Görseli ${index + 1}`,
              message: errorMessage,
            });
          }
        });
      }

      for (const variant of formData.combinatedVariants) {
        if (!variant.images || variant.images.length === 0) continue;

        const combinationInfo = updatedCombinations.find(
          (c) => c.sku === variant.sku,
        );

        if (!combinationInfo) {
          continue;
        }

        const variantImageResults = await Promise.allSettled(
          variant.images.map(async (imageItem) => {
            return uploadProductImageMutation.mutateAsync({
              file: imageItem.file,
              variantId: combinationInfo.id,
              order: imageItem.order,
            });
          }),
        );

        variantImageResults.forEach((result, index) => {
          // fulfilled olarak dönüyor ama success: false olabilir
          if (
            result.status === 'fulfilled' &&
            result.value?.success === false
          ) {
            const errorMessage = result.value?.error || 'Bilinmeyen hata';
            errors.push({
              title: `Varyant Görseli (SKU: ${variant.sku})`,
              message: `Görsel ${index + 1}: ${errorMessage}`,
            });
          } else if (result.status === 'rejected') {
            let errorMessage = 'Bilinmeyen hata';

            if (result.reason?.value?.error) {
              errorMessage = result.reason.value.error;
            } else if (result.reason instanceof Error) {
              errorMessage = result.reason.message;
            } else if (typeof result.reason === 'string') {
              errorMessage = result.reason;
            }

            errors.push({
              title: `Varyant Görseli (SKU: ${variant.sku})`,
              message: `Görsel ${index + 1}: ${errorMessage}`,
            });
          }
        });
      }

      if (formData.existingVariants) {
        for (const existingVariant of formData.existingVariants) {
          for (const option of existingVariant.options) {
            if (option.file) {
              const result = await uploadVariantOptionFileMutation
                .mutateAsync({
                  file: option.file,
                  uniqueId: option.uniqueId,
                })
                .catch((error) => error);

              // fulfilled olarak dönüyor ama success: false olabilir
              if (result?.success === false) {
                const errorMessage = result?.error || 'Bilinmeyen hata';
                errors.push({
                  title: 'Varyant Opsiyon Dosyası',
                  message: errorMessage,
                });
              }
            }
          }
        }
      }

      if (errors.length > 0) {
        errors.slice(0, 5).forEach((error) => {
          notifications.show({
            title: error.title,
            message: error.message,
            color: 'red',
            autoClose: 5000,
          });
        });

        if (errors.length > 5) {
          notifications.show({
            title: 'Daha Fazla Hata',
            message: `${errors.length - 5} dosya daha yüklenemedi.`,
            color: 'orange',
            autoClose: 5000,
          });
        }
      }

      context.client.invalidateQueries({
        queryKey: ['admin-product', productId],
      });

      context.client.invalidateQueries({
        queryKey: ['admin-products'],
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      console.error('Resimler yüklenirken hata oluştu:', errorMessage);
      notifications.show({
        title: 'Kritik Hata',
        message: errorMessage,
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const handleAddImages = (newFiles: File[]) => {
    const currentImages = images;
    const currentExistingCount = existingImages.length;
    const startOrder = currentExistingCount + currentImages.length;

    const newImagesWithOrder = newFiles.map((file, index) => ({
      file,
      order: startOrder + index,
    }));

    setValue('images', [...currentImages, ...newImagesWithOrder], {
      shouldValidate: true,
    });
  };

  const handleRemoveNewImage = (fileToRemove: File) => {
    const filteredImages = images.filter((item) => item.file !== fileToRemove);

    const removedImage = images.find((item) => item.file === fileToRemove);
    const removedOrder = removedImage?.order;

    if (removedOrder === undefined) {
      console.error('Silinen görsel bulunamadı');
      return;
    }

    const reorderedExistingImages = existingImages.map((img) => {
      if (img.order > removedOrder) {
        return { ...img, order: img.order - 1 };
      }
      return img;
    });

    const reorderedNewImages = filteredImages.map((img) => {
      if (img.order > removedOrder) {
        return { ...img, order: img.order - 1 };
      }
      return img;
    });

    setValue('existingImages', reorderedExistingImages, {
      shouldValidate: true,
    });

    setValue('images', reorderedNewImages, { shouldValidate: true });
  };

  const handleReorder = (
    newOrder: Array<{
      url: string;
      order: number;
      file?: File;
      isNew: boolean;
    }>,
  ) => {
    const existingImagesInOrder = newOrder.filter((item) => !item.isNew);
    const newImagesInOrder = newOrder.filter((item) => item.isNew);

    const updatedExistingImages = existingImagesInOrder
      .map((item) => {
        const existingImage = existingImages.find(
          (img) => img.url === item.url,
        );

        if (!existingImage) {
          return null;
        }

        return {
          ...existingImage,
          order: item.order,
        };
      })
      .filter((img): img is NonNullable<typeof img> => img !== null);

    const updatedNewImages = newImagesInOrder
      .map((item) => {
        if (!item.file) {
          return null;
        }

        const existingNewImage = images.find((img) => img.file === item.file);

        if (existingNewImage) {
          return {
            file: existingNewImage.file,
            order: item.order,
          };
        }

        const fallbackMatch = images.find(
          (img) =>
            img.file.name === item.file!.name &&
            img.file.size === item.file!.size,
        );

        if (fallbackMatch) {
          return {
            file: fallbackMatch.file,
            order: item.order,
          };
        }

        return null;
      })
      .filter((img): img is NonNullable<typeof img> => img !== null);

    setValue('existingImages', updatedExistingImages, { shouldValidate: true });
    setValue('images', updatedNewImages, { shouldValidate: true });
  };

  const handleRemoveExistingImage = async (urlToRemove: string) => {
    try {
      await deleteProductAssetMutation.mutateAsync(urlToRemove);

      const filteredImages = existingImages.filter(
        (image) => image.url !== urlToRemove,
      );

      const removedImage = existingImages.find(
        (image) => image.url === urlToRemove,
      );
      const removedOrder = removedImage?.order;

      if (removedOrder === undefined) {
        throw new Error('Silinen görsel bulunamadı');
      }

      const reorderedExistingImages = filteredImages.map((img) => {
        if (img.order > removedOrder) {
          return { ...img, order: img.order - 1 };
        }
        return img;
      });

      const reorderedNewImages = images.map((img) => {
        if (img.order > removedOrder) {
          return { ...img, order: img.order - 1 };
        }
        return img;
      });

      setValue('existingImages', reorderedExistingImages, {
        shouldValidate: true,
      });
      setValue('images', reorderedNewImages, { shouldValidate: true });

      notifications.show({
        title: 'Başarılı!',
        message: 'Görsel başarıyla silindi.',
        color: 'green',
        autoClose: 3000,
      });
    } catch (error) {
      notifications.show({
        title: 'Hata!',
        message: 'Görsel silinirken bir hata oluştu.',
        color: 'red',
        autoClose: 3000,
      });
      throw error;
    }
  };

  return (
    <Stack gap={'lg'}>
      {(isSubmitting || createOrUpdateVariantProductMutation.isPending) && (
        <LoadingOverlay />
      )}
      <Group align="center" justify="space-between">
        <Title order={4}>
          Varyantlı Ürün {defaultValues ? 'Güncelle' : 'Oluştur'}
        </Title>
        <Group gap="md" justify="end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setValue('active', false);
              handleSubmit(onSubmit)();
            }}
          >
            {defaultValues ? 'Pasif Olarak Güncelle' : 'Taslak Olarak Kaydet'}
          </Button>
          <Button type="button" onClick={handleSubmit(onSubmit)}>
            {defaultValues ? 'Güncelle' : 'Kaydet'}
          </Button>
        </Group>
      </Group>
      <Grid>
        <Grid.Col span={{ xs: 12, sm: 8 }}>
          <Controller
            control={control}
            name="translations.0.name"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                onChange={(event) => {
                  field.onChange(event);
                  setValue(
                    'translations.0.slug',
                    slugify(event.currentTarget.value),
                  );
                }}
                error={fieldState.error?.message}
                label="Ürün Adı"
                withAsterisk
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={{ xs: 12, sm: 4 }}>
          <Controller
            control={control}
            name="type"
            render={({ field, fieldState }) => (
              <Select
                {...field}
                error={fieldState.error?.message}
                label="Ürün Tipi"
                data={Object.values(ProductType).map((data) => ({
                  label: getProductTypeLabel(data),
                  value: data,
                }))}
                allowDeselect={false}
                withAsterisk
              />
            )}
          />
        </Grid.Col>
      </Grid>
      <Controller
        control={control}
        name="active"
        render={({ field: { value, ...field } }) => (
          <Switch
            {...field}
            checked={value}
            label={value ? 'Aktif' : 'Pasif'}
          />
        )}
      />
      <Controller
        control={control}
        name="translations.0.description"
        render={({ field, fieldState }) => (
          <GlobalTextEditor
            label="Ürün Açıklaması"
            {...field}
            value={field.value ?? undefined}
            placeholder="Ürün Açıklaması girebilirsiniz. Ai'dan yardım almak için /ai yazın"
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="images"
        render={({ fieldState }) => (
          <Stack gap={'xs'}>
            <InputLabel>Ürün Görselleri</InputLabel>
            <ProductDropzone
              existingImages={existingImages}
              images={images}
              onAddImages={handleAddImages}
              onRemoveNewImage={handleRemoveNewImage}
              onRemoveExistingImage={handleRemoveExistingImage}
              onReorder={handleReorder}
            />
            {fieldState.error && (
              <InputError>{fieldState.error.message}</InputError>
            )}
          </Stack>
        )}
      />
      <SimpleGrid cols={{ xs: 2, sm: 4 }}>
        <Controller
          control={control}
          name="categories"
          render={({ field }) => (
            <AdminCategoryDataSelect
              onChange={(data) => {
                field.onChange(data);
              }}
              multiple
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="tagIds"
          render={({ field, fieldState }) => (
            <AdminTagDataSelect
              onChange={(data) => {
                field.onChange(data);
              }}
              multiple
              value={field.value}
              props={{
                error: fieldState.error?.message,
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="brandId"
          render={({ field }) => (
            <AdminBrandDataSelect
              multiple={false}
              onChange={(data) => {
                if (Array.isArray(data)) {
                  return;
                }
                field.onChange(data);
              }}
              value={field.value || null}
            />
          )}
        />

        <Controller
          control={control}
          name="googleTaxonomyId"
          render={({ field, fieldState }) => (
            <>
              <TaxonomySelect field={{ ...field }} />
              {fieldState.error && (
                <InputError>{fieldState.error.message}</InputError>
              )}
            </>
          )}
        />
      </SimpleGrid>
      <ExistingVariantCard
        control={control}
        errors={errors.existingVariants?.message}
        setValue={setValue}
        getValues={getValues}
      />
      <SeoCard
        control={control}
        metaDescriptionFieldName="translations.0.metaDescription"
        metaTitleFieldName="translations.0.metaTitle"
        slugFieldName="translations.0.slug"
      />
    </Stack>
  );
};

export default VariantProductForm;
