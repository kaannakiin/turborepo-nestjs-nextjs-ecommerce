"use client";

import { getGroupedActions } from "@lib/ui/bulk-action.helper";
import { Button, Group, Menu, Text } from "@mantine/core";
import { ProductBulkAction } from "@repo/types";
import { IconChevronDown } from "@tabler/icons-react";

interface ProductActionsGroupProps {
  selectedIds: string[];
  onAction?: (action: ProductBulkAction) => void;
}

const ProductActionsGroup = ({
  selectedIds,
  onAction,
}: ProductActionsGroupProps) => {
  if (selectedIds.length === 0) return null;

  const groupedActions = getGroupedActions();

  return (
    <Group gap="sm">
      <Text size="sm" c="dimmed">
        {selectedIds.length} ürün seçildi
      </Text>

      <Menu shadow="md" width={220} position="bottom">
        <Menu.Target>
          <Button
            variant="light"
            size="xs"
            rightSection={<IconChevronDown size={14} />}
          >
            Toplu İşlemler
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          {Object.entries(groupedActions).map(([group, actions], index) => (
            <div key={group}>
              {index > 0 && <Menu.Divider />}
              <Menu.Label>{group}</Menu.Label>
              {actions.map((action) => (
                <Menu.Item
                  key={action.key}
                  leftSection={action.icon}
                  color={action.color}
                  onClick={() => onAction?.(action.key)}
                >
                  {action.label}
                </Menu.Item>
              ))}
            </div>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default ProductActionsGroup;
