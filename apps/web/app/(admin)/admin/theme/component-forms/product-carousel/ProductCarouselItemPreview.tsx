'use client';

import { Card, Text } from '@mantine/core';
import { DesignProductCarouselProductSchemaInputType } from '@repo/types';
import { ItemPreviewProps } from '../../registry/registry-types';

const ProductCarouselItemPreview = ({
  data,
  index,
  isSelected,
  onSelect,
}: ItemPreviewProps<DesignProductCarouselProductSchemaInputType>) => {
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
        Urun {index + 1}: {data.productVariantCombinationId || 'Secilmedi'}
      </Text>
    </Card>
  );
};

export default ProductCarouselItemPreview;
