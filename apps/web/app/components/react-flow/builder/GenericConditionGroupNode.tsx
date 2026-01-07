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
import {
  ConditionDomainConfig,
  ConditionOperator,
  createFieldOptions,
  getOperatorsForField,
  handleOperatorChangeValue,
  NO_VALUE_OPERATORS,
} from "@repo/types";
import { IconFilter, IconPlus, IconTrash } from "@tabler/icons-react";
import { Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { memo, useCallback, useMemo } from "react";
import GenericInputRenderer from "./GenericInputRenderer";

export type GenericConditionGroupNodeData<
  TField extends string,
  TCondition extends {
    field: TField;
    operator: ConditionOperator;
    value?: unknown;
  },
> = {
  operator: LogicalOperator;
  conditions: TCondition[];
  onUpdate?: (data: {
    operator: LogicalOperator;
    conditions: TCondition[];
  }) => void;
  onDelete?: () => void;
};

interface GenericConditionGroupNodeProps<
  TField extends string,
  TCondition extends {
    field: TField;
    operator: ConditionOperator;
    value?: unknown;
  },
> {
  data: GenericConditionGroupNodeData<TField, TCondition>;
  selected?: boolean;
  domainConfig: ConditionDomainConfig<TField, TCondition>;

  headerColor?: string;
  headerBgColor?: string;
  headerTitle?: string;

  defaultField: TField;
}

interface ConditionRowProps<
  TField extends string,
  TCondition extends {
    field: TField;
    operator: ConditionOperator;
    value?: unknown;
  },
> {
  condition: TCondition;
  index: number;
  onChange: (index: number, condition: TCondition) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  domainConfig: ConditionDomainConfig<TField, TCondition>;
}

function ConditionRowInner<
  TField extends string,
  TCondition extends {
    field: TField;
    operator: ConditionOperator;
    value?: unknown;
  },
>({
  condition,
  index,
  onChange,
  onRemove,
  canRemove,
  domainConfig,
}: ConditionRowProps<TField, TCondition>) {
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
      if (!value) return;
      const newCondition = domainConfig.createEmptyCondition(value as TField);
      onChange(index, newCondition);
    },
    [index, onChange, domainConfig]
  );

  const handleOperatorChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const newOperator = value as ConditionOperator;

      if (NO_VALUE_OPERATORS.has(newOperator)) {
        onChange(index, {
          field: condition.field,
          operator: newOperator,
        } as TCondition);
        return;
      }

      const currentValue = "value" in condition ? condition.value : undefined;

      const newValue = handleOperatorChangeValue(
        condition.field,
        newOperator,
        currentValue,
        domainConfig.fields
      );

      onChange(index, {
        ...condition,
        operator: newOperator,
        value: newValue,
      } as TCondition);
    },
    [condition, index, onChange, domainConfig.fields]
  );

  const handleValueChange = useCallback(
    (val: unknown) => {
      onChange(index, {
        ...condition,
        value: val,
      } as TCondition);
    },
    [condition, index, onChange]
  );

  const shouldShowValueInput = !NO_VALUE_OPERATORS.has(condition.operator);
  const conditionValue = "value" in condition ? condition.value : undefined;

  return (
    <Stack gap="xs">
      <Group gap="xs" wrap="nowrap" align="flex-start">
        <Select
          size="xs"
          placeholder="Alan"
          data={fieldOptions}
          value={condition.field}
          onChange={handleFieldChange}
          searchable
          allowDeselect={false}
          style={{ flex: 1, minWidth: 120 }}
        />

        <Select
          size="xs"
          placeholder="Koşul"
          data={operatorOptions}
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

      {shouldShowValueInput && fieldConfig && (
        <GenericInputRenderer
          fieldConfig={fieldConfig}
          operator={condition.operator}
          value={conditionValue}
          onChange={handleValueChange}
        />
      )}
    </Stack>
  );
}

const ConditionRow = memo(ConditionRowInner) as typeof ConditionRowInner;

function GenericConditionGroupNodeInner<
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
  headerColor = "violet",
  headerBgColor = "var(--mantine-color-violet-0)",
  headerTitle = "KOŞUL GRUBU",
  defaultField,
}: GenericConditionGroupNodeProps<TField, TCondition>) {
  const { operator, conditions, onUpdate, onDelete } = data;

  const handleOperatorChange = useCallback(
    (value: LogicalOperator) => {
      onUpdate?.({ operator: value, conditions });
    },
    [conditions, onUpdate]
  );

  const handleConditionChange = useCallback(
    (index: number, condition: TCondition) => {
      const newConditions = [...conditions];
      newConditions[index] = condition;
      onUpdate?.({ operator, conditions: newConditions });
    },
    [conditions, operator, onUpdate]
  );

  const handleConditionRemove = useCallback(
    (index: number) => {
      const newConditions = conditions.filter((_, i) => i !== index);
      onUpdate?.({ operator, conditions: newConditions });
    },
    [conditions, operator, onUpdate]
  );

  const handleAddCondition = useCallback(() => {
    const newCondition = domainConfig.createEmptyCondition(defaultField);
    onUpdate?.({ operator, conditions: [...conditions, newCondition] });
  }, [conditions, defaultField, domainConfig, operator, onUpdate]);

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
        <Group gap={4}>
          <Button
            size="xs"
            variant={operator === LogicalOperator.AND ? "filled" : "light"}
            color={headerColor}
            onClick={() => handleOperatorChange(LogicalOperator.AND)}
            style={{ flex: 1 }}
          >
            VE (Tümü)
          </Button>
          <Button
            size="xs"
            variant={operator === LogicalOperator.OR ? "filled" : "light"}
            color={headerColor}
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
                domainConfig={domainConfig}
              />
              {index < conditions.length - 1 && (
                <Divider
                  my="xs"
                  label={
                    <Badge size="xs" variant="light" color={headerColor}>
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
          color={headerColor}
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

export const GenericConditionGroupNode = memo(
  GenericConditionGroupNodeInner
) as typeof GenericConditionGroupNodeInner;
