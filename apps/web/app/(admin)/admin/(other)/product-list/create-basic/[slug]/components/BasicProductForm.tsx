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
  generateProductCodes,
  slugify,
  SubmitHandler,
  useForm,
  zodResolver,
} from "@repo/shared";
import {
  $Enums,
  BaseProductSchema,
  BaseProductZodType,
  BrandSelectType,
  CategorySelectType,
} from "@repo/types";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { getProductTypeLabel } from "../../../../../../../../lib/helpers";
import GlobalDropzone from "../../../../../../../components/GlobalDropzone";
import GlobalLoadingOverlay from "../../../../../../../components/GlobalLoadingOverlay";
import GlobalSeoCard from "../../../../../../../components/GlobalSeoCard";
import ProductDetailCard from "../../../create-variant/components/ProductDetailCard";
import ProductPriceNumberInput from "../../../create-variant/components/ProductPriceNumberInput";
import GoogleTaxonomySelectV2 from "../../../create-variant/components/GoogleTaxonomySelectV2";
import fetchWrapper from "@lib/fetchWrapper";

const GlobalTextEditor = dynamic(
  () => import("../../../../../../../components/GlobalTextEditor"),
  { ssr: false, loading: () => <GlobalLoadingOverlay /> }
);

interface BasicProductFormProps {
  defaultValues?: BaseProductZodType;
  categories: CategorySelectType[];
  brands: BrandSelectType[];
}

const BasicProductForm = ({
  defaultValues,
  brands,
  categories,
}: BasicProductFormProps) => {
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
      type: "PHYSICAL",
      googleTaxonomyId: null,
      prices: [
        {
          currency: "TRY",
          price: 0,
          buyedPrice: null,
          discountPrice: null,
        },
      ],
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
      uniqueId: createId(),
      active: true,
      stock: 0,
    },
  });

  const existingImages = watch("existingImages") || [];
  const name = watch("translations.0.name");
  const sku = watch("sku") || null;
  const barcode = watch("barcode") || null;
  const slug = watch("translations.0.slug") || null;
  const { push } = useRouter();

  const onSubmit: SubmitHandler<BaseProductZodType> = async (data) => {
    try {
      // 1. Önce images'ları ayır
      const { images, ...productDataWithoutImages } = data;

      // 2. İlk olarak ürünü oluştur/güncelle (images olmadan)
      const productResponse = await fetchWrapper.post(
        `/admin/products/create-or-update-basic-product`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify(productDataWithoutImages),
        }
      );

      if (!productResponse.success) {
        notifications.show({
          title: "Hata!",
          message: "Ürün işlemi sırasında bir hata oluştu.",
          color: "red",
          autoClose: 5000,
        });
        return;
      }

      if (images && images.length > 0) {
        const formData = new FormData();

        images.forEach((file) => {
          formData.append("files", file);
        });

        formData.append("productId", data.uniqueId);

        const imageUploadResponse = await fetchWrapper.postFormData(
          `/admin/products/upload-product-image`,
          formData
        );

        if (!imageUploadResponse.success) {
          notifications.show({
            title: "Uyarı!",
            message:
              "Ürün kaydedildi ancak resim yükleme sırasında hata oluştu.",
            color: "yellow",
            autoClose: 5000,
          });
          push("/admin/product-list");
          return;
        }
      }

      notifications.show({
        title: "Başarılı!",
        message: defaultValues
          ? "Ürün başarıyla güncellendi."
          : "Ürün başarıyla oluşturuldu.",
        color: "green",
        autoClose: 3000,
      });
      push("/admin/product-list");
    } catch (error) {
      console.error("Genel hata:", error);
      notifications.show({
        title: "Hata!",
        message: "Beklenmeyen bir hata oluştu.",
        color: "red",
        autoClose: 5000,
      });
    }
  };

  return (
    <Stack gap={"lg"}>
      {isSubmitting && <GlobalLoadingOverlay />}
      <Group align="center" justify="space-between">
        <Title order={4}>
          Basit Ürün {defaultValues ? "Güncelle" : "Oluştur"}
        </Title>
        <Group gap="md" justify="end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!slug) {
                setValue("translations.0.slug", slugify(name));
              }

              if (!sku || !barcode) {
                const codes = generateProductCodes(name);
                if (!sku) {
                  setValue("sku", codes.sku);
                }
                if (!barcode) {
                  setValue("barcode", codes.barcode);
                }
              }
              setValue("active", false);
              handleSubmit(onSubmit)();
            }}
          >
            {defaultValues ? "Pasif Olarak Güncelle" : "Pasif Olarak Kaydet"}
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!slug) {
                setValue("translations.0.slug", slugify(name));
              }

              if (!sku || !barcode) {
                const codes = generateProductCodes(name);
                if (!sku) {
                  setValue("sku", codes.sku);
                }
                if (!barcode) {
                  setValue("barcode", codes.barcode);
                }
              }
              handleSubmit(onSubmit)();
            }}
          >
            {defaultValues ? "Güncelle" : "Kaydet"}
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
              value={field.value || ""}
              error={fieldState.error?.message}
              label="SKU (Stok Kodu)"
              placeholder="Otomatik oluşturulacak"
              description="Boş bırakırsanız ürün adından otomatik oluşturulur"
              rightSection={
                <Button
                  size="xs"
                  variant="light"
                  disabled={!name}
                  onClick={() => {
                    if (name) {
                      const codes = generateProductCodes(name);
                      setValue("sku", codes.sku);
                    }
                  }}
                >
                  Oluştur
                </Button>
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
              value={field.value || ""}
              error={fieldState.error?.message}
              label="Barcode"
              placeholder="Otomatik oluşturulacak"
              description="Boş bırakırsanız otomatik EAN-13 barcode oluşturulur"
              rightSection={
                <Button
                  size="xs"
                  variant="light"
                  disabled={!name}
                  onClick={() => {
                    if (name) {
                      const codes = generateProductCodes(name);
                      setValue("barcode", codes.barcode);
                    }
                  }}
                >
                  Oluştur
                </Button>
              }
            />
          )}
        />
      </SimpleGrid>
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
                  `/admin/products/delete-product-image`,
                  {
                    body: JSON.stringify({ imageUrl }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    cache: "no-store",
                  }
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
