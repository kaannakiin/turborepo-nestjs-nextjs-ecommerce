import {
  customerSegmentFieldOptions,
  getOperatorsForCustomerSegmentField,
} from "@lib/helpers";
import { ActionIcon, Group, Paper, Select, Stack, Text } from "@mantine/core";
import { type SegmentCondition } from "@repo/types";
import { IconQuestionMark, IconTrash } from "@tabler/icons-react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { memo, useCallback } from "react";
import {
  NO_VALUE_OPERATORS,
  useSegmentConditionHandlers,
} from "../../../utils/react-flow-utils";
import FlowInputWrapper, {
  type FlowInputValue,
} from "./flow-inputs/FlowInputWrapper";

export type ConditionNodeData = {
  condition: SegmentCondition;
  onUpdate?: (condition: SegmentCondition) => void;
  onDelete?: () => void;
};

export type ConditionNodeType = Node<ConditionNodeData, "condition">;

const ConditionNode = memo(
  ({ data, selected }: NodeProps<ConditionNodeType>) => {
    const { condition, onUpdate, onDelete } = data;

    const conditionValue =
      "value" in condition ? (condition.value as FlowInputValue) : null;

    const { handleFieldChange, handleOperatorChange } =
      useSegmentConditionHandlers(condition, onUpdate);

    const handleValueChange = useCallback(
      (val: FlowInputValue) => {
        if (!onUpdate) return;

        onUpdate({
          ...condition,
          value: val,
        } as SegmentCondition);
      },
      [condition, onUpdate]
    );

    const operators = getOperatorsForCustomerSegmentField(condition.field);

    const shouldShowValueInput = !NO_VALUE_OPERATORS.has(condition.operator);

    return (
      <Paper
        shadow="sm"
        radius="md"
        withBorder
        style={{
          borderColor: selected
            ? "var(--mantine-color-blue-5)"
            : "var(--mantine-color-gray-4)",
          borderWidth: selected ? 2 : 1,
          transform: "translateZ(0)",
          willChange: "transform",
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
            background: "var(--mantine-color-blue-0)",
            borderBottom: "1px solid var(--mantine-color-gray-3)",
          }}
        >
          <Group gap={8}>
            <IconQuestionMark size={16} color="var(--mantine-color-blue-6)" />
            <Text size="xs" fw={600} c="blue.7">
              KOŞUL
            </Text>
          </Group>
          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={onDelete}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </Group>

        <Stack gap="xs" p="sm">
          <Select
            size="xs"
            label="Alan"
            placeholder="Alan seçin"
            data={customerSegmentFieldOptions}
            value={condition.field}
            onChange={handleFieldChange}
            searchable
            allowDeselect={false}
          />

          <Select
            size="xs"
            label="Koşul"
            placeholder="Koşul seçin"
            data={operators}
            value={condition.operator}
            onChange={handleOperatorChange}
            allowDeselect={false}
          />

          {shouldShowValueInput && (
            <Stack gap={4}>
              <FlowInputWrapper
                field={condition.field}
                operator={condition.operator}
                value={conditionValue}
                onChange={handleValueChange}
              />
            </Stack>
          )}
        </Stack>

        <Group
          justify="space-around"
          p="xs"
          style={{
            borderTop: "1px solid var(--mantine-color-gray-3)",
            background: "var(--mantine-color-gray-0)",
          }}
        >
          <Stack gap={4} align="center">
            <Handle
              type="source"
              position={Position.Bottom}
              id="yes"
              style={{
                position: "relative",
                transform: "none",
                width: 24,
                height: 24,
                background: "var(--mantine-color-green-5)",
                border: "2px solid var(--mantine-color-body)",
              }}
            />
          </Stack>

          <Stack gap={4} align="center">
            <Handle
              type="source"
              position={Position.Bottom}
              id="no"
              style={{
                position: "relative",
                transform: "none",
                width: 24,
                height: 24,
                background: "var(--mantine-color-red-5)",
                border: "2px solid var(--mantine-color-body)",
              }}
            />
          </Stack>
        </Group>
      </Paper>
    );
  }
);

ConditionNode.displayName = "ConditionNode";
export default ConditionNode;
