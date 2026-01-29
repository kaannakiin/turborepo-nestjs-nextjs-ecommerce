'use client';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Group,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { DesignComponentType } from '@repo/types';
import {
  IconChevronDown,
  IconChevronRight,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useScrollContext } from '../../context/scroll-context';
import { componentRegistry } from '../../registry';
import { useDesignStore, useIsSelected } from '../../store/design-store';
import { ComponentDragData, ItemDragData } from '../dnd/DndProvider';

const PageTree = () => {
  const design = useDesignStore((s) => s.design);
  const activePageId = useDesignStore((s) => s.activePageId);

  const activePage = design?.pages?.find((p) => p.uniqueId === activePageId);

  const pageToShow =
    activePage ||
    (design?.pages && design.pages.length > 0 ? design.pages[0] : null);

  if (!pageToShow) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        Henuz sayfa eklenmedi
      </Text>
    );
  }

  if (pageToShow.components.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        Bu sayfada bilesen yok
      </Text>
    );
  }

  const componentIds = pageToShow.components.map((c) => c.uniqueId);

  return (
    <SortableContext
      items={componentIds}
      strategy={verticalListSortingStrategy}
    >
      <Stack gap="xs">
        {pageToShow.components.map((component, index) => (
          <ComponentTreeItem
            key={component.uniqueId}
            component={component}
            pageUniqueId={pageToShow.uniqueId}
            index={index}
          />
        ))}
      </Stack>
    </SortableContext>
  );
};

interface ComponentTreeItemProps {
  component: {
    uniqueId: string;
    type: DesignComponentType;
    [key: string]: unknown;
  };
  pageUniqueId: string;
  index: number;
}

