import { $Enums } from "@repo/database";
import * as z from "zod";

type AllowedDiscountedItemsBy = "price" | "discounted_price";
type FilterOperator = "AND" | "OR";

const idArraySchema = z
  .array(
    z.cuid2({
      error: "Geçerli bir ID formatı olmalıdır.",
    })
  )
  .min(1, { error: "En az bir öğe seçmelisiniz." });

// Filtre koşulu şeması
const FilterConditionSchema = z.object({
  operator: z.enum(["AND", "OR"] as FilterOperator[], {
    error: "Bu alan gereklidir.",
  }),
  productIds: idArraySchema.nullish(),
  variantIds: idArraySchema.nullish(),
  brandIds: idArraySchema.nullish(),
  categoryIds: idArraySchema.nullish(),
});

const ProductFilterSchema = z
  .object({
    isAllProducts: z.boolean(),
    conditions: z.array(FilterConditionSchema).nullish(),
  })
  .check(({ issues, value, aborted }) => {
    if (!value.isAllProducts) {
      // En az bir koşul olmalı
      if (!value.conditions || value.conditions.length === 0) {
        issues.push({
          code: "custom",
          path: ["conditions"],
          input: value.conditions,
          message:
            "Tüm ürünler seçili değilse, en az bir filtre koşulu eklemelisiniz.",
        });
        aborted = true;
        return;
      }

      // Her koşulda en az bir seçim yapılmalı
      value.conditions.forEach((condition, index) => {
        const hasSelection =
          (condition.productIds?.length ?? 0) > 0 ||
          (condition.variantIds?.length ?? 0) > 0 ||
          (condition.brandIds?.length ?? 0) > 0 ||
          (condition.categoryIds?.length ?? 0) > 0;

        if (!hasSelection) {
          issues.push({
            code: "custom",
            path: ["conditions", index],
            input: condition,
            message: `${index + 1}. koşulda en az bir filtre seçmelisiniz.`,
          });
          aborted = true;
        }
      });
    }
  });

const DiscountConditionSchema = z
  .object({
    isLimitPurchase: z.boolean(),
    minPurchaseAmount: z
      .number({ error: "Bu alan gereklidir." })
      .min(0, {
        error: 'Minimum satın alma tutarı "0" veya daha büyük olmalıdır.',
      })
      .max(Number.MAX_SAFE_INTEGER, {
        error: "Minimum satın alma tutarı çok büyük olamaz.",
      })
      .nullish(),
    maxPurchaseAmount: z
      .number({ error: "Bu alan gereklidir." })
      .min(0, {
        error: 'Maksimum satın alma tutarı "0" veya daha büyük olmalıdır.',
      })
      .max(Number.MAX_SAFE_INTEGER, {
        error: "Maksimum satın alma tutarı çok büyük olamaz.",
      })
      .nullish(),
    isLimitItemQuantity: z.boolean(),
    minItemQuantity: z
      .number({ error: "Bu alan gereklidir." })
      .int({ error: "Bu alan tam sayı olmalıdır." })
      .min(1, {
        error: "Minimum adet en az 1 olmalıdır.",
      })
      .nullish(),
    maxItemQuantity: z
      .number({ error: "Bu alan gereklidir." })
      .int({ error: "Bu alan tam sayı olmalıdır." })
      .min(1, { error: "Maksimum adet en az 1 olmalıdır." })
      .nullish(),
    allowDiscountedItems: z.boolean(),
    allowedDiscountedItemsBy: z
      .enum(["price", "discounted_price"] as AllowedDiscountedItemsBy[], {
        error: "Bu alan gereklidir.",
      })
      .nullish(),
  })
  .check(({ issues, value, aborted }) => {
    if (value.isLimitPurchase) {
      const hasMin = value.minPurchaseAmount != null;
      const hasMax = value.maxPurchaseAmount != null;

      if (!hasMin && !hasMax) {
        issues.push({
          code: "custom",
          path: ["minPurchaseAmount"],
          message: "En az bir limit (minimum veya maksimum) belirtmelisiniz.",
          input: value.minPurchaseAmount,
        });
        aborted = true;
      }

      if (
        hasMin &&
        hasMax &&
        value.maxPurchaseAmount <= value.minPurchaseAmount
      ) {
        issues.push({
          code: "custom",
          path: ["maxPurchaseAmount"],
          message:
            "Maksimum satın alma tutarı, minimum satın alma tutarından büyük olmalıdır.",
          input: value.maxPurchaseAmount,
        });
        aborted = true;
      }
    }

    if (value.isLimitItemQuantity) {
      const hasMinQty = value.minItemQuantity != null;
      const hasMaxQty = value.maxItemQuantity != null;

      if (!hasMinQty && !hasMaxQty) {
        issues.push({
          code: "custom",
          path: ["minItemQuantity"],
          input: value.minItemQuantity,
          message: "En az bir limit (minimum veya maksimum) belirtmelisiniz.",
        });
        aborted = true;
      }

      if (
        hasMinQty &&
        hasMaxQty &&
        value.maxItemQuantity <= value.minItemQuantity
      ) {
        issues.push({
          code: "custom",
          path: ["maxItemQuantity"],
          message: "Maksimum adet, minimum adetten büyük olmalıdır.",
          input: value.maxItemQuantity,
        });
        aborted = true;
      }
    }

    if (value.allowDiscountedItems) {
      if (value.allowedDiscountedItemsBy == null) {
        issues.push({
          code: "custom",
          path: ["allowedDiscountedItemsBy"],
          message:
            "İndirimli ürünler izin verildiğinde bir kural belirtmelisiniz.",
          input: value.allowedDiscountedItemsBy,
        });
        aborted = true;
      }
    }
  });

