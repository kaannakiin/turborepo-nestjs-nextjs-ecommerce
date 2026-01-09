// apps/admin/hooks/use-condition-domain.ts
import {
  ConditionDomainConfig,
  ConditionOperator,
  createFieldOptions,
  getOperatorsForField,
  handleOperatorChangeValue,
  NO_VALUE_OPERATORS,
  resolveInputType,
  type FieldConfig,
  type InputComponentType,
} from "@repo/types";
import { useCallback, useMemo } from "react";

export function useConditionDomain<
  TField extends string,
  TCondition extends {
    field: TField;
    operator: ConditionOperator;
    value?: unknown;
  },
>(domainConfig: ConditionDomainConfig<TField, TCondition>) {
  const fieldOptions = useMemo(
    () => createFieldOptions(domainConfig.fields),
    [domainConfig.fields]
  );

  const getOperatorOptions = useCallback(
    (field: TField) => getOperatorsForField(field, domainConfig.fields),
    [domainConfig.fields]
  );

  const getFieldConfig = useCallback(
    (field: TField): FieldConfig | undefined => domainConfig.fields[field],
    [domainConfig.fields]
  );

  const getInputType = useCallback(
    (field: TField, operator: ConditionOperator): InputComponentType => {
      const config = domainConfig.fields[field];
      if (!config) return "none";
      return resolveInputType(config.type, operator);
    },
    [domainConfig.fields]
  );

  const shouldShowValueInput = useCallback(
    (operator: ConditionOperator) => !NO_VALUE_OPERATORS.has(operator),
    []
  );

  const createEmptyCondition = useCallback(
    (field: TField) => domainConfig.createEmptyCondition(field),
    [domainConfig]
  );

  const handleFieldChange = useCallback(
    (newField: TField, onUpdate: (condition: TCondition) => void) => {
      const newCondition = domainConfig.createEmptyCondition(newField);
      onUpdate(newCondition);
    },
    [domainConfig]
  );

  const handleOperatorChange = useCallback(
    (
      condition: TCondition,
      newOperator: ConditionOperator,
      onUpdate: (condition: TCondition) => void
    ) => {
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
    [domainConfig.fields]
  );

  const handleValueChange = useCallback(
    (
      condition: TCondition,
      newValue: unknown,
      onUpdate: (condition: TCondition) => void
    ) => {
      onUpdate({
        ...condition,
        value: newValue,
      } as TCondition);
    },
    []
  );

  return {
    domainConfig,
    fieldOptions,
    getOperatorOptions,
    getFieldConfig,
    getInputType,
    shouldShowValueInput,
    createEmptyCondition,
    handleFieldChange,
    handleOperatorChange,
    handleValueChange,
  };
}
