import { $Enums, Prisma } from "@repo/database";
import * as z from "zod";

export const BuyXGetYSchema = z
  .object({
    // X - Alınması gereken miktarlar
    buyQuantity: z
      .number({ error: "Alınması gereken adet zorunludur" })
      .int({ error: "Alınması gereken adet tam sayı olmalıdır" })
      .min(1, { error: "Alınması gereken adet en az 1 olmalıdır" }),
    buyProductId: z
      .cuid2({ error: "Geçersiz ürün kimliği" })
      .optional()
      .nullable(),
    buyVariantId: z
      .cuid2({ error: "Geçersiz varyant kimliği" })
      .optional()
      .nullable(),

    // Y - Kazanılacak miktarlar
    getQuantity: z
      .number({ error: "Kazanılan adet zorunludur" })
      .int({ error: "Kazanılan adet tam sayı olmalıdır" })
      .min(1, { error: "Kazanılan adet en az 1 olmalıdır" }),
    getProductId: z
      .cuid2({ error: "Geçersiz hedef ürün kimliği" })
      .optional()
      .nullable(),
    getVariantId: z
      .cuid2({ error: "Geçersiz hedef varyant kimliği" })
      .optional()
      .nullable(),

    // İndirim miktarı
    discountPercentage: z
      .number({ error: "Kazanılan ürünlerde indirim yüzdesi zorunludur" })
      .min(0, { error: "İndirim yüzdesi 0'dan küçük olamaz" })
      .max(100, { error: "İndirim yüzdesi 100'den büyük olamaz" }),
  })
  .refine(
    (data) => {
      // Buy için: en az bir tane seçilmeli (product veya variant)
      const buySelections = [data.buyProductId, data.buyVariantId].filter(
        Boolean
      );
      return buySelections.length >= 1;
    },
    {
      message:
        "Alınması gereken ürünler için en az bir ürün veya varyant seçmelisiniz",
    }
  )
  .refine(
    (data) => {
      // Get için: en az bir tane seçilmeli (product veya variant)
      const getSelections = [data.getProductId, data.getVariantId].filter(
        Boolean
      );
      return getSelections.length >= 1;
    },
    {
      message:
        "Kazanılacak ürünler için en az bir ürün veya varyant seçmelisiniz",
    }
  )
  .refine(
    (data) => {
      // Buy için: hem product hem de variant seçilemez (sadece bir tanesi)
      const hasBuyProduct = Boolean(data.buyProductId);
      const hasBuyVariant = Boolean(data.buyVariantId);
      return !(hasBuyProduct && hasBuyVariant);
    },
    {
      message:
        "Alınması gereken ürünler için hem ürün hem de varyant seçemezsiniz, sadece birini seçin",
    }
  )
  .refine(
    (data) => {
      // Get için: hem product hem de variant seçilemez (sadece bir tanesi)
      const hasGetProduct = Boolean(data.getProductId);
      const hasGetVariant = Boolean(data.getVariantId);
      return !(hasGetProduct && hasGetVariant);
    },
    {
      message:
        "Kazanılacak ürünler için hem ürün hem de varyant seçemezsiniz, sadece birini seçin",
    }
  );

export const DiscountCouponSchema = z.object({
  code: z
    .string({ error: "Kupon kodu zorunludur" })
    .min(1, { error: "Kupon kodu zorunludur" })
    .max(128, { error: "Kupon kodu en fazla 128 karakter olabilir" }),
  limit: z
    .number({ error: "Toplam kullanım limiti sayı olmalıdır" })
    .int({ error: "Toplam kullanım limiti tam sayı olmalıdır" })
    .min(1, { error: "Toplam kullanım limiti en az 1 olabilir" })
    .optional()
    .nullable(),
  perUserLimit: z
    .number({ error: "Kullanıcı başı limit sayı olmalıdır" })
    .int({ error: "Kullanıcı başı limit tam sayı olmalıdır" })
    .min(1, { error: "Kullanıcı başı limit en az 1 olabilir" })
    .optional()
    .nullable(),
});

