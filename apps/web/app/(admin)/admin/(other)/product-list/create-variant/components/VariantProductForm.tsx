"use client";

import fetchWrapper from "@lib/fetchWrapper";
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

      // Resim ve dosya verilerini temizleyerek sadece JSON verisi hazırla
      const cleanCombinatedVariants = combinatedVariants.map(
        ({ images: variantImages, existingImages, ...variant }) => variant
      );
      const cleanExistingVariants = data.existingVariants.map(
        ({ options, ...variant }) => ({
          ...variant,
          options: options.map(({ file, ...option }) => option),
        })
      );

      // Ürünün metadatasını (resimler hariç) sunucuya gönder
      const mainDataResponse = await fetchWrapper.post<{
        success: boolean;
        message: string;
        data: {
          productId: string;
          combinations: {
            id: string;
            sku: string | null;
          }[];
        };
      }>(`/admin/products/create-or-update-variant-product`, {
        ...productData,
        combinatedVariants: cleanCombinatedVariants,
        existingVariants: cleanExistingVariants,
      });

      if (!mainDataResponse.success) {
        notifications.show({
          title: "Hata!",
          message: "Ürün kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
          color: "red",
        });
        return;
      }
      const { data: mdData, success } = mainDataResponse.data;

      const { productId, combinations: updatedCombinations = [] } = mdData as {
        productId: string;
        combinations: {
          id: string;
          sku: string | null;
        }[];
      };

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
      if (formData.images && formData.images.length > 0) {
        const productImageFormData = new FormData();
        formData.images.forEach((imageFile) => {
          // NestJS'teki FilesInterceptor('files') bunu bekliyor.
          productImageFormData.append("files", imageFile);
        });
        productImageFormData.append("productId", productId);

        // İSTEK: /admin/products/upload-product-image endpoint'ine gidiyor.
        const productImageResponse = await fetchWrapper.postFormData(
          `/admin/products/upload-product-image`,
          productImageFormData
        );

        if (!productImageResponse.success) {
          console.warn("Ana ürün resimleri yüklenemedi:");
          // İsteğe bağlı: Kullanıcıya bir bildirim gösterilebilir.
        }
      }

      // --- 2. YENİ OLUŞTURULAN VARYANT KOMBİNASYONLARININ RESİMLERİNİN YÜKLENMESİ ---
      // Formdaki her bir yeni varyant kombinasyonu için döngüye gir.
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
            continue; // Bu varyantı atla, sonrakine geç.
          }

          const variantImageFormData = new FormData();
          variant.images.forEach((imageFile) => {
            variantImageFormData.append("files", imageFile);
          });
          variantImageFormData.append("variantId", combinationInfo.id);

          // İSTEK: /admin/products/upload-variant-image endpoint'ine gidiyor.
          const variantImageResponse = await fetchWrapper.postFormData(
            `/admin/products/upload-variant-image`,
            variantImageFormData
          );

          if (!variantImageResponse.success) {
            console.warn(
              `SKU'su ${variant.sku} olan varyantın resimleri yüklenemedi:`
            );
          }
        }
      }

      // --- 3. MEVCUT VARYANTLARIN OPSİYON RESİMLERİNİN YÜKLENMESİ (Örn: Renk için resim) ---
      // Mevcut varyant gruplarının opsiyonları için döngüye gir.
      for (const existingVariant of formData.existingVariants) {
        for (const option of existingVariant.options) {
          // Eğer opsiyon için yeni bir dosya seçilmişse (örn: kırmızı rengi için yeni bir görsel).
          if (option.file) {
            const optionFormData = new FormData();
            optionFormData.append("file", option.file);

            // İSTEK: /admin/products/upload-option-asset/:optionUniqueId endpoint'ine gidiyor.
            const fetchRes = await fetchWrapper.postFormData(
              `/admin/products/upload-option-asset/${option.uniqueId}`,
              optionFormData
            );

            if (!fetchRes.success) {
              console.warn(
                `Opsiyon ID'si ${option.uniqueId} olan varlığın resmi yüklenemedi:`
              );
            }
          }
        }
      }
    } catch (error) {
      console.error(
        "Resimler yüklenirken arka planda genel bir hata oluştu:",
        error
      );
      // Burada da kullanıcıya genel bir hata bildirimi gösterilebilir.
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
                const deleteResponse = await fetchWrapper.delete(
                  `/admin/products/delete-product-image/${encodeURIComponent(imageUrl)}`
                );
                if (!deleteResponse.success) {
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
