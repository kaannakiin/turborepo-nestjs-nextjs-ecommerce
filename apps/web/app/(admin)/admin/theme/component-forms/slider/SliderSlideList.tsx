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
import { DesignSliderSlideSchemaInputType } from '@repo/types';
import { IconGripVertical, IconPhoto, IconTrash } from '@tabler/icons-react';
import { ItemDragData } from '../../components/dnd/DndProvider';
import { useDesignStore, useIsSelected } from '../../store/design-store';

interface SliderSlideListProps {
  slides: DesignSliderSlideSchemaInputType[];
  parentUniqueId: string;
  onSelectItem: (uniqueId: string) => void;
}

const SliderSlideList = ({
  slides,
  parentUniqueId,
  onSelectItem,
}: SliderSlideListProps) => {
  const slideIds = slides.map((s) => s.uniqueId);

  if (slides.length === 0) {
    return (
      <Text size="xs" c="dimmed" ta="center" py="sm">
        Henuz slayt eklenmedi
      </Text>
    );
  }

  return (
    <SortableContext items={slideIds} strategy={verticalListSortingStrategy}>
      <Stack gap="xs">
        {slides.map((slide, index) => (
          <SortableSlideItem
            key={slide.uniqueId}
            slide={slide}
            index={index}
            parentUniqueId={parentUniqueId}
            onSelect={() => onSelectItem(slide.uniqueId)}
          />
        ))}
      </Stack>
    </SortableContext>
  );
};

interface SortableSlideItemProps {
  slide: DesignSliderSlideSchemaInputType;
  index: number;
  parentUniqueId: string;
  onSelect: () => void;
}

const SortableSlideItem = ({
  slide,
  index,
  parentUniqueId,
  onSelect,
}: SortableSlideItemProps) => {
  const theme = useMantineTheme();
  const deleteByUniqueId = useDesignStore((s) => s.deleteByUniqueId);
  const isSelected = useIsSelected(slide.uniqueId);

  const dragData: ItemDragData = {
    type: 'item',
    uniqueId: slide.uniqueId,
    parentUniqueId,
    arrayKey: 'slides',
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
    id: slide.uniqueId,
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
          <Text size="xs">{slide.title || `Slayt ${index + 1}`}</Text>
        </Group>
        <ActionIcon
          variant="subtle"
          color="red"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            deleteByUniqueId(slide.uniqueId);
          }}
        >
          <IconTrash size={14} />
        </ActionIcon>
      </Group>
    </Card>
  );
};

export default SliderSlideList;
