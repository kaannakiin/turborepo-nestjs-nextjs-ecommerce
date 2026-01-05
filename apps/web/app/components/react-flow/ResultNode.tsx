import {
  ActionIcon,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconCheck, IconFlag, IconTrash, IconX } from "@tabler/icons-react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { memo } from "react";

export type ResultNodeData = {
  label: string;
  color?: string;
  description?: string;
  onDelete?: () => void;
};

export type ResultNodeType = Node<ResultNodeData, "result">;

const ResultNode = memo(({ data, selected }: NodeProps<ResultNodeType>) => {
  const { label, description, color = "cyan", onDelete } = data;
  const isNegative = color === "red";
  const Icon = isNegative ? IconX : IconCheck;

  return (
    <Paper
      shadow="sm"
      radius="md"
      withBorder
      style={{
        borderColor: selected
          ? `var(--mantine-color-${color}-5)`
          : "var(--mantine-color-gray-4)",
        borderWidth: selected ? 2 : 1,
        minWidth: 200,
        overflow: "hidden",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 24,
          height: 24,
          background: "var(--mantine-color-gray-5)",
          border: "2px solid var(--mantine-color-body)",
        }}
      />

      <Group
        justify="space-between"
        p="xs"
        style={{
          background: `var(--mantine-color-${color}-0)`,
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <Group gap={8}>
          <IconFlag size={16} color={`var(--mantine-color-${color}-6)`} />
          <Text size="xs" fw={700} c={`${color}.7`} tt="uppercase">
            SONUÇ
          </Text>
        </Group>
        <ActionIcon variant="subtle" color="red" size="sm" onClick={onDelete}>
          <IconTrash size={14} />
        </ActionIcon>
      </Group>

      <Stack gap={4} p="md" align="center">
        <ThemeIcon size="xl" radius="xl" color={color} variant="light">
          <Icon size={24} />
        </ThemeIcon>

        <Text size="sm" fw={600} ta="center">
          {label}
        </Text>

        {description && (
          <Text size="xs" c="dimmed" ta="center">
            {description}
          </Text>
        )}
      </Stack>
    </Paper>
  );
});

ResultNode.displayName = "ResultNode";
export default ResultNode;
