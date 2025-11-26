"use client";
import {
  ActionIcon,
  Button,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { Control, createId, useFieldArray } from "@repo/shared";
import {
  minimalValidSlide,
  SliderComponentInputType,
  SliderInputType,
  ThemeInputType,
} from "@repo/types";
import { IconGripVertical, IconPlus, IconTrashX } from "@tabler/icons-react";
import { useThemeStore } from "../../store/zustand-zod-theme.store";

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
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

type SlideFieldWithRhfId = SliderInputType & {
  rhf_id_slide: string;
};

type SliderField = SliderComponentInputType & { rhf_id: string };

interface SliderFormProps {
  control: Control<ThemeInputType>;
  index: number;
  field: SliderField;
}

/**
 * Her bir sıralanabilir slayt öğesini temsil eden alt bileşen
 */
interface SortableSlideItemProps {
  slideField: SlideFieldWithRhfId;
  slideIndex: number;
  componentId: string;
  isSlideSelected: boolean;
  selectSlide: (componentId: string, slideId: string) => void;
  deleteSlide?: (index: number) => void;
}

const SortableSlideItem: React.FC<SortableSlideItemProps> = ({
  slideField,
  slideIndex,
  componentId,
  isSlideSelected,
  selectSlide,
  deleteSlide,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slideField.rhf_id_slide });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Group
      ref={setNodeRef}
      style={style}
      {...attributes}
      gap="xs"
      px="sm"
      py="xs"
      onClick={() => selectSlide(componentId, slideField.sliderId)}
      bg={
        isSlideSelected
          ? "var(--mantine-color-blue-0)"
          : "var(--mantine-color-white)"
      }
      className="hover:bg-gray-100 cursor-pointer border-b border-gray-100 transition-colors touch-none w-full"
      justify="space-between"
      align="center"
    >
      <Group gap={"xs"} align="center">
        <ActionIcon
          variant="transparent"
          color="gray"
          size="xs"
          className="cursor-grab active:cursor-grabbing"
          {...listeners}
          onClick={(event) => {
            event.stopPropagation();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <IconGripVertical size={14} />
        </ActionIcon>
        <Text size="sm">Slayt {slideIndex + 1}</Text>
      </Group>
      <ActionIcon
        size={"xs"}
        variant="transparent"
        color="red"
        onClick={(event) => {
          event.stopPropagation();
          deleteSlide?.(slideIndex);
        }}
      >
        <IconTrashX />
      </ActionIcon>
    </Group>
  );
};

const LeftSideSliderList = ({ control, index, field }: SliderFormProps) => {
  const { selection, selectSlide, clearSelection } = useThemeStore();

  const slidesPath = `components.${index}.sliders` as const;

  const { fields, append, move, remove } = useFieldArray({
    control,
    name: slidesPath,
    keyName: "rhf_id_slide",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.rhf_id_slide === active.id);
      const newIndex = fields.findIndex((f) => f.rhf_id_slide === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={fields.map((f) => f.rhf_id_slide)}
        strategy={verticalListSortingStrategy}
      >
        <Stack gap={0}>
          {fields.map((slideField, slideIndex) => {
            const isSlideSelected =
              selection?.type === "SLIDE" &&
              selection.id === slideField.sliderId;

            return (
              <SortableSlideItem
                key={slideField.rhf_id_slide}
                slideField={slideField as SlideFieldWithRhfId}
                slideIndex={slideIndex}
                componentId={field.componentId}
                isSlideSelected={isSlideSelected}
                selectSlide={selectSlide}
                deleteSlide={() => {
                  remove(slideIndex);
                  clearSelection();
                }}
              />
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
            <IconPlus size={24} color="white" />
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
