import { z } from "zod";
import { ConditionOperator, TimeUnit } from "../common";
import {
  FieldConfig,
  FieldType,
  OPERATORS_BY_FIELD_TYPE,
} from "./decision-tree-base";

export interface ConditionDomainConfig<
  TField extends string,
  TCondition,
  TMeta = unknown,
> {
  name: string;
  fields: Record<TField, FieldConfig<TMeta>>;
  conditionSchema: z.ZodType<TCondition>;
  createEmptyCondition: (field: TField) => TCondition;
}

export function createFieldOptions<TField extends string>(
  fields: Record<TField, FieldConfig>
): Array<{ value: TField; label: string; description: string }> {
  return Object.entries(fields).map(([field, config]) => ({
    value: field as TField,
    label: (config as FieldConfig).label,
    description: (config as FieldConfig).description,
  }));
}

export function getOperatorsForField<TField extends string>(
  field: TField,
  fields: Record<TField, FieldConfig>
): Array<{ value: ConditionOperator; label: string }> {
  const config = fields[field];
  if (!config) return [];

  const operators = config.operators ?? OPERATORS_BY_FIELD_TYPE[config.type];

  return operators.map((op) => ({
    value: op,
    label: getOperatorLabel(op),
  }));
}

export function getOperatorLabel(operator: ConditionOperator): string {
  const labels: Record<ConditionOperator, string> = {
    EQ: "Eşittir",
    NEQ: "Eşit Değildir",
    GT: "Büyüktür",
    GTE: "Büyük veya Eşittir",
    LT: "Küçüktür",
    LTE: "Küçük veya Eşittir",
    BETWEEN: "Arasında",
    IN: "İçinde",
    NOT_IN: "İçinde Değil",
    CONTAINS: "İçerir",
    NOT_CONTAINS: "İçermez",
    STARTS_WITH: "İle Başlar",
    ENDS_WITH: "İle Biter",
    IS_NULL: "Boş",
    IS_NOT_NULL: "Boş Değil",
    IS_TRUE: "Evet",
    IS_FALSE: "Hayır",
    IS_EMPTY: "Boş",
    IS_NOT_EMPTY: "Dolu",
    EXISTS: "Var",
    NOT_EXISTS: "Yok",
    HAS_ANY: "Herhangi Birini İçerir",
    HAS_ALL: "Tümünü İçerir",
    HAS_NONE: "Hiçbirini İçermez",
    WITHIN_LAST: "Son X İçinde",
    WITHIN_NEXT: "Sonraki X İçinde",
    NOT_WITHIN_LAST: "Son X İçinde Değil",
    NOT_WITHIN_NEXT: "Sonraki X İçinde Değil",
    AFTER: "Sonra",
    BEFORE: "Önce",
    ON_DATE: "Belirli Bir Tarihte",
  };

  return labels[operator] ?? operator;
}

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

export const DURATION_OPERATORS = new Set<ConditionOperator>([
  ConditionOperator.WITHIN_LAST,
  ConditionOperator.WITHIN_NEXT,
  ConditionOperator.NOT_WITHIN_LAST,
  ConditionOperator.NOT_WITHIN_NEXT,
]);

export const RANGE_OPERATORS = new Set<ConditionOperator>([
  ConditionOperator.BETWEEN,
]);

export const MULTI_VALUE_OPERATORS = new Set<ConditionOperator>([
  ConditionOperator.IN,
  ConditionOperator.NOT_IN,
  ConditionOperator.HAS_ANY,
  ConditionOperator.HAS_ALL,
  ConditionOperator.HAS_NONE,
]);

export function getDefaultValueForFieldType(
  type: FieldType,
  operator: ConditionOperator
): unknown {
  if (NO_VALUE_OPERATORS.has(operator)) {
    return undefined;
  }

  if (DURATION_OPERATORS.has(operator)) {
    return { amount: 30, unit: TimeUnit.DAYS };
  }

  if (RANGE_OPERATORS.has(operator)) {
    switch (type) {
      case "date":
        return { from: null, to: null };
      case "numeric":
        return { min: 0, max: 100 };
      case "time":
        return { from: "09:00", to: "18:00" };
      default:
        return { min: 0, max: 100 };
    }
  }

  if (MULTI_VALUE_OPERATORS.has(operator)) {
    return [];
  }

  switch (type) {
    case "numeric":
      return 0;
    case "date":
      return null;
    case "boolean":
      return undefined;
    case "enum":
      return null;
    case "relation":
      return [];
    case "location":
      return {
        countryId: null,
        cityId: null,
        stateId: null,
        districtId: null,
      };
    case "string":
      return "";
    case "time":
      return "12:00";
    case "currency":
      return null;
    case "duration":
      return { amount: 1, unit: TimeUnit.DAYS };
    default:
      return null;
  }
}

export function createGenericEmptyCondition<
  TField extends string,
  TCondition extends {
    field: TField;
    operator: ConditionOperator;
    value?: unknown;
  },
>(field: TField, fields: Record<TField, FieldConfig>): TCondition {
  const config = fields[field];
  if (!config) {
    throw new Error(`Unknown field: ${field}`);
  }

  const defaultOperator = config.operators[0];
  const defaultValue = getDefaultValueForFieldType(
    config.type,
    defaultOperator
  );

  if (NO_VALUE_OPERATORS.has(defaultOperator)) {
    return {
      field,
      operator: defaultOperator,
    } as TCondition;
  }

  return {
    field,
    operator: defaultOperator,
    value: defaultValue,
  } as TCondition;
}

