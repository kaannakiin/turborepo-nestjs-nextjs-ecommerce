"use client";
import { Control } from "@repo/shared";
import { ProductCarouselComponentInputType, ThemeInputType } from "@repo/types";
import { IconInfoCircle } from "@tabler/icons-react";

import AsideProductCarouselItemForm from "./AsideProductCarouselItemForm";
import { EditorSelection, useThemeStore } from "../../../../store/theme-store";
import { AsideEmptyState } from "../../AsideEmptyState";
import { AsideFormLayout } from "../../AsideFormLayout";

interface ProductCarouselEditorProps {
  component: ProductCarouselComponentInputType;
  pageIndex: number;
  componentIndex: number;
  selection: Extract<EditorSelection, { type: "PRODUCT_CAROUSEL_ITEM" }>;
  control: Control<ThemeInputType>;
}

const AsideProductCarouselEditor = ({
  component,
  control,
  selection,
  componentIndex,
  pageIndex,
}: ProductCarouselEditorProps) => {
  const { clearSelection } = useThemeStore();
  if (component.type !== "PRODUCT_CAROUSEL") {
    return (
      <AsideEmptyState
        clearAction={clearSelection}
        icon={IconInfoCircle}
        title="Geçersiz Seçim"
        description="Bu öğe bir Marquee değil."
        color="red"
      />
    );
  }
  const itemIndex = (
    component as ProductCarouselComponentInputType
  ).items.findIndex((item) => item.itemId === selection.itemId);

  if (itemIndex === -1) {
    return (
      <AsideEmptyState
        clearAction={clearSelection}
        icon={IconInfoCircle}
        title="Öğe Bulunamadı"
        description="Seçilen marquee öğesi artık mevcut değil."
        color="red"
      />
    );
  }

  return (
    <AsideFormLayout
      title="Ürün Item Ayarları"
      subtitle={`${itemIndex + 1}. öğe`}
      onClose={clearSelection}
    >
      <AsideProductCarouselItemForm
        index={itemIndex}
        control={control}
        componentIndex={componentIndex}
        pageIndex={pageIndex}
      />
    </AsideFormLayout>
  );
};

export default AsideProductCarouselEditor;
