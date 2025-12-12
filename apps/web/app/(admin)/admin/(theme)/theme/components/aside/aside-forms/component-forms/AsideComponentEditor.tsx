"use client";
import { Text } from "@mantine/core";
import { Control } from "@repo/shared";
import { ThemeComponents, ThemeInputType } from "@repo/types";
import AsideMarqueeForm from "./AsideMarqueeForm";
import ProductCarouselForm from "./AsideProductCarouselForm";
import AsideSliderForm from "./AsideSliderForm";
import { AsideFormLayout } from "../../AsideFormLayout";
import { useThemeStore } from "../../../../store/theme-store";

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

export const AsideComponentEditor = ({
  component,
  pageIndex,
  componentIndex,
  control,
}: ComponentEditorProps) => {
  const renderForm = () => {
    switch (component.type) {
      case "SLIDER":
        return (
          <AsideSliderForm
            control={control}
            pageIndex={pageIndex}
            componentIndex={componentIndex}
          />
        );

      case "MARQUEE":
        return (
          <AsideMarqueeForm
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
