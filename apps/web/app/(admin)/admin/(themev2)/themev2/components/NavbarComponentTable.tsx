import {
  DndContext,
  DragEndEvent,
  DraggableSyntheticListeners,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import LeftSideProductForm from "./left-side-components/LeftSideProductForm";
import LeftSideSliderList from "./left-side-components/LeftSideSliderList";
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
  functions: UseFieldArrayReturn<ThemeInputType, "components", "rhf_id">;
}

interface SortableItemProps {
  id: string;
  children: (
    dragHandleProps: DraggableSyntheticListeners,
    isDragging: boolean
  ) => React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children(listeners, isDragging)}
    </div>
  );
};

const NavbarComponentTable = ({
  control,
  functions: { fields, replace },
}: NavbarComponentTableProps) => {
  const sortedFields = useMemo(() => {
    return [...fields].sort((a, b) => a.order - b.order);
  }, [fields]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortedFields.findIndex(
        (item) => item.rhf_id === active.id
      );
      const newIndex = sortedFields.findIndex(
        (item) => item.rhf_id === over?.id
      );

      const newSortedList = arrayMove(sortedFields, oldIndex, newIndex);

      const updatedFields = newSortedList.map((field, index) => ({
        ...field,
        order: index,
      }));

      replace(updatedFields);
    }
  };

  const handleDelete = (rhf_id: string) => {
    const fieldToRemove = fields.find((f) => f.rhf_id === rhf_id);
    if (!fieldToRemove) return;

    const newComponents = sortedFields
      .filter((field) => field.rhf_id !== rhf_id)
      .map((field, index) => ({
        ...field,
        order: index,
      }));

    replace(newComponents);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedFields.map((f) => f.rhf_id)}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {sortedFields.map((field, sortedIndex) => {
            const actualIndex = fields.findIndex(
              (f) => f.rhf_id === field.rhf_id
            );
            if (actualIndex === -1) return null;

            return (
              <SortableItem key={field.rhf_id} id={field.rhf_id}>
                {(dragListeners, isDragging) => (
                  <SortableNavbarComponent
                    componentId={field.componentId}
                    title={getTitle(field.type, sortedIndex)}
                    onDelete={() => handleDelete(field.rhf_id)}
                    dragHandleProps={dragListeners}
                    isDragging={isDragging}
                  >
                    {field.type === "SLIDER" && (
                      <LeftSideSliderList
                        control={control}
                        index={actualIndex}
                        field={
                          field as SliderComponentInputType & { rhf_id: string }
                        }
                      />
                    )}
                    {field.type === "MARQUEE" && (
                      <LeftSideMarqueeList
                        control={control}
                        index={actualIndex}
                        field={
                          field as MarqueeComponentInputType & {
                            rhf_id: string;
                          }
                        }
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
                )}
              </SortableItem>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default NavbarComponentTable;