const ComponentTreeItem = ({
  component,
  pageUniqueId,
  index,
}: ComponentTreeItemProps) => {
  const [expanded, setExpanded] = useState(true);
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');
  const select = useDesignStore((s) => s.select);
  const deleteByUniqueId = useDesignStore((s) => s.deleteByUniqueId);
  const addItem = useDesignStore((s) => s.addItem);
  const isSelected = useIsSelected(component.uniqueId);
  const { scrollToComponent } = useScrollContext();

  const entry = componentRegistry[component.type];
  const itemConfig = entry?.itemConfig;

  const items = itemConfig
    ? (component[itemConfig.arrayKey] as Array<
        { uniqueId: string } & Record<string, unknown>
      >) || []
    : [];

  const hasItems = items.length > 0;

  const dragData: ComponentDragData = {
    type: 'component',
    uniqueId: component.uniqueId,
    pageUniqueId,
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
    id: component.uniqueId,
    data: dragData,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const itemIds = items.map((item) => item.uniqueId);

  return (
    <Box ref={setNodeRef} style={style}>
      <Box
        style={{
          width: '100%',
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          borderRadius: theme.radius.sm,
          cursor: 'pointer',
          backgroundColor: isSelected
            ? colorScheme === 'dark'
              ? theme.colors.dark[5]
              : theme.colors.blue[0]
            : colorScheme === 'dark'
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
          border: isSelected
            ? `1px solid ${theme.colors.blue[6]}`
            : `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        }}
        onClick={() => {
          select('component', component.uniqueId, [
            pageUniqueId,
            component.uniqueId,
          ]);
          scrollToComponent(component.uniqueId);
        }}
      >
        <Group gap="xs" justify="space-between">
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
            {itemConfig && (
              <ActionIcon
                variant="subtle"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? (
                  <IconChevronDown size={14} />
                ) : (
                  <IconChevronRight size={14} />
                )}
              </ActionIcon>
            )}
            <Text size="sm">{entry?.label || component.type}</Text>
          </Group>
          {hasItems && (
            <Text size="xs" c="dimmed">
              {items.length}
            </Text>
          )}
          <Group gap={4}>
            <Tooltip label="Sil" position="top">
              <ActionIcon
                variant="subtle"
                color="red"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteByUniqueId(component.uniqueId);
                }}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Box>

      {itemConfig && (
        <Collapse in={expanded}>
          <Box pl="xl" pt="xs">
            {hasItems && (
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                <Stack gap={4}>
                  {items.map((item, itemIndex) => (
                    <NestedItemRow
                      key={item.uniqueId}
                      item={item}
                      index={itemIndex}
                      parentUniqueId={component.uniqueId}
                      arrayKey={itemConfig.arrayKey}
                      label={itemConfig.label}
                      sortable={itemConfig.sortable}
                      getItemLabel={itemConfig.getItemLabel}
                    />
                  ))}
                </Stack>
              </SortableContext>
            )}
            <Button
              variant="light"
              size="xs"
              fullWidth
              leftSection={<IconPlus size={14} />}
              mt="xs"
              onClick={(e) => {
                e.stopPropagation();
                if (itemConfig.defaultValue) {
                  addItem(
                    component.uniqueId,
                    itemConfig.arrayKey,
                    itemConfig.defaultValue() as { uniqueId: string },
                  );
                  setExpanded(true);
                }
              }}
            >
              {itemConfig.label} Ekle
            </Button>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

interface NestedItemRowProps<T extends { uniqueId: string }> {
  item: T & Record<string, unknown>;
  index: number;
  parentUniqueId: string;
  arrayKey: string;
  label: string;
  sortable?: boolean;
  ItemIcon?: React.ComponentType<{ size: number }>;
  getItemLabel?: (item: T, index: number) => string;
}

const getItemLabel = (
  item: Record<string, unknown>,
  baseLabel: string,
  index: number,
) => {
  if (typeof item.title === 'string' && item.title.trim().length > 0) {
    return item.title;
  }
  if (
    typeof item.productName === 'string' &&
    item.productName.trim().length > 0
  ) {
    return item.productName;
  }
  if (
    item.isCustomBadgeActive === true &&
    typeof item.customBadgeText === 'string' &&
    item.customBadgeText.trim().length > 0
  ) {
    return `${baseLabel} ${index + 1} - ${item.customBadgeText}`;
  }
  return `${baseLabel} ${index + 1}`;
};

const NestedItemRow = <T extends { uniqueId: string }>({
  item,
  index,
  parentUniqueId,
  arrayKey,
  label,
  sortable = true,
  ItemIcon,
  getItemLabel: customGetItemLabel,
}: NestedItemRowProps<T>) => {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');
  const select = useDesignStore((s) => s.select);
  const deleteByUniqueId = useDesignStore((s) => s.deleteByUniqueId);
  const isSelected = useIsSelected(item.uniqueId);

  const dragData: ItemDragData = {
    type: 'item',
    uniqueId: item.uniqueId,
    parentUniqueId,
    arrayKey,
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
    disabled: !sortable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={{
        ...style,
        width: '100%',
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        borderRadius: theme.radius.sm,
        cursor: 'pointer',
        backgroundColor: isSelected
          ? colorScheme === 'dark'
            ? theme.colors.dark[5]
            : theme.colors.blue[0]
          : colorScheme === 'dark'
            ? theme.colors.dark[7]
            : theme.colors.gray[1],
        border: isSelected
          ? `1px solid ${theme.colors.blue[6]}`
          : `1px solid ${colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
      }}
      onClick={() =>
        select('item', item.uniqueId, [parentUniqueId, item.uniqueId])
      }
    >
      <Group gap="xs" justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap" style={{ overflow: 'hidden' }}>
          {sortable && (
            <ActionIcon
              variant="subtle"
              size="xs"
              style={{ cursor: isDragging ? 'grabbing' : 'grab', minWidth: 20 }}
              {...attributes}
              {...listeners}
            >
              <IconGripVertical size={12} />
            </ActionIcon>
          )}
          {ItemIcon && <ItemIcon size={12} />}
          <Text size="xs" truncate>
            {customGetItemLabel
              ? customGetItemLabel(item, index)
              : getItemLabel(item, label, index)}
          </Text>
        </Group>
        <Group gap={4} wrap="nowrap">
          <Tooltip label="Sil" position="top">
            <ActionIcon
              variant="subtle"
              color="red"
              component="div"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                deleteByUniqueId(item.uniqueId);
              }}
            >
              <IconTrash size={12} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Box>
  );
};

export default PageTree;
