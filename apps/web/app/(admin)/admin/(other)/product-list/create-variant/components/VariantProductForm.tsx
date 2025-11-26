"use client";

import fetchWrapper from "@lib/fetchWrapper";
import { queryClient } from "@lib/serverQueryClient";
import {
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
import { $Enums, ProductType } from "@repo/database/client";
import {
  Controller,
  createId,
  slugify,
  SubmitHandler,
  useForm,
  useMutation,
  zodResolver,
} from "@repo/shared";
import {
  BrandSelectType,
  CategorySelectType,
  VariantProductSchema,
  VariantProductZodType,
} from "@repo/types";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getProductTypeLabel } from "../../../../../../../lib/helpers";
import GlobalLoadingOverlay from "../../../../../../components/GlobalLoadingOverlay";
import GlobalSeoCard from "../../../../../../components/GlobalSeoCard";
import TaxonomySelect from "../../../components/TaxonomySelect";
import ProductDropzone from "../../components/ProductDropzone";
import ExistingVariantCard from "./ExistingVariantCard";

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
  const images = watch("images") || [];
  const { push } = useRouter();

  const createOrUpdateVariantProductMutation = useMutation({
    mutationFn: async (data: VariantProductZodType) => {
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
        throw new Error(
          "Ürün kaydedilirken bir hata oluştu. Lütfen tekrar deneyin."
        );
      }

      const { data: mdData } = mainDataResponse.data;
      const { productId, combinations: updatedCombinations = [] } = mdData as {
        productId: string;
        combinations: {
          id: string;
          sku: string | null;
        }[];
      };

      return { data, productId, updatedCombinations };
    },

    onSuccess: async (result, variables, _, context) => {
      const { data, productId, updatedCombinations } = result;

      notifications.show({
        title: "Başarılı!",
        message: defaultValues
          ? "Ürün başarıyla güncellendi."
          : "Ürün başarıyla kaydedildi.",
        color: "green",
      });

      uploadAllImagesInBackground(data, productId, updatedCombinations);

      context.client.invalidateQueries({ queryKey: ["admin-products"] });

      push("/admin/product-list");
    },

    onError: (error, variables, context) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "İnternet bağlantınızı kontrol edin.";

      notifications.show({
        title: "Bağlantı Hatası!",
        message: errorMessage,
        color: "red",
      });
    },
  });

  const onSubmit: SubmitHandler<VariantProductZodType> = async (data) => {
    createOrUpdateVariantProductMutation.mutate(data);
  };

  const uploadAllImagesInBackground = async (
    formData: VariantProductZodType,
    productId: string,
    updatedCombinations: { id: string; sku: string | null }[]
  ) => {
    try {
      if (formData.images && formData.images.length > 0) {
        const productImageFormData = new FormData();
        const sortedImages = [...formData.images].sort(
          (a, b) => a.order - b.order
        );
        sortedImages.forEach((imageFile) => {
          productImageFormData.append("files", imageFile.file);
        });
        const orders = sortedImages.map((item) => item.order);
        productImageFormData.append("orders", JSON.stringify(orders));

        productImageFormData.append("productId", productId);

        const productImageResponse = await fetchWrapper.postFormData(
          `/admin/products/upload-product-image`,
          productImageFormData
        );

        if (!productImageResponse.success) {
          console.warn("Ana ürün resimleri yüklenemedi:");
        }
      }

      for (const variant of formData.combinatedVariants) {
        if (variant.images && variant.images.length > 0) {
          const combinationInfo = updatedCombinations.find(
            (c) => c.sku === variant.sku
          );

          if (!combinationInfo) {
            console.warn(
              `SKU'su ${variant.sku} olan kombinasyon için ID bulunamadı, resimler yüklenemiyor.`
            );
            continue;
          }

          const variantImageFormData = new FormData();
          variant.images.forEach((imageFile) => {
            variantImageFormData.append("files", imageFile);
          });
          variantImageFormData.append("variantId", combinationInfo.id);

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

      for (const existingVariant of formData.existingVariants) {
        for (const option of existingVariant.options) {
          if (option.file) {
            const optionFormData = new FormData();
            optionFormData.append("file", option.file);

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

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (error) {
      console.error(
        "Resimler yüklenirken arka planda genel bir hata oluştu:",
        error
      );
    }
  };

  const handleAddImages = (newFiles: File[]) => {
    const currentImages = images;
    const currentExistingCount = existingImages.length;
    const startOrder = currentExistingCount + currentImages.length;

    const newImagesWithOrder = newFiles.map((file, index) => ({
      file,
      order: startOrder + index,
    }));

    setValue("images", [...currentImages, ...newImagesWithOrder], {
      shouldValidate: true,
    });
  };

  const handleRemoveNewImage = (fileToRemove: File) => {
    const filteredImages = images.filter((item) => item.file !== fileToRemove);

    const removedImage = images.find((item) => item.file === fileToRemove);
    const removedOrder = removedImage?.order;

    if (removedOrder === undefined) {
      console.error("Silinen görsel bulunamadı");
      return;
    }

    const reorderedExistingImages = existingImages.map((img) => {
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
        const existingImage = existingImages.find(
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

        const existingNewImage = images.find((img) => img.file === item.file);

        if (existingNewImage) {
          return {
            file: existingNewImage.file,
            order: item.order,
          };
        }

        const fallbackMatch = images.find(
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

  const handleRemoveExistingImage = async (urlToRemove: string) => {
    try {
      const deleteResponse = await fetchWrapper.delete(
        `/admin/products/delete-product-image?imageUrl=${encodeURIComponent(urlToRemove)}`
      );

      if (!deleteResponse.success) {
        throw new Error("Resim silinemedi");
      }

      const filteredImages = existingImages.filter(
        (image) => image.url !== urlToRemove
      );

      const removedImage = existingImages.find(
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

      const reorderedNewImages = images.map((img) => {
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

  return (
    <Stack gap={"lg"}>
      {(isSubmitting || createOrUpdateVariantProductMutation.isPending) && (
        <GlobalLoadingOverlay />
      )}
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
      <Controller
        control={control}
        name="translations.0.description"
        render={({ field, fieldState }) => (
          <GlobalTextEditor
            label="Ürün Açıklaması"
            {...field}
            value={field.value ?? undefined}
            placeholder="Ürün Açıklaması girebilirsiniz. Ai'dan yardım almak için /ai yazın"
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="images"
        render={({ fieldState }) => (
          <Stack gap={"xs"}>
            <InputLabel>Ürün Görselleri</InputLabel>
            <ProductDropzone
              existingImages={existingImages}
              images={images}
              onAddImages={handleAddImages}
              onRemoveNewImage={handleRemoveNewImage}
              onRemoveExistingImage={handleRemoveExistingImage}
              onReorder={handleReorder}
            />
            {fieldState.error && (
              <InputError>{fieldState.error.message}</InputError>
            )}
          </Stack>
        )}
      />
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
            <>
              <TaxonomySelect field={{ ...field }} />
              {fieldState.error && (
                <InputError>{fieldState.error.message}</InputError>
              )}
            </>
          )}
        />
      </SimpleGrid>
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
