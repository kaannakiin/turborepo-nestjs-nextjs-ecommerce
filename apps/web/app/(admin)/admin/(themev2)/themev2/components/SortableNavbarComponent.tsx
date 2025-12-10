"use client";
import { DraggableSyntheticListeners } from "@dnd-kit/core";
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
import { useThemeStore } from "../store/zustand-zod-theme.store";

interface SortableNavbarComponentProps {
  componentId: string;
  title: string;
  children: ReactNode;
  onDelete?: () => void;
  dragHandleProps?: DraggableSyntheticListeners;
  defaultOpened?: boolean;
  isDragging?: boolean;
}

const SortableNavbarComponent = ({
  componentId,
  title,
  children,
  onDelete,
  dragHandleProps,
  defaultOpened = false,
  isDragging = false,
}: SortableNavbarComponentProps) => {
  const [opened, { toggle, close }] = useDisclosure(defaultOpened);
  const { hovered, ref: hoverRef } = useHover();
  const { selection, selectComponent } = useThemeStore();

  const isComponentSelected =
    selection?.type === "COMPONENT" && selection.componentId === componentId;

  useEffect(() => {
    if (isDragging && opened) {
      close();
    }
  }, [isDragging, opened, close]);
  return (
    <Box
      ref={hoverRef}
      style={{
        borderColor: isComponentSelected
          ? "var(--mantine-primary-color-5)"
          : "var(--mantine-color-gray-2)",
        borderWidth: isComponentSelected ? "2px" : "1px",
        position: "relative",
      }}
      className="border transition-all duration-200 bg-white rounded-md overflow-hidden"
    >
      <Group
        align="center"
        px="sm"
        py="xs"
        wrap="nowrap"
        gap={0}
        className="transition-colors hover:bg-gray-50"
      >
        <Box
          style={{
            maxWidth: hovered ? "28px" : "0px",
            opacity: hovered ? 1 : 0,
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ActionIcon
            variant="transparent"
            color="gray"
            size="sm"
            style={{ cursor: "grab", touchAction: "none", minWidth: "22px" }}
            {...dragHandleProps}
            mr={6}
          >
            <IconGripVertical size={18} />
          </ActionIcon>
        </Box>

        <Group
          flex={1}
          align="center"
          gap="xs"
          style={{ cursor: "pointer" }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            selectComponent(componentId);
            toggle();
          }}
        >
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

          <Text fw={600} size="sm" flex={1} style={{ userSelect: "none" }}>
            {title}
          </Text>
        </Group>

        <Box
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s",
            display: "flex",
            alignItems: "center",
          }}
        >
          {onDelete && (
            <ActionIcon
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete();
              }}
              variant="subtle"
              size="sm"
              color="red"
              title="Sil"
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Box>
      </Group>

      <Collapse in={opened} transitionDuration={300}>
        <Stack gap={0} bg="gray.0" className="border-t border-gray-100 p-2">
          {children}
        </Stack>
      </Collapse>
    </Box>
  );
};

export default SortableNavbarComponent;
