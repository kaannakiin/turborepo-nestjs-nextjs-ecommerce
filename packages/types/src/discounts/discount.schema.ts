import {
  AllowedDiscountedItemsBy,
  CampaignStatus,
  Currency,
  DiscountConditionType,
  DiscountType,
  FilterOperator,
  Prisma,
} from "@repo/database/client";
import { isAfter, isValid, parseISO } from "date-fns";
import * as z from "zod";
const idArraySchema = z
  .array(
    z.cuid2({
      message: "Geçerli bir ID formatı olmalıdır.",
    })
  )
  .min(1, { message: "En az bir öğe seçmelisiniz." });

export const FilterConditionSchema = z.object({
  operator: z.enum(FilterOperator, {
    error: "Bu alan gereklidir.",
  }),
  type: z
    .enum(DiscountConditionType, {
      error: "Bu alan gereklidir.",
    })
    .nullish(),
  ids: idArraySchema.nullish(),
  subIds: idArraySchema.nullish(),
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
      .enum(AllowedDiscountedItemsBy, {
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

export const CouponSchema = z.object({
  couponName: z
    .string({ error: "Bu alan gereklidir." })
    .min(3, { message: "Kupon adı en az 3 karakter olmalıdır." })
    .max(50, { message: "Kupon adı en fazla 50 karakter olabilir." })
    .regex(/^[^\s]+$/, { message: "Kupon adı boşluk içeremez." }),
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
          message:
            "Tüm müşteriler seçili değilse, en az bir müşteri seçmelisiniz.",
        });
        aborted = true;
      }
    }
  });

