import {
  AccountStatus,
  RegistrationSource,
  SubscriptionStatus,
} from "@repo/database/client";
import {
  ConditionDomainConfig,
  ConditionOperator,
  createGenericEmptyCondition,
  CustomerGroupSmartFields,
  EnumFieldMeta,
  FieldConfig,
  LocationFieldMeta,
  registerDomain,
  RelationFieldMeta,
} from "../common";
import {
  SegmentCondition,
  SegmentConditionSchema,
} from "./customers-zod-schemas";

type CustomerSegmentMeta =
  | EnumFieldMeta
  | RelationFieldMeta
  | LocationFieldMeta;

export const CUSTOMER_SEGMENT_FIELDS: Record<
  CustomerGroupSmartFields,
  FieldConfig<CustomerSegmentMeta>
> = {
  [CustomerGroupSmartFields.ORDER_COUNT]: {
    label: "Sipariş Sayısı",
    description: "Toplam sipariş adedi",
    type: "numeric",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.GT,
      ConditionOperator.GTE,
      ConditionOperator.LT,
      ConditionOperator.LTE,
      ConditionOperator.BETWEEN,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
  },
  [CustomerGroupSmartFields.TOTAL_SPENT]: {
    label: "Toplam Harcama",
    description: "Toplam harcanan tutar",
    type: "numeric",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.GT,
      ConditionOperator.GTE,
      ConditionOperator.LT,
      ConditionOperator.LTE,
      ConditionOperator.BETWEEN,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
  },
  [CustomerGroupSmartFields.AVERAGE_ORDER_VALUE]: {
    label: "Ortalama Sipariş Tutarı",
    description: "Ortalama sipariş değeri",
    type: "numeric",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.GT,
      ConditionOperator.GTE,
      ConditionOperator.LT,
      ConditionOperator.LTE,
      ConditionOperator.BETWEEN,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
  },

  [CustomerGroupSmartFields.LAST_ORDER_DATE]: {
    label: "Son Sipariş Tarihi",
    description: "En son sipariş verilen tarih",
    type: "date",
    operators: [
      ConditionOperator.BEFORE,
      ConditionOperator.AFTER,
      ConditionOperator.ON_DATE,
      ConditionOperator.BETWEEN,
      ConditionOperator.WITHIN_LAST,
      ConditionOperator.NOT_WITHIN_LAST,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
  },
  [CustomerGroupSmartFields.FIRST_ORDER_DATE]: {
    label: "İlk Sipariş Tarihi",
    description: "İlk sipariş verilen tarih",
    type: "date",
    operators: [
      ConditionOperator.BEFORE,
      ConditionOperator.AFTER,
      ConditionOperator.ON_DATE,
      ConditionOperator.BETWEEN,
      ConditionOperator.WITHIN_LAST,
      ConditionOperator.NOT_WITHIN_LAST,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
  },
  [CustomerGroupSmartFields.CREATED_AT]: {
    label: "Kayıt Tarihi",
    description: "Müşteri kayıt tarihi",
    type: "date",
    operators: [
      ConditionOperator.BEFORE,
      ConditionOperator.AFTER,
      ConditionOperator.ON_DATE,
      ConditionOperator.BETWEEN,
      ConditionOperator.WITHIN_LAST,
      ConditionOperator.NOT_WITHIN_LAST,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
  },
  [CustomerGroupSmartFields.EMAIL_VERIFIED_AT]: {
    label: "E-posta Doğrulama Tarihi",
    description: "E-posta doğrulama tarihi",
    type: "date",
    operators: [
      ConditionOperator.BEFORE,
      ConditionOperator.AFTER,
      ConditionOperator.ON_DATE,
      ConditionOperator.BETWEEN,
      ConditionOperator.WITHIN_LAST,
      ConditionOperator.NOT_WITHIN_LAST,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
  },
  [CustomerGroupSmartFields.PHONE_VERIFIED_AT]: {
    label: "Telefon Doğrulama Tarihi",
    description: "Telefon doğrulama tarihi",
    type: "date",
    operators: [
      ConditionOperator.BEFORE,
      ConditionOperator.AFTER,
      ConditionOperator.ON_DATE,
      ConditionOperator.BETWEEN,
      ConditionOperator.WITHIN_LAST,
      ConditionOperator.NOT_WITHIN_LAST,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
  },

  [CustomerGroupSmartFields.IS_EMAIL_VERIFIED]: {
    label: "E-posta Doğrulandı",
    description: "E-posta adresi doğrulandı mı",
    type: "boolean",
    operators: [
      ConditionOperator.IS_TRUE,
      ConditionOperator.IS_FALSE,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
  },
  [CustomerGroupSmartFields.IS_PHONE_VERIFIED]: {
    label: "Telefon Doğrulandı",
    description: "Telefon numarası doğrulandı mı",
    type: "boolean",
    operators: [
      ConditionOperator.IS_TRUE,
      ConditionOperator.IS_FALSE,
      ConditionOperator.IS_NULL,
      ConditionOperator.IS_NOT_NULL,
    ],
  },
  [CustomerGroupSmartFields.HAS_ORDERS]: {
    label: "Siparişi Var",
    description: "En az bir siparişi var mı",
    type: "boolean",
    operators: [ConditionOperator.IS_TRUE, ConditionOperator.IS_FALSE],
  },
  [CustomerGroupSmartFields.HAS_ADDRESS]: {
    label: "Adresi Var",
    description: "Kayıtlı adresi var mı",
    type: "boolean",
    operators: [ConditionOperator.IS_TRUE, ConditionOperator.IS_FALSE],
  },

  [CustomerGroupSmartFields.ACCOUNT_STATUS]: {
    label: "Hesap Durumu",
    description: "Müşteri hesap durumu",
    type: "enum",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
    meta: {
      enumType: "AccountStatus",
      options: Object.values(AccountStatus).map((status) => ({
        value: status,
        label: getAccountStatusLabel(status),
      })),
    },
  },
  [CustomerGroupSmartFields.REGISTRATION_SOURCE]: {
    label: "Kayıt Kaynağı",
    description: "Müşterinin kayıt olduğu kaynak",
    type: "enum",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
    meta: {
      enumType: "RegistrationSource",
      options: Object.values(RegistrationSource).map((source) => ({
        value: source,
        label: getRegistrationSourceLabel(source),
      })),
    },
  },
  [CustomerGroupSmartFields.SUBSCRIPTION_STATUS]: {
    label: "Abonelik Durumu",
    description: "Bülten abonelik durumu",
    type: "enum",
    operators: [
      ConditionOperator.EQ,
      ConditionOperator.NEQ,
      ConditionOperator.IN,
      ConditionOperator.NOT_IN,
    ],
    meta: {
      enumType: "SubscriptionStatus",
      options: Object.values(SubscriptionStatus).map((status) => ({
        value: status,
        label: getSubscriptionStatusLabel(status),
      })),
    },
  },

  [CustomerGroupSmartFields.CUSTOMER_TAGS]: {
    label: "Müşteri Etiketleri",
    description: "Müşteriye atanan etiketler",
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
  [CustomerGroupSmartFields.CUSTOMER_GROUPS]: {
    label: "Müşteri Grupları",
    description: "Müşterinin dahil olduğu gruplar",
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
  [CustomerGroupSmartFields.PRICE_LIST]: {
    label: "Fiyat Listesi",
    description: "Müşteriye atanan fiyat listesi",
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
      queryKey: "price-lists",
      endpoint: "/api/price-lists",
      multiple: false,
    },
  },

  [CustomerGroupSmartFields.COUNTRY]: {
    label: "Ülke",
    description: "Müşteri adresi ülkesi",
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
  [CustomerGroupSmartFields.STATE]: {
    label: "İl/Eyalet",
    description: "Müşteri adresi ili",
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
      dependsOn: [CustomerGroupSmartFields.COUNTRY],
    },
  },
  [CustomerGroupSmartFields.CITY]: {
    label: "İlçe/Şehir",
    description: "Müşteri adresi ilçesi",
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
      dependsOn: [CustomerGroupSmartFields.COUNTRY],
    },
  },
  [CustomerGroupSmartFields.DISTRICT]: {
    label: "Mahalle/Semt",
    description: "Müşteri adresi mahallesi",
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
      locationType: "district",
      dependsOn: [
        CustomerGroupSmartFields.COUNTRY,
        CustomerGroupSmartFields.CITY,
      ],
    },
  },
};

function getAccountStatusLabel(status: AccountStatus): string {
  const labels: Record<AccountStatus, string> = {
    [AccountStatus.ACTIVE]: "Aktif",
    [AccountStatus.PASSIVE]: "Pasif",
    [AccountStatus.BANNED]: "Yasaklı",
    [AccountStatus.PENDING_APPROVAL]: "Beklemede",
  };
  return labels[status] ?? status;
}

function getRegistrationSourceLabel(source: RegistrationSource): string {
  const labels: Record<RegistrationSource, string> = {
    [RegistrationSource.WEB_REGISTER]: "Web Kayıt",
    [RegistrationSource.ADMIN_PANEL]: "Admin Panel",
    [RegistrationSource.IMPORT_EXCEL]: "İçe Aktarım",
    [RegistrationSource.API]: "API",
    [RegistrationSource.CHECKOUT_GUEST]: "Ödeme Sayfası",
    [RegistrationSource.PROVIDER_OAUTH]: "Sağlayıcı OAuth",
  };
  return labels[source] ?? source;
}

function getSubscriptionStatusLabel(status: SubscriptionStatus): string {
  const labels: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.SUBSCRIBED]: "Abone",
    [SubscriptionStatus.UNSUBSCRIBED]: "Abonelikten Çıkmış",
    [SubscriptionStatus.PENDING]: "Beklemede",
  };
  return labels[status] ?? status;
}

export const customerSegmentDomain: ConditionDomainConfig<
  CustomerGroupSmartFields,
  SegmentCondition,
  CustomerSegmentMeta
> = {
  name: "customerSegment",
  fields: CUSTOMER_SEGMENT_FIELDS,
  conditionSchema: SegmentConditionSchema,
  createEmptyCondition: (field) =>
    createGenericEmptyCondition<CustomerGroupSmartFields, SegmentCondition>(
      field,
      CUSTOMER_SEGMENT_FIELDS,
    ),
};

registerDomain(customerSegmentDomain);

export {
  getAccountStatusLabel,
  getRegistrationSourceLabel,
  getSubscriptionStatusLabel,
};
