'use client';

import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ActionIcon,
  Card,
  Group,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { DesignProductCarouselProductSchemaInputType } from '@repo/types';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { useDesignStore, useIsSelected } from '../../store/design-store';
import { ItemDragData } from '../../components/dnd/DndProvider';

interface ProductCarouselItemListProps {
  products: DesignProductCarouselProductSchemaInputType[];
  parentUniqueId: string;
  onSelectItem: (uniqueId: string) => void;
}

const ProductCarouselItemList = ({
  products,
  parentUniqueId,
  onSelectItem,
}: ProductCarouselItemListProps) => {
  const productIds = products.map((p) => p.uniqueId);

  if (products.length === 0) {
    return (
      <Text size="xs" c="dimmed" ta="center" py="sm">
        Henuz urun eklenmedi
      </Text>
    );
  }

  return (
    <SortableContext items={productIds} strategy={verticalListSortingStrategy}>
      <Stack gap="xs">
        {products.map((product, index) => (
          <SortableProductItem
            key={product.uniqueId}
            product={product}
            index={index}
            parentUniqueId={parentUniqueId}
            onSelect={() => onSelectItem(product.uniqueId)}
          />
        ))}
      </Stack>
    </SortableContext>
  );
};

interface SortableProductItemProps {
  product: DesignProductCarouselProductSchemaInputType;
  index: number;
  parentUniqueId: string;
  onSelect: () => void;
}

const SortableProductItem = ({
  product,
  index,
  parentUniqueId,
  onSelect,
}: SortableProductItemProps) => {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');
  const deleteByUniqueId = useDesignStore((s) => s.deleteByUniqueId);
  const isSelected = useIsSelected(product.uniqueId);

  const dragData: ItemDragData = {
    type: 'item',
    uniqueId: product.uniqueId,
    parentUniqueId,
    arrayKey: 'products',
    index,
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: product.uniqueId,
    data: dragData,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={{
        ...style,
        cursor: 'pointer',
        borderColor: isSelected ? theme.colors.blue[6] : undefined,
      }}
      withBorder
      p="xs"
      onClick={onSelect}
    >
      <Group justify="space-between">
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            size="xs"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            {...attributes}
            {...listeners}
          >
            <IconGripVertical size={14} />
          </ActionIcon>
          <Text size="xs">
            Urun {index + 1}
            {product.isCustomBadgeActive && product.customBadgeText && (
              <Text span size="xs" c="blue" ml="xs">
                ({product.customBadgeText})
              </Text>
            )}
          </Text>
        </Group>
        <ActionIcon
          variant="subtle"
          color="red"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            deleteByUniqueId(product.uniqueId);
          }}
        >
          <IconTrash size={14} />
        </ActionIcon>
      </Group>
    </Card>
  );
};

export default ProductCarouselItemList;
