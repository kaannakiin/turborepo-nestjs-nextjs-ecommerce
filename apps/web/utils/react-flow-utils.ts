import {
  ConditionOperator,
  createEmptyCondition,
  CustomerGroupSmartFields,
  DateFields,
  NumericFields,
  SegmentCondition,
  TimeUnit,
} from "@repo/types";
import { useCallback } from "react";

export const NO_VALUE_OPERATORS = new Set<ConditionOperator>([
  ConditionOperator.IS_NULL,
  ConditionOperator.IS_NOT_NULL,
  ConditionOperator.IS_TRUE,
  ConditionOperator.IS_FALSE,
  ConditionOperator.EXISTS,
  ConditionOperator.NOT_EXISTS,
  ConditionOperator.IS_EMPTY,
  ConditionOperator.IS_NOT_EMPTY,
]);

const DURATION_OPERATORS = new Set<ConditionOperator>([
  ConditionOperator.WITHIN_LAST,
  ConditionOperator.WITHIN_NEXT,
  ConditionOperator.NOT_WITHIN_LAST,
]);

const createConditionWithoutValue = (
  condition: SegmentCondition,
  newOperator: ConditionOperator
): SegmentCondition => {
  const { field } = condition;
  return { field, operator: newOperator } as SegmentCondition;
};

const getDefaultValueForOperator = (
  field: CustomerGroupSmartFields,
  operator: ConditionOperator,
  currentValue?: unknown
): unknown => {
  if (operator === ConditionOperator.BETWEEN) {
    if (DateFields.includes(field as (typeof DateFields)[number])) {
      return [null, null];
    }

    const base = typeof currentValue === "number" ? currentValue : 0;
    return { min: base, max: base + 100 };
  }

  if (DURATION_OPERATORS.has(operator)) {
    return { amount: 30, unit: TimeUnit.DAYS };
  }

  if (NumericFields.includes(field as (typeof NumericFields)[number])) {
    if (typeof currentValue === "number") return currentValue;
    if (
      currentValue &&
      typeof currentValue === "object" &&
      "min" in currentValue
    ) {
      return (currentValue as { min: number }).min;
    }
    return 0;
  }

  if (DateFields.includes(field as (typeof DateFields)[number])) {
    if (currentValue instanceof Date || typeof currentValue === "string") {
      return currentValue;
    }
    return null;
  }

  return currentValue;
};

export const useSegmentConditionHandlers = (
  condition: SegmentCondition,
  onUpdate?: (condition: SegmentCondition) => void
) => {
  const handleFieldChange = useCallback(
    (value: string | null) => {
      if (!value || !onUpdate) return;
      const newCondition = createEmptyCondition(
        value as CustomerGroupSmartFields
      );
      onUpdate(newCondition);
    },
    [onUpdate]
  );

  const handleOperatorChange = useCallback(
    (value: string | null) => {
      if (!value || !onUpdate) return;
      const newOperator = value as ConditionOperator;

      if (NO_VALUE_OPERATORS.has(newOperator)) {
        const newCondition = createConditionWithoutValue(
          condition,
          newOperator
        );
        onUpdate(newCondition);
        return;
      }

      const currentValue = "value" in condition ? condition.value : undefined;
      const newValue = getDefaultValueForOperator(
        condition.field,
        newOperator,
        currentValue
      );

      onUpdate({
        ...condition,
        operator: newOperator,
        value: newValue,
      } as SegmentCondition);
    },
    [condition, onUpdate]
  );

  const handleNumericValueChange = useCallback(
    (value: number | string) => {
      if (!onUpdate) return;
      const numValue =
        typeof value === "string" ? parseFloat(value) || 0 : value;
      onUpdate({ ...condition, value: numValue } as SegmentCondition);
    },
    [condition, onUpdate]
  );

  const handleRangeValueChange = useCallback(
    (field: "min" | "max", value: number | string) => {
      if (!onUpdate) return;

      const currentValue =
        "value" in condition &&
        typeof condition.value === "object" &&
        condition.value !== null &&
        "min" in condition.value
          ? (condition.value as { min: number; max: number })
          : { min: 0, max: 100 };

      const numValue =
        typeof value === "string" ? parseFloat(value) || 0 : value;

      onUpdate({
        ...condition,
        value: { ...currentValue, [field]: numValue },
      } as SegmentCondition);
    },
    [condition, onUpdate]
  );

  const handleDurationValueChange = useCallback(
    (field: "amount" | "unit", value: number | string | TimeUnit) => {
      if (!onUpdate) return;

      const currentValue =
        "value" in condition &&
        typeof condition.value === "object" &&
        condition.value !== null &&
        "amount" in condition.value
          ? (condition.value as { amount: number; unit: TimeUnit })
          : { amount: 30, unit: TimeUnit.DAYS };

      if (field === "amount") {
        const numValue =
          typeof value === "string" ? parseInt(value) || 1 : (value as number);
        onUpdate({
          ...condition,
          value: { ...currentValue, amount: numValue },
        } as SegmentCondition);
      } else {
        onUpdate({
          ...condition,
          value: { ...currentValue, unit: value as TimeUnit },
        } as SegmentCondition);
      }
    },
    [condition, onUpdate]
  );

  return {
    handleFieldChange,
    handleOperatorChange,
    handleNumericValueChange,
    handleRangeValueChange,
    handleDurationValueChange,
  };
};
