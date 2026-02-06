"use client";

import { Card, Text } from "@mantine/core";
import { SlideItemPreviewProps } from "@repo/types";

export default function SlideItemPreview({
  data,
  index,
  isSelected,
  onSelect,
}: SlideItemPreviewProps) {
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
        Slayt {index + 1}: {data.title || "Başlıksız"}
      </Text>
    </Card>
  );
}
