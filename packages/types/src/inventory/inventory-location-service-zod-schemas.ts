import { Currency } from "@repo/database/client";
import { z } from "zod";
import {
  BaseStartNodeSchema,
  ConditionOperator,
  createDecisionTreeSchema,
  createResultNodeSchema,
  DateValueSchema,
  DayOfWeek,
  DecisionNodeType,
  FulfillmentActionType,
  FulfillmentConditionField,
  FulfillmentStrategyType,
  LogicalOperatorSchema,
  NumericValueSchema,
  PositionSchema,
  RangeValueSchema,
  StringArraySchema,
  type DecisionTreeEdge,
} from "../common";

export const FulfillmentConditionFieldSchema = z.enum(
  FulfillmentConditionField
);
export const FulfillmentActionTypeSchema = z.enum(FulfillmentActionType);
export const FulfillmentStrategyTypeSchema = z.enum(FulfillmentStrategyType);
export const CurrencySchema = z.enum(Currency);

export const FulfillmentNumericFields = [
  FulfillmentConditionField.ORDER_TOTAL,
  FulfillmentConditionField.ORDER_ITEM_COUNT,
  FulfillmentConditionField.ORDER_WEIGHT,
] as const;

export const FulfillmentLocationFields = [
  FulfillmentConditionField.DESTINATION_COUNTRY,
  FulfillmentConditionField.DESTINATION_STATE,
  FulfillmentConditionField.DESTINATION_CITY,
] as const;

export const ProductRelationFields = [
  FulfillmentConditionField.PRODUCT_TAG,
  FulfillmentConditionField.PRODUCT_CATEGORY,
  FulfillmentConditionField.PRODUCT_BRAND,
] as const;

export const CustomerRelationFields = [
  FulfillmentConditionField.CUSTOMER_TYPE,
  FulfillmentConditionField.CUSTOMER_GROUP,
] as const;

export const TimeFields = [
  FulfillmentConditionField.DAY_OF_WEEK,
  FulfillmentConditionField.TIME_OF_DAY,
  FulfillmentConditionField.IS_HOLIDAY,
] as const;

export const TimeRangeValueSchema = z
  .object({
    from: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "HH:mm formatında olmalı"),
    to: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "HH:mm formatında olmalı"),
  })
  .refine(
    (data) => {
      const [fromH, fromM] = data.from.split(":").map(Number);
      const [toH, toM] = data.to.split(":").map(Number);
      return fromH * 60 + fromM <= toH * 60 + toM;
    },
    { message: "Başlangıç saati bitiş saatinden sonra olamaz" }
  );

export type TimeRangeValue = z.infer<typeof TimeRangeValueSchema>;

const NumericConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.enum(FulfillmentNumericFields),
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
    field: z.enum(FulfillmentNumericFields),
    operator: z.literal(ConditionOperator.BETWEEN),
    value: RangeValueSchema,
  }),

  z.object({
    field: z.enum(FulfillmentNumericFields),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: z.array(NumericValueSchema).min(1, "En az bir değer gerekli"),
  }),
]);

const CurrencyConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.literal(FulfillmentConditionField.ORDER_CURRENCY),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: CurrencySchema,
  }),
  z.object({
    field: z.literal(FulfillmentConditionField.ORDER_CURRENCY),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: z.array(CurrencySchema).min(1, "En az bir para birimi seçilmeli"),
  }),
]);

/**
 * Lokasyon Koşulları
 * - DESTINATION_COUNTRY, DESTINATION_STATE, DESTINATION_CITY için
 * - Desteklenen operatörler: EQ, NEQ, IN, NOT_IN, IS_NULL, IS_NOT_NULL
 */
const LocationConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.enum(FulfillmentLocationFields),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: z.string().min(1, "Lokasyon ID gerekli"),
  }),

  z.object({
    field: z.enum(FulfillmentLocationFields),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: StringArraySchema,
  }),

  z.object({
    field: z.enum(FulfillmentLocationFields),
    operator: z.enum([
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ]),
  }),
]);

/**
 * Ürün İlişki Koşulları
 * - PRODUCT_TAG, PRODUCT_CATEGORY, PRODUCT_BRAND için
 * - Desteklenen operatörler: HAS_ANY, HAS_ALL, HAS_NONE, EXISTS, NOT_EXISTS
 */
const ProductRelationConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.enum(ProductRelationFields),
    operator: z.enum([
      ConditionOperator.HAS_ANY,
      ConditionOperator.HAS_ALL,
      ConditionOperator.HAS_NONE,
    ]),
    value: StringArraySchema,
  }),

  z.object({
    field: z.enum(ProductRelationFields),
    operator: z.enum([ConditionOperator.EXISTS, ConditionOperator.NOT_EXISTS]),
  }),
]);

/**
 * Müşteri İlişki Koşulları
 * - CUSTOMER_TYPE, CUSTOMER_GROUP için
 * - Desteklenen operatörler: EQ, NEQ, IN, NOT_IN, IS_NULL, IS_NOT_NULL
 */
const CustomerRelationConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.enum(CustomerRelationFields),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: z.string().min(1),
  }),
  z.object({
    field: z.enum(CustomerRelationFields),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: StringArraySchema,
  }),
  z.object({
    field: z.enum(CustomerRelationFields),
    operator: z.enum([
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ]),
  }),
]);

/**
 * Zaman Bazlı Koşullar
 * - DAY_OF_WEEK: Haftanın günleri
 * - TIME_OF_DAY: Saat aralığı
 * - IS_HOLIDAY: Tatil günü mü
 */
const DayOfWeekConditionSchema = z.object({
  field: z.literal(FulfillmentConditionField.DAY_OF_WEEK),
  operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
  value: z.array(z.enum(DayOfWeek)).min(1, "En az bir gün seçilmeli"),
});

const TimeOfDayConditionSchema = z.object({
  field: z.literal(FulfillmentConditionField.TIME_OF_DAY),
  operator: z.literal(ConditionOperator.BETWEEN),
  value: TimeRangeValueSchema,
});

const IsHolidayConditionSchema = z.object({
  field: z.literal(FulfillmentConditionField.IS_HOLIDAY),
  operator: z.enum([ConditionOperator.IS_TRUE, ConditionOperator.IS_FALSE]),
});

/**
 * Kargo Yöntemi Koşulları
 * - SHIPPING_METHOD için
 */
const ShippingMethodConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.literal(FulfillmentConditionField.SHIPPING_METHOD),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: z.string().min(1, "Kargo yöntemi gerekli"),
  }),
  z.object({
    field: z.literal(FulfillmentConditionField.SHIPPING_METHOD),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: StringArraySchema,
  }),
]);

export const FulfillmentConditionSchema = z.union([
  NumericConditionSchema,
  CurrencyConditionSchema,
  LocationConditionSchema,
  ProductRelationConditionSchema,
  CustomerRelationConditionSchema,
  DayOfWeekConditionSchema,
  TimeOfDayConditionSchema,
  IsHolidayConditionSchema,
  ShippingMethodConditionSchema,
]);

export type FulfillmentCondition = z.infer<typeof FulfillmentConditionSchema>;

export const LocationPrioritySchema = z.enum([
  "sequential",
  "parallel",
  "random",
]);
export type LocationPriority = z.infer<typeof LocationPrioritySchema>;

/**
 * Fulfillment Aksiyonları
 * Her aksiyon tipi için ayrı schema tanımlanmış
 */
export const FulfillmentActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(FulfillmentActionType.USE_LOCATION),
    locationIds: z.array(z.cuid2()).min(1, "En az bir lokasyon seçilmeli"),
    priority: LocationPrioritySchema.default("sequential"),
  }),

  z.object({
    type: z.literal(FulfillmentActionType.EXCLUDE_LOCATION),
    locationIds: z.array(z.cuid2()).min(1, "En az bir lokasyon seçilmeli"),
  }),

  z.object({
    type: z.literal(FulfillmentActionType.PREFER_LOCATION),
    locationId: z.cuid2(),
    fallbackAllowed: z.boolean().default(true),
  }),

  z.object({
    type: z.literal(FulfillmentActionType.ALLOW_SPLIT),
    maxSplitCount: z.number().int().min(2).max(10).optional(),
    splitStrategy: z
      .enum(["minimize_shipments", "fastest_delivery"])
      .default("minimize_shipments"),
  }),

  z.object({
    type: z.literal(FulfillmentActionType.DENY_SPLIT),
  }),

  z.object({
    type: z.literal(FulfillmentActionType.USE_DROPSHIP),
    supplierId: z.cuid2(),
    onlyIfOutOfStock: z.boolean().default(true),
    maxLeadDays: z.number().int().positive().optional(),
  }),

  z.object({
    type: z.literal(FulfillmentActionType.BACKORDER),
    maxWaitDays: z.number().int().positive().optional(),
    notifyCustomer: z.boolean().default(true),
    estimatedDate: DateValueSchema.optional(),
  }),

  z.object({
    type: z.literal(FulfillmentActionType.REJECT),
    reason: z.string().max(500).optional(),
    refundAutomatically: z.boolean().default(true),
  }),

  z.object({
    type: z.literal(FulfillmentActionType.FLAG_FOR_REVIEW),
    reason: z.string().max(500).optional(),
    assignTo: z.cuid2().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  }),
]);

export type FulfillmentAction = z.infer<typeof FulfillmentActionSchema>;

const FulfillmentStartNodeSchema = BaseStartNodeSchema;

const FulfillmentConditionNodeSchema = z.object({
  id: z.string(),
  type: z.literal(DecisionNodeType.CONDITION),
  position: PositionSchema,
  data: z.object({
    condition: FulfillmentConditionSchema,
    label: z.string().optional(),
  }),
});

const FulfillmentConditionGroupNodeSchema = z.object({
  id: z.string(),
  type: z.literal(DecisionNodeType.CONDITION_GROUP),
  position: PositionSchema,
  data: z.object({
    operator: LogicalOperatorSchema,
    conditions: z
      .array(FulfillmentConditionSchema)
      .min(1, "En az bir koşul gerekli"),
    label: z.string().optional(),
  }),
});

