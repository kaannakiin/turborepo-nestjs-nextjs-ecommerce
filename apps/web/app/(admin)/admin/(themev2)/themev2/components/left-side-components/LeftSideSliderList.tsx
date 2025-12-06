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
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button, Stack, Text, ThemeIcon } from "@mantine/core";
import { Control, createId, useFieldArray } from "@repo/shared";
import { minimalValidSlide, SliderComponentInputType, ThemeInputType } from "@repo/types";
import { IconPlus } from "@tabler/icons-react";
import { useThemeStore } from "../../store/zustand-zod-theme.store";
import { SortableListRow } from "../common/SortableListRow";

interface SliderFormProps {
  control: Control<ThemeInputType>;
  index: number;
  field: SliderComponentInputType;
}

const LeftSideSliderList = ({ control, index, field }: SliderFormProps) => {
  const { selection, selectSlide, clearSelection } = useThemeStore();
  const slidesPath = `components.${index}.sliders` as const;

  const { fields, append, move, remove } = useFieldArray({
    control,
    name: slidesPath,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <Stack gap={0}>
          {fields.map((slideField, slideIndex) => {
            const isSelected = selection?.type === "SLIDE" && selection.id === slideField.sliderId;

            return (
              <SortableListRow
                key={slideField.id}
                id={slideField.id}
                isSelected={isSelected}
                onClick={() => selectSlide(field.componentId, slideField.sliderId)}
                onDelete={() => {
                  remove(slideIndex);

                  if (isSelected) clearSelection();
                }}
              >
                <Text size="sm">Slayt {slideIndex + 1}</Text>
              </SortableListRow>
            );
          })}
        </Stack>
      </SortableContext>

      <Button
        variant="transparent"
        size="sm"
        color="black"
        onClick={() => {
          append({
            order: fields.length,
            sliderId: createId(),
            ...minimalValidSlide,
          });
        }}
        leftSection={
          <ThemeIcon size="xs" radius="xl" color="black" variant="filled">
            <IconPlus size={16} color="white" />
          </ThemeIcon>
        }
        justify="start"
        fz="xs"
        fw={500}
        px="sm"
        py="xs"
        fullWidth
        className="hover:bg-gray-100"
      >
        Slider Ekle
      </Button>
    </DndContext>
  );
};

export default LeftSideSliderList;
