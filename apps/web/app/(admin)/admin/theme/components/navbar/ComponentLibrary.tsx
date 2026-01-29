'use client';

import {
  Accordion,
  ActionIcon,
  Box,
  Group,
  Indicator,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { DesignComponentCategory, DesignComponentType } from '@repo/types';
import { IconPlus } from '@tabler/icons-react';
import {
  ComponentRegistryEntry,
  categoryLabels,
  getComponentsByCategory,
} from '../../registry';
import { useDesignStore } from '../../store/design-store';

export default function ComponentLibrary() {
  const groupedComponents = getComponentsByCategory();
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');

  const filteredGroups = Object.entries(groupedComponents).reduce(
    (acc, [category, components]) => {
      const filtered = components.filter((c) =>
        Object.values(DesignComponentType).includes(c.type),
      );
      if (filtered.length > 0) {
        acc[category as DesignComponentCategory] = filtered;
      }
      return acc;
    },
    {} as Record<DesignComponentCategory, ComponentRegistryEntry[]>,
  );

  return (
    <Accordion
      variant="separated"
      multiple
      defaultValue={Object.keys(filteredGroups)}
      styles={{
        item: {
          backgroundColor:
            colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
          border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        },
      }}
    >
      {Object.entries(filteredGroups).map(([category, components]) => (
        <Accordion.Item key={category} value={category}>
          <Accordion.Control>
            <Text size="sm" fw={500}>
              {categoryLabels[category as DesignComponentCategory]}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {components.map((entry) => (
                <ComponentCard key={entry.type} entry={entry} />
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

interface ComponentCardProps {
  entry: ComponentRegistryEntry;
}

function ComponentCard({ entry }: ComponentCardProps) {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');
  const { hovered, ref } = useHover<HTMLDivElement>();

  const activePageId = useDesignStore((s) => s.activePageId);
  const addComponent = useDesignStore((s) => s.addComponent);

  const handleAddComponent = () => {
    if (!activePageId) return;
    const newComponent = entry.defaultValue();
    addComponent(activePageId, newComponent);
  };

  return (
    <Indicator
      disabled={!hovered}
      position="top-end"
      ref={ref}
      offset={4}
      size={0}
      label={
        <Tooltip label="Sayfaya ekle" position="top">
          <ActionIcon
            variant="filled"
            color="blue"
            size="xs"
            radius="xl"
            onClick={handleAddComponent}
          >
            <IconPlus size={12} />
          </ActionIcon>
        </Tooltip>
      }
    >
      <Box
        style={{
          padding: theme.spacing.sm,
          borderRadius: theme.radius.md,
          border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
          backgroundColor:
            colorScheme === 'dark'
              ? theme.colors.dark[5]
              : theme.colors.gray[0],
          transition: 'all 0.15s ease',
          cursor: 'default',
        }}
      >
        <Group gap="sm">
          <Stack gap={0}>
            <Text size="sm" fw={500}>
              {entry.label}
            </Text>
            {entry.description && (
              <Text size="xs" c="dimmed">
                {entry.description}
              </Text>
            )}
          </Stack>
        </Group>
      </Box>
    </Indicator>
  );
}
