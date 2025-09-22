"use client";

import GlobalDropzone from "@/components/GlobalDropzone";
import { Drawer, DrawerProps } from "@mantine/core";
import {
  Control,
  Controller,
  FieldArrayWithId,
  UseFieldArrayUpdate,
} from "@repo/shared";
import { VariantProductZodType } from "@repo/types";

interface CombinatedVariantsDropzoneDrawer
  extends Pick<DrawerProps, "opened" | "onClose"> {
  selectedIndexs: number[];
  selectedIndex: number;
  fields: FieldArrayWithId<VariantProductZodType, "combinatedVariants", "id">[];
  update: UseFieldArrayUpdate<VariantProductZodType, "combinatedVariants">;
  control: Control<VariantProductZodType>;
}

const CombinatedVariantsDropzoneDrawer = ({
  onClose,
  opened,
  fields,
  selectedIndexs,
  update,
  control,
  selectedIndex,
}: CombinatedVariantsDropzoneDrawer) => {
  const handleDrop = (files: File[]) => {
    if (selectedIndexs.length > 1) {
      selectedIndexs.forEach((index) => {
        if (index !== selectedIndex) {
          // selectedIndex zaten GlobalDropzone tarafından güncellendi
          const currentField = fields[index];
          if (currentField) {
            const existingImages = currentField.images || [];

            update(index, {
              ...currentField,
              images: [...existingImages, ...files],
            });
          }
        }
      });
    }
  };

  const currentField = fields[selectedIndex];
  const currentImageCount =
    (currentField?.images?.length || 0) +
    (currentField?.existingImages?.length || 0);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      title={
        selectedIndexs.length > 1
          ? `Medya Yükle (${selectedIndexs.length} varyant seçili)`
          : "Medya Yükle"
      }
    >
      <Controller
        control={control}
        name={`combinatedVariants.${selectedIndex}.images`}
        render={({ field, fieldState }) => (
          <GlobalDropzone
            error={fieldState.error?.message}
            value={field.value || []}
            onChange={field.onChange} // Bu eksikti!
            onDrop={handleDrop} // Sadece toplu güncelleme için
            accept={["IMAGE", "VIDEO"]}
            multiple
            maxFiles={10 - currentImageCount}
            cols={1}
            maxSize={10 * 1024 * 1024}
          />
        )}
      />
    </Drawer>
  );
};

export default CombinatedVariantsDropzoneDrawer;
