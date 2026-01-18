'use client';

import Dropzone from '@/components/Dropzone';
import LoadingOverlay from '@/components/LoadingOverlay';
import SeoCard from '@/components/SeoCard';
import AdminBrandDataSelect from '@/components/inputs/admin/AdminBrandDataSelect';
import {
  useCreateOrUpdateBrand,
  useUploadBrandImage,
  useDeleteBrandImage,
} from '@hooks/admin/useAdminBrands';
import {
  Button,
  Group,
  InputLabel,
  SimpleGrid,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  Controller,
  createId,
  slugify,
  SubmitHandler,
  useForm,
  zodResolver,
} from '@repo/shared';
import { BrandSchema, BrandZodType } from '@repo/types';
import { useRouter } from 'next/navigation';

interface BrandFormProps {
  defaultValues?: BrandZodType;
}

const BrandForm = ({ defaultValues }: BrandFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = useForm<BrandZodType>({
    resolver: zodResolver(BrandSchema),
    defaultValues: defaultValues || {
      uniqueId: createId(),
      existingImage: null,
      image: null,
      parentId: null,
      translations: [
        {
          locale: 'TR',
          name: '',
          slug: '',
          metaDescription: null,
          metaTitle: null,
        },
      ],
    },
  });
  const router = useRouter();
  const createOrUpdateBrand = useCreateOrUpdateBrand();
  const uploadBrandImage = useUploadBrandImage();
  const deleteBrandImage = useDeleteBrandImage();

  const onSubmit: SubmitHandler<BrandZodType> = async (data) => {
    const { image, ...rest } = data;

    try {
      const brandResult = await createOrUpdateBrand.mutateAsync(rest);

      if (image) {
        await uploadBrandImage.mutateAsync({
          file: image,
          brandId: brandResult.brandId,
        });
      }

      notifications.show({
        title: 'Başarılı',
        message: 'Marka başarıyla kaydedildi',
        autoClose: 3000,
        color: 'green',
      });

      router.push('/admin/product-list/brands');
      router.refresh(); // Server component'leri yenile
    } catch (error) {
      notifications.show({
        title: 'Hata',
        message: error instanceof Error ? error.message : 'Bir hata oluştu',
        autoClose: 3000,
        color: 'red',
      });
    }
  };
  const existingImage = watch('existingImage') || null;
  return (
    <Stack gap={'lg'}>
      {isSubmitting && <LoadingOverlay />}
      <Group justify="space-between" align="center">
        <Title order={3}>
          Marka
          {defaultValues ? ' Düzenle' : ' Oluştur'}
        </Title>
        <Button variant="outline" onClick={handleSubmit(onSubmit)}>
          Kaydet
        </Button>
      </Group>
      <SimpleGrid cols={{ xs: 1, sm: 2 }}>
        <Controller
          control={control}
          name="translations.0.name"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              error={fieldState.error?.message}
              onChange={(e) => {
                field.onChange(e);
                setValue('translations.0.slug', slugify(e.currentTarget.value));
              }}
              label="Marka Adı"
            />
          )}
        />
        <Controller
          control={control}
          name="parentId"
          render={({ field, fieldState }) => (
            <AdminBrandDataSelect
              {...field}
              props={{
                error: fieldState.error?.message,
              }}
              multiple={false}
            />
          )}
        />
      </SimpleGrid>
      <Controller
        control={control}
        name="image"
        render={({ field, fieldState }) => (
          <Stack gap={'xs'}>
            <InputLabel>Marka Görseli</InputLabel>
            <Dropzone
              onDrop={(files) => field.onChange(files ? files[0] : null)}
              value={field.value}
              accept={'IMAGE'}
              existingImages={
                existingImage ? [{ type: 'IMAGE', url: existingImage }] : []
              }
              existingImagesDelete={async (fileUrl) => {
                try {
                  await deleteBrandImage.mutateAsync(fileUrl);

                  notifications.show({
                    title: 'Başarılı',
                    message: 'Resim başarıyla silindi',
                    autoClose: 3000,
                    color: 'green',
                  });

                  setValue('existingImage', null);
                } catch (error) {
                  notifications.show({
                    title: 'Hata',
                    message:
                      error instanceof Error
                        ? error.message
                        : 'Resim silinirken bir hata oluştu',
                    autoClose: 3000,
                    color: 'red',
                  });
                }
              }}
              cols={1}
              error={fieldState.error?.message}
              multiple={false}
              maxFiles={1}
              maxSize={10 * 1024 * 1024}
              onChange={field.onChange}
            />
          </Stack>
        )}
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

export default BrandForm;
