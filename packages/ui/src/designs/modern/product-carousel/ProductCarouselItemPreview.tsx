"use client";

import { Card, Text } from "@mantine/core";
import { ProductCarouselItemPreviewProps } from "@repo/types";

export default function ProductCarouselItemPreview({
  data,
  index,
  isSelected,
  onSelect,
}: ProductCarouselItemPreviewProps) {
  return (
    <Card
      withBorder
      p="xs"
      onClick={onSelect}
      style={{
        cursor: "pointer",
        borderColor: isSelected ? "var(--mantine-color-blue-6)" : undefined,
      }}
    >
      <Text size="xs">
        Ürün {index + 1}: {data.productVariantCombinationId || "Seçilmedi"}
      </Text>
    </Card>
  );
}
