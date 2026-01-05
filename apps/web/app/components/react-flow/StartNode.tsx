import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Paper, Text, ThemeIcon, Stack, MantineColor } from "@mantine/core";

export type NodeHandleConfig = {
  id: string;
  type: "source" | "target";
  position: Position;
  style?: React.CSSProperties;
};

export type StartNodeData = {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  color?: MantineColor;
  badgeText?: string;
  handles?: NodeHandleConfig[];
};

export type StartNodeType = Node<StartNodeData, "start">;

const StartNode = memo(({ data }: NodeProps<StartNodeType>) => {
  const color = data.color || "primary";
  const badgeText = data.badgeText || null;

  const handles = data.handles || [
    { id: "output", type: "source", position: Position.Bottom },
  ];

  return (
    <Paper
      shadow="md"
      p="md"
      radius="lg"
      withBorder
      style={{
        borderColor: `var(--mantine-color-primary-5)`,
        borderWidth: 2,
        minWidth: 220,
        background: `linear-gradient(135deg, var(--mantine-color-primary-0) 0%, var(--mantine-color-body) 100%)`,
      }}
    >
      <Stack gap="xs" align="center">
        {data.icon && (
          <ThemeIcon size={48} radius="xl" color={color} variant="light">
            {data.icon}
          </ThemeIcon>
        )}

        <div style={{ textAlign: "center" }}>
          {badgeText && (
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {badgeText}
            </Text>
          )}
          <Text size="sm" fw={600} c={`primary.7`}>
            {data.label}
          </Text>
          {data.description && (
            <Text size="xs" c="dimmed" mt={4}>
              {data.description}
            </Text>
          )}
        </div>
      </Stack>

      {handles.map((handle) => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          style={{
            width: 24,
            height: 24,
            background: `var(--mantine-color-primary-5)`,
            border: "2px solid var(--mantine-color-body)",
            ...handle.style,
          }}
        />
      ))}
    </Paper>
  );
});

StartNode.displayName = "StartNode";
export default StartNode;
