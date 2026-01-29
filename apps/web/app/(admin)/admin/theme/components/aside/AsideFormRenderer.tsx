'use client';

import { Group, Stack, Text } from '@mantine/core';
import { DesignComponentType } from '@repo/types';
import { componentRegistry } from '../../registry';
import { useDesignStore, useSelectedItem } from '../../store/design-store';
import AsideEmptyState from './AsideEmptyState';

const AsideFormRenderer = () => {
  const selection = useDesignStore((s) => s.selection);
  const data = useSelectedItem() as Record<string, unknown> | null;

  if (!selection || !data) {
    return <AsideEmptyState />;
  }

  if (selection.type === 'component') {
    const componentType = data.type as DesignComponentType;
    const entry = componentRegistry[componentType];

    if (!entry) {
      return (
        <Stack p="md">
          <Text size="sm" c="dimmed">
            Bu bilesen tipi icin form bulunamadi: {componentType}
          </Text>
        </Stack>
      );
    }

    const FormComponent = entry.FormComponent;

    return (
      <Stack gap="md" p="md">
        <Group justify="space-between">
          <Text size="sm" fw={600}>
            {entry.label}
          </Text>
        </Group>
        <FormComponent uniqueId={selection.uniqueId} />
      </Stack>
    );
  }

  if (selection.type === 'item') {
    const parentId = selection.path[selection.path.length - 2];
    const parent = useDesignStore
      .getState()
      .findByUniqueId<Record<string, unknown>>(parentId);

    if (!parent) {
      return <AsideEmptyState />;
    }

    const parentType = parent.type as DesignComponentType;
    const parentEntry = componentRegistry[parentType];

    if (parentEntry?.itemConfig) {
      const ItemFormComponent = parentEntry.itemConfig.FormComponent;
      return (
        <Stack gap="md" p="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              {parentEntry.itemConfig.label}
            </Text>
          </Group>
          <ItemFormComponent
            uniqueId={selection.uniqueId}
            parentUniqueId={parentId}
          />
        </Stack>
      );
    }
  }

  if (selection.type === 'page') {
    return (
      <Stack gap="md" p="md">
        <Text size="sm" c="dimmed">
          Sayfa ayarlari yakininda eklenecek
        </Text>
      </Stack>
    );
  }

  return <AsideEmptyState />;
};

export default AsideFormRenderer;
