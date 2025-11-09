"use client";
import { Stack } from "@mantine/core";
import { Control, useFieldArray } from "@repo/shared";
import { SliderComponentInputType, ThemeInputType } from "@repo/types";
import { useEffect, useMemo, useRef } from "react";
import LeftSideSliderList from "./left-side-components/LeftSideSliderList";
import SortableNavbarComponent from "./SortableNavbarComponent";

interface NavbarComponentTableProps {
  control: Control<ThemeInputType>;
}

const NavbarComponentTable = ({ control }: NavbarComponentTableProps) => {
  const { fields, remove, swap, update } = useFieldArray({
    control,
    name: "components",
    keyName: "rhf_id",
  });

  const fieldsRef = useRef(fields);
  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);

  const sortedFields = useMemo(() => {
    return [...fields].sort((a, b) => a.order - b.order);
  }, [fields]);

  const handleSwap = (currentIndex: number, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= sortedFields.length) return;

    const currentField = sortedFields[currentIndex];
    const targetField = sortedFields[targetIndex];

    const currentActualIndex = fields.findIndex(
      (f) => f.rhf_id === currentField.rhf_id
    );
    const targetActualIndex = fields.findIndex(
      (f) => f.rhf_id === targetField.rhf_id
    );

    swap(currentActualIndex, targetActualIndex);

    update(currentActualIndex, { ...currentField, order: targetField.order });
    update(targetActualIndex, { ...targetField, order: currentField.order });
  };

  const handleDelete = (rhf_id: string) => {
    const actualIndex = fields.findIndex((f) => f.rhf_id === rhf_id);
    if (actualIndex === -1) return;

    const removedOrder = fields[actualIndex].order;

    remove(actualIndex);

    setTimeout(() => {
      const currentComponents = fieldsRef.current;

      currentComponents.forEach((field) => {
        if (field.order > removedOrder) {
          const newActualIndex = currentComponents.findIndex(
            (f) => f.rhf_id === field.rhf_id
          );

          if (newActualIndex !== -1) {
            update(newActualIndex, { ...field, order: field.order - 1 });
          }
        }
      });
    }, 0);
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
            title={
              field.type === "SLIDER"
                ? `Slider (${sortedIndex + 1})`
                : `Marquee (${sortedIndex + 1})`
            }
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
            {field.type === "MARQUEE" && <div>Marquee Form</div>}
          </SortableNavbarComponent>
        );
      })}
    </Stack>
  );
};

export default NavbarComponentTable;
