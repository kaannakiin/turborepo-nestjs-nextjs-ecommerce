"use client";
import { Text } from "@mantine/core";
import { Control } from "@repo/shared";
import { ThemeComponents, ThemeInputType } from "@repo/types";
import { useThemeStore } from "../../store/theme-store";
import { AsideFormLayout } from "../layout/AsideFormLayout";
import MarqueeForm from "../right-side-forms/marquee/MarqueeForm";
import ProductCarouselForm from "../right-side-forms/product-carousel/ProductCarouselForm";
import SliderForm from "../right-side-forms/sliders/SliderForm";

const titleMap: Record<ThemeComponents, string> = {
  SLIDER: "Slider Ayarları",
  MARQUEE: "Marquee Ayarları",
  PRODUCT_CAROUSEL: "Ürün Slider Ayarları",
};

interface ComponentEditorProps {
  component: ThemeInputType["pages"][number]["components"][number];
  pageIndex: number;
  componentIndex: number;
  control: Control<ThemeInputType>;
}

export const ComponentEditor = ({
  component,
  pageIndex,
  componentIndex,
  control,
}: ComponentEditorProps) => {
  const renderForm = () => {
    switch (component.type) {
      case "SLIDER":
        return (
          <SliderForm
            control={control}
            pageIndex={pageIndex}
            componentIndex={componentIndex}
          />
        );

      case "MARQUEE":
        return (
          <MarqueeForm
            control={control}
            pageIndex={pageIndex}
            componentIndex={componentIndex}
          />
        );

      case "PRODUCT_CAROUSEL":
        return (
          <ProductCarouselForm
            control={control}
            pageIndex={pageIndex}
            componentIndex={componentIndex}
          />
        );

      default:
        return (
          <Text c="red" p="md">
            Bilinmeyen bileşen türü: {component.type}
          </Text>
        );
    }
  };

  return (
    <AsideFormLayout
      title={titleMap[component.type]}
      subtitle={`Sıra: ${component.order + 1}`}
      onClose={useThemeStore.getState().clearSelection}
    >
      {renderForm()}
    </AsideFormLayout>
  );
};
