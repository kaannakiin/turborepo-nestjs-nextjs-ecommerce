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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button, Stack, ThemeIcon } from "@mantine/core";
import { Control, createId, useFieldArray, useWatch } from "@repo/shared";
import { MarqueeComponentInputType, ThemeInputType } from "@repo/types";
import { IconPlus } from "@tabler/icons-react";
import NavbarMarqueeItemRow from "./NavbarMarqueeItemRow";

interface LeftSideMarqueeListProps {
  control: Control<ThemeInputType>;
  actualPageIndex: number;
  componentIndex: number;
  field: MarqueeComponentInputType;
}

const NavbarMarqueeList = ({
  control,
  actualPageIndex,
  componentIndex,
  field,
}: LeftSideMarqueeListProps) => {
  const itemsPath =
    `pages.${actualPageIndex}.components.${componentIndex}.items` as const;

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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((f) => f.rhf_item_id === active.id);
      const newIndex = items.findIndex((f) => f.rhf_item_id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex);
    }
  };

  const componentId = useWatch({
    control,
    name: `pages.${actualPageIndex}.components.${componentIndex}.componentId`,
    defaultValue: field.componentId,
  });

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
            const itemData = item as unknown as (typeof field.items)[number];
            return (
              <NavbarMarqueeItemRow
                key={item.rhf_item_id}
                id={item.rhf_item_id}
                itemId={itemData.itemId}
                text={itemData.text || (itemData.image ? "[Resim]" : "")}
                index={itemIndex}
                componentId={componentId}
                onRemove={() => remove(itemIndex)}
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
            itemId: createId(),
            text: "Yeni Duyuru",
            link: null,
            image: null,
            existingImage: null,
            badgeText: null,
            customTitle: null,
            productId: null,
            variantId: null,
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

export default NavbarMarqueeList;
