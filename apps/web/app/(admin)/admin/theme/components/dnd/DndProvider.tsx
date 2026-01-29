'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MeasuringStrategy,
  closestCenter,
} from '@dnd-kit/core';
import { Card, Group, Text } from '@mantine/core';
import { DesignComponentType } from '@repo/types';
import { ReactNode, useState } from 'react';
import { componentRegistry } from '../../registry';
import { useDesignStore } from '../../store/design-store';
import { useDndSensors } from './useDndSensors';

export type DragType = 'library' | 'component' | 'item';

export interface LibraryDragData {
  type: 'library';
  componentType: DesignComponentType;
}

export interface ComponentDragData {
  type: 'component';
  uniqueId: string;
  pageUniqueId: string;
  index: number;
}

export interface ItemDragData {
  type: 'item';
  uniqueId: string;
  parentUniqueId: string;
  arrayKey: string;
  index: number;
}

export type DragData = LibraryDragData | ComponentDragData | ItemDragData;

interface DndProviderProps {
  children: ReactNode;
}

const DndProvider = ({ children }: DndProviderProps) => {
  const sensors = useDndSensors();
  const [activeData, setActiveData] = useState<DragData | null>(null);

  const { addComponent, reorderComponents, reorderItems, activePageId } =
    useDesignStore();

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData;
    setActiveData(data);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveData(null);
      return;
    }

    const activeData = active.data.current as DragData | undefined;
    const overData = over.data.current as
      | DragData
      | { type: 'dropzone'; pageUniqueId: string }
      | undefined;

    if (!activeData || !overData) {
      setActiveData(null);
      return;
    }

    if (activeData.type === 'library' && overData.type === 'dropzone') {
      const entry = componentRegistry[activeData.componentType];
      const targetPageId = (overData as { pageUniqueId: string }).pageUniqueId;
      if (entry && targetPageId) {
        addComponent(targetPageId, entry.defaultValue());
      }
    }

    if (activeData.type === 'component' && overData.type === 'component') {
      if (active.id !== over.id) {
        reorderComponents(
          activeData.pageUniqueId,
          activeData.index,
          overData.index,
        );
      }
    }

    if (activeData.type === 'item' && overData.type === 'item') {
      if (
        active.id !== over.id &&
        activeData.parentUniqueId === overData.parentUniqueId
      ) {
        reorderItems(
          activeData.parentUniqueId,
          activeData.arrayKey,
          activeData.index,
          overData.index,
        );
      }
    }

    setActiveData(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      {children}
      <DragOverlay>
        {activeData && <DragOverlayContent data={activeData} />}
      </DragOverlay>
    </DndContext>
  );
};

const DragOverlayContent = ({ data }: { data: DragData }) => {
  if (data.type === 'library') {
    const entry = componentRegistry[data.componentType];
    if (!entry) return null;

    return (
      <Card withBorder p="sm" shadow="md" style={{ width: 200 }}>
        <Group gap="sm">
          <Text size="sm">{entry.label}</Text>
        </Group>
      </Card>
    );
  }

  if (data.type === 'component') {
    return (
      <Card withBorder p="sm" shadow="md" style={{ opacity: 0.8 }}>
        <Text size="sm">Component</Text>
      </Card>
    );
  }

  if (data.type === 'item') {
    return (
      <Card withBorder p="xs" shadow="md" style={{ opacity: 0.8 }}>
        <Text size="xs">Item</Text>
      </Card>
    );
  }

  return null;
};

export default DndProvider;
