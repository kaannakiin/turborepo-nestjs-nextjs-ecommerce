'use client';

import {
  ActionIcon,
  Group,
  Select,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useDesignStore } from '../../store/design-store';

export default function PageTabs() {
  const theme = useMantineTheme();

  const design = useDesignStore((s) => s.design);
  const activePageId = useDesignStore((s) => s.activePageId);
  const setActivePageId = useDesignStore((s) => s.setActivePageId);

  if (!design?.pages || design.pages.length === 0) {
    return (
      <Group
        p="xs"
        style={{
          borderRadius: theme.radius.md,
        }}
      >
        <Text size="sm" c="dimmed">
          Henuz sayfa eklenmedi
        </Text>
        <ActionIcon variant="light" size="sm">
          <IconPlus size={14} />
        </ActionIcon>
      </Group>
    );
  }

  const selectData = design.pages.map((page) => ({
    value: page.uniqueId,
    label: page.pageName,
  }));

  return (
    <Select
      value={activePageId || design.pages[0]?.uniqueId}
      onChange={(value) => setActivePageId(value)}
      data={selectData}
      placeholder="Sayfa seçin"
      searchable
      allowDeselect={false}
    />
  );
}
