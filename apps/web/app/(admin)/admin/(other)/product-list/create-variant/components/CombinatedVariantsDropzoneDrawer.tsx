"use client";

import fetchWrapper from "@lib/fetchWrapper";
import { Drawer, DrawerProps, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Control, UseFormGetValues, UseFormSetValue, useWatch } from "@repo/shared";
import { VariantProductZodType } from "@repo/types";
import ProductDropzone from "../../components/ProductDropzone";

interface CombinatedVariantsDropzoneDrawerProps extends Pick<DrawerProps, "opened" | "onClose"> {
  selectedIndexs: number[];
  selectedIndex: number;
  control: Control<VariantProductZodType>;
  setValue: UseFormSetValue<VariantProductZodType>;
  getValues: UseFormGetValues<VariantProductZodType>;
}

const CombinatedVariantsDropzoneDrawer = ({
  onClose,
  opened,
  selectedIndexs,
  control,
  selectedIndex,
  setValue,
  getValues,
}: CombinatedVariantsDropzoneDrawerProps) => {
  // Aktif (Görüntülenen) varyantın verilerini izle
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

  // --- HANDLERS ---

  // 1. Yeni Resim Ekleme (TOPLU İŞLEM DESTEKLİ)
  const handleAddImages = (files: File[]) => {
    // Seçili olan TÜM varyantları döngüye al (Sadece şu an açık olanı değil)
    // Eğer sadece 1 tane seçiliyse array sadece onu içerir.
    const targetIndices = selectedIndexs.length > 0 ? selectedIndexs : [selectedIndex];

    targetIndices.forEach((index) => {
      // Her bir varyantın o anki güncel durumunu al
      const currentExisting = getValues(`combinatedVariants.${index}.existingImages`) || [];
      const currentNewImages = getValues(`combinatedVariants.${index}.images`) || [];

      // O varyanttaki toplam resim sayısına göre order hesapla
      const currentTotalCount = currentExisting.length + currentNewImages.length;

      // Dosyaları formatla
      const newFormattedImages = files.map((file, i) => ({
        file,
        order: currentTotalCount + i,
      }));

      // İlgili varyantı güncelle
      setValue(`combinatedVariants.${index}.images`, [...currentNewImages, ...newFormattedImages], {
        shouldDirty: true,
        shouldValidate: true,
      });
    });

    if (targetIndices.length > 1) {
      notifications.show({
        title: "Toplu Yükleme",
        message: `${files.length} görsel ${targetIndices.length} varyanta başarıyla eklendi.`,
        color: "blue",
      });
    }
  };

  // 2. Yeni Eklenen Resmi Silme (Sadece aktif varyanttan siler)
  const handleRemoveNewImage = (file: File) => {
    const currentImages = getValues(`combinatedVariants.${selectedIndex}.images`) || [];
    const filteredImages = currentImages.filter((img) => img.file !== file);

    setValue(`combinatedVariants.${selectedIndex}.images`, filteredImages, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // 3. Mevcut Resmi Silme (API İsteği + State Güncelleme)
  const handleRemoveExistingImage = async (imageUrl: string) => {
    try {
      const deleteResponse = await fetchWrapper.delete(`/admin/products/delete-product-image?imageUrl=${imageUrl}`);

      if (!deleteResponse.success) {
        throw new Error("Silme başarısız");
      }

      const currentExisting = getValues(`combinatedVariants.${selectedIndex}.existingImages`) || [];
      const filteredExisting = currentExisting.filter((img) => img.url !== imageUrl);

      setValue(`combinatedVariants.${selectedIndex}.existingImages`, filteredExisting, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      notifications.show({
        title: "Hata",
        message: "Görsel silinemedi.",
        color: "red",
      });
      throw error; // ProductDropzone loading state'i kapatsın diye
    }
  };

  // 4. Sıralama (Reorder) - Sadece aktif varyant için
  const handleReorder = (
    newOrderList: Array<{
      url: string;
      order: number;
      file?: File;
      isNew: boolean;
    }>
  ) => {
    const currentExisting = getValues(`combinatedVariants.${selectedIndex}.existingImages`) || [];
    const currentImages = getValues(`combinatedVariants.${selectedIndex}.images`) || [];

    const updatedExistingImages: typeof existingImages = [];
    const updatedNewImages: typeof images = [];

    newOrderList.forEach((item) => {
      if (item.isNew && item.file) {
        updatedNewImages.push({
          file: item.file,
          order: item.order,
        });
      } else {
        const originalImg = currentExisting.find((img) => img.url === item.url);
        if (originalImg) {
          updatedExistingImages.push({
            ...originalImg,
            order: item.order,
          });
        }
      }
    });

    setValue(`combinatedVariants.${selectedIndex}.existingImages`, updatedExistingImages, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(`combinatedVariants.${selectedIndex}.images`, updatedNewImages, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="xl" // Daha geniş alan için
      title={selectedIndexs.length > 1 ? `Medya Yükle (${selectedIndexs.length} varyant seçili)` : "Medya Yükle"}
    >
      <Stack>
        <ProductDropzone
          // State
          existingImages={existingImages}
          images={images}
          // Handlers
          onAddImages={handleAddImages}
          onRemoveNewImage={handleRemoveNewImage}
          onRemoveExistingImage={handleRemoveExistingImage}
          onReorder={handleReorder}
          // Görünüm Ayarları
          cols={2} // Drawer dar olduğu için 2 kolon daha iyi durabilir
        />
      </Stack>
    </Drawer>
  );
};

export default CombinatedVariantsDropzoneDrawer;
