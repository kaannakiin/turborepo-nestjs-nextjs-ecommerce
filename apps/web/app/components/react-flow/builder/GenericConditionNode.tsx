//apps/web/app/components/react-flow/builder/ConditionBuilder.tsx
import { Group, Paper, Select, Stack, Text } from "@mantine/core";
import {
  ConditionDomainConfig,
  ConditionOperator,
  createFieldOptions,
  getOperatorsForField,
  handleOperatorChangeValue,
  NO_VALUE_OPERATORS,
} from "@repo/types";
import { IconQuestionMark } from "@tabler/icons-react";
import { Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { memo, useCallback, useMemo } from "react";
import GenericInputRenderer from "./GenericInputRenderer";

export type GenericConditionNodeData<
  TField extends string,
  TCondition extends {
    field: TField;
    operator: ConditionOperator;
    value?: unknown;
  },
> = {
  condition: TCondition;
  onUpdate?: (condition: TCondition) => void;
  onDelete?: () => void;
};

interface GenericConditionNodeProps<
  TField extends string,
  TCondition extends {
    field: TField;
    operator: ConditionOperator;
    value?: unknown;
  },
> {
  data: GenericConditionNodeData<TField, TCondition>;
  selected?: boolean;
  domainConfig: ConditionDomainConfig<TField, TCondition>;

  headerColor?: string;
  headerBgColor?: string;
  headerTitle?: string;
}

function GenericConditionNodeInner<
  TField extends string,
  TCondition extends {
    field: TField;
    operator: ConditionOperator;
    value?: unknown;
  },
>({
  data,
  selected,
  domainConfig,
  headerColor = "blue",
  headerBgColor = "var(--mantine-color-blue-0)",
  headerTitle = "KOŞUL",
}: GenericConditionNodeProps<TField, TCondition>) {
  const { condition, onUpdate, onDelete } = data;

  const fieldOptions = useMemo(
    () => createFieldOptions(domainConfig.fields),
    [domainConfig.fields]
  );

  const operatorOptions = useMemo(
    () => getOperatorsForField(condition.field, domainConfig.fields),
    [condition.field, domainConfig.fields]
  );

  const fieldConfig = domainConfig.fields[condition.field];

  const handleFieldChange = useCallback(
    (value: string | null) => {
      if (!value || !onUpdate) return;
      const newCondition = domainConfig.createEmptyCondition(value as TField);
      onUpdate(newCondition);
    },
    [domainConfig, onUpdate]
  );

  const handleOperatorChange = useCallback(
    (value: string | null) => {
      if (!value || !onUpdate) return;
      const newOperator = value as ConditionOperator;

      if (NO_VALUE_OPERATORS.has(newOperator)) {
        onUpdate({
          field: condition.field,
          operator: newOperator,
        } as TCondition);
        return;
      }

      const newValue = handleOperatorChangeValue(
        condition.field,
        newOperator,
        condition.value,
        domainConfig.fields
      );

      onUpdate({
        ...condition,
        operator: newOperator,
        value: newValue,
      } as TCondition);
    },
    [condition, domainConfig.fields, onUpdate]
  );

  const handleValueChange = useCallback(
    (value: unknown) => {
      if (!onUpdate) return;
      onUpdate({
        ...condition,
        value,
      } as TCondition);
    },
    [condition, onUpdate]
  );

  const shouldShowValueInput = !NO_VALUE_OPERATORS.has(condition.operator);

  return (
    <Paper
      shadow="sm"
      radius="md"
      withBorder
      style={{
        borderColor: selected
          ? `var(--mantine-color-${headerColor}-5)`
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
          background: headerBgColor,
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <Group gap={8}>
          <Text size="xs" fw={600} c={`${headerColor}.7`}>
            {headerTitle}
          </Text>
        </Group>
      </Group>

      <Stack gap="xs" p="sm">
        <Select
          size="xs"
          label="Alan"
          placeholder="Alan seçin"
          data={fieldOptions}
          value={condition.field}
          onChange={handleFieldChange}
          searchable
          allowDeselect={false}
        />

        <Select
          size="xs"
          label="Koşul"
          placeholder="Koşul seçin"
          data={operatorOptions}
          value={condition.operator}
          onChange={handleOperatorChange}
          allowDeselect={false}
        />

        {shouldShowValueInput && fieldConfig && (
          <GenericInputRenderer
            fieldConfig={fieldConfig}
            operator={condition.operator}
            value={condition.value}
            onChange={handleValueChange}
          />
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
        <Stack>
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
              cursor: "crosshair",
            }}
          />
        </Stack>

        <Stack>
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
              cursor: "crosshair",
            }}
          />
        </Stack>
      </Group>
    </Paper>
  );
}

export const GenericConditionNode = memo(
  GenericConditionNodeInner
) as typeof GenericConditionNodeInner;
