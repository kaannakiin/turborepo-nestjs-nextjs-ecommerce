"use client";
import {
  ActionIcon,
  Box,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface AsideFormLayoutProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const AsideFormLayout = ({
  title,
  subtitle,
  onClose,
  children,
}: AsideFormLayoutProps) => {
  return (
    <Box>
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Group gap="xs">
          <Box>
            <Text fw={600} size="sm">
              {title}
            </Text>
            {subtitle && (
              <Text size="xs" c="dimmed">
                {subtitle}
              </Text>
            )}
          </Box>
        </Group>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={onClose}
          aria-label="Kapat"
        >
          <IconX size={18} />
        </ActionIcon>
      </Group>

      <Divider mb="md" />

      <Stack gap="md">{children}</Stack>
    </Box>
  );
};
