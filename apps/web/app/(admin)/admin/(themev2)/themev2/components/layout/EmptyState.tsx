import { Stack, Text, ThemeIcon } from "@mantine/core";
import { useEffect } from "react";

interface EmptyStateProps {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  description: string;
  color?: string;
  clearAction?: () => void;
}

export const EmptyState = ({ icon: Icon, title, description, clearAction, color = "blue" }: EmptyStateProps) => {
  useEffect(() => {
    if (clearAction) {
      clearAction();
    }
  }, [clearAction]);

  return (
    <Stack align="center" justify="center" gap="lg" py="xl" px="md" h="100%">
      <ThemeIcon size={64} variant="light" color={color} radius="xl">
        <Icon size={32} />
      </ThemeIcon>

      <Stack align="center" gap="xs">
        <Text fw={600} size="lg" ta="center">
          {title}
        </Text>
        <Text size="sm" c="dimmed" ta="center" maw={280}>
          {description}
        </Text>
      </Stack>
    </Stack>
  );
};
