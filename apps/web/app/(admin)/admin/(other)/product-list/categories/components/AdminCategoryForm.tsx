'use client';

import Dropzone from '@/components/Dropzone';
import LoadingOverlay from '@/components/LoadingOverlay';
import SeoCard from '@/components/SeoCard';
import {
  useParentCategories,
  useCreateOrUpdateCategory,
  useUploadCategoryImage,
  useDeleteCategoryImage,
} from '@hooks/admin/useAdminCategories';

import {
  Button,
  Group,
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
  slugify,
  SubmitHandler,
  useForm,
  zodResolver,
} from '@repo/shared';
import { CategorySchema, CategoryZodType } from '@repo/types';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface AdminCategoryFormProps {
  defaultValues?: CategoryZodType;
}

const AdminCategoryForm = ({ defaultValues }: AdminCategoryFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = useForm<CategoryZodType>({
    resolver: zodResolver(CategorySchema),
    defaultValues: defaultValues || {
      existingImage: null,
      image: null,
      parentId: null,
      translations: [
        {
          name: '',
          locale: 'TR',
          slug: '',
          description: null,
          metaDescription: null,
          metaTitle: null,
        },
      ],
      uniqueId: createId(),
    },
  });

  const { push, refresh } = useRouter();
  const existingImage = watch('existingImage') || null;
  const createOrUpdateCategory = useCreateOrUpdateCategory();
  const uploadCategoryImage = useUploadCategoryImage();
  const deleteCategoryImage = useDeleteCategoryImage();

  const { data: parentCategories = [], isLoading: parentCategoriesLoading } =
    useParentCategories(defaultValues?.uniqueId);

  const selectData = useMemo(() => {
    if (!parentCategories.length) return [];

    return parentCategories.map((group) => ({
      group: group.group,
      items: group.items.map((item) => ({
        value: item.value,
        label: item.label,
        disabled: item.disabled,
      })),
    }));
  }, [parentCategories]);

  const onSubmit: SubmitHandler<CategoryZodType> = async (
    data: CategoryZodType,
  ) => {
    const { image, ...rest } = data;

    try {
      await createOrUpdateCategory.mutateAsync(rest);

      if (image) {
        await uploadCategoryImage.mutateAsync({
          file: image,
          uniqueId: data.uniqueId,
        });
      }

      notifications.show({
        title: 'Başarılı',
        message: 'Kategori başarıyla kaydedildi',
        autoClose: 3000,
        color: 'green',
      });

      push('/admin/product-list/categories');
    } catch (error) {
      notifications.show({
        title: 'Hata',
        message:
          error instanceof Error
            ? error.message
            : 'Beklenmeyen bir hata oluştu',
        autoClose: 3000,
        color: 'red',
      });
    }
  };

  return (
    <Stack gap={'lg'}>
      {isSubmitting && <LoadingOverlay />}
      <Group justify="space-between" align="center">
        <Title order={3}>
          Kategori
          {defaultValues ? ' Düzenle' : ' Oluştur'}
        </Title>
        <Button variant="outline" onClick={handleSubmit(onSubmit)}>
          Kaydet
        </Button>
      </Group>
      <SimpleGrid
        cols={{
          xs: 1,
          sm: 2,
        }}
      >
        <Controller
          control={control}
          name="translations.0.name"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              error={fieldState.error ? fieldState.error.message : null}
              label="Kategori Adı"
              onChange={(e) => {
                field.onChange(e);
                setValue('translations.0.slug', slugify(e.currentTarget.value));
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="parentId"
          render={({ field, fieldState }) => (
            <Select
              {...field}
              value={field.value || null}
              onChange={(value) => field.onChange(value || null)}
              error={fieldState.error?.message}
              label="Üst Kategori"
              clearable
              searchable
              data={selectData}
              disabled={parentCategoriesLoading}
              nothingFoundMessage="Kategori bulunamadı"
            />
          )}
        />
      </SimpleGrid>

      <Controller
        control={control}
        name="image"
        render={({ field, fieldState }) => (
          <Stack gap={'xs'}>
            <InputLabel>Kategori Görseli</InputLabel>
            <Dropzone
              onDrop={(files) => field.onChange(files ? files[0] : null)}
              value={field.value}
              accept={'IMAGE'}
              cols={1}
              existingImages={
                existingImage ? [{ type: 'IMAGE', url: existingImage }] : []
              }
              existingImagesDelete={async (fileUrl) => {
                try {
                  await deleteCategoryImage.mutateAsync(fileUrl);

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

export default AdminCategoryForm;
