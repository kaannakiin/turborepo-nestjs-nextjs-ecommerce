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
import { MarqueeComponentInputType, ThemeInputType } from "@repo/types";
import { IconPlus } from "@tabler/icons-react";
import { useThemeStore } from "../../store/zustand-zod-theme.store";
import { SortableListRow } from "../common/SortableListRow";

interface LeftSideMarqueeListProps {
  control: Control<ThemeInputType>;
  index: number;
  field: MarqueeComponentInputType;
}

const LeftSideMarqueeList = ({ control, index, field }: LeftSideMarqueeListProps) => {
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
        distance: 5,
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
      <SortableContext items={items.map((f) => f.rhf_item_id)} strategy={verticalListSortingStrategy}>
        <Stack gap={0}>
          {items.map((item, itemIndex) => {
            const itemData = item as unknown as (typeof field.items)[number];

            const isSelected =
              selection?.type === "MARQUEE_ITEM" &&
              selection.componentId === field.componentId &&
              selection.itemId === itemData.itemId;

            const displayText = itemData.text || (itemData.image ? "[Resim]" : `Öğe ${itemIndex + 1}`);

            return (
              <SortableListRow
                key={item.rhf_item_id}
                id={item.rhf_item_id}
                isSelected={isSelected}
                onClick={() => selectMarqueeItem(field.componentId, itemData.itemId)}
                onDelete={() => {
                  remove(itemIndex);
                  if (isSelected) clearSelection();
                }}
              >
                <Text size="sm" truncate>
                  {displayText}
                </Text>
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
            itemId: createId(),
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
        Marquee Öğesi Ekle
      </Button>
    </DndContext>
  );
};

export default LeftSideMarqueeList;
