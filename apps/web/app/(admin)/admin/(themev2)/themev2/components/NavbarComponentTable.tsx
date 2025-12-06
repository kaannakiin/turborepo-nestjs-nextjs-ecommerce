import { Stack } from "@mantine/core";
import { Control, UseFieldArrayReturn } from "@repo/shared";
import {
  MarqueeComponentInputType,
  ProductCarouselComponentInputType,
  SliderComponentInputType,
  ThemeComponents,
  ThemeInputType,
} from "@repo/types";
import { useMemo } from "react";
import LeftSideMarqueeList from "./left-side-components/LeftSideMarqueeList";
import LeftSideSliderList from "./left-side-components/LeftSideSliderList";
import SortableNavbarComponent from "./SortableNavbarComponent";
import LeftSideProductForm from "./left-side-components/LeftSideProductForm";

const getTitle = (type: ThemeComponents, index: number) => {
  switch (type) {
    case "SLIDER":
      return `Slider (${index + 1})`;
    case "MARQUEE":
      return `Marquee (${index + 1})`;
    case "PRODUCT_CAROUSEL":
      return `Ürün Slaytı (${index + 1})`;
  }
};

interface NavbarComponentTableProps {
  control: Control<ThemeInputType>;
  functions: UseFieldArrayReturn<ThemeInputType, "components", "rhf_id">;
}

const NavbarComponentTable = ({
  control,

  functions: { fields, replace },
}: NavbarComponentTableProps) => {
  const sortedFields = useMemo(() => {
    return [...fields].sort((a, b) => a.order - b.order);
  }, [fields]);

  const handleSwap = (currentIndex: number, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= sortedFields.length) return;

    const currentField = sortedFields[currentIndex];
    const targetField = sortedFields[targetIndex];

    const newComponents = fields.map((field) => {
      if (field.rhf_id === currentField.rhf_id) {
        return { ...field, order: targetField.order };
      }

      if (field.rhf_id === targetField.rhf_id) {
        return { ...field, order: currentField.order };
      }

      return field;
    });

    replace(newComponents);
  };

  const handleDelete = (rhf_id: string) => {
    const fieldToRemove = fields.find((f) => f.rhf_id === rhf_id);
    if (!fieldToRemove) return;

    const removedOrder = fieldToRemove.order;

    const newComponents = fields
      .filter((field) => field.rhf_id !== rhf_id)
      .map((field) => {
        if (field.order > removedOrder) {
          return { ...field, order: field.order - 1 };
        }
        return field;
      });

    replace(newComponents);
  };

  return (
    <Stack gap="xs" py="md">
      {sortedFields.map((field, sortedIndex) => {
        const actualIndex = fields.findIndex((f) => f.rhf_id === field.rhf_id);

        if (actualIndex === -1) return null;

        return (
          <SortableNavbarComponent
            key={field.rhf_id}
            componentId={field.componentId}
            title={getTitle(field.type, sortedIndex)}
            onDelete={() => handleDelete(field.rhf_id)}
            onMoveUp={() => handleSwap(sortedIndex, sortedIndex - 1)}
            onMoveDown={() => handleSwap(sortedIndex, sortedIndex + 1)}
            isFirst={sortedIndex === 0}
            isLast={sortedIndex === sortedFields.length - 1}
          >
            {field.type === "SLIDER" && (
              <LeftSideSliderList
                control={control}
                index={actualIndex}
                field={field as SliderComponentInputType & { rhf_id: string }}
              />
            )}
            {field.type === "MARQUEE" && (
              <LeftSideMarqueeList
                control={control}
                index={actualIndex}
                field={field as MarqueeComponentInputType & { rhf_id: string }}
              />
            )}
            {field.type === "PRODUCT_CAROUSEL" && (
              <LeftSideProductForm
                control={control}
                index={actualIndex}
                field={
                  field as ProductCarouselComponentInputType & {
                    rhf_id: string;
                  }
                }
              />
            )}
          </SortableNavbarComponent>
        );
      })}
    </Stack>
  );
};

export default NavbarComponentTable;
