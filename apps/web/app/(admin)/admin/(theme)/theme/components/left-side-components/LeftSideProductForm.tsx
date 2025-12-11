"use client";
import SelectableProductModal from "@/components/modals/SelectableProductModal";
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
import { Control, createId, useFieldArray, useWatch } from "@repo/shared";
import {
  CarouselItemInputType,
  ProductCarouselComponentInputType,
  ProductSelectResult,
  PageInputType,
  ThemeInputType,
} from "@repo/types";
import { IconPlus } from "@tabler/icons-react";
import { useMemo } from "react";
import { useThemeStore } from "../../store/theme-store";
import { SortableListRow } from "../common/SortableListRow";
import { TruncatedText } from "@/components/TruncatedText";

interface LeftSideProductFormProps {
  control: Control<ThemeInputType>;
  actualPageIndex: number;
  componentIndex: number;
  field: ProductCarouselComponentInputType;
}

const LeftSideProductForm = ({
  actualPageIndex,
  componentIndex,
  field,
  control,
}: LeftSideProductFormProps) => {
  const [opened, { open, close }] = useDisclosure();
  const { selection, clearSelection, selectProductCarouselItem } =
    useThemeStore();

  const productPaths =
    `pages.${actualPageIndex}.components.${componentIndex}.items` as const;

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

  const watchedItems = useWatch({
    control,
    name: productPaths,
  });

  const currentSelectedIds = useMemo(() => {
    const items = watchedItems || fields;

    return items
      .map(
        (item: CarouselItemInputType) => item.variantId || item.productId || ""
      )
      .filter((id: string) => Boolean(id));
  }, [watchedItems, fields]);

  const handleModalSubmit = (selectedProducts: ProductSelectResult[]) => {
    const selectedIdsSet = new Set(selectedProducts.map((p) => p.id));

    const indexesToRemove: number[] = [];
    fields.forEach((fieldItem: CarouselItemInputType, idx) => {
      const currentId = fieldItem.variantId || fieldItem.productId;
      if (currentId && !selectedIdsSet.has(currentId)) {
        indexesToRemove.push(idx);
      }
    });

    if (indexesToRemove.length > 0) {
      indexesToRemove.sort((a, b) => b - a).forEach((idx) => remove(idx));
    }

    const newItems = selectedProducts.filter(
      (p) => !currentSelectedIds.includes(p.id)
    );

    const itemsToAppend = newItems.map((product) => ({
      itemId: createId(),
      productId: product.isVariant ? null : product.id,
      variantId: product.isVariant ? product.id : null,
      customTitle: product.name,
      badgeText: "",
    }));

    if (itemsToAppend.length > 0) {
      append(itemsToAppend);
    }
  };

  return (
    <>
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
              const itemData = item as unknown as CarouselItemInputType;

              const isSelected =
                selection?.type === "PRODUCT_CAROUSEL_ITEM" &&
                selection.itemId === itemData.itemId;

              return (
                <SortableListRow
                  key={item.id}
                  id={item.id}
                  isSelected={isSelected}
                  onClick={() => {
                    selectProductCarouselItem(
                      field.componentId,
                      itemData.itemId
                    );
                  }}
                  onDelete={() => {
                    remove(itemIndex);
                    if (isSelected) clearSelection();
                  }}
                >
                  <div style={{ width: "100%", overflow: "hidden" }}>
                    <TruncatedText size="sm" fw={500}>
                      {itemData.customTitle || "İsimsiz Ürün"}
                    </TruncatedText>
                  </div>
                </SortableListRow>
              );
            })}
          </Stack>
        </SortableContext>
      </DndContext>
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
        onSubmit={handleModalSubmit}
        selectedIds={currentSelectedIds}
        props={{
          title: "Ürün Seçimi",
          size: "lg",
        }}
      />
    </>
  );
};

export default LeftSideProductForm;
