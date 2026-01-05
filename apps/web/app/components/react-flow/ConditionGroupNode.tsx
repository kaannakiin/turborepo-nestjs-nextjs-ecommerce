import {
  customerSegmentFieldOptions,
  getOperatorsForCustomerSegmentField,
} from "@lib/helpers";
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { LogicalOperator } from "@repo/database/client";
import { createEmptyCondition, type SegmentCondition } from "@repo/types";
import { IconFilter, IconPlus, IconTrash } from "@tabler/icons-react";
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

export type ConditionGroupNodeData = {
  operator: LogicalOperator;
  conditions: SegmentCondition[];
  onUpdate?: (data: {
    operator: LogicalOperator;
    conditions: SegmentCondition[];
  }) => void;
  onDelete?: () => void;
};

export type ConditionGroupNodeType = Node<
  ConditionGroupNodeData,
  "conditionGroup"
>;

interface ConditionRowProps {
  condition: SegmentCondition;
  index: number;
  onChange: (index: number, condition: SegmentCondition) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const ConditionRow = memo(
  ({ condition, index, onChange, onRemove, canRemove }: ConditionRowProps) => {
    const operators = getOperatorsForCustomerSegmentField(condition.field);

    const conditionValue =
      "value" in condition ? (condition.value as FlowInputValue) : null;

    const { handleFieldChange, handleOperatorChange } =
      useSegmentConditionHandlers(condition, (newCondition) =>
        onChange(index, newCondition)
      );

    const handleValueChange = useCallback(
      (val: FlowInputValue) => {
        onChange(index, {
          ...condition,
          value: val,
        } as SegmentCondition);
      },
      [condition, index, onChange]
    );

    const shouldShowValueInput = !NO_VALUE_OPERATORS.has(condition.operator);

    return (
      <Stack gap="xs">
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <Select
            size="xs"
            placeholder="Alan"
            data={customerSegmentFieldOptions}
            value={condition.field}
            onChange={handleFieldChange}
            searchable
            allowDeselect={false}
            style={{ flex: 1, minWidth: 120 }}
          />

          <Select
            size="xs"
            placeholder="Koşul"
            data={operators}
            value={condition.operator}
            onChange={handleOperatorChange}
            allowDeselect={false}
            style={{ minWidth: 100 }}
          />

          <ActionIcon
            variant="subtle"
            color="red"
            size="md"
            onClick={() => onRemove(index)}
            disabled={!canRemove}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>

        {shouldShowValueInput && (
          <FlowInputWrapper
            field={condition.field}
            operator={condition.operator}
            value={conditionValue}
            onChange={handleValueChange}
          />
        )}
      </Stack>
    );
  }
);

ConditionRow.displayName = "ConditionRow";

const ConditionGroupNode = memo(
  ({ data, selected }: NodeProps<ConditionGroupNodeType>) => {
    const { operator, conditions, onUpdate, onDelete } = data;

    const handleOperatorChange = (value: LogicalOperator) => {
      onUpdate?.({ operator: value, conditions });
    };

    const handleConditionChange = (
      index: number,
      condition: SegmentCondition
    ) => {
      const newConditions = [...conditions];
      newConditions[index] = condition;
      onUpdate?.({ operator, conditions: newConditions });
    };

    const handleConditionRemove = (index: number) => {
      const newConditions = conditions.filter((_, i) => i !== index);
      onUpdate?.({ operator, conditions: newConditions });
    };

    const handleAddCondition = () => {
      const newCondition = createEmptyCondition("ORDER_COUNT");
      onUpdate?.({ operator, conditions: [...conditions, newCondition] });
    };

    return (
      <Paper
        shadow="sm"
        radius="md"
        withBorder
        style={{
          borderColor: selected
            ? "var(--mantine-color-violet-5)"
            : "var(--mantine-color-gray-4)",
          borderWidth: selected ? 2 : 1,
          transform: "translateZ(0)",
          willChange: "transform",
          minWidth: 320,
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
            background: "var(--mantine-color-violet-0)",
            borderBottom: "1px solid var(--mantine-color-gray-3)",
          }}
        >
          <Group gap={8}>
            <IconFilter size={16} color="var(--mantine-color-violet-6)" />
            <Text size="xs" fw={600} c="violet.7">
              KOŞUL GRUBU
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
          <Group gap={4}>
            <Button
              size="xs"
              variant={operator === LogicalOperator.AND ? "filled" : "light"}
              color="violet"
              onClick={() => handleOperatorChange(LogicalOperator.AND)}
              style={{ flex: 1 }}
            >
              VE (Tümü)
            </Button>
            <Button
              size="xs"
              variant={operator === LogicalOperator.OR ? "filled" : "light"}
              color="violet"
              onClick={() => handleOperatorChange(LogicalOperator.OR)}
              style={{ flex: 1 }}
            >
              VEYA (Biri)
            </Button>
          </Group>
          <Text size="xs" c="dimmed">
            {operator === LogicalOperator.AND
              ? "Tüm koşullar sağlanmalı"
              : "Koşullardan en az biri sağlanmalı"}
          </Text>
          <Divider />
          <Stack gap="md">
            {conditions.map((condition, index) => (
              <div key={index}>
                <ConditionRow
                  condition={condition}
                  index={index}
                  onChange={handleConditionChange}
                  onRemove={handleConditionRemove}
                  canRemove={conditions.length > 1}
                />
                {index < conditions.length - 1 && (
                  <Divider
                    my="xs"
                    label={
                      <Badge size="xs" variant="light" color="violet">
                        {operator === LogicalOperator.AND ? "VE" : "VEYA"}
                      </Badge>
                    }
                    labelPosition="center"
                  />
                )}
              </div>
            ))}
          </Stack>
          <Button
            variant="light"
            color="violet"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={handleAddCondition}
            fullWidth
          >
            Koşul Ekle
          </Button>
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

ConditionGroupNode.displayName = "ConditionGroupNode";
export default ConditionGroupNode;
