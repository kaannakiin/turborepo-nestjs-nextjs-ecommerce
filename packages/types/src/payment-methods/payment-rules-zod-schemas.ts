import { PaymentProvider, PaymentType, StoreType } from "@repo/database/client";
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
  DecisionNodeType,
  FieldType,
  NumericValueSchema,
  RangeValueSchema,
  StringArraySchema,
} from "../common";
import { PaymentRuleConditionField } from "../common/enums";

const NumericFields = [
  PaymentRuleConditionField.CART_TOTAL,
  PaymentRuleConditionField.CART_ITEM_COUNT,
] as const;

const BooleanFields = [PaymentRuleConditionField.IS_FIRST_ORDER] as const;

const EnumFields = [PaymentRuleConditionField.CUSTOMER_TYPE] as const;

const RelationFields = [
  PaymentRuleConditionField.CUSTOMER_GROUP,
  PaymentRuleConditionField.CUSTOMER_GROUP_SMART,
] as const;

const LocationFields = [
  PaymentRuleConditionField.SHIPPING_COUNTRY,
  PaymentRuleConditionField.SHIPPING_STATE,
  PaymentRuleConditionField.SHIPPING_CITY,
  PaymentRuleConditionField.SHIPPING_DISTRICT,
] as const;

const NumericConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.enum(NumericFields),
    operator: z.enum([
      ConditionOperator.EQ,
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
]);

const BooleanConditionSchema = z.object({
  field: z.enum(BooleanFields),
  operator: z.enum([ConditionOperator.IS_TRUE, ConditionOperator.IS_FALSE]),
});

const CustomerTypeConditionSchema = z.object({
  field: z.literal(PaymentRuleConditionField.CUSTOMER_TYPE),
  operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
  value: z.enum(StoreType),
});

const CustomerGroupConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.enum(RelationFields),
    operator: z.enum([
      ConditionOperator.HAS_ANY,
      ConditionOperator.HAS_ALL,
      ConditionOperator.HAS_NONE,
    ]),
    value: StringArraySchema,
  }),
  z.object({
    field: z.enum(RelationFields),
    operator: z.enum([ConditionOperator.EXISTS, ConditionOperator.NOT_EXISTS]),
  }),
]);

const LocationConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.enum(LocationFields),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: z.string().min(1),
  }),
  z.object({
    field: z.enum(LocationFields),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: StringArraySchema,
  }),
]);

export const PaymentRuleConditionSchema = z.union([
  NumericConditionSchema,
  BooleanConditionSchema,
  CustomerTypeConditionSchema,
  CustomerGroupConditionSchema,
  LocationConditionSchema,
]);

export type PaymentRuleCondition = z.infer<typeof PaymentRuleConditionSchema>;

export const InstallmentOptionsSchema = z.object({
  enabled: z.boolean().default(false),
  maxInstallment: z.number().int().min(1).max(12).optional(),
});

export const PaymentRuleResultDataSchema = z.object({
  label: z.string().min(1, "Sonuç adı gerekli"),
  providers: z
    .array(z.enum(PaymentProvider))
    .min(1, "En az bir provider seçin"),
  paymentTypes: z.array(z.enum(PaymentType)).optional(),
  installmentOptions: InstallmentOptionsSchema.optional(),
});

export type PaymentRuleResultData = z.infer<typeof PaymentRuleResultDataSchema>;

const StartNodeSchema = BaseStartNodeSchema;
const ConditionNodeSchema = createConditionNodeSchema(
  PaymentRuleConditionSchema,
);
const ConditionGroupNodeSchema = createConditionGroupNodeSchema(
  PaymentRuleConditionSchema,
);
const ResultNodeSchema = createResultNodeSchema(PaymentRuleResultDataSchema);

export const PaymentRuleNodeSchema = z.discriminatedUnion("type", [
  StartNodeSchema,
  ConditionNodeSchema,
  ConditionGroupNodeSchema,
  ResultNodeSchema,
]);

export type PaymentRuleNode = z.infer<typeof PaymentRuleNodeSchema>;

export const PaymentRuleTreeSchema = createDecisionTreeSchema(
  PaymentRuleNodeSchema,
  { minResultNodes: 1 },
);

export type PaymentRuleTree = z.infer<typeof PaymentRuleTreeSchema>;

export const PaymentRuleZodSchema = z.object({
  uniqueId: z.cuid2().nullish(),
  name: z.string().min(1, "Kural adı zorunludur").max(100),
  priority: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  flowData: PaymentRuleTreeSchema,
});

export type CreatePaymentRuleZodInput = z.input<typeof PaymentRuleZodSchema>;
export type CreatePaymentRuleZodOutput = z.output<typeof PaymentRuleZodSchema>;

export const createDefaultPaymentRuleTree = (): PaymentRuleTree =>
  createDefaultDecisionTreeBase("Ödeme Kuralı") as PaymentRuleTree;

export const createPaymentRuleResultNode = (
  label: string,
  providers: PaymentProvider[],
  position: { x: number; y: number },
): PaymentRuleNode => ({
  id: createNodeId(DecisionNodeType.RESULT),
  type: DecisionNodeType.RESULT,
  position,
  data: { label, providers },
});

export const getPaymentRuleFieldType = (
  field: PaymentRuleConditionField,
): FieldType => {
  if (NumericFields.includes(field as (typeof NumericFields)[number]))
    return "numeric";
  if (BooleanFields.includes(field as (typeof BooleanFields)[number]))
    return "boolean";
  if (EnumFields.includes(field as (typeof EnumFields)[number])) return "enum";
  if (RelationFields.includes(field as (typeof RelationFields)[number]))
    return "relation";
  if (LocationFields.includes(field as (typeof LocationFields)[number]))
    return "location";
  return "string";
};

export {
  BooleanFields as PaymentRuleBooleanFields,
  EnumFields as PaymentRuleEnumFields,
  LocationFields as PaymentRuleLocationFields,
  NumericFields as PaymentRuleNumericFields,
  RelationFields as PaymentRuleRelationFields,
};
