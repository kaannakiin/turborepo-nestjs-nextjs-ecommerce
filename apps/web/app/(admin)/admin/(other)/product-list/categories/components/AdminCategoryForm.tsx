"use client";

import GlobalDropzone from "@/components/GlobalDropzone";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import GlobalSeoCard from "@/components/GlobalSeoCard";
import fetchWrapper from "@lib/wrappers/fetchWrapper";

import {
  Button,
  Group,
  InputLabel,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  Controller,
  createId,
  slugify,
  SubmitHandler,
  useForm,
  useQuery,
  zodResolver,
} from "@repo/shared";
import { CategorySchema, CategoryZodType } from "@repo/types";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

interface AdminCategoryFormProps {
  defaultValues?: CategoryZodType;
}

interface CategoryGroup {
  group: string;
  items: Array<{ value: string; label: string; disabled?: boolean }>;
}

const fetchParentCategories = async (categoryId?: string) => {
  const params = categoryId ? { excludeId: categoryId } : {};

  const result = await fetchWrapper.get<CategoryGroup[]>(
    `/admin/products/categories/get-all-categories-for-select`,
    { params }
  );

  if (!result.success) {
    throw new Error("Üst kategoriler yüklenirken bir hata oluştu");
  }

  return result.data;
};

const useParentCategories = (currentCategoryId?: string) => {
  return useQuery({
    queryKey: ["parentCategories", currentCategoryId],
    queryFn: () => fetchParentCategories(currentCategoryId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

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
          name: "",
          locale: "TR",
          slug: "",
          description: null,
          metaDescription: null,
          metaTitle: null,
        },
      ],
      uniqueId: createId(),
    },
  });

  const { push } = useRouter();
  const existingImage = watch("existingImage") || null;

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
    data: CategoryZodType
  ) => {
    const { image, ...rest } = data;

    try {
      const categoryRes = await fetchWrapper.post<{ categoryId: string }>(
        "/admin/products/categories/create-or-update-category",
        rest
      );

      if (!categoryRes.success) {
        notifications.show({
          title: "Hata",
          message: "Kategori kaydedilirken bir hata oluştu",
          autoClose: 3000,
          color: "red",
        });
        return;
      }

      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const imageRes = await fetchWrapper.postFormData<void>(
          `/admin/products/categories/upload-category-image/${data.uniqueId}`,
          formData
        );

        if (!imageRes.success) {
          notifications.show({
            title: "Hata",
            message: "Kategori resmi yüklenirken bir hata oluştu",
            autoClose: 3000,
            color: "red",
          });
          return;
        }
      }

      push("/admin/product-list/categories");
      notifications.show({
        title: "Başarılı",
        message: "Kategori başarıyla kaydedildi",
        autoClose: 3000,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Hata",
        message: "Beklenmeyen bir hata oluştu",
        autoClose: 3000,
        color: "red",
      });
    }
  };

  return (
    <Stack gap={"lg"}>
      {isSubmitting && <GlobalLoadingOverlay />}
      <Group justify="space-between" align="center">
        <Title order={3}>
          Kategori
          {defaultValues ? " Düzenle" : " Oluştur"}
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
                setValue("translations.0.slug", slugify(e.currentTarget.value));
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
          <Stack gap={"xs"}>
            <InputLabel>Kategori Görseli</InputLabel>
            <GlobalDropzone
              onDrop={(files) => field.onChange(files ? files[0] : null)}
              value={field.value}
              accept={"IMAGE"}
              cols={1}
              existingImages={
                existingImage ? [{ type: "IMAGE", url: existingImage }] : []
              }
              existingImagesDelete={async (fileUrl) => {
                const response = await fetchWrapper.delete(
                  `/admin/products/categories/delete-category-image/${encodeURIComponent(fileUrl)}`
                );

                if (!response.success) {
                  notifications.show({
                    title: "Hata",
                    message: "Resim silinirken bir hata oluştu",
                    autoClose: 3000,
                    color: "red",
                  });
                  return;
                }

                notifications.show({
                  title: "Başarılı",
                  message: "Resim başarıyla silindi",
                  autoClose: 3000,
                  color: "green",
                });
                setValue("existingImage", null);
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
      <GlobalSeoCard
        control={control}
        metaDescriptionFieldName="translations.0.metaDescription"
        metaTitleFieldName="translations.0.metaTitle"
        slugFieldName="translations.0.slug"
      />
    </Stack>
  );
};

export default AdminCategoryForm;
