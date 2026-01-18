import { StoreType } from "@repo/database/client";
import {
  ConditionDomainConfig,
  ConditionOperator,
  createGenericEmptyCondition,
  EnumFieldMeta,
  FieldConfig,
  LocationFieldMeta,
  PaymentRuleConditionField,
  registerDomain,
  RelationFieldMeta,
} from "../common";
import {
  PaymentRuleCondition,
  PaymentRuleConditionSchema,
} from "./payment-rules-zod-schemas";

type PaymentRuleMeta = EnumFieldMeta | RelationFieldMeta | LocationFieldMeta;

export const PAYMENT_RULE_FIELDS: Record<
  PaymentRuleConditionField,
  FieldConfig<PaymentRuleMeta>
> = {
  [PaymentRuleConditionField.CART_TOTAL]: {
    label: "Sepet Tutarı",
    description: "Toplam sepet tutarı",
    type: "numeric",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.GT,
      ConditionOperator.GTE,
      ConditionOperator.LT,
      ConditionOperator.LTE,
      ConditionOperator.BETWEEN,
    ],
  },
  [PaymentRuleConditionField.CART_ITEM_COUNT]: {
    label: "Ürün Sayısı",
    description: "Sepetteki toplam ürün sayısı",
    type: "numeric",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.GT,
      ConditionOperator.GTE,
      ConditionOperator.LT,
      ConditionOperator.LTE,
      ConditionOperator.BETWEEN,
    ],
  },

  [PaymentRuleConditionField.IS_FIRST_ORDER]: {
    label: "İlk Sipariş mi?",
    description: "Müşterinin ilk siparişi mi kontrol eder",
    type: "boolean",
    operators: [ConditionOperator.IS_TRUE, ConditionOperator.IS_FALSE],
  },
  [PaymentRuleConditionField.CUSTOMER_TYPE]: {
    label: "Müşteri Tipi",
    description: "B2B veya B2C müşteri tipi",
    type: "enum",
    operators: [ConditionOperator.EQ, ConditionOperator.NEQ],
    meta: {
      enumType: "StoreType",
      options: Object.values(StoreType).map((type) => ({
        value: type,
        label: getStoreTypeLabel(type),
      })),
    },
  },
  [PaymentRuleConditionField.CUSTOMER_GROUP]: {
    label: "Müşteri Grubu",
    description: "Manuel müşteri grubu",
    type: "relation",
    operators: [
      ConditionOperator.HAS_ANY,
      ConditionOperator.HAS_ALL,
      ConditionOperator.HAS_NONE,
      ConditionOperator.EXISTS,
      ConditionOperator.NOT_EXISTS,
    ],
    meta: {
      queryKey: "customer-groups",
      endpoint: "/admin/users/customer-groups",
      multiple: true,
    },
  },
  [PaymentRuleConditionField.CUSTOMER_GROUP_SMART]: {
    label: "Dinamik Müşteri Grubu",
    description: "Koşul tabanlı dinamik müşteri grubu",
    type: "relation",
    operators: [
      ConditionOperator.HAS_ANY,
      ConditionOperator.HAS_ALL,
      ConditionOperator.HAS_NONE,
      ConditionOperator.EXISTS,
      ConditionOperator.NOT_EXISTS,
    ],
    meta: {
      queryKey: "customer-groups-smart",
      endpoint: "/admin/users/customer-groups?type=SMART",
      multiple: true,
    },
  },

  [PaymentRuleConditionField.SHIPPING_COUNTRY]: {
    label: "Teslimat Ülkesi",
    description: "Teslimat adresi ülkesi",
    type: "location",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
    meta: {
      locationType: "country",
    },
  },
  [PaymentRuleConditionField.SHIPPING_STATE]: {
    label: "Teslimat İli",
    description: "Teslimat adresi ili",
    type: "location",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
    meta: {
      locationType: "state",
      dependsOn: [PaymentRuleConditionField.SHIPPING_COUNTRY],
    },
  },
  [PaymentRuleConditionField.SHIPPING_CITY]: {
    label: "Teslimat İlçesi",
    description: "Teslimat adresi ilçesi",
    type: "location",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
    meta: {
      locationType: "city",
      dependsOn: [PaymentRuleConditionField.SHIPPING_COUNTRY],
    },
  },
  [PaymentRuleConditionField.SHIPPING_DISTRICT]: {
    label: "Teslimat Mahallesi",
    description: "Teslimat adresi mahallesi",
    type: "location",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
    meta: {
      locationType: "district",
      dependsOn: [
        PaymentRuleConditionField.SHIPPING_COUNTRY,
        PaymentRuleConditionField.SHIPPING_CITY,
      ],
    },
  },
};

function getStoreTypeLabel(type: StoreType): string {
  const labels: Record<StoreType, string> = {
    [StoreType.B2C]: "B2C (Son Kullanıcı)",
    [StoreType.B2B]: "B2B (Bayi)",
  };
  return labels[type] ?? type;
}

export const paymentRuleDomain: ConditionDomainConfig<
  PaymentRuleConditionField,
  PaymentRuleCondition,
  PaymentRuleMeta
> = {
  name: "paymentRule",
  fields: PAYMENT_RULE_FIELDS,
  conditionSchema: PaymentRuleConditionSchema,
  createEmptyCondition: (field) =>
    createGenericEmptyCondition<
      PaymentRuleConditionField,
      PaymentRuleCondition
    >(field, PAYMENT_RULE_FIELDS),
};

registerDomain(paymentRuleDomain);

export { getStoreTypeLabel };
