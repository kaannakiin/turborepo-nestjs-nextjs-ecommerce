"use client";
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
  IconArrowDown,
  IconArrowUp,
  IconChevronRight,
  IconTrash,
} from "@tabler/icons-react";
import { ReactNode } from "react";
import { useThemeStore } from "../store/zustand-zod-theme.store";

interface SortableNavbarComponentProps {
  componentId: string;
  title: string;
  children: ReactNode;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  defaultOpened?: boolean;
}

const SortableNavbarComponent = ({
  componentId,
  title,
  children,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  defaultOpened = false,
}: SortableNavbarComponentProps) => {
  const [opened, { toggle }] = useDisclosure(defaultOpened);
  const { hovered, ref: hoverRef } = useHover();
  const { selection, selectComponent } = useThemeStore();

  const isComponentSelected =
    selection?.type === "COMPONENT" && selection.componentId === componentId;

  return (
    <Box
      ref={hoverRef}
      style={{
        borderColor: isComponentSelected
          ? "var(--mantine-primary-color-5)"
          : "var(--mantine-color-gray-2)",
        borderWidth: isComponentSelected ? "2px" : "1px",
      }}
      className="border transition-all duration-200"
    >
      <Group
        align="center"
        px="sm"
        py="xs"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          selectComponent(componentId);
          toggle();
        }}
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        bg="white"
        wrap="nowrap"
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

        <Text fw={600} size="sm" flex={1}>
          {title}
        </Text>

        <Group
          gap="xs"
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}
        >
          {onMoveUp && (
            <ActionIcon
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onMoveUp();
              }}
              variant={isFirst ? "subtle" : "filled"}
              size="sm"
              color="gray"
              disabled={isFirst}
              title="Yukarı Taşı"
            >
              <IconArrowUp size={16} />
            </ActionIcon>
          )}

          {onMoveDown && (
            <ActionIcon
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onMoveDown();
              }}
              variant={isLast ? "subtle" : "filled"}
              size="sm"
              color="gray"
              disabled={isLast}
              title="Aşağı Taşı"
            >
              <IconArrowDown size={16} />
            </ActionIcon>
          )}

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
        </Group>
      </Group>

      <Collapse in={opened} transitionDuration={300}>
        <Stack gap={0} bg="gray.0">
          {children}
        </Stack>
      </Collapse>
    </Box>
  );
};

export default SortableNavbarComponent;