const DiscountSettingsSchema = z
  .object({
    mergeOtherCampaigns: z.boolean(),
    isLimitTotalUsage: z.boolean(),
    totalUsageLimit: z
      .number({ error: "Bu alan gereklidir." })
      .int({ error: "Bu alan tam sayı olmalıdır." })
      .min(1, {
        error: "Toplam kullanım limiti en az 1 olmalıdır.",
      })
      .max(Number.MAX_SAFE_INTEGER, {
        error: "Toplam kullanım limiti çok büyük olamaz.",
      })
      .nullish(),
    isLimitTotalUsagePerCustomer: z.boolean(),
    totalUsageLimitPerCustomer: z
      .number({ error: "Bu alan gereklidir." })
      .int({ error: "Bu alan tam sayı olmalıdır." })
      .min(1, {
        error: "Müşteri başına kullanım limiti en az 1 olmalıdır.",
      })
      .max(Number.MAX_SAFE_INTEGER, {
        error: "Müşteri başına kullanım limiti çok büyük olamaz.",
      })
      .nullish(),
  })
  .check(({ issues, value, aborted }) => {
    if (value.isLimitTotalUsage) {
      if (value.totalUsageLimit == null) {
        issues.push({
          code: "custom",
          path: ["totalUsageLimit"],
          input: value.totalUsageLimit,
          message: "Toplam kullanım limiti belirtmelisiniz.",
        });
        aborted = true;
      }
    }

    if (value.isLimitTotalUsagePerCustomer) {
      if (value.totalUsageLimitPerCustomer == null) {
        issues.push({
          code: "custom",
          path: ["totalUsageLimitPerCustomer"],
          input: value.totalUsageLimitPerCustomer,
          message: "Müşteri başına kullanım limiti belirtmelisiniz.",
        });
        aborted = true;
      }
    }

    if (
      value.isLimitTotalUsage &&
      value.isLimitTotalUsagePerCustomer &&
      value.totalUsageLimit != null &&
      value.totalUsageLimitPerCustomer != null
    ) {
      if (value.totalUsageLimitPerCustomer > value.totalUsageLimit) {
        issues.push({
          code: "custom",
          path: ["totalUsageLimitPerCustomer"],
          input: value.totalUsageLimitPerCustomer,
          message:
            "Müşteri başına kullanım limiti, toplam kullanım limitinden fazla olamaz.",
        });
        aborted = true;
      }
    }
  });

