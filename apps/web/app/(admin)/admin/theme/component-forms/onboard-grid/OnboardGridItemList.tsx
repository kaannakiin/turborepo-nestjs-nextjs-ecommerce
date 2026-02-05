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
  useMantineTheme,
} from '@mantine/core';
import { DesignOnboardGridItemBaseSchemaInputType } from '@repo/types';
import { IconGripVertical, IconPhoto, IconTrash } from '@tabler/icons-react';
import { ItemDragData } from '../../components/dnd/DndProvider';
import { useDesignStore, useIsSelected } from '../../store/design-store';

interface OnboardGridItemListProps {
  items: DesignOnboardGridItemBaseSchemaInputType[];
  parentUniqueId: string;
  onSelectItem: (uniqueId: string) => void;
}

const OnboardGridItemList = ({
  items,
  parentUniqueId,
  onSelectItem,
}: OnboardGridItemListProps) => {
  const itemIds = items.map((item) => item.uniqueId);

  if (items.length === 0) {
    return (
      <Text size="xs" c="dimmed" ta="center" py="sm">
        Henüz öğe eklenmedi
      </Text>
    );
  }

  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
      <Stack gap="xs">
        {items.map((item, index) => (
          <SortableGridItem
            key={item.uniqueId}
            item={item}
            index={index}
            parentUniqueId={parentUniqueId}
            onSelect={() => onSelectItem(item.uniqueId)}
          />
        ))}
      </Stack>
    </SortableContext>
  );
};

interface SortableGridItemProps {
  item: DesignOnboardGridItemBaseSchemaInputType;
  index: number;
  parentUniqueId: string;
  onSelect: () => void;
}

const SortableGridItem = ({
  item,
  index,
  parentUniqueId,
  onSelect,
}: SortableGridItemProps) => {
  const theme = useMantineTheme();
  const deleteByUniqueId = useDesignStore((s) => s.deleteByUniqueId);
  const isSelected = useIsSelected(item.uniqueId);

  const dragData: ItemDragData = {
    type: 'item',
    uniqueId: item.uniqueId,
    parentUniqueId,
    arrayKey: 'items',
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
    id: item.uniqueId,
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
          <IconPhoto size={14} />
          <Text size="xs">{item.title || `Öğe ${index + 1}`}</Text>
        </Group>
        <ActionIcon
          variant="subtle"
          color="red"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            deleteByUniqueId(item.uniqueId);
          }}
        >
          <IconTrash size={14} />
        </ActionIcon>
      </Group>
    </Card>
  );
};

export default OnboardGridItemList;
