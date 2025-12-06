"use client";
import { UseFormReturn } from "@repo/shared";
import { ThemeInputType } from "@repo/types";
import { IconClick, IconInfoCircle } from "@tabler/icons-react";
import { useThemeStore } from "../store/zustand-zod-theme.store";
import { useActiveComponentData } from "./hooks/useActiveComponentData";
import { EmptyState } from "./layout/EmptyState";
import { ComponentEditor } from "./renderers/ComponentEditor";
import { MarqueeItemEditor } from "./renderers/MarqueeItemEditor";
import { SlideEditor } from "./renderers/SlideEditor";
import { ComponentType } from "react";

interface AsideFormsTableProps {
  forms: UseFormReturn<ThemeInputType>;
}

// Registry'yi tanımlıyoruz
const EDITOR_REGISTRY = {
  COMPONENT: ComponentEditor,
  SLIDE: SlideEditor,
  MARQUEE_ITEM: MarqueeItemEditor,
};

const AsideFormsTable = ({ forms: { setValue, control } }: AsideFormsTableProps) => {
  const { clearSelection } = useThemeStore();

  const { isValid, selection, component, index } = useActiveComponentData(control);

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

  if (!isValid || !component) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ActiveEditor = EDITOR_REGISTRY[selection.type as keyof typeof EDITOR_REGISTRY] as ComponentType<any>;

  if (!ActiveEditor) {
    return (
      <EmptyState
        clearAction={clearSelection}
        icon={IconInfoCircle}
        title="Editör Bulunamadı"
        description="Bu seçim türü için bir editör tanımlanmamış."
        color="red"
      />
    );
  }

  return (
    <ActiveEditor component={component} index={index} selection={selection} control={control} setValue={setValue} />
  );
};

export default AsideFormsTable;
