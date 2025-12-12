"use client";

import { TextInput } from "@mantine/core";
import { Control, Controller } from "@repo/shared";
import { PageInputType, ThemeInputType } from "@repo/types";

interface ProductCarouselItemFormProps {
  control: Control<ThemeInputType>;
  componentIndex: number;
  pageIndex: number;
  index: number;
}

const AsideProductCarouselItemForm = ({
  componentIndex,
  control,
  pageIndex,
  index,
}: ProductCarouselItemFormProps) => {
  const prefix =
    `pages.${pageIndex}.components.${componentIndex}.items.${index}` as const;
  return (
    <>
      <Controller
        control={control}
        name={`${prefix}.customTitle`}
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            error={fieldState.error?.message}
            label="Ürün Başlığı"
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.badgeText`}
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            error={fieldState.error?.message}
            label="Kutu Metni"
          />
        )}
      />
    </>
  );
};

export default AsideProductCarouselItemForm;
