"use client";
import { ActionIcon, Group } from "@mantine/core";
import { IconTrashX } from "@tabler/icons-react";
import React from "react";

interface UnsortableListRowProps {
  isSelected?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}

export const UnsortableListRow = ({
  isSelected = false,
  onClick,
  onDelete,
  children,
}: UnsortableListRowProps) => {
  return (
    <Group
      wrap="nowrap"
      gap="xs"
      pr="sm"
      pl="xl"
      py="xs"
      onClick={onClick}
      className="hover:bg-gray-50 border-b border-gray-100 transition-colors cursor-pointer w-full group"
      align="center"
    >
      <div className="flex-1 overflow-hidden">{children}</div>

      {onDelete && (
        <ActionIcon
          size="xs"
          variant="transparent"
          color="red"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <IconTrashX size={16} />
        </ActionIcon>
      )}
    </Group>
  );
};

export default UnsortableListRow;
