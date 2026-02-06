"use client";

import { Card, Text } from "@mantine/core";
import { OnboardGridItemPreviewProps } from "@repo/types";

export default function OnboardGridItemPreview({
  data,
  index,
  isSelected,
  onSelect,
}: OnboardGridItemPreviewProps) {
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
      <Text size="xs">{data.title || `Öğe ${index + 1}`}</Text>
    </Card>
  );
}