export const DiscountDatesSchema = z
  .object({
    addStartDate: z.boolean(),
    startDate: z
      .string()
      .refine((date) => isValid(parseISO(date)), {
        message: "Geçerli bir tarih formatı giriniz.",
      })
      .nullish(),
    addEndDate: z.boolean(),
    endDate: z
      .string()
      .refine((date) => isValid(parseISO(date)), {
        message: "Geçerli bir tarih formatı giriniz.",
      })
      .nullish(),
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
      const startDateParsed = parseISO(value.startDate);
      const endDateParsed = parseISO(value.endDate);

      if (!isAfter(endDateParsed, startDateParsed)) {
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

const BaseDiscountSchema = z
  .object({
    uniqueId: z.cuid2().nullish(),
    status: z.enum(CampaignStatus, {
      error: "Bu alan gereklidir.",
    }),
    title: z
      .string({ error: "Bu alan gereklidir." })
      .min(3, { error: "Başlık en az 3 karakter olmalıdır." })
      .max(100, { error: "Başlık en fazla 100 karakter olabilir." }),
    currencies: z
      .array(
        z.enum(Currency, {
          error: "Geçerli bir para birimi olmalıdır.",
        })
      )
      .min(1, { error: "En az bir para birimi seçmelisiniz." })
      .refine(
        (val) => {
          const uniqueValues = new Set(val);
          return uniqueValues.size === val.length;
        },
        {
          error: "Para birimleri benzersiz olmalıdır.",
        }
      ),
    ...DiscountCustomerSchema.shape,
    ...DiscountDatesSchema.shape,
    ...DiscountConditionSchema.shape,
    ...DiscountSettingsSchema.shape,
    conditions: z
      .object({
        isAllProducts: z.boolean(),
        conditions: z.array(FilterConditionSchema).nullish(),
      })
      .refine(
        (data) => {
          if (data.isAllProducts) return true;
          return data.conditions != null && data.conditions.length > 0;
        },
        {
          error: "Ürünler için geçerli koşullar belirtmelisiniz.",
        }
      ),
    coupons: z
      .array(CouponSchema, { error: "Bu alan gereklidir." })
      .min(1, { error: "En az bir kupon eklemelisiniz." })
      .refine(
        (coupons) => {
          const couponNames = coupons.map((c) => c.couponName.toLowerCase());
          const uniqueCouponNames = new Set(couponNames);
          return uniqueCouponNames.size === couponNames.length;
        },
        {
          error: "Kupon adları benzersiz olmalıdır.",
        }
      ),
  })
  .check(({ issues, value, aborted }) => {
    if (!value.conditions || value.conditions.conditions.length === 0) return;

    value.conditions.conditions.forEach((condition, index) => {
      if (!condition.type) return;

      const hasIds = condition.ids && condition.ids.length > 0;
      const hasVariantIds = condition.subIds && condition.subIds.length > 0;

      switch (condition.type) {
        case "PRODUCT":
          if (!hasIds && !hasVariantIds) {
            issues.push({
              code: "custom",
              message:
                "Ürün seçimi için en az bir ürün veya varyant seçmelisiniz.",
              path: ["conditions", "conditions", index, "ids"],
              input: condition.ids,
            });
          }
          break;

        case "CATEGORY":
        case "BRAND":
          if (!hasIds) {
            issues.push({
              code: "custom",
              message: `${condition.type} seçimi için en az bir öğe seçmelisiniz.`,
              path: ["conditions", "conditions", index, "ids"],
              input: condition.ids,
            });
          }
          break;
      }
    });
  });

// Tier şemaları
const PercentageTierByQuantitySchema = z
  .object({
    minQuantity: z
      .number({ error: "Bu alan gereklidir." })
      .int({ error: "Bu alan tam sayı olmalıdır." })
      .min(1, { error: "Minimum adet en az 1 olmalıdır." }),
    maxQuantity: z
      .number({ error: "Bu alan gereklidir." })
      .int({ error: "Bu alan tam sayı olmalıdır." })
      .min(1, { error: "Maksimum adet en az 1 olmalıdır." })
      .nullish(),
    discountPercentage: z
      .number({ error: "Bu alan gereklidir." })
      .min(0.01, { error: "İndirim yüzdesi 0'dan büyük olmalıdır." })
      .max(100, { error: "İndirim yüzdesi 100'den büyük olamaz." }),
  })
  .check(({ issues, value, aborted }) => {
    if (value.maxQuantity != null && value.maxQuantity <= value.minQuantity) {
      issues.push({
        code: "custom",
        path: ["maxQuantity"],
        input: value.maxQuantity,
        message: "Maksimum adet, minimum adetten büyük olmalıdır.",
      });
      aborted = true;
    }
  });

const PercentageTierByPriceSchema = z
  .object({
    minAmount: z
      .number({ error: "Bu alan gereklidir." })
      .min(0, { error: "Minimum tutar 0 veya daha büyük olmalıdır." }),
    maxAmount: z
      .number({ error: "Bu alan gereklidir." })
      .min(0, { error: "Maksimum tutar 0 veya daha büyük olmalıdır." })
      .nullish(),
    discountPercentage: z
      .number({ error: "Bu alan gereklidir." })
      .min(0.01, { error: "İndirim yüzdesi 0'dan büyük olmalıdır." })
      .max(100, { error: "İndirim yüzdesi 100'den büyük olamaz." }),
  })
  .check(({ issues, value, aborted }) => {
    if (value.maxAmount != null && value.maxAmount <= value.minAmount) {
      issues.push({
        code: "custom",
        path: ["maxAmount"],
        input: value.maxAmount,
        message: "Maksimum tutar, minimum tutardan büyük olmalıdır.",
      });
      aborted = true;
    }
  });

const FixedTierByQuantitySchema = z
  .object({
    minQuantity: z
      .number({ error: "Bu alan gereklidir." })
      .int({ error: "Bu alan tam sayı olmalıdır." })
      .min(1, { error: "Minimum adet en az 1 olmalıdır." }),
    maxQuantity: z
      .number({ error: "Bu alan gereklidir." })
      .int({ error: "Bu alan tam sayı olmalıdır." })
      .min(1, { error: "Maksimum adet en az 1 olmalıdır." })
      .nullish(),
    discountAmount: z
      .number({ error: "Bu alan gereklidir." })
      .min(0.01, { error: "İndirim tutarı 0'dan büyük olmalıdır." }),
  })
  .check(({ issues, value, aborted }) => {
    if (value.maxQuantity != null && value.maxQuantity <= value.minQuantity) {
      issues.push({
        code: "custom",
        path: ["maxQuantity"],
        input: value.maxQuantity,
        message: "Maksimum adet, minimum adetten büyük olmalıdır.",
      });
      aborted = true;
    }
  });

const FixedTierByPriceSchema = z
  .object({
    minAmount: z
      .number({ error: "Bu alan gereklidir." })
      .min(0, { error: "Minimum tutar 0 veya daha büyük olmalıdır." }),
    maxAmount: z
      .number({ error: "Bu alan gereklidir." })
      .min(0, { error: "Maksimum tutar 0 veya daha büyük olmalıdır." })
      .nullish(),
    discountAmount: z
      .number({ error: "Bu alan gereklidir." })
      .min(0.01, { error: "İndirim tutarı 0'dan büyük olmalıdır." }),
  })
  .check(({ issues, value, aborted }) => {
    if (value.maxAmount != null && value.maxAmount <= value.minAmount) {
      issues.push({
        code: "custom",
        path: ["maxAmount"],
        input: value.maxAmount,
        message: "Maksimum tutar, minimum tutardan büyük olmalıdır.",
      });
      aborted = true;
    }
  });

/**
 * Adet bazlı tier validasyonu
 * Kontroller:
 * 1. minQuantity değerleri artan sırada olmalı
 * 2. Aynı minQuantity değeri tekrar etmemeli
 * 3. maxQuantity + 1 = next minQuantity (süreklilik)
 * 4. Son tier dışında maxQuantity olmalı
 * 5. İndirim değerleri artan sırada olmalı
 */
function validateQuantityTiers<
  T extends { minQuantity: number; maxQuantity?: number | null },
>(tiers: T[], discountField: keyof T, issues: any[]): void {
  if (!tiers || !tiers.length) return;
  const sortedTiers = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);

  // İlk tierın minQuantity 1 olmalı
  if (sortedTiers[0].minQuantity !== 1) {
    issues.push({
      code: "custom",
      path: ["tiers", 0],
      input: sortedTiers[0],
      message: "İlk kademenin minimum adeti 1 olmalıdır.",
    });
    return;
  }

  for (let i = 0; i < sortedTiers.length; i++) {
    const currentTier = sortedTiers[i];
    const nextTier = sortedTiers[i + 1];

    // ✅ Tekrar eden minQuantity kontrolü
    if (i > 0 && currentTier.minQuantity === sortedTiers[i - 1].minQuantity) {
      issues.push({
        code: "custom",
        path: ["tiers"],
        input: tiers,
        message: `İki kademe aynı minimum adete (${currentTier.minQuantity}) sahip olamaz.`,
      });
      return;
    }

    // ✅ Son tier kontrolü (sadece son tier maxQuantity null olabilir)
    if (currentTier.maxQuantity == null && i < sortedTiers.length - 1) {
      issues.push({
        code: "custom",
        path: ["tiers", i],
        input: currentTier,
        message: `${i + 1}. kademe: Maksimum adet belirtilmeyen kademe sadece son kademe olabilir.`,
      });
      return;
    }

    // ✅ Süreklilik kontrolü (bir sonraki tier varsa)
    if (nextTier && currentTier.maxQuantity != null) {
      // maxQuantity + 1 = nextMinQuantity olmalı
      if (currentTier.maxQuantity + 1 !== nextTier.minQuantity) {
        issues.push({
          code: "custom",
          path: ["tiers", i],
          input: currentTier,
          message: `${i + 1}. kademe ile ${i + 2}. kademe arasında süreksizlik var. ${i + 1}. kademenin bitişi (${currentTier.maxQuantity}), ${i + 2}. kademenin başlangıcından (${nextTier.minQuantity}) 1 eksik olmalıdır.`,
        });
        return;
      }
    }

    // ✅ İndirim değerlerinin artan sırada olması
    if (nextTier) {
      const currentDiscount = currentTier[discountField] as number;
      const nextDiscount = nextTier[discountField] as number;

      if (currentDiscount >= nextDiscount) {
        const fieldName =
          discountField === "discountPercentage"
            ? "İndirim yüzdeleri"
            : "İndirim tutarları";
        issues.push({
          code: "custom",
          path: ["tiers", i],
          input: currentTier,
          message: `${fieldName} artan sırada olmalıdır. ${i + 1}. kademe (${currentDiscount}) >= ${i + 2}. kademe (${nextDiscount})`,
        });
        return;
      }
    }

    // ✅ maxQuantity >= minQuantity kontrolü (her tier için)
    if (
      currentTier.maxQuantity != null &&
      currentTier.maxQuantity < currentTier.minQuantity
    ) {
      issues.push({
        code: "custom",
        path: ["tiers", i],
        input: currentTier,
        message: `${i + 1}. kademe: Maksimum adet (${currentTier.maxQuantity}), minimum adetten (${currentTier.minQuantity}) küçük olamaz.`,
      });
      return;
    }
  }
}

/**
 * Fiyat bazlı tier validasyonu
 * Kontroller:
 * 1. minAmount değerleri artan sırada olmalı
 * 2. Aynı minAmount değeri tekrar etmemeli
 * 3. maxAmount < next minAmount (çakışma olmamalı)
 * 4. Son tier dışında maxAmount olmalı
 * 5. İndirim değerleri artan sırada olmalı
 */
function validatePriceTiers<
  T extends { minAmount: number; maxAmount?: number | null },
>(tiers: T[], discountField: keyof T, issues: any[]): void {
  // Önce minAmount'a göre sırala
  const sortedTiers = [...tiers].sort((a, b) => a.minAmount - b.minAmount);

  // İlk tierın minAmount 0 olmalı
  if (sortedTiers[0].minAmount !== 0) {
    issues.push({
      code: "custom",
      path: ["tiers", 0],
      input: sortedTiers[0],
      message: "İlk kademenin minimum tutarı 0 olmalıdır.",
    });
    return;
  }

  for (let i = 0; i < sortedTiers.length; i++) {
    const currentTier = sortedTiers[i];
    const nextTier = sortedTiers[i + 1];

    // ✅ Tekrar eden minAmount kontrolü
    if (i > 0 && currentTier.minAmount === sortedTiers[i - 1].minAmount) {
      issues.push({
        code: "custom",
        path: ["tiers"],
        input: tiers,
        message: `İki kademe aynı minimum tutara (${currentTier.minAmount}) sahip olamaz.`,
      });
      return;
    }

    // ✅ Son tier kontrolü (sadece son tier maxAmount null olabilir)
    if (currentTier.maxAmount == null && i < sortedTiers.length - 1) {
      issues.push({
        code: "custom",
        path: ["tiers", i],
        input: currentTier,
        message: `${i + 1}. kademe: Maksimum tutar belirtilmeyen kademe sadece son kademe olabilir.`,
      });
      return;
    }

    // ✅ Çakışma kontrolü (bir sonraki tier varsa)
    if (nextTier && currentTier.maxAmount != null) {
      // maxAmount < nextMinAmount olmalı (eşitlik olmamalı - çakışma)
      if (currentTier.maxAmount >= nextTier.minAmount) {
        issues.push({
          code: "custom",
          path: ["tiers", i],
          input: currentTier,
          message: `${i + 1}. kademe ile ${i + 2}. kademe arasında çakışma var. ${i + 1}. kademenin bitişi (${currentTier.maxAmount}), ${i + 2}. kademenin başlangıcından (${nextTier.minAmount}) küçük olmalıdır.`,
        });
        return;
      }
    }

    // ✅ İndirim değerlerinin artan sırada olması
    if (nextTier) {
      const currentDiscount = currentTier[discountField] as number;
      const nextDiscount = nextTier[discountField] as number;

      if (currentDiscount >= nextDiscount) {
        const fieldName =
          discountField === "discountPercentage"
            ? "İndirim yüzdeleri"
            : "İndirim tutarları";
        issues.push({
          code: "custom",
          path: ["tiers", i],
          input: currentTier,
          message: `${fieldName} artan sırada olmalıdır. ${i + 1}. kademe (${currentDiscount}) >= ${i + 2}. kademe (${nextDiscount})`,
        });
        return;
      }
    }

    // ✅ maxAmount >= minAmount kontrolü (her tier için)
    if (
      currentTier.maxAmount != null &&
      currentTier.maxAmount <= currentTier.minAmount
    ) {
      issues.push({
        code: "custom",
        path: ["tiers", i],
        input: currentTier,
        message: `${i + 1}. kademe: Maksimum tutar (${currentTier.maxAmount}), minimum tutardan (${currentTier.minAmount}) büyük olmalıdır.`,
      });
      return;
    }
  }
}

export const PercentageDiscountSchema = z.object({
  type: z.literal<DiscountType>("PERCENTAGE", {
    error: "İndirim türü yüzde olmalıdır.",
  }),
  discountValue: z
    .number({ error: "Bu alan gereklidir." })
    .min(0.01, { error: "İndirim yüzdesi 0'dan büyük olmalıdır." })
    .max(100, { error: "İndirim yüzdesi 100'den büyük olamaz." }),
  ...BaseDiscountSchema.shape,
});

export const PercentageGrowQuantityDiscountSchema = z
  .object({
    type: z.literal<DiscountType>("PERCENTAGE_GROW_QUANTITY", {
      error: "İndirim türü kademeli yüzde (adet) olmalıdır.",
    }),
    tiers: z
      .array(PercentageTierByQuantitySchema)
      .min(2, { error: "Kademeli indirim için en az 2 kademe gereklidir." }),
    ...BaseDiscountSchema.shape,
  })
  .check(({ issues, value }) => {
    validateQuantityTiers(value.tiers, "discountPercentage", issues);
  });

export const PercentageGrowPriceDiscountSchema = z
  .object({
    type: z.literal<DiscountType>("PERCENTAGE_GROW_PRICE", {
      error: "İndirim türü kademeli yüzde (tutar) olmalıdır.",
    }),
    tiers: z
      .array(PercentageTierByPriceSchema)
      .min(2, { error: "Kademeli indirim için en az 2 kademe gereklidir." }),
    ...BaseDiscountSchema.shape,
  })
  .check(({ issues, value }) => {
    validatePriceTiers(value.tiers, "discountPercentage", issues);
  });

export const FixedAmountDiscountSchema = z.object({
  type: z.literal<DiscountType>("FIXED_AMOUNT", {
    error: "İndirim türü sabit tutar olmalıdır.",
  }),
  discountAmount: z
    .number({ error: "Bu alan gereklidir." })
    .min(0.01, { error: "İndirim tutarı 0'dan büyük olmalıdır." }),
  ...BaseDiscountSchema.shape,
});

export const FixedAmountGrowQuantityDiscountSchema = z
  .object({
    type: z.literal<DiscountType>("FIXED_AMOUNT_GROW_QUANTITY", {
      error: "İndirim türü kademeli sabit tutar (adet) olmalıdır.",
    }),
    tiers: z
      .array(FixedTierByQuantitySchema)
      .min(2, { error: "Kademeli indirim için en az 2 kademe gereklidir." }),
    ...BaseDiscountSchema.shape,
  })
  .check(({ issues, value }) => {
    validateQuantityTiers(value.tiers, "discountAmount", issues);
  });

export const FixedAmountGrowPriceDiscountSchema = z
  .object({
    type: z.literal<DiscountType>("FIXED_AMOUNT_GROW_PRICE", {
      error: "İndirim türü kademeli sabit tutar (tutar) olmalıdır.",
    }),
    tiers: z
      .array(FixedTierByPriceSchema)
      .min(2, { error: "Kademeli indirim için en az 2 kademe gereklidir." }),
    ...BaseDiscountSchema.shape,
  })
  .check(({ issues, value }) => {
    validatePriceTiers(value.tiers, "discountAmount", issues);
  });

export const FreeShippingDiscountSchema = z.object({
  type: z.literal<DiscountType>("FREE_SHIPPING", {
    error: "İndirim türü ücretsiz kargo olmalıdır.",
  }),
  ...BaseDiscountSchema.shape,
});

// 2. Ana şemayı bu değişkenleri kullanarak oluşturun
export const MainDiscountSchema = z.discriminatedUnion("type", [
  PercentageDiscountSchema,
  PercentageGrowQuantityDiscountSchema,
  PercentageGrowPriceDiscountSchema,
  FixedAmountDiscountSchema,
  FixedAmountGrowQuantityDiscountSchema,
  FixedAmountGrowPriceDiscountSchema,
  FreeShippingDiscountSchema,
]);
export type BaseDiscountZodType = z.infer<typeof BaseDiscountSchema>;

export const MainDiscountSchemaDefaultValue: MainDiscount = {
  type: "PERCENTAGE",
  status: "ACTIVE",
  title: "",
  conditions: {
    isAllProducts: true,
    conditions: null,
  },
  discountAmount: 0,
  coupons: [],
  tiers: null,
  currencies: ["TRY"],
  allCustomers: true,
  otherCustomers: null,
  addEndDate: false,
  startDate: null,
  endDate: null,
  addStartDate: false,
  isLimitPurchase: false,
  minPurchaseAmount: null,
  maxPurchaseAmount: null,
  isLimitItemQuantity: false,
  minItemQuantity: null,
  maxItemQuantity: null,
  allowDiscountedItems: false,
  allowedDiscountedItemsBy: null,
  discountValue: 0,
  isLimitTotalUsage: false,
  isLimitTotalUsagePerCustomer: false,
  mergeOtherCampaigns: false,
  totalUsageLimit: null,
  totalUsageLimitPerCustomer: null,
};

export type MainDiscount = z.infer<typeof MainDiscountSchema>;

export type PercentageDiscountZodType = z.infer<
  typeof PercentageDiscountSchema
>;
export type PercentageGrowQuantityDiscountZodType = z.infer<
  typeof PercentageGrowQuantityDiscountSchema
>;
export type PercentageGrowPriceDiscountZodType = z.infer<
  typeof PercentageGrowPriceDiscountSchema
>;
export type FixedAmountDiscountZodType = z.infer<
  typeof FixedAmountDiscountSchema
>;
export type FixedAmountGrowQuantityDiscountZodType = z.infer<
  typeof FixedAmountGrowQuantityDiscountSchema
>;
export type FixedAmountGrowPriceDiscountZodType = z.infer<
  typeof FixedAmountGrowPriceDiscountSchema
>;
export type FreeShippingDiscountZodType = z.infer<
  typeof FreeShippingDiscountSchema
>;

export type FilterCondition = z.infer<typeof FilterConditionSchema>;

export type GrowQuantitySchema =
  | PercentageGrowQuantityDiscountZodType
  | FixedAmountGrowQuantityDiscountZodType;

export type GrowPriceSchema =
  | PercentageGrowPriceDiscountZodType
  | FixedAmountGrowPriceDiscountZodType;

export type PercentageTierByQuantity = z.infer<
  typeof PercentageTierByQuantitySchema
>;
export type PercentageTierByPrice = z.infer<typeof PercentageTierByPriceSchema>;
export type FixedTierByQuantity = z.infer<typeof FixedTierByQuantitySchema>;
export type FixedTierByPrice = z.infer<typeof FixedTierByPriceSchema>;
export type TierType =
  | PercentageTierByQuantity
  | PercentageTierByPrice
  | FixedTierByQuantity
  | FixedTierByPrice;

export type Coupon = z.infer<typeof CouponSchema>;

export const AutomaticCouponSchema = z.object({
  prefix: z
    .string({ error: "Bu alan gereklidir." })
    .min(3, { error: "Önek en az 3 karakter olmalıdır." })
    .max(20, { error: "Önek en fazla 20 karakter olabilir." }),
  numberOfCoupons: z
    .number({ error: "Bu alan gereklidir." })
    .int({ error: "Bu alan tam sayı olmalıdır." })
    .min(1, { error: "Oluşturulacak kupon sayısı en az 1 olmalıdır." })
    .max(1000, { error: "Oluşturulacak kupon sayısı en fazla 1000 olabilir." }),
});
export type AutomaticCoupon = z.infer<typeof AutomaticCouponSchema>;

export type DiscountItem = {
  id: string;
  name: string;
  sub?: DiscountItem[];
};

export type FlatItem = {
  id: string;
  name: string;
  parentId: string | null;
};

export type AllUsersReturnType = {
  id: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
};

export type CommonDiscountPrismaData = {
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  isLimitPurchase: boolean;
  minPurchaseAmount: number | null;
  maxPurchaseAmount: number | null;
  isLimitItemQuantity: boolean;
  minItemQuantity: number | null;
  maxItemQuantity: number | null;
  allowDiscountedItems: boolean;
  allowedDiscountedItemsBy: AllowedDiscountedItemsBy | null;
  mergeOtherCampaigns: boolean;
  isLimitTotalUsage: boolean;
  totalUsageLimit: number | null;
  isLimitTotalUsagePerCustomer: boolean;
  totalUsageLimitPerCustomer: number | null;
  isAllCustomers: boolean;
  isAllProducts: boolean;
};

export type DiscountUpsertResponse = {
  success: boolean;
  message: string;
  discountId: string;
};

export type GetAllDiscountReturnType = {
  success: boolean;
  message: string;
  data: Prisma.DiscountGetPayload<{
    include: {
      _count: {
        select: {
          usages: true;
        };
      };
    };
  }>[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};
