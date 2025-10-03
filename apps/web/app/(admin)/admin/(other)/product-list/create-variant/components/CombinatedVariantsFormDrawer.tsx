"use client";

import {
  Button,
  Drawer,
  DrawerProps,
  Group,
  SimpleGrid,
  Stack,
  Switch,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Control, Controller, UseFormSetValue } from "@repo/shared";
import { VariantProductZodType } from "@repo/types";
import GlobalDropzone from "@/components/GlobalDropzone";
import GlobalSeoCard from "@/components/GlobalSeoCard";
import ProductPriceNumberInput from "./ProductPriceNumberInput";
import fetchWrapper from "@lib/fetchWrapper";

interface CombinatedVariantsFormDrawerProps
  extends Pick<DrawerProps, "opened" | "onClose"> {
  control: Control<VariantProductZodType>;
  selectedIndex: number;
  onSave?: () => void;
  setValue: UseFormSetValue<VariantProductZodType>;
}

const CombinatedVariantsFormDrawer = ({
  opened,
  onClose,
  control,
  selectedIndex,
  onSave,
  setValue,
}: CombinatedVariantsFormDrawerProps) => {
  const handleSave = () => {
    onSave?.();
    onClose();
  };
  const existingImages =
    control._getWatch(`combinatedVariants.${selectedIndex}.existingImages`) ||
    [];
  const images =
    control._getWatch(`combinatedVariants.${selectedIndex}.images`) || [];

  const currentImageCount =
    (images?.length || 0) + (existingImages?.length || 0);
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

        {/* Fiyat Bilgileri */}
        <div>
          <Title order={4} mb="md">
            Fiyat Bilgileri
          </Title>
          <SimpleGrid cols={{ xs: 1, md: 3 }} spacing="md">
            <Controller
              control={control}
              name={`combinatedVariants.${selectedIndex}.prices.0.price`}
              render={({ field, fieldState }) => (
                <ProductPriceNumberInput
                  label="Satış Fiyatı"
                  error={fieldState.error?.message}
                  {...field}
                />
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

        <Controller
          control={control}
          name={`combinatedVariants.${selectedIndex}.images`}
          render={({ field, fieldState }) => (
            <GlobalDropzone
              error={fieldState.error?.message}
              value={field.value || []}
              onChange={field.onChange}
              onDrop={(files) => {
                field.onChange(files);
              }}
              existingImages={existingImages || []}
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
                  `combinatedVariants.${selectedIndex}.existingImages`,
                  existingImages.filter((img) => img.url !== imageUrl)
                );
              }}
              accept={["IMAGE", "VIDEO"]}
              multiple
              maxFiles={10 - currentImageCount}
              maxSize={10 * 1024 * 1024}
            />
          )}
        />
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

        {/* Alt Butonlar */}
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
