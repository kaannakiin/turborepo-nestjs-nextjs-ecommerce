//packages/types/src/customers/customers-zod-schemas.ts
import {
  AccountStatus,
  GroupType,
  LogicalOperator,
  RegistrationSource,
  SubscriptionStatus,
} from "@repo/database/client";
import { z } from "zod";
import {
  BaseStartNodeSchema,
  ConditionOperator,
  createConditionGroupNodeSchema,
  createConditionNodeSchema,
  createDecisionTreeSchema,
  createDefaultDecisionTreeBase,
  createNodeId,
  createResultNodeSchema,
  CustomerGroupSmartFields,
  DateRangeValueSchema,
  DateValueSchema,
  DecisionNodeType,
  DurationValueSchema,
  FieldType,
  NumericValueSchema,
  RangeValueSchema,
  StringArraySchema,
  TimeUnit,
} from "../common";
import { createId } from "@paralleldrive/cuid2";

export const CustomerSegmentFieldSchema = z.enum(CustomerGroupSmartFields);
export const AccountStatusSchema = z.enum(AccountStatus);
export const RegistrationSourceSchema = z.enum(RegistrationSource);
export const SubscriptionStatusSchema = z.enum(SubscriptionStatus);
export const GroupTypeSchema = z.enum(GroupType);

const NumericFields = [
  CustomerGroupSmartFields.ORDER_COUNT,
  CustomerGroupSmartFields.TOTAL_SPENT,
  CustomerGroupSmartFields.AVERAGE_ORDER_VALUE,
] as const;

const NumericConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.enum(NumericFields),
    operator: z.enum([
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.GT,
      ConditionOperator.GTE,
      ConditionOperator.LT,
      ConditionOperator.LTE,
    ]),
    value: NumericValueSchema,
  }),
  z.object({
    field: z.enum(NumericFields),
    operator: z.literal(ConditionOperator.BETWEEN),
    value: RangeValueSchema,
  }),
  z.object({
    field: z.enum(NumericFields),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: z.array(z.number()).min(1),
  }),
  z.object({
    field: z.enum(NumericFields),
    operator: z.enum([
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ]),
  }),
]);

const DateFields = [
  CustomerGroupSmartFields.LAST_ORDER_DATE,
  CustomerGroupSmartFields.FIRST_ORDER_DATE,
  CustomerGroupSmartFields.CREATED_AT,
  CustomerGroupSmartFields.EMAIL_VERIFIED_AT,
  CustomerGroupSmartFields.PHONE_VERIFIED_AT,
] as const;

const DateConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.enum(DateFields),
    operator: z.enum([
      ConditionOperator.BEFORE,
      ConditionOperator.AFTER,
      ConditionOperator.ON_DATE,
    ]),
    value: DateValueSchema,
  }),
  z.object({
    field: z.enum(DateFields),
    operator: z.enum([
      ConditionOperator.WITHIN_LAST,
      ConditionOperator.NOT_WITHIN_LAST,
      ConditionOperator.WITHIN_NEXT,
    ]),
    value: DurationValueSchema,
  }),
  z.object({
    field: z.enum(DateFields),
    operator: z.literal(ConditionOperator.BETWEEN),
    value: DateRangeValueSchema,
  }),
  z.object({
    field: z.enum(DateFields),
    operator: z.enum([
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ]),
  }),
]);

const BooleanFields = [
  CustomerGroupSmartFields.IS_EMAIL_VERIFIED,
  CustomerGroupSmartFields.IS_PHONE_VERIFIED,
  CustomerGroupSmartFields.HAS_ORDERS,
  CustomerGroupSmartFields.HAS_ADDRESS,
] as const;

const BooleanConditionSchema = z.object({
  field: z.enum(BooleanFields),
  operator: z.enum([
    ConditionOperator.IS_TRUE,
    ConditionOperator.IS_FALSE,
    ConditionOperator.IS_NULL,
    ConditionOperator.IS_NOT_NULL,
  ]),
});

const AccountStatusConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.literal(CustomerGroupSmartFields.ACCOUNT_STATUS),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: AccountStatusSchema,
  }),
  z.object({
    field: z.literal(CustomerGroupSmartFields.ACCOUNT_STATUS),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: z.array(AccountStatusSchema).min(1),
  }),
]);

const RegistrationSourceConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.literal(CustomerGroupSmartFields.REGISTRATION_SOURCE),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: RegistrationSourceSchema,
  }),
  z.object({
    field: z.literal(CustomerGroupSmartFields.REGISTRATION_SOURCE),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: z.array(RegistrationSourceSchema).min(1),
  }),
]);

const SubscriptionStatusConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.literal(CustomerGroupSmartFields.SUBSCRIPTION_STATUS),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: SubscriptionStatusSchema,
  }),
  z.object({
    field: z.literal(CustomerGroupSmartFields.SUBSCRIPTION_STATUS),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: z.array(SubscriptionStatusSchema).min(1),
  }),
]);

const TagsGroupsConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.enum([
      CustomerGroupSmartFields.CUSTOMER_TAGS,
      CustomerGroupSmartFields.CUSTOMER_GROUPS,
    ]),
    operator: z.enum([
      ConditionOperator.HAS_ANY,
      ConditionOperator.HAS_ALL,
      ConditionOperator.HAS_NONE,
    ]),
    value: StringArraySchema,
  }),
  z.object({
    field: z.enum([
      CustomerGroupSmartFields.CUSTOMER_TAGS,
      CustomerGroupSmartFields.CUSTOMER_GROUPS,
    ]),
    operator: z.enum([ConditionOperator.EXISTS, ConditionOperator.NOT_EXISTS]),
  }),
]);

const PriceListConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.literal(CustomerGroupSmartFields.PRICE_LIST),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: z.string().min(1),
  }),
  z.object({
    field: z.literal(CustomerGroupSmartFields.PRICE_LIST),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: StringArraySchema,
  }),
  z.object({
    field: z.literal(CustomerGroupSmartFields.PRICE_LIST),
    operator: z.enum([
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ]),
  }),
]);

const LocationFields = [
  CustomerGroupSmartFields.COUNTRY,
  CustomerGroupSmartFields.STATE,
  CustomerGroupSmartFields.CITY,
  CustomerGroupSmartFields.DISTRICT,
] as const;

const LocationConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.enum(LocationFields),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),

    value: z.union([
      z.string().min(1),
      z.object({
        countryId: z.cuid2().nullish(),
        cityId: z.cuid2().nullish(),
        stateId: z.cuid2().nullish(),
        districtId: z.cuid2().nullish(),
        value: z.string().optional(),
      }),
    ]),
  }),
  z.object({
    field: z.enum(LocationFields),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: StringArraySchema,
  }),
  z.object({
    field: z.enum(LocationFields),
    operator: z.enum([
      ConditionOperator.CONTAINS,
      ConditionOperator.NOT_CONTAINS,
      ConditionOperator.STARTS_WITH,
      ConditionOperator.ENDS_WITH,
    ]),
    value: z.string().min(1),
  }),
  z.object({
    field: z.enum(LocationFields),
    operator: z.enum([
      ConditionOperator.IS_EMPTY,
      ConditionOperator.IS_NOT_EMPTY,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ]),
  }),
]);

export const SegmentConditionSchema = z.union([
  NumericConditionSchema,
  DateConditionSchema,
  BooleanConditionSchema,
  AccountStatusConditionSchema,
  RegistrationSourceConditionSchema,
  SubscriptionStatusConditionSchema,
  TagsGroupsConditionSchema,
  PriceListConditionSchema,
  LocationConditionSchema,
]);

export type SegmentCondition = z.infer<typeof SegmentConditionSchema>;

const StartNodeSchema = BaseStartNodeSchema;

const ConditionNodeSchema = createConditionNodeSchema(SegmentConditionSchema);

const ConditionGroupNodeSchema = createConditionGroupNodeSchema(
  SegmentConditionSchema,
);

const ResultNodeSchema = createResultNodeSchema(
  z.object({
    label: z.string().min(1, "Segment adı gerekli"),
    color: z.string().optional(),
    description: z.string().optional(),
  }),
);

export const DecisionTreeNodeSchema = z.discriminatedUnion("type", [
  StartNodeSchema,
  ConditionNodeSchema,
  ConditionGroupNodeSchema,
  ResultNodeSchema,
]);

export type DecisionTreeNode = z.infer<typeof DecisionTreeNodeSchema>;

export const DecisionTreeSchema = createDecisionTreeSchema(
  DecisionTreeNodeSchema,
  {
    minResultNodes: 1,
  },
);
export type DecisionTree = z.infer<typeof DecisionTreeSchema>;

const BaseCustomerGroupSchema = z.object({
  uniqueId: z.cuid2(),
  name: z
    .string()
    .min(2, "Grup adı en az 2 karakter olmalı")
    .max(100, "Grup adı en fazla 100 karakter olabilir"),
  description: z
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .nullish()
    .or(z.literal("")),
  isActive: z.boolean(),
});
export const SmartGroupSchema = BaseCustomerGroupSchema.extend({
  type: z.literal(GroupType.SMART),
  conditions: DecisionTreeSchema,
});

export const ManualGroupSchema = BaseCustomerGroupSchema.extend({
  type: z.literal(GroupType.MANUAL),
  conditions: z.null().nullish(),
  users: z.array(z.cuid2()).nullish(),
});

export const CustomerGroupSchema = z.discriminatedUnion("type", [
  SmartGroupSchema,
  ManualGroupSchema,
]);
export type CustomerGroupInputZodType = z.input<typeof CustomerGroupSchema>;
export type CustomerGroupOutputZodType = z.output<typeof CustomerGroupSchema>;

