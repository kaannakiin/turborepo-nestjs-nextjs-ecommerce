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
import { Button, Stack, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Control, createId, useFieldArray } from "@repo/shared";
import {
  CarouselItemInputType,
  ProductCarouselComponentInputType,
  ThemeInputType,
} from "@repo/types";
import { IconPlus } from "@tabler/icons-react";
import { useMemo } from "react";
import SelectableProductModal, {
  SimplifiedProductSelection,
} from "../../../../../../components/modals/SelectableProductModal";
import { useThemeStore } from "../../store/zustand-zod-theme.store";
import { SortableListRow } from "../common/SortableListRow";

interface LeftSideProductFormProps {
  control: Control<ThemeInputType>;
  index: number;
  field: ProductCarouselComponentInputType;
}

const LeftSideProductForm = ({
  index,
  field,
  control,
}: LeftSideProductFormProps) => {
  const [opened, { open, close }] = useDisclosure();
  const { selectProductCarouselItem, selection, clearSelection } =
    useThemeStore();
  const productPaths = `components.${index}.items` as const;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: productPaths,
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
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  const existingItemsPayload = useMemo(() => {
    return fields
      .map((fieldItem) => {
        const item = fieldItem as unknown as (typeof field.items)[number];

        const id = item.variantId || item.productId;

        if (!id) return null;

        return {
          id: id,
          isVariant: !!item.variantId,
          name: item.customTitle || "",
        } satisfies SimplifiedProductSelection;
      })
      .filter((item): item is SimplifiedProductSelection => item !== null);
  }, [field, fields]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <Stack gap={0}>
          {fields.map((item, itemIndex) => {
            const itemData = item as unknown as (typeof field.items)[number];

            const isSelected =
              selection?.type === "PRODUCT_CAROUSEL_ITEM" &&
              selection.itemId === itemData.itemId;

            return (
              <SortableListRow
                key={item.id}
                id={item.id}
                isSelected={isSelected}
                onClick={() =>
                  selectProductCarouselItem(field.componentId, itemData.itemId)
                }
                onDelete={() => {
                  remove(itemIndex);
                  if (isSelected) clearSelection();
                }}
              >
                <div>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {itemData.customTitle || "İsimsiz Ürün"}
                  </Text>
                </div>
              </SortableListRow>
            );
          })}
        </Stack>
      </SortableContext>

      <Button
        variant="transparent"
        size="sm"
        color="black"
        onClick={open}
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
        Ürün Ekle
      </Button>

      <SelectableProductModal
        opened={opened}
        onClose={close}
        multiple={true}
        initialData={existingItemsPayload}
        onSubmit={(data) => {
          const selectedItems = Array.isArray(data) ? data : [data];

          const currentIds = new Set(
            fields.map((f: CarouselItemInputType) => f.variantId || f.productId)
          );

          selectedItems.forEach((product) => {
            if (currentIds.has(product.id)) return;

            append({
              itemId: createId(),

              productId: product.isVariant ? null : product.id,
              variantId: product.isVariant ? product.id : null,
              customTitle: product.name,
              badgeText: "",
            });
          });
          close();
        }}
      />
    </DndContext>
  );
};

export default LeftSideProductForm;