export const ConditionsSchema = z
  .object({
    // Ürün koşulları
    allProducts: z.boolean({ error: "Tüm ürünler seçimi zorunludur" }),
    includedProductIds: z
      .array(z.cuid2({ error: "Geçersiz ürün kimliği" }), {
        error: "Dahil edilen ürünler geçerli kimlike sahip olmalıdır",
      })
      .optional()
      .nullable(),
    includedVariantIds: z
      .array(z.cuid2({ error: "Geçersiz varyant kimliği" }), {
        error: "Dahil edilen varyantlar geçerli kimlike sahip olmalıdır",
      })
      .optional()
      .nullable(),
    includedCategoryIds: z
      .array(z.cuid2({ error: "Geçersiz kategori kimliği" }), {
        error: "Dahil edilen kategoriler geçerli kimlike sahip olmalıdır",
      })
      .optional()
      .nullable(),
    includedBrandIds: z
      .array(z.cuid2({ error: "Geçersiz marka kimliği" }), {
        error: "Dahil edilen markalar geçerli kimlike sahip olmalıdır",
      })
      .optional()
      .nullable(),

    // Kullanıcı koşulları
    allUser: z.boolean({ error: "Tüm kullanıcılar seçimi zorunludur" }),
    onlyRegisteredUsers: z.boolean({
      error: "Kayıtlı kullanıcılar seçimi zorunludur",
    }),
    usersIds: z
      .array(z.cuid2({ error: "Geçersiz kullanıcı kimliği" }), {
        error: "Kullanıcılar geçerli kimlike sahip olmalıdır",
      })
      .optional()
      .nullable(),

    // Minimum sepet tutarı
    hasAmountCondition: z.boolean({ error: "Sepet tutarı koşulu zorunludur" }),
    minimumAmount: z
      .number({ error: "Minimum tutar sayı olmalıdır" })
      .min(0, { error: "Minimum tutar 0'dan küçük olamaz" })
      .optional()
      .nullable(),
    maximumAmount: z
      .number({ error: "Maksimum tutar sayı olmalıdır" })
      .min(0, { error: "Maksimum tutar 0'dan küçük olamaz" })
      .optional()
      .nullable(),
    // Minimum ürün adedi
    hasQuantityCondition: z.boolean({
      error: "Adet koşulu zorunludur",
    }),
    minimumQuantity: z
      .number({ error: "Minimum adet sayı olmalıdır" })
      .int({ error: "Minimum adet tam sayı olmalıdır" })
      .min(1, { error: "Minimum adet en az 1 olabilir" })
      .optional()
      .nullable(),
    maximumQuantity: z
      .number({ error: "Maksimum adet sayı olmalıdır" })
      .int({ error: "Maksimum adet tam sayı olmalıdır" })
      .min(1, { error: "Maksimum adet en az 1 olabilir" })
      .optional()
      .nullable(),

    addStartDate: z.boolean({ error: "Başlangıç tarihi koşulu zorunludur" }),
    startDate: z
      .date({ error: "Başlangıç tarihi geçerli bir tarih olmalıdır" })
      .optional()
      .nullable(),
    addEndDate: z.boolean({ error: "Bitiş tarihi koşulu zorunludur" }),
    endDate: z
      .date({ error: "Bitiş tarihi geçerli bir tarih olmalıdır" })
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.allProducts) return true;
      const hasProducts =
        data.includedProductIds && data.includedProductIds.length > 0;
      const hasCategories =
        data.includedCategoryIds && data.includedCategoryIds.length > 0;
      const hasBrands =
        data.includedBrandIds && data.includedBrandIds.length > 0;
      return hasProducts || hasCategories || hasBrands;
    },
    {
      message: ", en az bir ürün, kategori veya marka seçmelisiniz",
    }
  )
  .refine(
    (data) => {
      if (data.allUser) return true;
      if (data.onlyRegisteredUsers) return true;
      const hasSpecificUsers = data.usersIds && data.usersIds.length > 0;
      return hasSpecificUsers;
    },
    {
      message:
        "Tüm kullanıcılar veya kayıtlı kullanıcılar seçili değilse, belirli kullanıcılar seçmelisiniz",
    }
  )
  .refine(
    (data) => {
      const selections = [
        data.allUser,
        data.usersIds && data.usersIds.length > 0,
      ];
      const activeSelections = selections.filter(Boolean).length;
      return activeSelections <= 1;
    },
    {
      message: "Yalnızca bir kullanıcı seçim türü seçebilirsiniz",
    }
  )
  .refine(
    (data) => {
      if (data.hasAmountCondition) {
        if (data.minimumAmount === null && data.maximumAmount === null) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "Sepet tutar koşulu aktifse, maksimum tutar veya minimum tutar belirtmelisiniz",
    }
  )
  .refine(
    (data) => {
      if (data.hasQuantityCondition) {
        return (
          data.minimumQuantity !== null && data.minimumQuantity !== undefined
        );
      }
      return true;
    },
    {
      message:
        "Adet koşulu aktifse, minimum adet veya maksimum adet belirtmelisiniz",
    }
  )
  .refine(
    (data) => {
      if (
        data.hasAmountCondition &&
        data.minimumAmount !== null &&
        data.maximumAmount !== null
      ) {
        return data.minimumAmount <= data.maximumAmount;
      }
      return true;
    },
    {
      message: "Minimum tutar maksimum tutardan büyük olamaz",
    }
  )
  .refine(
    (data) => {
      if (
        data.hasQuantityCondition &&
        data.minimumQuantity !== null &&
        data.maximumQuantity !== null
      ) {
        return data.minimumQuantity <= data.maximumQuantity;
      }
      return true;
    },
    {
      message: "Minimum adet maksimum adetten büyük olamaz",
    }
  )
  .refine(
    (data) => {
      if (data.addStartDate) {
        return data.startDate !== null && data.startDate !== undefined;
      }
      return true;
    },
    {
      message:
        "Başlangıç tarihi koşulu aktifse, başlangıç tarihi belirtmelisiniz",
    }
  )
  .refine(
    (data) => {
      if (data.addEndDate) {
        return data.endDate !== null && data.endDate !== undefined;
      }
      return true;
    },
    {
      message: "Bitiş tarihi koşulu aktifse, bitiş tarihi belirtmelisiniz",
    }
  )
  .refine(
    (data) => {
      if (
        data.addStartDate &&
        data.addEndDate &&
        data.startDate &&
        data.endDate
      ) {
        return data.startDate < data.endDate;
      }
      return true;
    },
    {
      message: "Başlangıç tarihi bitiş tarihinden önce olmalıdır",
    }
  );

const BaseDiscountSchema = z
  .object({
    uniqueId: z.cuid2({ error: "Geçersiz indirim kimliği" }),

    // Yeni eklenen: Kupon oluşturma türü
    couponGeneration: z.enum($Enums.CouponGenerationType, {
      error: "Geçersiz kupon oluşturma türü",
    }),

    translations: z
      .array(
        z.object({
          locale: z.enum($Enums.Locale, { error: "Geçersiz dil" }),
          discountTitle: z
            .string({ error: "İndirim başlığı zorunludur" })
            .min(1, { error: "İndirim başlığı zorunludur" })
            .max(255, {
              error: "İndirim başlığı en fazla 255 karakter olabilir",
            }),
        })
      )
      .refine(
        (arr) => {
          const hasTrLocale = arr.some((item) => item.locale === "TR");
          if (!hasTrLocale) {
            return false;
          }
          return true;
        },
        {
          error: "İndirim başlığı için Türkçe (TR) dilini eklemelisiniz",
        }
      )
      .refine(
        (arr) => {
          const locales = arr.map((item) => item.locale);
          const uniqueLocales = new Set(locales);
          return uniqueLocales.size === locales.length;
        },
        {
          error: "Her dil için yalnızca bir çeviri ekleyebilirsiniz",
        }
      ),

    // Kuponlar artık conditionally required
    coupons: z.array(DiscountCouponSchema).optional().nullable(),

    conditions: ConditionsSchema,
    isActive: z.boolean({ error: "Aktiflik durumu zorunludur" }),
  })
  .refine(
    (data) => {
      // Eğer MANUAL ise kuponlar zorunlu
      if (data.couponGeneration === "MANUAL") {
        return data.coupons && data.coupons.length > 0;
      }
      return true;
    },
    {
      message:
        "Manuel kupon oluşturma seçildiğinde en az 1 kupon eklemelisiniz",
    }
  );

// Ana indirim şeması - 5 farklı tip (yeni BUY_X_GET_Y eklendi)
export const DiscountSchema = z.discriminatedUnion("type", [
  // 1. Yüzdelik İndirim
  BaseDiscountSchema.safeExtend({
    type: z.literal($Enums.DiscountType.PERCENTAGE),
    discountPercentage: z
      .number({ error: "İndirim yüzdesi zorunludur" })
      .min(0.01, { error: "İndirim yüzdesi en az %0.01 olabilir" })
      .max(100, { error: "İndirim yüzdesi en fazla %100 olabilir" }),
    allowedCurrencies: z
      .array(z.enum($Enums.Currency, { error: "Geçersiz para birimi" }), {
        error: "En az bir para birimi seçmelisiniz",
      })
      .min(1, { error: "En az bir para birimi seçmelisiniz" })
      .refine(
        (arr) => {
          const uniqueCurrencies = new Set(arr);
          return uniqueCurrencies.size === arr.length;
        },
        {
          message: "Aynı para birimi birden fazla kez seçilemez",
        }
      ),
  }),

  // 2. Sabit Tutar İndirim
  BaseDiscountSchema.safeExtend({
    type: z.literal($Enums.DiscountType.FIXED),
    discountAmount: z
      .number({ error: "İndirim tutarı zorunludur" })
      .min(0.01, { error: "İndirim tutarı 0'dan büyük olmalıdır" }),
    allowedCurrencies: z
      .array(z.enum($Enums.Currency, { error: "Geçersiz para birimi" }), {
        error: "En az bir para birimi seçmelisiniz",
      })
      .min(1, { error: "En az bir para birimi seçmelisiniz" })
      .refine(
        (arr) => {
          const uniqueCurrencies = new Set(arr);
          return uniqueCurrencies.size === arr.length;
        },
        {
          message: "Aynı para birimi birden fazla kez seçilemez",
        }
      ),
  }),

  // 3. Ücretsiz Kargo
  BaseDiscountSchema.safeExtend({
    type: z.literal($Enums.DiscountType.FREE_SHIPPING),
  }),

  // 4. X Al Y Kazan - YENİ TİP
  BaseDiscountSchema.safeExtend({
    type: z.literal("BUY_X_GET_Y"), // Bu enum'a eklenecek
    buyXGetYConfig: BuyXGetYSchema,
  }),
]);

export type DiscountZodType = z.infer<typeof DiscountSchema>;

export type PercentageDiscount = Extract<
  DiscountZodType,
  { type: typeof $Enums.DiscountType.PERCENTAGE }
>;

export type FixedDiscount = Extract<
  DiscountZodType,
  { type: typeof $Enums.DiscountType.FIXED }
>;

export type FreeShippingDiscount = Extract<
  DiscountZodType,
  { type: typeof $Enums.DiscountType.FREE_SHIPPING }
>;

// Yeni tip
export type BuyXGetYDiscount = Extract<
  DiscountZodType,
  { type: "BUY_X_GET_Y" }
>;

export type ProductWithVariants = {
  productId: string;
  isVariant: boolean;
  productName: string;
  variantInfo?: {
    variantId: string;
    variants: { groupName: string; optionName: string }[];
  }[];
};

export type DiscountTableData = Prisma.DiscountGetPayload<{
  include: {
    coupons: true;
    translations: true;
    conditions: true;
    _count: {
      select: {
        usage: true,
      },
    };
  };
}>;
