"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ActionIcon,
  Box,
  Collapse,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure, useHover } from "@mantine/hooks";
import {
  IconChevronRight,
  IconGripVertical,
  IconTrash,
} from "@tabler/icons-react";
import { ReactNode, useEffect } from "react";
import { useThemeStore } from "../store/theme-store";

interface SortableNavbarComponentProps {
  componentId: string;
  rhfId: string;
  title: string;
  children: ReactNode;
  onDelete?: () => void;
  defaultOpened?: boolean;
}

const SortableNavbarComponent = ({
  children,
  componentId,
  rhfId,
  title,
  onDelete,
  defaultOpened,
}: SortableNavbarComponentProps) => {
  const [opened, { toggle, close }] = useDisclosure(defaultOpened);
  const { hovered, ref: hoverRef } = useHover();
  const { selection, selectComponent } = useThemeStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rhfId });

  useEffect(() => {
    if (isDragging && opened) {
      close();
    }
  }, [isDragging, opened, close]);

  const style = {
    transform: CSS.Translate.toString(transform),

    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 999 : 1,
    position: "relative" as const,
  };

  const isComponentSelected =
    selection?.type === "COMPONENT" && selection.componentId === componentId;

  return (
    <Box
      ref={setNodeRef}
      style={{
        ...style,
        borderColor: isComponentSelected
          ? "var(--mantine-primary-color-5)"
          : "var(--mantine-color-gray-2)",
        borderWidth: isComponentSelected ? "2px" : "1px",
      }}
      className={`bg-white border rounded-sm ${isDragging ? "shadow-lg" : ""}`}
    >
      <Group
        ref={hoverRef}
        align="center"
        px="sm"
        py="xs"
        wrap="nowrap"
        bg="white"
        className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={(event) => {
          event.preventDefault();
          selectComponent(componentId);
          toggle();
        }}
      >
        <Box
          style={{
            opacity: hovered || isDragging ? 1 : 0,
            width: hovered || isDragging ? "28px" : "0px",
            overflow: "hidden",
            transition: "all 0.2s ease",
          }}
        >
          <ActionIcon
            variant="transparent"
            color="gray"
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <IconGripVertical size={18} />
          </ActionIcon>
        </Box>

        <Text fw={600} size="sm" flex={1} className="select-none">
          {title}
        </Text>

        <Group gap="xs">
          {onDelete && (
            <ActionIcon
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              variant="subtle"
              size="sm"
              color="red"
              title="Sil"
              style={{
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}

          <ThemeIcon
            variant="transparent"
            color="gray"
            size="sm"
            className="transition-transform duration-300"
            style={{
              transform: opened ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            <IconChevronRight size={16} />
          </ThemeIcon>
        </Group>
      </Group>

      <Collapse in={opened} transitionDuration={300}>
        <Stack gap={0} bg="gray.0" p="0" onClick={(e) => e.stopPropagation()}>
          {children}
        </Stack>
      </Collapse>
    </Box>
  );
};

export default SortableNavbarComponent;