export const createDefaultDecisionTree = (): DecisionTree =>
  createDefaultDecisionTreeBase("Müşteri Değerlendirmesi") as DecisionTree;

export const customerSegmentDefaultValues: CustomerGroupInputZodType = {
  isActive: true,
  name: "",
  type: GroupType.SMART,
  conditions: createDefaultDecisionTree(),
  uniqueId: createId(),
  description: "",
};

export const createEmptyCondition = (
  field: CustomerGroupSmartFields,
): SegmentCondition => {
  if (NumericFields.includes(field as (typeof NumericFields)[number])) {
    return {
      field,
      operator: ConditionOperator.GT,
      value: 0,
    } as SegmentCondition;
  }

  if (DateFields.includes(field as (typeof DateFields)[number])) {
    return {
      field,
      operator: ConditionOperator.WITHIN_LAST,
      value: { amount: 30, unit: TimeUnit.DAYS },
    } as SegmentCondition;
  }

  if (BooleanFields.includes(field as (typeof BooleanFields)[number])) {
    return { field, operator: ConditionOperator.IS_TRUE } as SegmentCondition;
  }

  if (LocationFields.includes(field as (typeof LocationFields)[number])) {
    return {
      field,
      operator: ConditionOperator.IN,
      value: [],
    } as SegmentCondition;
  }

  if (field === CustomerGroupSmartFields.ACCOUNT_STATUS) {
    return {
      field,
      operator: ConditionOperator.EQ,
      value: AccountStatus.ACTIVE,
    } as SegmentCondition;
  }
  if (field === CustomerGroupSmartFields.REGISTRATION_SOURCE) {
    return {
      field,
      operator: ConditionOperator.EQ,
      value: RegistrationSource.WEB_REGISTER,
    } as SegmentCondition;
  }
  if (field === CustomerGroupSmartFields.SUBSCRIPTION_STATUS) {
    return {
      field,
      operator: ConditionOperator.EQ,
      value: SubscriptionStatus.SUBSCRIBED,
    } as SegmentCondition;
  }

  if (
    field === CustomerGroupSmartFields.CUSTOMER_TAGS ||
    field === CustomerGroupSmartFields.CUSTOMER_GROUPS
  ) {
    return {
      field,
      operator: ConditionOperator.HAS_ANY,
      value: [],
    } as SegmentCondition;
  }
  if (field === CustomerGroupSmartFields.PRICE_LIST) {
    return {
      field,
      operator: ConditionOperator.IS_NOT_NULL,
    } as SegmentCondition;
  }

  return {
    field,
    operator: ConditionOperator.EQ,
    value: "",
  } as SegmentCondition;
};

export const createConditionNode = (
  field: CustomerGroupSmartFields,
  position: { x: number; y: number },
): DecisionTreeNode => ({
  id: createNodeId(DecisionNodeType.CONDITION),
  type: DecisionNodeType.CONDITION,
  position,
  data: {
    condition: createEmptyCondition(field),
  },
});

export const createConditionGroupNode = (
  operator: LogicalOperator,
  conditions: SegmentCondition[],
  position: { x: number; y: number },
): DecisionTreeNode => ({
  id: createNodeId(DecisionNodeType.CONDITION_GROUP),
  type: DecisionNodeType.CONDITION_GROUP,
  position,
  data: {
    operator,
    conditions,
  },
});

export const createResultNode = (
  label: string,
  position: { x: number; y: number },
  color?: string,
): DecisionTreeNode => ({
  id: createNodeId(DecisionNodeType.RESULT),
  type: DecisionNodeType.RESULT,
  position,
  data: {
    label,
    color,
  },
});

export { BooleanFields, DateFields, LocationFields, NumericFields };

const EnumFields = [
  CustomerGroupSmartFields.ACCOUNT_STATUS,
  CustomerGroupSmartFields.REGISTRATION_SOURCE,
  CustomerGroupSmartFields.SUBSCRIPTION_STATUS,
] as const;

const RelationFields = [
  CustomerGroupSmartFields.CUSTOMER_TAGS,
  CustomerGroupSmartFields.CUSTOMER_GROUPS,
  CustomerGroupSmartFields.PRICE_LIST,
] as const;

export const getFieldType = (field: CustomerGroupSmartFields): FieldType => {
  if (NumericFields.includes(field as (typeof NumericFields)[number]))
    return "numeric";
  if (DateFields.includes(field as (typeof DateFields)[number])) return "date";
  if (BooleanFields.includes(field as (typeof BooleanFields)[number]))
    return "boolean";
  if (LocationFields.includes(field as (typeof LocationFields)[number]))
    return "location";
  if (EnumFields.includes(field as (typeof EnumFields)[number])) return "enum";
  if (RelationFields.includes(field as (typeof RelationFields)[number]))
    return "relation";
  return "enum";
};
