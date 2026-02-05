'use client';

import { Card, Text } from '@mantine/core';
import { DesignOnboardGridItemBaseSchemaInputType } from '@repo/types';
import { ItemPreviewProps } from '../../registry/registry-types';

const OnboardGridItemPreview = ({
  data,
  index,
  isSelected,
  onSelect,
}: ItemPreviewProps<DesignOnboardGridItemBaseSchemaInputType>) => {
  return (
    <Card
      withBorder
      p="xs"
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
      }}
    >
      <Text size="xs">{data.title || `Öğe ${index + 1}`}</Text>
    </Card>
  );
};

export default OnboardGridItemPreview;
