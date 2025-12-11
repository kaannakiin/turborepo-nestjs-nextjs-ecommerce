"use client";
import { UseFormReturn } from "@repo/shared";
import {
  MarqueeComponentInputType,
  ProductCarouselComponentInputType,
  SliderComponentInputType,
  ThemeInputType,
} from "@repo/types";
import { IconClick, IconInfoCircle } from "@tabler/icons-react";
import { useThemeStore } from "../store/theme-store";
import { useActiveComponentData } from "./hooks/useActiveComponentData";
import { EmptyState } from "./layout/EmptyState";
import { ComponentEditor } from "./renderers/ComponentEditor";
import { MarqueeItemEditor } from "./renderers/MarqueeItemEditor";
import ProductCarouselEditor from "./renderers/ProductCarouselEditor";
import { SlideEditor } from "./renderers/SlideEditor";

interface AsideFormsTableProps {
  forms: UseFormReturn<ThemeInputType>;
}

const AsideFormsTable = ({
  forms: { control, setValue },
}: AsideFormsTableProps) => {
  const { clearSelection } = useThemeStore();

  const { isValid, selection, component, pageIndex, componentIndex } =
    useActiveComponentData(control);

  if (!selection) {
    return (
      <EmptyState
        clearAction={clearSelection}
        icon={IconClick}
        title="Bir öğe seçin"
        description="Düzenlemek için bir öğe seçerek başlayın"
      />
    );
  }

  const isComponentDependent = [
    "COMPONENT",
    "SLIDE",
    "MARQUEE_ITEM",
    "PRODUCT_CAROUSEL_ITEM",
  ].includes(selection.type);

  if (isComponentDependent && (!isValid || !component)) {
    return (
      <EmptyState
        clearAction={clearSelection}
        icon={IconInfoCircle}
        title="Öğe Bulunamadı"
        description="Seçilen öğe artık mevcut değil"
        color="red"
      />
    );
  }

  const renderEditor = () => {
    switch (selection.type) {
      case "COMPONENT":
        if (!component) return null;
        return (
          <ComponentEditor
            control={control}
            component={component}
            pageIndex={pageIndex}
            componentIndex={componentIndex}
          />
        );

      case "SLIDE":
        return (
          <SlideEditor
            control={control}
            setValue={setValue}
            pageIndex={pageIndex}
            componentIndex={componentIndex}
            component={component as SliderComponentInputType}
            selection={selection}
          />
        );

      case "MARQUEE_ITEM":
        return (
          <MarqueeItemEditor
            control={control}
            pageIndex={pageIndex}
            component={component as MarqueeComponentInputType}
            componentIndex={componentIndex}
            selection={selection}
          />
        );

      case "PRODUCT_CAROUSEL_ITEM":
        return (
          <ProductCarouselEditor
            control={control}
            pageIndex={pageIndex}
            componentIndex={componentIndex}
            selection={selection}
            component={component as ProductCarouselComponentInputType}
          />
        );

      case "HEADER":
        return <div>Header Ayarları Formu Buraya Gelecek</div>;

      case "FOOTER":
        return <div>Footer Ayarları Formu Buraya Gelecek</div>;

      case "PAGE_SETTINGS":
        return <div>Sayfa Ayarları Formu Buraya Gelecek</div>;

      default:
        return (
          <EmptyState
            clearAction={clearSelection}
            icon={IconInfoCircle}
            title="Editör Bulunamadı"
            description={`Bir editör tanımlanmamış.`}
            color="red"
          />
        );
    }
  };

  return <>{renderEditor()}</>;
};

export default AsideFormsTable;
