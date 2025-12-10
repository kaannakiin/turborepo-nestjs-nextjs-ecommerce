"use client";

import { Box, Collapse, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure, useHover } from "@mantine/hooks";
import { IconChevronRight } from "@tabler/icons-react";
import { ReactNode, useEffect } from "react";

interface NonSortableNavbarComponentProps {
  title: string;
  children: ReactNode;
  isSelected: boolean;
  onClick: () => void;
  defaultOpened?: boolean;
}

const NonSortableNavbarComponent = ({
  title,
  children,
  isSelected,
  onClick,
  defaultOpened = false,
}: NonSortableNavbarComponentProps) => {
  const [opened, { toggle }] = useDisclosure(defaultOpened);
  const { ref: hoverRef } = useHover();

  const handleclick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
    toggle();
  };

  return (
    <Box
      ref={hoverRef}
      style={{
        borderColor: isSelected
          ? "var(--mantine-primary-color-5)"
          : "var(--mantine-color-gray-2)",
        borderWidth: isSelected ? "2px" : "1px",
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
        style={{ cursor: "pointer" }}
        onClick={handleclick}
      >
        <Group flex={1} align="center" gap="xs">
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
      </Group>

      <Collapse in={opened} transitionDuration={300}>
        <Stack gap={0} bg="gray.0" className="border-t border-gray-100 p-2">
          {children}
        </Stack>
      </Collapse>
    </Box>
  );
};

export default NonSortableNavbarComponent;
