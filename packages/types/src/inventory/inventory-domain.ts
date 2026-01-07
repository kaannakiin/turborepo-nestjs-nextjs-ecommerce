import { Currency } from "@repo/database/client";
import {
  ConditionDomainConfig,
  ConditionOperator,
  createGenericEmptyCondition,
  EnumFieldMeta,
  FieldConfig,
  FulfillmentConditionField,
  LocationFieldMeta,
  registerDomain,
  RelationFieldMeta,
} from "../common";
import {
  FulfillmentCondition,
  FulfillmentConditionSchema,
} from "./inventory-location-service-zod-schemas";

interface TimeRangeMeta {
  timeRange: true;
}

interface StockLevelMeta {
  thresholds?: {
    low: number;
    medium: number;
    high: number;
  };
}

type FulfillmentMeta =
  | EnumFieldMeta
  | RelationFieldMeta
  | LocationFieldMeta
  | TimeRangeMeta
  | StockLevelMeta;

export const FULFILLMENT_FIELDS: Record<
  FulfillmentConditionField,
  FieldConfig<FulfillmentMeta>
> = {
  [FulfillmentConditionField.ORDER_TOTAL]: {
    label: "Sipariş Tutarı",
    description: "Toplam sipariş tutarı",
    type: "numeric",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.GT,
      ConditionOperator.GTE,
      ConditionOperator.LT,
      ConditionOperator.LTE,
      ConditionOperator.BETWEEN,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
  },
  [FulfillmentConditionField.ORDER_ITEM_COUNT]: {
    label: "Ürün Adedi",
    description: "Siparişteki toplam ürün sayısı",
    type: "numeric",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.GT,
      ConditionOperator.GTE,
      ConditionOperator.LT,
      ConditionOperator.LTE,
      ConditionOperator.BETWEEN,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
  },
  [FulfillmentConditionField.ORDER_WEIGHT]: {
    label: "Sipariş Ağırlığı",
    description: "Toplam sipariş ağırlığı (kg)",
    type: "numeric",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.GT,
      ConditionOperator.GTE,
      ConditionOperator.LT,
      ConditionOperator.LTE,
      ConditionOperator.BETWEEN,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
  },

  [FulfillmentConditionField.ORDER_CURRENCY]: {
    label: "Para Birimi",
    description: "Sipariş para birimi",
    type: "currency",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
    meta: {
      enumType: "Currency",
      options: Object.values(Currency).map((c) => ({
        value: c,
        label: c,
      })),
    },
  },

  [FulfillmentConditionField.DESTINATION_COUNTRY]: {
    label: "Hedef Ülke",
    description: "Teslimat ülkesi",
    type: "location",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
    meta: {
      locationType: "country",
    },
  },
  [FulfillmentConditionField.DESTINATION_STATE]: {
    label: "Hedef İl/Eyalet",
    description: "Teslimat ili",
    type: "location",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
    meta: {
      locationType: "state",
      dependsOn: [FulfillmentConditionField.DESTINATION_COUNTRY],
    },
  },
  [FulfillmentConditionField.DESTINATION_CITY]: {
    label: "Hedef Şehir",
    description: "Teslimat şehri",
    type: "location",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
    meta: {
      locationType: "city",
      dependsOn: [FulfillmentConditionField.DESTINATION_COUNTRY],
    },
  },

  [FulfillmentConditionField.PRODUCT_TAG]: {
    label: "Ürün Etiketi",
    description: "Ürün etiketleri",
    type: "relation",
    operators: [
      ConditionOperator.HAS_ANY,
      ConditionOperator.HAS_ALL,
      ConditionOperator.HAS_NONE,
      ConditionOperator.EXISTS,
      ConditionOperator.NOT_EXISTS,
    ],
    meta: {
      endpoint: "/admin/products/tags/get-all-tags-id-and-name",
      queryKey: "select-tags",
      multiple: true,
    },
  },
  [FulfillmentConditionField.PRODUCT_CATEGORY]: {
    label: "Ürün Kategorisi",
    description: "Ürün kategorileri",
    type: "relation",
    operators: [
      ConditionOperator.HAS_ANY,
      ConditionOperator.HAS_ALL,
      ConditionOperator.HAS_NONE,
      ConditionOperator.EXISTS,
      ConditionOperator.NOT_EXISTS,
    ],
    meta: {
      endpoint:
        "/admin/products/categories/get-all-categories-only-id-and-name",
      queryKey: "select-categories",
      multiple: true,
    },
  },
  [FulfillmentConditionField.PRODUCT_BRAND]: {
    label: "Ürün Markası",
    description: "Ürün markaları",
    type: "relation",
    operators: [
      ConditionOperator.HAS_ANY,
      ConditionOperator.HAS_ALL,
      ConditionOperator.HAS_NONE,
      ConditionOperator.EXISTS,
      ConditionOperator.NOT_EXISTS,
    ],
    meta: {
      endpoint: "/admin/products/brands/get-all-brands-only-id-and-name",
      queryKey: "select-brands",
      multiple: true,
    },
  },
  [FulfillmentConditionField.CUSTOMER_GROUP]: {
    label: "Müşteri Grubu",
    description: "Müşteri grupları",
    type: "relation",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
    meta: {
      endpoint: "/admin/users/get-all-customer-groups-list",
      queryKey: "",
      multiple: false,
      labelField: "name",
      valueField: "id",
    },
  },

  [FulfillmentConditionField.DAY_OF_WEEK]: {
    label: "Haftanın Günü",
    description: "Siparişin verildiği gün",
    type: "enum",
    operators: [ConditionOperator.IN, ConditionOperator.NOT_IN],
    meta: {
      enumType: "DayOfWeek",
      options: [
        { value: "MONDAY", label: "Pazartesi" },
        { value: "TUESDAY", label: "Salı" },
        { value: "WEDNESDAY", label: "Çarşamba" },
        { value: "THURSDAY", label: "Perşembe" },
        { value: "FRIDAY", label: "Cuma" },
        { value: "SATURDAY", label: "Cumartesi" },
        { value: "SUNDAY", label: "Pazar" },
      ],
    },
  },
  [FulfillmentConditionField.TIME_OF_DAY]: {
    label: "Günün Saati",
    description: "Siparişin verildiği saat aralığı",
    type: "time",
    operators: [ConditionOperator.BETWEEN],
    meta: {
      timeRange: true,
    },
  },
  [FulfillmentConditionField.IS_HOLIDAY]: {
    label: "Tatil Günü",
    description: "Tatil günü mü",
    type: "boolean",
    operators: [ConditionOperator.IS_TRUE, ConditionOperator.IS_FALSE],
  },

  [FulfillmentConditionField.SHIPPING_METHOD]: {
    label: "Kargo Yöntemi",
    description: "Seçilen kargo yöntemi",
    type: "relation",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
    meta: {
      endpoint: "/api/shipping-methods",
      queryKey: "",
      multiple: false,
    },
  },

  [FulfillmentConditionField.STOCK_LEVEL]: {
    label: "Stok Seviyesi",
    description: "Ürün stok durumu",
    type: "enum",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
    meta: {
      enumType: "StockLevel",
      options: [
        { value: "OUT_OF_STOCK", label: "Stokta Yok" },
        { value: "LOW_STOCK", label: "Düşük Stok" },
        { value: "IN_STOCK", label: "Stokta Var" },
        { value: "HIGH_STOCK", label: "Yüksek Stok" },
      ],
    },
  },

  [FulfillmentConditionField.LOCATION_TYPE]: {
    label: "Lokasyon Tipi",
    description: "Fulfillment lokasyon tipi",
    type: "enum",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
    meta: {
      enumType: "LocationType",
      options: [
        { value: "WAREHOUSE", label: "Depo" },
        { value: "STORE", label: "Mağaza" },
        { value: "DROPSHIP", label: "Dropship" },
        { value: "VIRTUAL", label: "Sanal" },
      ],
    },
  },

  [FulfillmentConditionField.SUPPLIER_LEAD_TIME]: {
    label: "Tedarikçi Teslim Süresi",
    description: "Tedarikçiden teslim alma süresi (gün)",
    type: "numeric",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.GT,
      ConditionOperator.GTE,
      ConditionOperator.LT,
      ConditionOperator.LTE,
      ConditionOperator.BETWEEN,
    ],
  },
};

export const fulfillmentDomain: ConditionDomainConfig<
  FulfillmentConditionField,
  FulfillmentCondition,
  FulfillmentMeta
> = {
  name: "fulfillment",
  fields: FULFILLMENT_FIELDS,
  conditionSchema: FulfillmentConditionSchema,
  createEmptyCondition: (field) =>
    createGenericEmptyCondition<
      FulfillmentConditionField,
      FulfillmentCondition
    >(field, FULFILLMENT_FIELDS),
};

registerDomain(fulfillmentDomain);

export type { FulfillmentMeta };