const FulfillmentResultDataSchema = z.object({
  label: z.string().min(1, "Aksiyon adı gerekli"),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Geçerli HEX renk kodu giriniz"
    )
    .optional(),
  actions: z
    .array(FulfillmentActionSchema)
    .min(1, "En az bir aksiyon gerekli")
    .refine(
      (actions) => {
        const hasReject = actions.some(
          (a) => a.type === FulfillmentActionType.REJECT
        );

        if (hasReject && actions.length > 1) return false;

        const hasAllowSplit = actions.some(
          (a) => a.type === FulfillmentActionType.ALLOW_SPLIT
        );
        const hasDenySplit = actions.some(
          (a) => a.type === FulfillmentActionType.DENY_SPLIT
        );

        if (hasAllowSplit && hasDenySplit) return false;

        return true;
      },
      {
        message:
          "Çelişkili aksiyonlar tespit edildi (Örn: Hem Reddet hem Gönder seçilemez).",
      }
    ),
  isTerminal: z.boolean().default(true),
});

const FulfillmentResultNodeSchema = createResultNodeSchema(
  FulfillmentResultDataSchema
);

export const FulfillmentDecisionNodeSchema = z.discriminatedUnion("type", [
  FulfillmentStartNodeSchema,
  FulfillmentConditionNodeSchema,
  FulfillmentConditionGroupNodeSchema,
  FulfillmentResultNodeSchema,
]);

export type FulfillmentDecisionNode = z.infer<
  typeof FulfillmentDecisionNodeSchema
>;

const fulfillmentTreeValidations = [
  {
    validate: (data: {
      nodes: FulfillmentDecisionNode[];
      edges: DecisionTreeEdge[];
    }) => {
      const conditionNodes = data.nodes.filter(
        (n) => n.type === DecisionNodeType.CONDITION
      );

      return conditionNodes.every((node) => {
        const outgoingEdges = data.edges.filter((e) => e.source === node.id);
        const hasYes = outgoingEdges.some((e) => e.sourceHandle === "yes");
        const hasNo = outgoingEdges.some((e) => e.sourceHandle === "no");
        return hasYes && hasNo;
      });
    },
    message:
      "Her koşul kutusunun hem 'Evet' hem de 'Hayır' yolu bağlı olmalıdır.",
  },
  {
    validate: (data: {
      nodes: FulfillmentDecisionNode[];
      edges: DecisionTreeEdge[];
    }) => {
      const startNode = data.nodes.find(
        (n) => n.type === DecisionNodeType.START
      );
      if (!startNode) return false;
      return data.edges.some((e) => e.source === startNode.id);
    },
    message: "Başlangıç node'undan en az bir çıkış bağlantısı olmalı",
  },
  {
    validate: (data: {
      nodes: FulfillmentDecisionNode[];
      edges: DecisionTreeEdge[];
    }) => {
      const resultNodes = data.nodes.filter(
        (n) => n.type === DecisionNodeType.RESULT
      );
      return resultNodes.every((node) =>
        data.edges.some((e) => e.target === node.id)
      );
    },
    message: "Her sonuç node'una en az bir giriş bağlantısı olmalı",
  },
];

export const FulfillmentDecisionTreeSchema = createDecisionTreeSchema(
  FulfillmentDecisionNodeSchema,
  {
    minResultNodes: 1,
    customValidations: fulfillmentTreeValidations,
  }
);

export type FulfillmentDecisionTree = z.infer<
  typeof FulfillmentDecisionTreeSchema
>;

const FulfillmentStrategySettingsSchema = z.object({
  allowSplitShipment: z.boolean().default(false),

  maxSplitCount: z.number().int().min(2).max(10).nullish(),

  allowBackorder: z.boolean().default(false),

  allowDropship: z.boolean().default(false),

  defaultLeadTimeDays: z.number().int().min(0).default(0),

  processOnHolidays: z.boolean().default(false),
});

export type FulfillmentStrategySettings = z.infer<
  typeof FulfillmentStrategySettingsSchema
>;

export const FulfillmentStrategyZodSchema = z.object({
  uniqueId: z.cuid2(),
  name: z
    .string()
    .min(2, "Strateji adı en az 2 karakter olmalı")
    .max(100, "Strateji adı en fazla 100 karakter olabilir"),
  description: z
    .string()
    .max(500, "Açıklama en fazla 500 karakter olabilir")
    .nullish()
    .or(z.literal("")),
  type: FulfillmentStrategyTypeSchema.default(
    FulfillmentStrategyType.PROXIMITY
  ),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  priority: z.number().int().min(0).default(0),
  settings: FulfillmentStrategySettingsSchema,
  decisionTree: FulfillmentDecisionTreeSchema,
});

export type FulfillmentStrategyInput = z.input<
  typeof FulfillmentStrategyZodSchema
>;
export type FulfillmentStrategyOutput = z.output<
  typeof FulfillmentStrategyZodSchema
>;
