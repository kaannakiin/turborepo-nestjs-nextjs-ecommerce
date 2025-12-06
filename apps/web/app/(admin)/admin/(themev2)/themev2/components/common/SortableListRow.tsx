"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon, Group } from "@mantine/core";
import { IconGripVertical, IconTrashX } from "@tabler/icons-react";
import React, { CSSProperties } from "react";

interface SortableListRowProps {
  id: string;
  isSelected?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}

export const SortableListRow = ({ id, isSelected = false, onClick, onDelete, children }: SortableListRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
  };

  return (
    <Group
      ref={setNodeRef}
      style={style}
      {...attributes}
      wrap="nowrap"
      gap="xs"
      px="sm"
      py="xs"
      onClick={onClick}
      bg={isSelected ? "var(--mantine-color-blue-0)" : "var(--mantine-color-white)"}
      className="hover:bg-gray-50 border-b border-gray-100 transition-colors cursor-pointer w-full group"
      align="center"
    >
      <ActionIcon
        variant="transparent"
        color="gray"
        size="xs"
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.preventDefault()}
      >
        <IconGripVertical size={16} />
      </ActionIcon>

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