export function handleOperatorChangeValue<TField extends string>(
  field: TField,
  newOperator: ConditionOperator,
  currentValue: unknown,
  fields: Record<TField, FieldConfig>
): unknown {
  const config = fields[field];
  if (!config) return undefined;

  if (NO_VALUE_OPERATORS.has(newOperator)) {
    return undefined;
  }

  if (DURATION_OPERATORS.has(newOperator)) {
    if (isDurationValue(currentValue)) {
      return currentValue;
    }
    return { amount: 30, unit: TimeUnit.DAYS };
  }

  if (RANGE_OPERATORS.has(newOperator)) {
    if (config.type === "date") {
      return { from: null, to: null };
    }
    if (isRangeValue(currentValue)) {
      return currentValue;
    }
    const numericBase = typeof currentValue === "number" ? currentValue : 0;
    return { min: numericBase, max: numericBase + 100 };
  }

  if (MULTI_VALUE_OPERATORS.has(newOperator)) {
    if (Array.isArray(currentValue)) {
      return currentValue;
    }
    if (currentValue != null && currentValue !== "") {
      return [currentValue];
    }
    return [];
  }

  if (Array.isArray(currentValue) && currentValue.length > 0) {
    return currentValue[0];
  }

  if (isRangeValue(currentValue)) {
    return currentValue.min;
  }

  if (isDurationValue(currentValue)) {
    return currentValue.amount;
  }

  return currentValue ?? getDefaultValueForFieldType(config.type, newOperator);
}

export function isDurationValue(
  val: unknown
): val is { amount: number; unit: string } {
  return (
    typeof val === "object" && val !== null && "amount" in val && "unit" in val
  );
}

export function isRangeValue(
  val: unknown
): val is { min: number; max: number } {
  return (
    typeof val === "object" && val !== null && "min" in val && "max" in val
  );
}

export function isDateRangeValue(
  val: unknown
): val is { from: string | null; to: string | null } {
  return (
    typeof val === "object" &&
    val !== null &&
    "from" in val &&
    "to" in val &&
    !("amount" in val) &&
    !("min" in val)
  );
}

export function isLocationValue(val: unknown): val is {
  countryId?: string | null;
  cityId?: string | null;
  stateId?: string | null;
  districtId?: string | null;
} {
  return (
    typeof val === "object" &&
    val !== null &&
    !("min" in val) &&
    !("amount" in val) &&
    !("from" in val) &&
    ("countryId" in val ||
      "cityId" in val ||
      "stateId" in val ||
      "districtId" in val)
  );
}

export function isTimeRangeValue(
  val: unknown
): val is { from: string; to: string } {
  if (!isDateRangeValue(val)) return false;

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return (
    typeof val.from === "string" &&
    typeof val.to === "string" &&
    timeRegex.test(val.from) &&
    timeRegex.test(val.to)
  );
}

export type InputComponentType =
  | "none"
  | "number"
  | "range"
  | "date"
  | "dateRange"
  | "duration"
  | "time"
  | "timeRange"
  | "text"
  | "select"
  | "multiSelect"
  | "location"
  | "currency";

export function resolveInputType(
  fieldType: FieldType,
  operator: ConditionOperator
): InputComponentType {
  if (NO_VALUE_OPERATORS.has(operator)) {
    return "none";
  }

  if (fieldType === "date" && DURATION_OPERATORS.has(operator)) {
    return "duration";
  }

  if (RANGE_OPERATORS.has(operator)) {
    switch (fieldType) {
      case "date":
        return "dateRange";
      case "time":
        return "timeRange";
      case "numeric":
      case "duration":
        return "range";
      default:
        return "range";
    }
  }

  if (MULTI_VALUE_OPERATORS.has(operator)) {
    return "multiSelect";
  }

  switch (fieldType) {
    case "numeric":
      return "number";
    case "date":
      return "date";
    case "boolean":
      return "none";
    case "enum":
    case "enum": {
      if (MULTI_VALUE_OPERATORS.has(operator)) {
        return "multiSelect";
      }
      return "select";
    }
    case "relation":
      return "multiSelect";
    case "location":
      return "location";
    case "string":
      return "text";
    case "time":
      return "time";
    case "currency":
      return "currency";
    case "duration":
      return "duration";
    default:
      return "text";
  }
}

export interface EnumFieldMeta {
  enumType: string;
  options?: Array<{ value: string; label: string }>;
  fetchEndpoint?: string;
}

export interface RelationFieldMeta {
  endpoint: string;
  queryKey: string;
  multiple: boolean;
  labelField?: string;
  valueField?: string;
}

export interface LocationFieldMeta {
  locationType: "country" | "state" | "city" | "district";
  dependsOn?: string[];
}

export interface CurrencyFieldMeta {
  allowedCurrencies?: string[];
}

export type CommonFieldMeta =
  | EnumFieldMeta
  | RelationFieldMeta
  | LocationFieldMeta
  | CurrencyFieldMeta;

const domainRegistry = new Map<
  string,
  ConditionDomainConfig<string, unknown>
>();

export function registerDomain<TField extends string, TCondition>(
  config: ConditionDomainConfig<TField, TCondition>
): void {
  domainRegistry.set(
    config.name,
    config as ConditionDomainConfig<string, unknown>
  );
}

export function getDomain<TField extends string, TCondition>(
  name: string
): ConditionDomainConfig<TField, TCondition> | undefined {
  return domainRegistry.get(name) as
    | ConditionDomainConfig<TField, TCondition>
    | undefined;
}

export function getAllDomains(): string[] {
  return Array.from(domainRegistry.keys());
}
