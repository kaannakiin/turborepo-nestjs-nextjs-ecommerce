"use client";
import { MarqueeComponentInputType, ThemeInputType } from "@repo/types";
import { IconInfoCircle } from "@tabler/icons-react";
import { EditorSelection, useThemeStore } from "../../store/theme-store";
import { AsideFormLayout } from "../layout/AsideFormLayout";
import { EmptyState } from "../layout/EmptyState";
import MarqueeItemForm from "../right-side-forms/marquee/MarqueeItemForm";
import { Control } from "@repo/shared";

interface MarqueeItemEditorProps {
  component: MarqueeComponentInputType;
  selection: Extract<EditorSelection, { type: "MARQUEE_ITEM" }>;
  control: Control<ThemeInputType>;
  componentIndex: number;
  pageIndex: number;
}

export const MarqueeItemEditor = ({
  component,
  selection,
  control,
  componentIndex,
  pageIndex,
}: MarqueeItemEditorProps) => {
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
      title="Marquee Item Ayarları"
      subtitle={`${itemIndex + 1}. öğe`}
      onClose={clearSelection}
    >
      <MarqueeItemForm
        key={itemIndex}
        index={itemIndex}
        control={control}
        componentIndex={componentIndex}
        pageIndex={pageIndex}
      />
    </AsideFormLayout>
  );
};
