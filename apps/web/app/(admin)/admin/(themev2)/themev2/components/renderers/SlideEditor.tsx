import { Control, UseFormSetValue } from "@repo/shared";
import { SliderComponentInputType, ThemeInputType } from "@repo/types";
import { IconInfoCircle } from "@tabler/icons-react";
import { EditorSelection, useThemeStore } from "../../store/zustand-zod-theme.store";
import { AsideFormLayout } from "../layout/AsideFormLayout";
import { EmptyState } from "../layout/EmptyState";
import SlideForm from "../right-side-forms/sliders/SlideForm";

interface SlideEditorProps {
  component: SliderComponentInputType;
  index: number;
  selection: Extract<EditorSelection, { type: "SLIDE" }>;
  control: Control<ThemeInputType>;
  setValue: UseFormSetValue<ThemeInputType>;
}

export const SlideEditor = ({ component, index, selection, control, setValue }: SlideEditorProps) => {
  const { clearSelection } = useThemeStore();

  if (component.type !== "SLIDER") {
    return (
      <EmptyState
        clearAction={clearSelection}
        icon={IconInfoCircle}
        title="Geçersiz Seçim"
        description="Bu öğe bir Slider değil."
        color="red"
      />
    );
  }

  const slideIndex = (component as SliderComponentInputType).sliders.findIndex((s) => s.sliderId === selection.id);

  if (slideIndex === -1) {
    return (
      <EmptyState
        clearAction={clearSelection}
        icon={IconInfoCircle}
        title="Slayt Bulunamadı"
        description="Seçilen slayt artık mevcut değil."
        color="red"
      />
    );
  }

  const slide = (component as SliderComponentInputType).sliders[slideIndex];

  return (
    <AsideFormLayout title="Slayt Ayarları" subtitle={`Sıra: ${slide.order + 1}`} onClose={clearSelection}>
      <SlideForm componentIndex={index} slideIndex={slideIndex} control={control} setValue={setValue} />
    </AsideFormLayout>
  );
};
