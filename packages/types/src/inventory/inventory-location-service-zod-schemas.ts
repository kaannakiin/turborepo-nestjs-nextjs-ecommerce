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
  FullfillmentActionType,
  FullfillmentConditionField,
  FullfillmentStrategyType,
  LogicalOperatorSchema,
  NumericValueSchema,
  PositionSchema,
  RangeValueSchema,
  StringArraySchema,
  StringOrArraySchema,
  type DecisionTreeEdge,
} from "../common";

export const FulfillmentConditionFieldSchema = z.enum(
  FullfillmentConditionField
);
export const FulfillmentActionTypeSchema = z.enum(FullfillmentActionType);
export const FulfillmentStrategyTypeSchema = z.enum(FullfillmentStrategyType);
export const CurrencySchema = z.enum(Currency);

export const FulfillmentNumericFields = [
  FullfillmentConditionField.ORDER_TOTAL,
  FullfillmentConditionField.ORDER_ITEM_COUNT,
  FullfillmentConditionField.ORDER_WEIGHT,
] as const;

export const FulfillmentLocationFields = [
  FullfillmentConditionField.DESTINATION_COUNTRY,
  FullfillmentConditionField.DESTINATION_STATE,
  FullfillmentConditionField.DESTINATION_CITY,
] as const;

export const ProductRelationFields = [
  FullfillmentConditionField.PRODUCT_TAG,
  FullfillmentConditionField.PRODUCT_CATEGORY,
  FullfillmentConditionField.PRODUCT_BRAND,
] as const;

export const CustomerRelationFields = [
  FullfillmentConditionField.CUSTOMER_GROUP,
] as const;

export const TimeFields = [
  FullfillmentConditionField.DAY_OF_WEEK,
  FullfillmentConditionField.TIME_OF_DAY,
  FullfillmentConditionField.IS_HOLIDAY,
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
    field: z.literal(FullfillmentConditionField.ORDER_CURRENCY),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: CurrencySchema,
  }),
  z.object({
    field: z.literal(FullfillmentConditionField.ORDER_CURRENCY),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: z.array(CurrencySchema).min(1, "En az bir para birimi seçilmeli"),
  }),
]);

const LocationValueObjectSchema = z.object({
  countryId: z.uuid().nullish(),
  stateId: z.uuid().nullish(),
  cityId: z.uuid().nullish(),
  districtId: z.uuid().nullish(),
});

/**
 * Lokasyon Koşulları
 * - DESTINATION_COUNTRY, DESTINATION_STATE, DESTINATION_CITY için
 * - Desteklenen operatörler: EQ, NEQ, IN, NOT_IN, IS_NULL, IS_NOT_NULL
 */
const LocationConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.enum(FulfillmentLocationFields),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: z.union([z.string(), LocationValueObjectSchema]),
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
    value: StringOrArraySchema,
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
  field: z.literal(FullfillmentConditionField.DAY_OF_WEEK),
  operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
  value: z.array(z.enum(DayOfWeek)).min(1, "En az bir gün seçilmeli"),
});

const TimeOfDayConditionSchema = z.object({
  field: z.literal(FullfillmentConditionField.TIME_OF_DAY),
  operator: z.literal(ConditionOperator.BETWEEN),
  value: TimeRangeValueSchema,
});

const IsHolidayConditionSchema = z.object({
  field: z.literal(FullfillmentConditionField.IS_HOLIDAY),
  operator: z.enum([ConditionOperator.IS_TRUE, ConditionOperator.IS_FALSE]),
});

/**
 * Kargo Yöntemi Koşulları
 * - SHIPPING_METHOD için
 */
const ShippingMethodConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.literal(FullfillmentConditionField.SHIPPING_METHOD),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: z.string().min(1, "Kargo yöntemi gerekli"),
  }),
  z.object({
    field: z.literal(FullfillmentConditionField.SHIPPING_METHOD),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: StringArraySchema,
  }),
]);

const StockLevelConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.literal(FullfillmentConditionField.STOCK_LEVEL),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: z.enum(["OUT_OF_STOCK", "LOW_STOCK", "IN_STOCK", "HIGH_STOCK"]),
  }),
  z.object({
    field: z.literal(FullfillmentConditionField.STOCK_LEVEL),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: z
      .array(z.enum(["OUT_OF_STOCK", "LOW_STOCK", "IN_STOCK", "HIGH_STOCK"]))
      .min(1),
  }),
]);

const LocationTypeConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.literal(FullfillmentConditionField.LOCATION_TYPE),
    operator: z.enum([ConditionOperator.EQ, ConditionOperator.NEQ]),
    value: z.enum(["WAREHOUSE", "STORE", "DROPSHIP", "VIRTUAL"]),
  }),
  z.object({
    field: z.literal(FullfillmentConditionField.LOCATION_TYPE),
    operator: z.enum([ConditionOperator.IN, ConditionOperator.NOT_IN]),
    value: z
      .array(z.enum(["WAREHOUSE", "STORE", "DROPSHIP", "VIRTUAL"]))
      .min(1),
  }),
]);

const SupplierLeadTimeConditionSchema = z.discriminatedUnion("operator", [
  z.object({
    field: z.literal(FullfillmentConditionField.SUPPLIER_LEAD_TIME),
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
    field: z.literal(FullfillmentConditionField.SUPPLIER_LEAD_TIME),
    operator: z.literal(ConditionOperator.BETWEEN),
    value: RangeValueSchema,
  }),
]);

export const FullfillmentConditionSchema = z.union([
  NumericConditionSchema,
  CurrencyConditionSchema,
  LocationConditionSchema,
  ProductRelationConditionSchema,
  CustomerRelationConditionSchema,
  DayOfWeekConditionSchema,
  TimeOfDayConditionSchema,
  IsHolidayConditionSchema,
  ShippingMethodConditionSchema,
  StockLevelConditionSchema,
  LocationTypeConditionSchema,
  SupplierLeadTimeConditionSchema,
]);

export type FullfillmentCondition = z.infer<typeof FullfillmentConditionSchema>;

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
export const FullfillmentActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(FullfillmentActionType.USE_LOCATION),
    locationIds: z.array(z.cuid2()).min(1, "En az bir lokasyon seçilmeli"),
    priority: LocationPrioritySchema.default("sequential"),
  }),

  z.object({
    type: z.literal(FullfillmentActionType.EXCLUDE_LOCATION),
    locationIds: z.array(z.cuid2()).min(1, "En az bir lokasyon seçilmeli"),
  }),

  z.object({
    type: z.literal(FullfillmentActionType.PREFER_LOCATION),
    locationId: z.cuid2(),
    fallbackAllowed: z.boolean().default(true),
  }),

  z.object({
    type: z.literal(FullfillmentActionType.ALLOW_SPLIT),
    maxSplitCount: z.number().int().min(2).max(10).optional(),
    splitStrategy: z
      .enum(["minimize_shipments", "fastest_delivery"])
      .default("minimize_shipments"),
  }),

  z.object({
    type: z.literal(FullfillmentActionType.DENY_SPLIT),
  }),

  z.object({
    type: z.literal(FullfillmentActionType.USE_DROPSHIP),
    supplierId: z.cuid2(),
    onlyIfOutOfStock: z.boolean().default(true),
    maxLeadDays: z.number().int().positive().optional(),
  }),

  z.object({
    type: z.literal(FullfillmentActionType.BACKORDER),
    maxWaitDays: z.number().int().positive().optional(),
    notifyCustomer: z.boolean().default(true),
    estimatedDate: DateValueSchema.optional(),
  }),

  z.object({
    type: z.literal(FullfillmentActionType.REJECT),
    reason: z.string().max(500).optional(),
    refundAutomatically: z.boolean().default(true),
  }),

  z.object({
    type: z.literal(FullfillmentActionType.FLAG_FOR_REVIEW),
    reason: z.string().max(500).optional(),
    assignTo: z.cuid2().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  }),
]);

export type FullfillmentAction = z.infer<typeof FullfillmentActionSchema>;

const FullfillmentStartNodeSchema = BaseStartNodeSchema;

const FullfillmentConditionNodeSchema = z.object({
  id: z.string(),
  type: z.literal(DecisionNodeType.CONDITION),
  position: PositionSchema,
  data: z.object({
    condition: FullfillmentConditionSchema,
    label: z.string().optional(),
  }),
});

const FullfillmentConditionGroupNodeSchema = z.object({
  id: z.string(),
  type: z.literal(DecisionNodeType.CONDITION_GROUP),
  position: PositionSchema,
  data: z.object({
    operator: LogicalOperatorSchema,
    conditions: z
      .array(FullfillmentConditionSchema)
      .min(1, "En az bir koşul gerekli"),
    label: z.string().optional(),
  }),
});

const FullfillmentResultDataSchema = z.object({
  label: z.string().min(1, "Aksiyon adı gerekli"),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Geçerli HEX renk kodu giriniz"
    )
    .optional(),
  actions: z.array(FullfillmentActionSchema).nullish(),
  // .min(1, "En az bir aksiyon gerekli")
  // .refine(
  //   (actions) => {
  //     const hasReject = actions.some(
  //       (a) => a.type === FullfillmentActionType.REJECT
  //     );

  //     if (hasReject && actions.length > 1) return false;

  //     const hasAllowSplit = actions.some(
  //       (a) => a.type === FullfillmentActionType.ALLOW_SPLIT
  //     );
  //     const hasDenySplit = actions.some(
  //       (a) => a.type === FullfillmentActionType.DENY_SPLIT
  //     );

  //     if (hasAllowSplit && hasDenySplit) return false;

  //     return true;
  //   },
  //   {
  //     message:
  //       "Çelişkili aksiyonlar tespit edildi (Örn: Hem Reddet hem Gönder seçilemez).",
  //   }
  // ),
  isTerminal: z.boolean().default(true),
});

