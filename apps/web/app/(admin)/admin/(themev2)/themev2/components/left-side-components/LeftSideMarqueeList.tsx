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
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  MarqueeComponentInputType,
  MarqueeComponentOutputType,
  minimalValidMarqueeItem,
  ThemeInputType,
} from "@repo/types";
import { IconGripVertical, IconPlus, IconTrashX } from "@tabler/icons-react";
import React from "react";
import { useThemeStore } from "../../store/zustand-zod-theme.store";

type MarqueeItemWithRhfId = MarqueeComponentOutputType["items"][0] & {
  rhf_item_id: string;
};

interface SortableMarqueeItemProps {
  itemField: MarqueeItemWithRhfId;
  itemIndex: number;
  componentId: string;
  isItemSelected: boolean;
  selectMarqueeItem: (componentId: string, itemId: string) => void;
  deleteMarqueeItem?: (index: number) => void;
}

interface LeftSideMarqueeListProps {
  control: Control<ThemeInputType>;
  index: number;
  field: MarqueeComponentInputType & { rhf_id: string };
}

const SortableMarqueeItem: React.FC<SortableMarqueeItemProps> = ({
  itemField,
  itemIndex,
  componentId,
  isItemSelected,
  selectMarqueeItem,
  deleteMarqueeItem,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemField.rhf_item_id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  const displayText =
    itemField.text || (itemField.image ? "[Resim]" : `Öğe ${itemIndex + 1}`);

  return (
    <Group
      ref={setNodeRef}
      style={style}
      {...attributes}
      gap="xs"
      px="sm"
      py="xs"
      onClick={() => selectMarqueeItem(componentId, itemField.itemId)}
      bg={
        isItemSelected
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
        <Text size="sm" truncate maw={150}>
          {displayText}
        </Text>
      </Group>
      <ActionIcon
        size={"xs"}
        variant="transparent"
        color="red"
        onClick={(event) => {
          event.stopPropagation();
          deleteMarqueeItem?.(itemIndex);
        }}
      >
        <IconTrashX />
      </ActionIcon>
    </Group>
  );
};

const LeftSideMarqueeList = ({
  control,
  field,
  index,
}: LeftSideMarqueeListProps) => {
  const { selection, selectMarqueeItem, clearSelection } = useThemeStore();
  const itemsPath = `components.${index}.items` as const;

  const {
    fields: items,
    append,
    remove,
    move,
  } = useFieldArray({
    control,
    name: itemsPath,
    keyName: "rhf_item_id",
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
      const oldIndex = items.findIndex((f) => f.rhf_item_id === active.id);
      const newIndex = items.findIndex((f) => f.rhf_item_id === over.id);

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
        items={items.map((f) => f.rhf_item_id)}
        strategy={verticalListSortingStrategy}
      >
        <Stack gap={0}>
          {items.map((item, itemIndex) => {
            const isItemSelected =
              selection?.type === "MARQUEE_ITEM" &&
              selection.componentId === field.componentId &&
              selection.itemId === item.itemId;

            return (
              <SortableMarqueeItem
                key={item.rhf_item_id}
                itemField={item as MarqueeItemWithRhfId}
                itemIndex={itemIndex}
                componentId={field.componentId}
                isItemSelected={isItemSelected}
                selectMarqueeItem={selectMarqueeItem}
                deleteMarqueeItem={() => {
                  remove(itemIndex);
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
            ...minimalValidMarqueeItem,
            itemId: createId(),
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
        Marquee Öğesi Ekle
      </Button>
    </DndContext>
  );
};

export default LeftSideMarqueeList;