const DiscountCustomerSchema = z
  .object({
    allCustomers: z.boolean(),
    otherCustomers: idArraySchema.nullish(),
  })
  .check(({ issues, value, aborted }) => {
    if (!value.allCustomers) {
      if (!value.otherCustomers || value.otherCustomers.length === 0) {
        issues.push({
          code: "custom",
          path: ["otherCustomers"],
          input: value.otherCustomers,
          message: "En az bir müşteri seçmelisiniz.",
        });
        aborted = true;
      }
    }
  });

const SelectedCurrencies = z
  .array(z.enum($Enums.Currency))
  .min(1, {
    error: "En az bir para birimi seçmelisiniz.",
  })
  .max(Object.values($Enums.Currency).length, {
    error: "Çok fazla para birimi seçemezsiniz.",
  })
  .refine(
    (currencies) => {
      const uniqueCurrencies = new Set(currencies);
      return uniqueCurrencies.size === currencies.length;
    },
    {
      error: "Para birimleri benzersiz olmalıdır.",
    }
  );

const DiscountDates = z
  .object({
    addStartDate: z.boolean(),
    startDate: z.date({ error: "Bu alan gereklidir." }).nullish(),
    addEndDate: z.boolean(),
    endDate: z.date({ error: "Bu alan gereklidir." }).nullish(),
  })
  .check(({ issues, value, aborted }) => {
    if (value.addStartDate) {
      if (value.startDate == null) {
        issues.push({
          code: "custom",
          path: ["startDate"],
          input: value.startDate,
          message: "Başlangıç tarihi belirtmelisiniz.",
        });
        aborted = true;
      }
    }

    if (value.addEndDate) {
      if (value.endDate == null) {
        issues.push({
          code: "custom",
          path: ["endDate"],
          input: value.endDate,
          message: "Bitiş tarihi belirtmelisiniz.",
        });
        aborted = true;
      }
    }

    if (
      value.addStartDate &&
      value.addEndDate &&
      value.startDate != null &&
      value.endDate != null
    ) {
      if (value.endDate <= value.startDate) {
        issues.push({
          code: "custom",
          path: ["endDate"],
          input: value.endDate,
          message: "Bitiş tarihi, başlangıç tarihinden sonra olmalıdır.",
        });
        aborted = true;
      }
    }
  });

const BaseDiscountSchema = z.object({
  title: z
    .string({ error: "Bu alan gereklidir." })
    .min(1, { error: "Bu alan gereklidir." })
    .max(256, { error: "Başlık en fazla 256 karakter olabilir." }),
  currencies: SelectedCurrencies,
  dates: DiscountDates,
  customerSchema: DiscountCustomerSchema,
  settings: DiscountSettingsSchema,
  conditions: DiscountConditionSchema,
});

const PercentageTierSchema = z.object({
  minQuantity: z
    .number({ error: "Bu alan gereklidir." })
    .int({ error: "Bu alan gereklidir." })
    .min(1, {
      error: "Minimum adet en az 1 olmalıdır.",
    }),
  discountPercentage: z
    .number({ error: "Bu alan gereklidir." })
    .int({ error: "Bu alan gereklidir." })
    .min(1, { error: "Yüzde değeri en az 1 olmalıdır." })
    .max(99, { error: "Yüzde değeri en fazla 99 olabilir." }),
});

const FixedTierSchema = z.object({
  minQuantity: z
    .number({ error: "Bu alan gereklidir." })
    .int({ error: "Bu alan gereklidir." })
    .min(1, {
      error: "Minimum adet en az 1 olmalıdır.",
    }),
  discountAmount: z.number({ error: "Bu alan gereklidir." }).min(0.01, {
    error: "İndirim tutarı 0'dan büyük olmalıdır.",
  }),
});

