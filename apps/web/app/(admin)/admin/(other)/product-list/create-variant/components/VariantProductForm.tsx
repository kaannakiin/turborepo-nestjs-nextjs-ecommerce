"use client";

import {
  Button,
  Grid,
  Group,
  InputLabel,
  MultiSelect,
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
  zodResolver,
} from "@repo/shared";
import {
  $Enums,
  BrandSelectType,
  CategorySelectType,
  VariantProductSchema,
  VariantProductZodType,
} from "@repo/types";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getProductTypeLabel } from "../../../../../../../lib/helpers";
import GlobalDropzone from "../../../../../../components/GlobalDropzone";
import GlobalLoadingOverlay from "../../../../../../components/GlobalLoadingOverlay";
import GlobalSeoCard from "../../../../../../components/GlobalSeoCard";
import ExistingVariantCard from "./ExistingVariantCard";
import GoogleTaxonomySelectV2 from "./GoogleTaxonomySelectV2";
import ProductDetailCard from "./ProductDetailCard";

const GlobalTextEditor = dynamic(
  () => import("../../../../../../components/GlobalTextEditor"),
  { ssr: false, loading: () => <GlobalLoadingOverlay /> }
);

interface VariantProductFormProps {
  defaultValues?: VariantProductZodType;
  categories: CategorySelectType[];
  brands: BrandSelectType[];
}

