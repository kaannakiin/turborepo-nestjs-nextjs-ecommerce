'use client';

import { Box, Card, Group, Stack, Text } from '@mantine/core';
import { DesignOnboardGridSchemaInputType } from '@repo/types';
import { IconLayoutGrid } from '@tabler/icons-react';
import { DesignPreviewProps } from '../types';

const ModernOnboardGrid = ({
  data,
  isSelected,
  onSelect,
}: DesignPreviewProps<DesignOnboardGridSchemaInputType>) => {
  const itemCount = data.items.length;

  return (
    <Card
      withBorder
      p={0}
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
        borderWidth: isSelected ? 2 : 1,
        overflow: 'hidden',
      }}
    >
      {/* Preview Area */}
      <Box
        style={{
          height: 200,
          backgroundColor: 'var(--mantine-color-gray-1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack align="center" gap="xs">
          <IconLayoutGrid
            size={48}
            color={
              itemCount > 0
                ? 'var(--mantine-color-gray-5)'
                : 'var(--mantine-color-gray-4)'
            }
          />
          <Text size="sm" c="dimmed">
            {itemCount > 0 ? `${itemCount} öğe` : 'Öğe eklenmedi'}
          </Text>
        </Stack>
      </Box>

      {/* Info Bar */}
      <Box
        p="sm"
        style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
      >
        <Group justify="space-between">
          <Group gap="xs">
            <IconLayoutGrid size={16} />
            <Text size="sm" fw={500}>
              Onboard Grid
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            {itemCount} öğe
          </Text>
        </Group>
      </Box>
    </Card>
  );
};

export default ModernOnboardGrid;