export const MainDiscountSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal<$Enums.DiscountType>("PERCENTAGE"),
    isGrowDiscount: z.literal(false),
    discountValue: z
      .number({ error: "Bu alan gereklidir." })
      .int({ error: "Tam sayı olmalıdır." })
      .min(1, { error: "Yüzde değeri en az 1 olmalıdır." })
      .max(99, { error: "Yüzde değeri en fazla 99 olabilir." }),
    ...BaseDiscountSchema.shape,
    ...ProductFilterSchema.shape,
  }),

  z.object({
    type: z.literal<$Enums.DiscountType>("PERCENTAGE"),
    isGrowDiscount: z.literal(true),
    tiers: z
      .array(PercentageTierSchema)
      .min(2, { error: "Katlı indirim için en az 2 kademe gereklidir." })
      .refine(
        (tiers) => {
          for (let i = 1; i < tiers.length; i++) {
            if (tiers[i].minQuantity <= tiers[i - 1].minQuantity) {
              return false;
            }
          }
          return true;
        },
        { error: "Kademeler artan sırada olmalıdır." }
      )
      .refine(
        (tiers) => {
          for (let i = 1; i < tiers.length; i++) {
            if (
              tiers[i].discountPercentage <= tiers[i - 1].discountPercentage
            ) {
              return false;
            }
          }
          return true;
        },
        { error: "İndirim yüzdeleri artan sırada olmalıdır." }
      ),
    ...BaseDiscountSchema.shape,
    ...ProductFilterSchema.shape,
  }),

  // Fixed - Simple
  z.object({
    type: z.literal<$Enums.DiscountType>("FIXED_AMOUNT"),
    isGrowDiscount: z.literal(false),
    discountAmount: z
      .number({ error: "Bu alan gereklidir." })
      .min(0.01, { error: "İndirim tutarı 0'dan büyük olmalıdır." }),
    ...BaseDiscountSchema.shape,
    ...ProductFilterSchema.shape,
  }),

  // Fixed - Tiered
  z.object({
    type: z.literal<$Enums.DiscountType>("FIXED_AMOUNT"),
    isGrowDiscount: z.literal(true),
    tiers: z
      .array(FixedTierSchema)
      .min(2, { error: "Katlı indirim için en az 2 kademe gereklidir." })
      .refine(
        (tiers) => {
          for (let i = 1; i < tiers.length; i++) {
            if (tiers[i].minQuantity <= tiers[i - 1].minQuantity) {
              return false;
            }
          }
          return true;
        },
        { error: "Kademeler artan sırada olmalıdır." }
      )
      .refine(
        (tiers) => {
          for (let i = 1; i < tiers.length; i++) {
            if (tiers[i].discountAmount <= tiers[i - 1].discountAmount) {
              return false;
            }
          }
          return true;
        },
        { error: "İndirim tutarları artan sırada olmalıdır." }
      ),
    ...BaseDiscountSchema.shape,
    ...ProductFilterSchema.shape,
  }),

  z.object({
    type: z.literal<$Enums.DiscountType>("FREE_SHIPPING"),
  }),

  z.object({
    type: z.literal<$Enums.DiscountType>("BUY_X_GET_Y"),
  }),
]);

export const MainDiscountSchemaDefaultValue: MainDiscount = {
  type: "PERCENTAGE",
  title: "",
  isAllProducts: true,
  isGrowDiscount: false,
  currencies: ["TRY"],
  conditions: null,
  customerSchema: { allCustomers: true, otherCustomers: null },
  dates: {
    addEndDate: false,
    startDate: null,
    endDate: null,
    addStartDate: false,
  },
  discountValue: 0,
  settings: {
    isLimitTotalUsage: false,
    isLimitTotalUsagePerCustomer: false,
    mergeOtherCampaigns: false,
    totalUsageLimit: null,
    totalUsageLimitPerCustomer: null,
  },
};

export type MainDiscount = z.infer<typeof MainDiscountSchema>;
export type FilterCondition = z.infer<typeof FilterConditionSchema>;
export type ProductFilter = z.infer<typeof ProductFilterSchema>;