const VariantProductForm = ({
  defaultValues,
  brands,
  categories,
}: VariantProductFormProps) => {
  const {
    control,
    formState: { isSubmitting, errors },
    watch,
    handleSubmit,
    setValue,
  } = useForm<VariantProductZodType>({
    resolver: zodResolver(VariantProductSchema),
    defaultValues: defaultValues || {
      uniqueId: createId(),
      type: "PHYSICAL",
      combinatedVariants: [],
      existingImages: [],
      existingVariants: [],
      images: [],
      translations: [
        {
          locale: "TR",
          name: "",
          slug: "",
          description: null,
          metaDescription: null,
          metaTitle: null,
        },
      ],
    },
  });
  const existingImages = watch("existingImages") || [];

  const { push } = useRouter();
  const onSubmit: SubmitHandler<VariantProductZodType> = async (data) => {
    try {
      const { images, combinatedVariants, ...productData } = data;
      const cleanCombinatedVariants = combinatedVariants.map(
        ({ images: variantImages, existingImages, ...variant }) => variant
      );
      const cleanExistingVariants = data.existingVariants.map(
        ({ options, ...variant }) => ({
          ...variant,
          options: options.map(({ file, ...option }) => option),
        })
      );

      const mainDataResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/create-or-update-variant-product`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...productData,
            combinatedVariants: cleanCombinatedVariants,
            existingVariants: cleanExistingVariants,
          }),
          credentials: "include",
        }
      );

      if (!mainDataResponse.ok) {
        // Ana veri kaydedilemezse bu kritik bir hatadır, kullanıcıya göster.
        const error = await mainDataResponse.json();
        notifications.show({
          title: "Hata!",
          message: error.message || "Ürün kaydedilirken bir hata oluştu.",
          color: "red",
        });
        return;
      }

      const responseData = await mainDataResponse.json();
      const { productId, combinations: updatedCombinations } =
        responseData.data;

      // TODO EXISTINGVARIANTSLAR ICIN RESIM YUKLEME ISLEMI YAP
      notifications.show({
        title: "Başarılı!",
        message: defaultValues
          ? "Ürün başarıyla güncellendi."
          : "Ürün başarıyla kaydedildi.",
        color: "green",
      });

      await uploadAllImagesInBackground(data, productId, updatedCombinations);
      push("/admin/product-list");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "İnternet bağlantınızı kontrol edin.";
      notifications.show({
        title: "Bağlantı Hatası!",
        message: errorMessage,
        color: "red",
      });
    }
  };

  const uploadAllImagesInBackground = async (
    formData: VariantProductZodType,
    productId: string,
    updatedCombinations: { id: string; sku: string | null }[]
  ) => {
    try {
      // A. ANA ÜRÜN RESİMLERİNİ YÜKL
      if (formData.images && formData.images.length > 0) {
        const productImageFormData = new FormData();
        formData.images.forEach((imageFile) => {
          productImageFormData.append("files", imageFile);
        });

        productImageFormData.append("productId", productId);

        const productImageResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/upload-product-image`,
          {
            method: "POST",
            body: productImageFormData,
            credentials: "include",
          }
        );
        if (!productImageResponse.ok) {
          console.warn(
            "Ana ürün resimleri yüklenemedi:",
            await productImageResponse.json()
          );
        }
      }

      // B. VARYANT KOMBİNASYON RESİMLERİNİ SIRAYLA YÜKLE
      for (const variant of formData.combinatedVariants) {
        if (variant.images && variant.images.length > 0) {
          // Formdaki SKU'yu kullanarak backend'den gelen doğru kombinasyon ID'sini bul.
          const combinationInfo = updatedCombinations.find(
            (c) => c.sku === variant.sku
          );

          if (!combinationInfo) {
            console.warn(
              `SKU'su ${variant.sku} olan kombinasyon için ID bulunamadı, resimler yüklenemiyor.`
            );
            continue; // Sonraki varyanta geç
          }

          const variantImageFormData = new FormData();
          variant.images.forEach((imageFile) => {
            variantImageFormData.append("files", imageFile);
          });

          // Controller'ınız body'de variantId bekliyor.
          variantImageFormData.append("variantId", combinationInfo.id);

          const variantImageResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/upload-variant-image`,
            {
              method: "POST",
              credentials: "include",
              body: variantImageFormData,
            }
          );
          if (!variantImageResponse.ok) {
            console.warn(
              `SKU'su ${variant.sku} olan varyantın resimleri yüklenemedi:`,
              await variantImageResponse.json()
            );
          }
        }
      }
      for (const existingVariant of formData.existingVariants) {
        for (const options of existingVariant.options) {
          if (options.file) {
            const optionFormData = new FormData();
            optionFormData.append("file", options.file);
            const fetchRes = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/upload-option-asset/${options.uniqueId}`,
              {
                method: "POST",
                credentials: "include",
                body: optionFormData,
              }
            );
          }
        }
      }
    } catch (error) {
      console.error("Resimler yüklenirken arka planda bir hata oluştu:", error);
    }
  };

  return (
    <Stack gap={"lg"}>
      {isSubmitting && <GlobalLoadingOverlay />}
      <Group align="center" justify="space-between">
        <Title order={4}>
          Varyantlı Ürün {defaultValues ? "Güncelle" : "Oluştur"}
        </Title>
        <Group gap="md" justify="end">
          <Button type="button" onClick={handleSubmit(onSubmit)}>
            {defaultValues ? "Güncelle" : "Kaydet"}
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
                    "translations.0.slug",
                    slugify(event.currentTarget.value)
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
                data={Object.values($Enums.ProductType).map((data) => ({
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
      <Stack gap={"xs"}>
        <InputLabel>Ürün Görselleri</InputLabel>
        <Controller
          control={control}
          name="images"
          render={({ field, fieldState }) => (
            <GlobalDropzone
              error={fieldState.error?.message}
              value={field.value || []}
              onChange={field.onChange}
              onDrop={(files) => {
                field.onChange(files);
              }}
              existingImages={existingImages}
              existingImagesDelete={async (imageUrl) => {
                const deleteResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/delete-product-image`,
                  {
                    method: "DELETE",
                    body: JSON.stringify({ imageUrl }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    cache: "no-store",
                  }
                );
                if (!deleteResponse.ok) {
                  console.error(await deleteResponse.text());
                  notifications.show({
                    title: "Silme Hatası!",
                    message: "Ürün görseli silinirken bir hata oluştu.",
                    color: "red",
                    autoClose: 3000,
                  });
                  return;
                }
                setValue(
                  "existingImages",
                  existingImages.filter((img) => img.url !== imageUrl)
                );
              }}
              accept={["IMAGE", "VIDEO"]}
              multiple
              maxFiles={10 - existingImages.length || 0}
              maxSize={10 * 1024 * 1024}
            />
          )}
        />
      </Stack>
      <ProductDetailCard>
        <SimpleGrid cols={{ xs: 1, sm: 3 }}>
          <Controller
            control={control}
            name="brandId"
            render={({ field }) => (
              <Select
                {...field}
                label="Marka"
                clearable
                nothingFoundMessage="Marka bulunamadı"
                searchable
                data={
                  brands &&
                  brands.length > 0 &&
                  brands.map((brand) => ({
                    value: brand.id,
                    label:
                      brand.translations.find((t) => t.locale === "TR")?.name ||
                      brand.translations[0]?.name ||
                      "İsimsiz Marka",
                  }))
                }
              />
            )}
          />
          <Controller
            control={control}
            name="categories"
            render={({ field }) => (
              <MultiSelect
                {...field}
                label="Kategori"
                clearable
                searchable
                nothingFoundMessage="Kategori bulunamadı"
                data={
                  categories &&
                  categories.length > 0 &&
                  categories.map((cat) => ({
                    value: cat.id,
                    label:
                      cat.translations.find((t) => t.locale === "TR")?.name ||
                      cat.translations[0]?.name ||
                      "İsimsiz Kategori",
                  }))
                }
              />
            )}
          />

          <Controller
            control={control}
            name="googleTaxonomyId"
            render={({ field, fieldState }) => (
              <GoogleTaxonomySelectV2
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
        </SimpleGrid>
      </ProductDetailCard>
      <ExistingVariantCard
        control={control}
        errors={errors.existingVariants?.message}
        setValue={setValue}
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

export default VariantProductForm;
