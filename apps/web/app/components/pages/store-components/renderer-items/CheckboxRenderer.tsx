"use client";

import { Checkbox, Stack, Group, Avatar } from "@mantine/core";
import { AssetType } from "@repo/database";

interface CheckboxItem {
  id: string;
  slug: string;
  name: string;
  image?: { url: string; type: AssetType } | null;
  color?: string | null;
}

interface CheckboxRendererProps {
  items: CheckboxItem[];
  selectedSlugs: string[];
  onToggle: (slug: string, checked: boolean) => void;
}

const CheckboxRenderer = ({
  items,
  selectedSlugs,
  onToggle,
}: CheckboxRendererProps) => {
  return (
    <Stack gap="xs">
      {items.map((item) => (
        <Checkbox
          key={item.id}
          label={
            <Group gap="xs">
              {item.image && (
                <Avatar src={item.image.url} size="xs" radius="sm" />
              )}
              {item.name}
            </Group>
          }
          checked={selectedSlugs.includes(item.slug)}
          onChange={(e) => onToggle(item.slug, e.currentTarget.checked)}
        />
      ))}
    </Stack>
  );
};

export default CheckboxRenderer;
