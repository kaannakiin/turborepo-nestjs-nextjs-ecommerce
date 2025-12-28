"use client";

import { Badge, Group } from "@mantine/core";

interface BadgeItem {
  id: string;
  slug: string;
  name: string;
}

interface BadgeRendererProps {
  items: BadgeItem[];
  selectedSlugs: string[];
  onToggle: (slug: string, checked: boolean) => void;
}

const BadgeRenderer = ({
  items,
  selectedSlugs,
  onToggle,
}: BadgeRendererProps) => {
  return (
    <Group gap="xs">
      {items.map((item) => {
        const isSelected = selectedSlugs.includes(item.slug);

        return (
          <Badge
            key={item.id}
            variant={isSelected ? "filled" : "outline"}
            style={{ cursor: "pointer" }}
            onClick={() => onToggle(item.slug, !isSelected)}
          >
            {item.name}
          </Badge>
        );
      })}
    </Group>
  );
};

export default BadgeRenderer;
