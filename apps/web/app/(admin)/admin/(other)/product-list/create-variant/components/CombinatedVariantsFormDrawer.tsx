"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import GlobalSeoCard from "@/components/GlobalSeoCard";
import fetchWrapper from "@lib/fetchWrapper";
import {
  Button,
  Drawer,
  DrawerProps,
  Group,
  InputError,
  InputLabel,
  SimpleGrid,
  Stack,
  Switch,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Control, Controller, UseFormGetValues, UseFormSetValue, useWatch } from "@repo/shared";
import { VariantProductZodType } from "@repo/types";
import dynamic from "next/dynamic";
import ProductDropzone from "../../components/ProductDropzone";
import ProductPriceNumberInput from "./ProductPriceNumberInput";

const GlobalTextEditor = dynamic(() => import("../../../../../../components/GlobalTextEditor"), {
  ssr: false,
  loading: () => <GlobalLoadingOverlay />,
});

interface CombinatedVariantsFormDrawerProps extends Pick<DrawerProps, "opened" | "onClose"> {
  control: Control<VariantProductZodType>;
  selectedIndex: number;
  onSave?: () => void;
  setValue: UseFormSetValue<VariantProductZodType>;
  getValues: UseFormGetValues<VariantProductZodType>;
}

const CombinatedVariantsFormDrawer = ({
  opened,
  onClose,
  control,
  selectedIndex,
  onSave,
  setValue,
  getValues, // Parent'tan gelen getValues fonksiyonu
}: CombinatedVariantsFormDrawerProps) => {
  const handleSave = () => {
    onSave?.();
    onClose();
  };

  // UI render için useWatch kullanmaya devam ediyoruz
  const existingImages =
    useWatch({
      control,
      name: `combinatedVariants.${selectedIndex}.existingImages`,
    }) || [];

  const images =
    useWatch({
      control,
      name: `combinatedVariants.${selectedIndex}.images`,
    }) || [];

  const handleAddImages = (files: File[]) => {
    // Ekleme yaparken de en güncel veriyi baz almak daha güvenlidir
    const currentExisting = getValues(`combinatedVariants.${selectedIndex}.existingImages`) || [];
    const currentImages = getValues(`combinatedVariants.${selectedIndex}.images`) || [];

    const currentTotalCount = currentExisting.length + currentImages.length;

    const newFormattedImages = files.map((file, index) => ({
      file,
      order: currentTotalCount + index,
    }));

    setValue(`combinatedVariants.${selectedIndex}.images`, [...currentImages, ...newFormattedImages], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleRemoveNewImage = (file: File) => {
    const currentImages = getValues(`combinatedVariants.${selectedIndex}.images`) || [];
    const filteredImages = currentImages.filter((img) => img.file !== file);

    setValue(`combinatedVariants.${selectedIndex}.images`, filteredImages, { shouldValidate: true, shouldDirty: true });
  };

  const handleRemoveExistingImage = async (imageUrl: string) => {
    const deleteResponse = await fetchWrapper.delete(`/admin/products/delete-product-image?imageUrl=${imageUrl}`);

    if (!deleteResponse.success) {
      notifications.show({
        title: "Silme Hatası!",
        message: "Ürün görseli silinirken bir hata oluştu.",
        color: "red",
        autoClose: 3000,
      });
      throw new Error("Silme başarısız");
    }

    const currentExisting = getValues(`combinatedVariants.${selectedIndex}.existingImages`) || [];
    const filteredExisting = currentExisting.filter((img) => img.url !== imageUrl);

    setValue(`combinatedVariants.${selectedIndex}.existingImages`, filteredExisting, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // --- KRİTİK DÜZELTME BURADA ---
  const handleReorder = (
    newOrderList: Array<{
      url: string;
      order: number;
      file?: File;
      isNew: boolean;
    }>
  ) => {
    // 1. Verinin en güncel halini "getValues" ile alıyoruz.
    // useWatch, closure içinde eski veriyi tutuyor olabilir.
    const currentExistingImages = getValues(`combinatedVariants.${selectedIndex}.existingImages`) || [];
    const currentImages = getValues(`combinatedVariants.${selectedIndex}.images`) || [];

    const updatedExistingImages: typeof existingImages = [];
    const updatedNewImages: typeof images = [];

    // 2. Yeni sıralama listesini dönerek dizileri yeniden oluşturuyoruz
    newOrderList.forEach((item) => {
      if (item.isNew && item.file) {
        // Yeni resimler için file objesini koruyoruz
        updatedNewImages.push({
          file: item.file,
          order: item.order,
        });
      } else {
        // Mevcut resimler için orijinal objeyi bulup order'ını güncelliyoruz
        const originalImg = currentExistingImages.find((img) => img.url === item.url);

        if (originalImg) {
          updatedExistingImages.push({
            ...originalImg,
            order: item.order,
          });
        } else {
          console.warn(`Reorder uyuşmazlığı: ${item.url} bulunamadı.`);
        }
      }
    });

    // 3. SetValue options ile render'ı zorluyoruz
    setValue(`combinatedVariants.${selectedIndex}.existingImages`, updatedExistingImages, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    setValue(`combinatedVariants.${selectedIndex}.images`, updatedNewImages, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      transitionProps={{
        transition: "slide-up",
        duration: 400,
      }}
      size="xl"
      title="Varyant Kombinasyonu Düzenle"
    >
      <Stack gap="lg">
        <div>
          <Title order={4} mb="md">
            Temel Bilgiler
          </Title>
          <SimpleGrid cols={{ xs: 1, md: 2 }} spacing="md">
            <Controller
              control={control}
              name={`combinatedVariants.${selectedIndex}.sku`}
              render={({ field, fieldState }) => (
                <TextInput
                  label="SKU"
                  placeholder="Ürün kodunu giriniz"
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value || ""}
                />
              )}
            />

            <Controller
              control={control}
              name={`combinatedVariants.${selectedIndex}.barcode`}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Barkod"
                  placeholder="Barkod numarasını giriniz"
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value || ""}
                />
              )}
            />
          </SimpleGrid>
        </div>
        <div>
          <Title order={4} mb={"md"}>
            Açıklama
          </Title>
          <Controller
            control={control}
            name={`combinatedVariants.${selectedIndex}.translations.0.description`}
            render={({ field, fieldState }) => (
              <GlobalTextEditor
                renderLabel={false}
                {...field}
                value={field.value ?? undefined}
                error={fieldState.error?.message}
                placeholder="Varyant kombinasyonlarını düzenleyebilirsiniz. Yapay zekadan yardım almak için /ai yazabilirsiniz."
              />
            )}
          />
        </div>
        <div>
          <Title order={4} mb="md">
            Fiyat Bilgileri
          </Title>
          <SimpleGrid cols={{ xs: 1, md: 3 }} spacing="md">
            <Controller
              control={control}
              name={`combinatedVariants.${selectedIndex}.prices.0.price`}
              render={({ field, fieldState }) => (
                <ProductPriceNumberInput label="Satış Fiyatı" error={fieldState.error?.message} {...field} />
              )}
            />

            <Controller
              control={control}
              name={`combinatedVariants.${selectedIndex}.prices.0.discountPrice`}
              render={({ field, fieldState }) => (
                <ProductPriceNumberInput
                  label="İndirimli Fiyat"
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value || undefined}
                />
              )}
            />

            <Controller
              control={control}
              name={`combinatedVariants.${selectedIndex}.prices.0.buyedPrice`}
              render={({ field, fieldState }) => (
                <ProductPriceNumberInput
                  label="Alış Fiyatı"
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value || undefined}
                />
              )}
            />
          </SimpleGrid>
        </div>

        <div>
          <InputLabel mb="xs">Varyant Resimleri</InputLabel>
          <Controller
            control={control}
            name={`combinatedVariants.${selectedIndex}.images`}
            render={({ fieldState }) => (
              <>
                <ProductDropzone
                  existingImages={existingImages}
                  images={images}
                  onAddImages={handleAddImages}
                  onRemoveNewImage={handleRemoveNewImage}
                  onRemoveExistingImage={handleRemoveExistingImage}
                  onReorder={handleReorder}
                />
                {fieldState.error?.message && <InputError>{fieldState.error?.message}</InputError>}
              </>
            )}
          />
        </div>

        <GlobalSeoCard
          control={control}
          metaTitleFieldName={`combinatedVariants.${selectedIndex}.translations.0.metaTitle`}
          metaDescriptionFieldName={`combinatedVariants.${selectedIndex}.translations.0.metaDescription`}
        />

        <div>
          <Title order={4} mb="md">
            Durum
          </Title>
          <Controller
            control={control}
            name={`combinatedVariants.${selectedIndex}.active`}
            render={({ field: { value, ...field } }) => (
              <Switch
                {...field}
                checked={value}
                label={value ? "Aktif" : "Pasif"}
                description="Bu varyantın satışta olup olmadığını belirler"
                size="md"
              />
            )}
          />
        </div>

        <Group justify="flex-end" mt="xl">
          <Button variant="light" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={handleSave}>Kaydet</Button>
        </Group>
      </Stack>
    </Drawer>
  );
};

export default CombinatedVariantsFormDrawer;
