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
    const targetIndices = selectedIndexs.length > 0 ? selectedIndexs : [selectedIndex];

    targetIndices.forEach((index) => {
      const currentExisting = getValues(`combinatedVariants.${index}.existingImages`) || [];
      const currentNewImages = getValues(`combinatedVariants.${index}.images`) || [];

      const currentTotalCount = currentExisting.length + currentNewImages.length;

      const newFormattedImages = files.map((file, i) => ({
        file,
        order: currentTotalCount + i,
      }));

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

  const handleRemoveNewImage = (file: File) => {
    const currentImages = getValues(`combinatedVariants.${selectedIndex}.images`) || [];
    const filteredImages = currentImages.filter((img) => img.file !== file);

    setValue(`combinatedVariants.${selectedIndex}.images`, filteredImages, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

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
      throw error;
    }
  };

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
      size="xl"
      title={selectedIndexs.length > 1 ? `Medya Yükle (${selectedIndexs.length} varyant seçili)` : "Medya Yükle"}
    >
      <Stack>
        <ProductDropzone
          existingImages={existingImages}
          images={images}
          onAddImages={handleAddImages}
          onRemoveNewImage={handleRemoveNewImage}
          onRemoveExistingImage={handleRemoveExistingImage}
          onReorder={handleReorder}
          cols={2}
        />
      </Stack>
    </Drawer>
  );
};

export default CombinatedVariantsDropzoneDrawer;
