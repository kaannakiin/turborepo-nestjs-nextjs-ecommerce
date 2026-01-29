'use client';

import { Card, Text } from '@mantine/core';
import { DesignSliderSlideSchemaInputType } from '@repo/types';
import { ItemPreviewProps } from '../../registry/registry-types';

const SlideItemPreview = ({
  data,
  index,
  isSelected,
  onSelect,
}: ItemPreviewProps<DesignSliderSlideSchemaInputType>) => {
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
      <Text size="xs">
        Slayt {index + 1}: {data.title || 'Baslıksız'}
      </Text>
    </Card>
  );
};

export default SlideItemPreview;
