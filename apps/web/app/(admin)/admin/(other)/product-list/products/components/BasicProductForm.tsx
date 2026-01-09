'use client';

import {
  ActionIcon,
  Button,
  Grid,
  Group,
  InputError,
  InputLabel,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  Controller,
  createId,
  generateProductCodes,
  slugify,
  SubmitHandler,
  useForm,
  useMutation,
  zodResolver,
} from '@repo/shared';
import { BaseProductSchema, BaseProductZodType } from '@repo/types';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import TaxonomySelect from '@/(admin)/admin/(other)/components/TaxonomySelect';
import {
  useCreateOrUpdateBasicProduct,
  useUploadProductImage,
  useDeleteProductAsset,
} from '@hooks/admin/useProducts';
import GlobalLoadingOverlay from '@/components/GlobalLoadingOverlay';
import GlobalSeoCard from '@/components/GlobalSeoCard';
import AdminBrandDataSelect from '@/components/inputs/admin/AdminBrandDataSelect';
import AdminCategoryDataSelect from '@/components/inputs/admin/AdminCategoryDataSelect';
import AdminTagDataSelect from '@/components/inputs/admin/AdminTagDataSelect';
import { getProductTypeLabel } from '@lib/helpers';
import { getQueryClient } from '@lib/serverQueryClient';
import { ProductType } from '@repo/database/client';
import { IconPencilPlus } from '@tabler/icons-react';
import ProductDropzone from '../../components/ProductDropzone';
import ProductPriceNumberInput from './ProductPriceNumberInput';

const GlobalTextEditor = dynamic(
  () => import('../../../../../../components/GlobalTextEditor'),
  {
    ssr: false,
    loading: () => <GlobalLoadingOverlay />,
  },
);

interface BasicProductFormProps {
  defaultValues?: BaseProductZodType;
}

