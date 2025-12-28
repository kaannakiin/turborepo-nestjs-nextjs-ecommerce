"use client";

import GlobalDropzone from "@/components/GlobalDropzone";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import GlobalSeoCard from "@/components/GlobalSeoCard";
import AdminBrandDataSelect from "@/components/inputs/admin/AdminBrandDataSelect";
import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import {
  Button,
  Group,
  InputLabel,
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
  zodResolver,
} from "@repo/shared";
import { BrandSchema, BrandZodType } from "@repo/types";
import { useRouter } from "next/navigation";

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
          locale: "TR",
          name: "",
          slug: "",
          metaDescription: null,
          metaTitle: null,
        },
      ],
    },
  });
  const { push } = useRouter();

  const onSubmit: SubmitHandler<BrandZodType> = async (data) => {
    const { image, ...rest } = data;

    try {
      // Brand oluştur
      const brandRes = await fetchWrapper.post<{
        success: boolean;
        brandId: string;
      }>("/admin/products/brands/create-or-update-brand", rest);
      if (!brandRes.success) {
        const response = brandRes as ApiError;
        notifications.show({
          title: "Hata",
          message:
            response.error ||
            "Marka kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
          autoClose: 3000,
        });
        return;
      }

      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const imageRes = await fetchWrapper.postFormData(
          `/admin/products/brands/upload-brand-image/${brandRes.data.brandId}`,
          formData
        );
        if (!imageRes.success) {
          const error = imageRes as ApiError;
          notifications.show({
            title: "Hata",
            message:
              error.error ||
              "Resim yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
            autoClose: 3000,
            color: "red",
          });
          return;
        }
      }

      push("/admin/product-list/brands");
      notifications.show({
        title: "Başarılı",
        message: "Marka başarıyla kaydedildi",
        autoClose: 3000,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Hata",
        message: error instanceof Error ? error.message : "Bir hata oluştu",
        autoClose: 3000,
        color: "red",
      });
    }
  };
  const existingImage = watch("existingImage") || null;
  return (
    <Stack gap={"lg"}>
      {isSubmitting && <GlobalLoadingOverlay />}
      <Group justify="space-between" align="center">
        <Title order={3}>
          Marka
          {defaultValues ? " Düzenle" : " Oluştur"}
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
                setValue("translations.0.slug", slugify(e.currentTarget.value));
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
          <Stack gap={"xs"}>
            <InputLabel>Marka Görseli</InputLabel>
            <GlobalDropzone
              onDrop={(files) => field.onChange(files ? files[0] : null)}
              value={field.value}
              accept={"IMAGE"}
              existingImages={
                existingImage ? [{ type: "IMAGE", url: existingImage }] : []
              }
              existingImagesDelete={async (fileUrl) => {
                const result = await fetchWrapper.delete<void>(
                  `/admin/products/brands/delete-brand-image/${encodeURIComponent(fileUrl)}`
                );

                if (!result.success) {
                  notifications.show({
                    title: "Hata",
                    message:
                      "Resim silinirken bir hata oluştu. Lütfen tekrar deneyin.",
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
      <GlobalSeoCard
        control={control}
        metaDescriptionFieldName="translations.0.metaDescription"
        metaTitleFieldName="translations.0.metaTitle"
        slugFieldName="translations.0.slug"
      />
    </Stack>
  );
};

export default BrandForm;
