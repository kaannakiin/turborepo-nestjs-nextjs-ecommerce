"use client";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import NavbarProductCarouselList from "./navbar-components/product-carousel/NavbarProductCarouselList";
import NavbarSliderList from "./navbar-components/slider/NavbarSliderList";
import NavbarMarqueeList from "./navbar-components/marquee/NavbarMarqueeList";
import SortableNavbarComponent from "./SortableNavbarComponent";

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
  activePageIndex: number;
  functions: UseFieldArrayReturn<
    ThemeInputType,
    `pages.${number}.components`,
    "rhf_id"
  >;
}

const NavbarComponentTable = ({
  control,
  functions: { fields, move, replace },
  activePageIndex,
}: NavbarComponentTableProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedFields = useMemo(() => {
    return [...fields].sort((a, b) => a.order - b.order);
  }, [fields]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f.rhf_id === active.id);
      const newIndex = fields.findIndex((f) => f.rhf_id === over?.id);

      move(oldIndex, newIndex);

      const updatedFields = [...fields];
      const [movedItem] = updatedFields.splice(oldIndex, 1);
      updatedFields.splice(newIndex, 0, movedItem);

      const reordered = updatedFields.map((field, index) => ({
        ...field,
        order: index,
      }));

      replace(reordered);
    }
  };

  const handleDelete = (rhf_id: string) => {
    const index = fields.findIndex((f) => f.rhf_id === rhf_id);
    if (index === -1) return;

    const newFields = fields
      .filter((_, i) => i !== index)
      .map((field, i) => ({ ...field, order: i }));

    replace(newFields);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Stack gap="xs">
        <SortableContext
          items={sortedFields.map((f) => f.rhf_id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedFields.map((field, sortedIndex) => {
            const actualIndex = fields.findIndex(
              (f) => f.rhf_id === field.rhf_id
            );

            if (actualIndex === -1) return null;
            return (
              <SortableNavbarComponent
                key={field.rhf_id}
                rhfId={field.rhf_id}
                componentId={field.componentId}
                title={getTitle(field.type, sortedIndex)}
                onDelete={() => handleDelete(field.rhf_id)}
              >
                {field.type === "SLIDER" && (
                  <NavbarSliderList
                    key={field.rhf_id}
                    componentIndex={actualIndex}
                    control={control}
                    index={activePageIndex}
                    field={
                      field as SliderComponentInputType & {
                        rhf_id: string;
                      }
                    }
                  />
                )}
                {field.type === "MARQUEE" && (
                  <NavbarMarqueeList
                    key={field.rhf_id}
                    control={control}
                    actualPageIndex={activePageIndex}
                    componentIndex={actualIndex}
                    field={
                      field as MarqueeComponentInputType & {
                        rhf_id: string;
                      }
                    }
                  />
                )}
                {field.type === "PRODUCT_CAROUSEL" && (
                  <NavbarProductCarouselList
                    key={field.rhf_id}
                    control={control}
                    actualPageIndex={activePageIndex}
                    componentIndex={actualIndex}
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
        </SortableContext>
      </Stack>
    </DndContext>
  );
};

export default NavbarComponentTable;
