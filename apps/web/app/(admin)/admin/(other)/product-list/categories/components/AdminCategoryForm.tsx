"use client";

import GlobalDropzone from "@/components/GlobalDropzone";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import GlobalSeoCard from "@/components/GlobalSeoCard";
import FetchWrapperV2 from "@lib/fetchWrapper-v2";
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
import { Category, CategorySchema } from "@repo/types";
import { useRouter } from "next/navigation";

interface AdminCategoryFormProps {
  defaultValues?: Category;
}

// Fetch function for parent categories
const fetchParentCategories = async (categoryId?: string) => {
  const api = new FetchWrapperV2();
  const endpoint = categoryId
    ? `get-all-parent-categories/${categoryId}`
    : "get-all-parent-categories";

  const result = await api.get<{
    data: Array<{ value: string; label: string }>;
  }>(`/admin/products/categories/${endpoint}`);

  if (!result.success) {
    throw new Error("Üst kategoriler yüklenirken bir hata oluştu");
  }

  return result.data.data;
};

// Custom hook for parent categories
const useParentCategories = (currentCategoryId?: string) => {
  return useQuery({
    queryKey: ["parentCategories", currentCategoryId],
    queryFn: () => fetchParentCategories(currentCategoryId),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
  });
};

const AdminCategoryForm = ({ defaultValues }: AdminCategoryFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
    setValue,
  } = useForm<Category>({
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

  // TanStack Query hook'u
  const { data: parentCategories = [], isLoading: parentCategoriesLoading } =
    useParentCategories(defaultValues?.uniqueId);

  const onSubmit: SubmitHandler<Category> = async (data: Category) => {
    const { image, ...rest } = data;

    try {
      const api = new FetchWrapperV2();

      // Kategori oluştur
      const categoryRes = await api.post<void>(
        "/admin/products/categories/create-or-update-category",
        {
          body: JSON.stringify(rest),
        }
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

      // Resim yükle
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const imageRes = await api.postFormData<void>(
          `/admin/products/categories/update-category-image/${data.uniqueId}`,
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
              error={fieldState.error?.message}
              label="Ebeveyn Kategori"
              clearable
              data={parentCategories}
              disabled={parentCategoriesLoading}
            />
          )}
        />
      </SimpleGrid>

      {/* Rest of the form remains the same */}
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
              existingImages={
                existingImage ? [{ type: "IMAGE", url: existingImage }] : []
              }
              existingImagesDelete={async (fileUrl) => {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/categories/delete-category-image/${encodeURIComponent(fileUrl)}`,
                  {
                    method: "DELETE",
                    credentials: "include",
                    cache: "no-cache",
                  }
                );

                if (!response.ok) {
                  let errorMessage = "Resim silinirken bir hata oluştu";

                  try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                  } catch (err) {
                    console.error("Error parsing JSON:", err);
                  }

                  notifications.show({
                    title: "Hata",
                    message: errorMessage,
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
