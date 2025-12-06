import { MarqueeComponentInputType, ThemeInputType } from "@repo/types";
import { IconInfoCircle, IconMarquee } from "@tabler/icons-react";
import { Control } from "react-hook-form";
import { EditorSelection, useThemeStore } from "../../store/zustand-zod-theme.store";
import { AsideFormLayout } from "../layout/AsideFormLayout";
import { EmptyState } from "../layout/EmptyState";
import MarqueeItemForm from "../right-side-forms/marquee/MarqueeItemForm";

interface MarqueeItemEditorProps {
  component: MarqueeComponentInputType;
  index: number;
  selection: Extract<EditorSelection, { type: "MARQUEE_ITEM" }>;
  control: Control<ThemeInputType>;
}

export const MarqueeItemEditor = ({ component, index, selection, control }: MarqueeItemEditorProps) => {
  const { clearSelection } = useThemeStore();

  if (component.type !== "MARQUEE") {
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

  const itemIndex = (component as MarqueeComponentInputType).items.findIndex(
    (item) => item.itemId === selection.itemId
  );

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
      icon={IconMarquee}
      iconColor="orange"
      title="Marquee Item Ayarları"
      subtitle={`${itemIndex + 1}. öğe`}
      onClose={clearSelection}
    >
      <MarqueeItemForm index={itemIndex} control={control} componentIndex={index} />
    </AsideFormLayout>
  );
};