const FullfillmentResultNodeSchema = createResultNodeSchema(
  FullfillmentResultDataSchema
);

export const FullfillmentDecisionNodeSchema = z.discriminatedUnion("type", [
  FullfillmentStartNodeSchema,
  FullfillmentConditionNodeSchema,
  FullfillmentConditionGroupNodeSchema,
  FullfillmentResultNodeSchema,
]);

export type FullfillmentDecisionNode = z.infer<
  typeof FullfillmentDecisionNodeSchema
>;

const fullfillmentTreeValidations = [
  {
    validate: (data: {
      nodes: FullfillmentDecisionNode[];
      edges: DecisionTreeEdge[];
    }) => {
      const startNode = data.nodes.find(
        (n) => n.type === DecisionNodeType.START
      );
      if (!startNode) return false;

      return data.edges.some((e) => e.source === startNode.id);
    },
    message: "Başlangıç kutusundan bir bağlantı yapmalısınız.",
  },

  {
    validate: (data: {
      nodes: FullfillmentDecisionNode[];
      edges: DecisionTreeEdge[];
    }) => {
      const resultNodes = data.nodes.filter(
        (n) => n.type === DecisionNodeType.RESULT
      );

      return resultNodes.every((node) =>
        data.edges.some((e) => e.target === node.id)
      );
    },
    message: "Tüm Sonuç kutularına en az bir bağlantı gelmelidir.",
  },

  {
    validate: (data: {
      nodes: FullfillmentDecisionNode[];
      edges: DecisionTreeEdge[];
    }) => {
      const nonResultNodes = data.nodes.filter(
        (n) => n.type !== DecisionNodeType.RESULT
      );

      return nonResultNodes.every((node) => {
        const hasOutgoingEdge = data.edges.some((e) => e.source === node.id);
        return hasOutgoingEdge;
      });
    },
    message:
      "Akışın ortasında sonuca bağlanmayan (yarım kalan) kutular var. Lütfen akışı tamamlayın.",
  },

  {
    validate: (data: {
      nodes: FullfillmentDecisionNode[];
      edges: DecisionTreeEdge[];
    }) => {
      const conditionNodes = data.nodes.filter(
        (n) =>
          n.type === DecisionNodeType.CONDITION ||
          n.type === DecisionNodeType.CONDITION_GROUP
      );

      return conditionNodes.every((node) => {
        return data.edges.some(
          (e) => e.source === node.id && e.sourceHandle === "yes"
        );
      });
    },
    message:
      "Koşul kutularının 'Evet' (Yeşil) yolu mutlaka bir yere bağlanmalıdır.",
  },
];

export const FullfillmentDecisionTreeSchema = createDecisionTreeSchema(
  FullfillmentDecisionNodeSchema,
  {
    minResultNodes: 1,
    customValidations: fullfillmentTreeValidations,
  }
);

export type FullfillmentDecisionTree = z.infer<
  typeof FullfillmentDecisionTreeSchema
>;

const FullfillmentStrategySettingsSchema = z.object({
  allowSplitShipment: z.boolean().default(false),

  maxSplitCount: z.number().int().min(2).max(10).nullish(),

  allowBackorder: z.boolean().default(false),

  allowDropship: z.boolean().default(false),

  defaultLeadTimeDays: z.number().int().min(0).default(0),

  processOnHolidays: z.boolean().default(false),
});

export type FullfillmentStrategySettings = z.infer<
  typeof FullfillmentStrategySettingsSchema
>;

export const FullfillmentStrategyZodSchema = z.object({
  uniqueId: z.cuid2().nullish(),
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
    FullfillmentStrategyType.PROXIMITY
  ),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  priority: z.number().int().min(0).default(0),
  settings: FullfillmentStrategySettingsSchema,
  decisionTree: FullfillmentDecisionTreeSchema,
});

export type FullfillmentStrategyInput = z.input<
  typeof FullfillmentStrategyZodSchema
>;
export type FullfillmentStrategyOutput = z.output<
  typeof FullfillmentStrategyZodSchema
>;

export const GetFulfillmentStrategiesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  take: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});
export type GetFulfillmentStrategiesInput = z.infer<
  typeof GetFulfillmentStrategiesQuerySchema
>;