const BasicProductForm = ({ defaultValues }: BasicProductFormProps) => {
  const createOrUpdateProductMutation = useCreateOrUpdateBasicProduct();
  const uploadProductImageMutation = useUploadProductImage();
  const deleteProductAssetMutation = useDeleteProductAsset();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<BaseProductZodType>({
    resolver: zodResolver(BaseProductSchema),
    defaultValues: defaultValues || {
      brandId: null,
      categories: [],
      existingImages: [],
      images: [],
      type: 'PHYSICAL',
      googleTaxonomyId: null,
      prices: [
        {
          currency: 'TRY',
          price: 0,
          buyedPrice: null,
          discountPrice: null,
        },
      ],
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
      uniqueId: createId(),
      active: true,
      stock: 0,
    },
  });

  const name = watch('translations.0.name');
  const sku = watch('sku') || null;
  const barcode = watch('barcode') || null;
  const slug = watch('translations.0.slug') || null;
  const { push } = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: BaseProductZodType) => {
      const { images, existingImages, ...productDataWithoutImages } = data;

      const productResponse = await createOrUpdateProductMutation.mutateAsync(
        productDataWithoutImages,
      );

      return {
        data,
        productId: productResponse.productId,
      };
    },

    onSuccess: async (result, variables, mutateResult, context) => {
      const { data, productId } = result;

      notifications.show({
        title: 'Başarılı!',
        message: defaultValues
          ? 'Ürün başarıyla güncellendi.'
          : 'Ürün başarıyla oluşturuldu.',
        color: 'green',
        autoClose: 3000,
      });

      uploadImagesInBackground(data.images, productId);

      context.client.invalidateQueries({
        queryKey: ['admin-product', productId],
      });

      push('/admin/product-list');
    },

    onError: (error: Error) => {
      notifications.show({
        title: 'Hata!',
        message: error.message || 'Beklenmeyen bir hata oluştu.',
        color: 'red',
        autoClose: 5000,
      });
    },
  });

  const uploadImagesInBackground = async (
    images: BaseProductZodType['images'],
    productId: string,
  ) => {
    if (!images || images.length === 0) return;

    const errors: Array<{ title: string; message: string }> = [];

    const results = await Promise.allSettled(
      images.map(async (imageItem) => {
        return uploadProductImageMutation.mutateAsync({
          file: imageItem.file,
          productId,
          order: imageItem.order,
        });
      }),
    );

    results.forEach((result, index) => {
      // fulfilled olarak dönüyor ama success: false olabilir
      if (result.status === 'fulfilled' && result.value?.success === false) {
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
          message: `${errors.length - 5} görsel daha yüklenemedi.`,
          color: 'orange',
          autoClose: 5000,
        });
      }
    }

    getQueryClient().invalidateQueries({
      queryKey: ['admin-product', productId],
    });

    getQueryClient().invalidateQueries({
      queryKey: ['admin-products'],
    });
  };

  const onSubmit: SubmitHandler<BaseProductZodType> = async (data) => {
    mutation.mutate(data);
  };

  const watchedImages = watch('images') || [];
  const watchedExistingImages = watch('existingImages') || [];

  const handleAddImages = (newFiles: File[]) => {
    const currentImages = watchedImages;
    const currentExistingCount = watchedExistingImages.length;
    const startOrder = currentExistingCount + currentImages.length;

    const newImagesWithOrder = newFiles.map((file, index) => ({
      file,
      order: startOrder + index,
    }));

    setValue('images', [...currentImages, ...newImagesWithOrder], {
      shouldValidate: true,
    });
  };

  const handleRemoveExistingImage = async (urlToRemove: string) => {
    try {
      await deleteProductAssetMutation.mutateAsync(urlToRemove);

      const filteredImages = watchedExistingImages.filter(
        (image) => image.url !== urlToRemove,
      );

      const removedImage = watchedExistingImages.find(
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

      const reorderedNewImages = watchedImages.map((img) => {
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

  const handleRemoveNewImage = (fileToRemove: File) => {
    const filteredImages = watchedImages.filter(
      (item) => item.file !== fileToRemove,
    );

    const removedImage = watchedImages.find(
      (item) => item.file === fileToRemove,
    );
    const removedOrder = removedImage?.order;

    if (removedOrder === undefined) {
      console.error('Silinen görsel bulunamadı');
      return;
    }

    const reorderedExistingImages = watchedExistingImages.map((img) => {
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
        const existingImage = watchedExistingImages.find(
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

        const existingNewImage = watchedImages.find(
          (img) => img.file === item.file,
        );

        if (existingNewImage) {
          return {
            file: existingNewImage.file,
            order: item.order,
          };
        }

        const fallbackMatch = watchedImages.find(
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

  return (
    <Stack gap={'lg'}>
      {isSubmitting || mutation.isPending ? <GlobalLoadingOverlay /> : null}
      <Group align="center" justify="space-between">
        <Title order={4}>
          Basit Ürün {defaultValues ? 'Güncelle' : 'Oluştur'}
        </Title>
        <Group gap="md" justify="end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!slug) {
                setValue('translations.0.slug', slugify(name));
              }

              if (!sku || !barcode) {
                const codes = generateProductCodes(name);
                if (!sku) {
                  setValue('sku', codes.sku);
                }
                if (!barcode) {
                  setValue('barcode', codes.barcode);
                }
              }
              setValue('active', false);
              handleSubmit(onSubmit)();
            }}
          >
            {defaultValues ? 'Pasif Olarak Güncelle' : 'Pasif Olarak Kaydet'}
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!slug) {
                setValue('translations.0.slug', slugify(name));
              }

              if (!sku || !barcode) {
                const codes = generateProductCodes(name);
                if (!sku) {
                  setValue('sku', codes.sku);
                }
                if (!barcode) {
                  setValue('barcode', codes.barcode);
                }
              }
              handleSubmit(onSubmit)();
            }}
          >
            {defaultValues ? 'Güncelle' : 'Kaydet'}
          </Button>
        </Group>
      </Group>
      <Grid>
        <Grid.Col span={{ xs: 12, sm: 6 }}>
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
        <Grid.Col span={{ xs: 12, sm: 3 }}>
          <Controller
            control={control}
            name="stock"
            render={({ field, fieldState }) => (
              <ProductPriceNumberInput
                {...field}
                error={fieldState.error?.message}
                label="Stok"
                withAsterisk
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={{ xs: 12, sm: 3 }}>
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
      <SimpleGrid cols={{ xs: 1, md: 3 }}>
        <Controller
          control={control}
          name="prices.0.price"
          render={({ field, fieldState }) => (
            <ProductPriceNumberInput
              {...field}
              error={fieldState.error?.message}
              label="Satış Fiyatı"
              withAsterisk
            />
          )}
        />

        <Controller
          control={control}
          name="prices.0.discountPrice"
          render={({ field, fieldState }) => (
            <ProductPriceNumberInput
              {...field}
              error={fieldState.error?.message}
              label="İndirimli Fiyat"
            />
          )}
        />

        <Controller
          control={control}
          name="prices.0.buyedPrice"
          render={({ field, fieldState }) => (
            <ProductPriceNumberInput
              {...field}
              error={fieldState.error?.message}
              label="Alış Fiyat"
            />
          )}
        />
      </SimpleGrid>
      <SimpleGrid cols={{ xs: 1, md: 2 }}>
        <Controller
          control={control}
          name="sku"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              value={field.value || ''}
              error={fieldState.error?.message}
              label="SKU (Stok Kodu)"
              placeholder="Otomatik oluşturulacak"
              description="Boş bırakırsanız ürün adından otomatik oluşturulur"
              rightSection={
                <ActionIcon
                  variant="light"
                  disabled={!name}
                  onClick={() => {
                    if (name) {
                      const codes = generateProductCodes(name);
                      setValue('sku', codes.sku);
                    }
                  }}
                >
                  <IconPencilPlus />
                </ActionIcon>
              }
            />
          )}
        />
        <Controller
          control={control}
          name="barcode"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              value={field.value || ''}
              error={fieldState.error?.message}
              label="Barcode"
              placeholder="Otomatik oluşturulacak"
              description="Boş bırakırsanız otomatik EAN-13 barcode oluşturulur"
              rightSection={
                <ActionIcon
                  variant="light"
                  disabled={!name}
                  onClick={() => {
                    if (name) {
                      const codes = generateProductCodes(name);
                      setValue('barcode', codes.barcode);
                    }
                  }}
                >
                  <IconPencilPlus />
                </ActionIcon>
              }
            />
          )}
        />
      </SimpleGrid>
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
      <Controller
        control={control}
        name="translations.0.description"
        render={({ field, fieldState }) => (
          <GlobalTextEditor
            label="Ürün Açıklaması"
            {...field}
            value={field.value ?? undefined}
            error={fieldState.error?.message}
          />
        )}
      />
      <Stack gap={'xs'}>
        <InputLabel>Ürün Görselleri</InputLabel>

        <Controller
          control={control}
          name="images"
          render={({ fieldState }) => (
            <>
              {fieldState?.error?.message && (
                <InputError>{fieldState.error?.message}</InputError>
              )}
              <ProductDropzone
                existingImages={watchedExistingImages}
                images={watchedImages}
                onAddImages={handleAddImages}
                onRemoveNewImage={handleRemoveNewImage}
                onRemoveExistingImage={handleRemoveExistingImage}
                onReorder={handleReorder}
              />
            </>
          )}
        />
      </Stack>
      <GlobalSeoCard
        control={control}
        metaDescriptionFieldName="translations.0.metaDescription"
        metaTitleFieldName="translations.0.metaTitle"
        slugFieldName="translations.0.slug"
      />
    </Stack>
  );
};

export default BasicProductForm;
