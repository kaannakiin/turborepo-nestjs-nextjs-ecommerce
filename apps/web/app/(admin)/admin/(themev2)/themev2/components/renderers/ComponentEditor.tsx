import { Text } from "@mantine/core";
import { Control } from "@repo/shared";
import { ThemeComponents, ThemeInputType } from "@repo/types";
import { IconClipboard } from "@tabler/icons-react";
import { useThemeStore } from "../../store/zustand-zod-theme.store";
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
  component: ThemeInputType["components"][number];
  index: number;
  control: Control<ThemeInputType>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_FORM_MAP: Record<string, React.ComponentType<any>> = {
  SLIDER: SliderForm,
  MARQUEE: MarqueeForm,
  PRODUCT_CAROUSEL: ProductCarouselForm,
};

export const ComponentEditor = ({ component, index, control }: ComponentEditorProps) => {
  const FormComponent = COMPONENT_FORM_MAP[component.type];

  if (!FormComponent) return <Text p="md">Bu bileşen tipi ({component.type}) için form bulunamadı.</Text>;

  return (
    <AsideFormLayout
      title={titleMap[component.type]}
      subtitle={`Sıra: ${component.order + 1}`}
      onClose={useThemeStore.getState().clearSelection}
    >
      <FormComponent control={control} index={index} />
    </AsideFormLayout>
  );
};
