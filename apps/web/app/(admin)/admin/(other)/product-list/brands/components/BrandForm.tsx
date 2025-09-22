"use client";

import {
  Button,
  Group,
  InputLabel,
  SimpleGrid,
  Stack,
  Text,
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
import { Brand, BrandSchema } from "@repo/types";
import { useRouter } from "next/navigation";
import GlobalDropzone from "@/components/GlobalDropzone";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import GlobalSeoCard from "@/components/GlobalSeoCard";
import CustomBrandSelect from "./CustomBrandSelect";

interface BrandFormProps {
  defaultValues?: Brand;
}

const BrandForm = ({ defaultValues }: BrandFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<Brand>({
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

  const onSubmit: SubmitHandler<Brand> = async (data) => {
    const { image, ...rest } = data;

    try {
      const brandResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/brands/create-or-update-brand`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rest),
          credentials: "include",
          cache: "no-cache",
        }
      );

      if (!brandResponse.ok) {
        let errorMessage = "Marka kaydedilirken bir hata oluştu";

        try {
          const errorData = await brandResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // JSON parse edilemezse default mesajı kullan
        }

        notifications.show({
          title: "Hata",
          message: errorMessage,
          autoClose: 3000,
          color: "red",
        });
        return;
      }

      const brandResult = await brandResponse.json();

      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        const imageResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/brands/update-brand-image/${data.uniqueId}`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
            cache: "no-cache",
          }
        );

        if (!imageResponse.ok) {
          let imageErrorMessage = "Resim yüklenirken bir hata oluştu";

          try {
            const errorData = await imageResponse.json();
            imageErrorMessage = errorData.message || imageErrorMessage;
          } catch (err) {
            console.error("Error parsing JSON:", err);
          }

          notifications.show({
            title: "Hata",
            message: imageErrorMessage,
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
        message: "Bağlantı hatası. Lütfen tekrar deneyin.",
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
            <CustomBrandSelect
              {...field}
              nothingFoundMessage={
                <Text fz={"md"} fw={700}>
                  Hiçbir ebeveyn marka bulunamadı
                </Text>
              }
              label="Ebeveyn Marka"
              error={fieldState.error?.message}
              brandId={defaultValues?.uniqueId}
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
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/brands/delete-brand-image/${encodeURIComponent(fileUrl)}`,
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
