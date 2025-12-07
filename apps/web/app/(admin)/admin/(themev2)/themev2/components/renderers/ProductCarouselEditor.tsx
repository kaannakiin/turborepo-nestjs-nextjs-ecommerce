import { Control } from "@repo/shared";
import { ProductCarouselComponentInputType, ThemeInputType } from "@repo/types";
import {
  EditorSelection,
  useThemeStore,
} from "../../store/zustand-zod-theme.store";
import { EmptyState } from "../layout/EmptyState";
import { IconInfoCircle } from "@tabler/icons-react";
import { AsideFormLayout } from "../layout/AsideFormLayout";
import ProductCarouselItemForm from "../right-side-forms/product-carousel/ProductCarouselItemForm";

interface ProductCarouselEditorProps {
  component: ProductCarouselComponentInputType;
  index: number;
  selection: Extract<EditorSelection, { type: "PRODUCT_CAROUSEL_ITEM" }>;
  control: Control<ThemeInputType>;
}

const ProductCarouselEditor = ({
  component,
  control,
  index,
  selection,
}: ProductCarouselEditorProps) => {
  const { clearSelection } = useThemeStore();
  if (component.type !== "PRODUCT_CAROUSEL") {
    return (
      <EmptyState
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
      <EmptyState
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
      <ProductCarouselItemForm
        index={itemIndex}
        control={control}
        componentIndex={index}
      />
    </AsideFormLayout>
  );
};

export default ProductCarouselEditor;
