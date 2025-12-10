"use client";

import {
  Box,
  Button,
  Grid,
  Group,
  InputError,
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
  useMutation,
  zodResolver,
} from "@repo/shared";
import {
  BaseProductSchema,
  BaseProductZodType,
  BrandSelectType,
  CategorySelectType,
} from "@repo/types";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import fetchWrapper from "@lib/wrappers/fetchWrapper";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import GlobalSeoCard from "@/components/GlobalSeoCard";
import { getProductTypeLabel } from "@lib/helpers";
import { ProductType } from "@repo/database/client";
import ProductDropzone from "../../../components/ProductDropzone";
import GoogleTaxonomySelectV2 from "../../../create-variant/components/GoogleTaxonomySelectV2";
import ProductPriceNumberInput from "../../../create-variant/components/ProductPriceNumberInput";
import TaxonomySelect from "@/(admin)/admin/(other)/components/TaxonomySelect";

const GlobalTextEditor = dynamic(
  () => import("../../../../../../../components/GlobalTextEditor"),
  {
    ssr: false,
    loading: () => <GlobalLoadingOverlay />,
  }
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

  const name = watch("translations.0.name");
  const sku = watch("sku") || null;
  const barcode = watch("barcode") || null;
  const slug = watch("translations.0.slug") || null;
  const { push } = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: BaseProductZodType) => {
      const { images, ...productDataWithoutImages } = data;

      const productResponse = await fetchWrapper.post<{
        success: boolean;
        message: string;
      }>(
        `/admin/products/create-or-update-basic-product`,
        productDataWithoutImages
      );

      if (!productResponse.success || !productResponse.data.success) {
        throw new Error("Ürün işlemi sırasında bir hata oluştu.");
      }

      if (images && images.length > 0) {
        const formData = new FormData();

        const sortedImages = [...images].sort((a, b) => a.order - b.order);

        sortedImages.forEach((item) => {
          formData.append("files", item.file);
        });

        const orders = sortedImages.map((item) => item.order);
        formData.append("orders", JSON.stringify(orders));

        formData.append("productId", data.uniqueId);

        const imageUploadResponse = await fetchWrapper.postFormData(
          `/admin/products/upload-product-image`,
          formData
        );

        if (!imageUploadResponse.success) {
          throw new Error("Resim yükleme sırasında hata oluştu.");
        }
      }

      return productResponse;
    },
    onSuccess: (data1, data, _, context) => {
      context.client.invalidateQueries({
        queryKey: ["admin-basic-product", data.uniqueId],
      });

      notifications.show({
        title: "Başarılı!",
        message: defaultValues
          ? "Ürün başarıyla güncellendi."
          : "Ürün başarıyla oluşturuldu.",
        color: "green",
        autoClose: 3000,
      });

      push("/admin/product-list");
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Hata!",
        message: error.message || "Beklenmeyen bir hata oluştu.",
        color: "red",
        autoClose: 5000,
      });
    },
  });

  const onSubmit: SubmitHandler<BaseProductZodType> = async (data) => {
    mutation.mutate(data);
  };

  const watchedImages = watch("images") || [];
  const watchedExistingImages = watch("existingImages") || [];

  const handleAddImages = (newFiles: File[]) => {
    const currentImages = watchedImages;
    const currentExistingCount = watchedExistingImages.length;
    const startOrder = currentExistingCount + currentImages.length;

    const newImagesWithOrder = newFiles.map((file, index) => ({
      file,
      order: startOrder + index,
    }));

    setValue("images", [...currentImages, ...newImagesWithOrder], {
      shouldValidate: true,
    });
  };

  const handleRemoveExistingImage = async (urlToRemove: string) => {
    try {
      const deleteResponse = await fetchWrapper.delete(
        `/admin/products/delete-product-image?imageUrl=${encodeURIComponent(urlToRemove)}`
      );

      if (!deleteResponse.success) {
        throw new Error("Resim silinemedi");
      }

      const filteredImages = watchedExistingImages.filter(
        (image) => image.url !== urlToRemove
      );

      const removedImage = watchedExistingImages.find(
        (image) => image.url === urlToRemove
      );
      const removedOrder = removedImage?.order;

      if (removedOrder === undefined) {
        throw new Error("Silinen görsel bulunamadı");
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

      setValue("existingImages", reorderedExistingImages, {
        shouldValidate: true,
      });
      setValue("images", reorderedNewImages, { shouldValidate: true });

      notifications.show({
        title: "Başarılı!",
        message: "Görsel başarıyla silindi.",
        color: "green",
        autoClose: 3000,
      });
    } catch (error) {
      notifications.show({
        title: "Hata!",
        message: "Görsel silinirken bir hata oluştu.",
        color: "red",
        autoClose: 3000,
      });
      throw error;
    }
  };

  const handleRemoveNewImage = (fileToRemove: File) => {
    const filteredImages = watchedImages.filter(
      (item) => item.file !== fileToRemove
    );

    const removedImage = watchedImages.find(
      (item) => item.file === fileToRemove
    );
    const removedOrder = removedImage?.order;

    if (removedOrder === undefined) {
      console.error("Silinen görsel bulunamadı");
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

    setValue("existingImages", reorderedExistingImages, {
      shouldValidate: true,
    });

    setValue("images", reorderedNewImages, { shouldValidate: true });
  };

  const handleReorder = (
    newOrder: Array<{
      url: string;
      order: number;
      file?: File;
      isNew: boolean;
    }>
  ) => {
    const existingImagesInOrder = newOrder.filter((item) => !item.isNew);
    const newImagesInOrder = newOrder.filter((item) => item.isNew);

    const updatedExistingImages = existingImagesInOrder
      .map((item) => {
        const existingImage = watchedExistingImages.find(
          (img) => img.url === item.url
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
          (img) => img.file === item.file
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
            img.file.size === item.file!.size
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

    setValue("existingImages", updatedExistingImages, { shouldValidate: true });
    setValue("images", updatedNewImages, { shouldValidate: true });
  };

  return (
    <Stack gap={"lg"}>
      {isSubmitting || mutation.isPending ? <GlobalLoadingOverlay /> : null}
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
            <Box>
              <TaxonomySelect field={{ ...field }} />
              {fieldState?.error?.message && (
                <InputError>{fieldState.error?.message}</InputError>
              )}
            </Box>
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
      <Stack gap={"xs"}>
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
