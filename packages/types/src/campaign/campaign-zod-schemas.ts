import {
  AllowedDiscountedItemsBy,
  CampaignOfferTargetPage,
  CampaignStatus,
  CampaignType,
  Currency,
  DiscountType,
} from "@repo/database/client";
import z from "zod";
import { DiscountDatesSchema } from "../discounts/discounts-zod-schemas";

export const RequirementsSchema = z
  .object({
    addMinCartAmount: z.boolean({
      error: "Geçersiz minimum sepet tutarı ekleme değeri.",
    }),
    minCartAmount: z
      .number({
        error: "Geçersiz minimum sepet tutarı.",
      })
      .min(0, {
        error: "Minimum sepet tutarı negatif olamaz.",
      })
      .nonnegative({
        error: "Minimum sepet tutarı negatif olamaz.",
      })
      .nullish(),
    addMaxCartAmount: z.boolean({
      error: "Geçersiz maksimum sepet tutarı ekleme değeri.",
    }),
    maxCartAmount: z
      .number({
        error: "Geçersiz maksimum sepet tutarı.",
      })
      .min(0, {
        error: "Maksimum sepet tutarı negatif olamaz.",
      })
      .nonnegative({
        error: "Maksimum sepet tutarı negatif olamaz.",
      })
      .nullish(),
  })
  .refine(
    (data) => {
      if (data.addMinCartAmount && data.addMaxCartAmount) {
        return data.minCartAmount <= data.maxCartAmount;
      }
      return true;
    },
    {
      error: "Minimum sepet tutarı, maksimum sepet tutarından büyük olamaz.",
    }
  );

export const OfferSchema = z.object({
  order: z
    .number({ error: "Geçersiz sıra değeri." })
    .min(1, { error: "Sıra değeri en az 1 olmalıdır." }),
  variantId: z.cuid2({ error: "Geçersiz varyant kimliği." }).nullish(),
  productId: z.cuid2({ error: "Geçersiz ürün kimliği." }).nullish(),
  title: z
    .string({ error: "Başlık zorunludur" })
    .min(1, {
      error: "Başlık zorunludur",
    })
    .max(256, {
      error: "Başlık en fazla 256 karakter olabilir",
    }),
  description: z
    .string({ error: "Açıklama zorunludur" })
    .max(1024, { error: "Açıklama en fazla 1024 karakter olabilir" }),
  offer: z
    .object({
      discountType: z.enum(
        [DiscountType.FIXED_AMOUNT, DiscountType.PERCENTAGE],
        {
          error: "Geçersiz indirim türü.",
        }
      ),
      discountValue: z
        .number({ error: "Geçersiz indirim değeri." })
        .min(0, { error: "İndirim değeri negatif olamaz." })
        .nonnegative({
          error: "İndirim değeri negatif olamaz.",
        }),
      discountValueAppliedByPrice: z.enum(
        [
          AllowedDiscountedItemsBy.discounted_price,
          AllowedDiscountedItemsBy.price,
        ],
        {
          error: " Geçersiz indirim uygulama türü.",
        }
      ),
      addCountDown: z.boolean({ error: "Geçersiz geri sayım değeri." }),
      countDownMinute: z
        .number({ error: "Geçersiz geri sayım dakikası." })
        .min(0, { error: "Geri sayım dakikası negatif olamaz." })
        .nullish(),
      showPrroductIfInCart: z.boolean({
        error: "Geçersiz ürün gösterme değeri.",
      }),
    })
    .refine(
      (offer) => {
        return offer.discountType === DiscountType.FIXED_AMOUNT
          ? offer.discountValue > 0
          : offer.discountValue > 0 && offer.discountValue <= 100;
      },
      {
        error:
          "İndirim değeri, sabit tutar için 0'dan büyük, yüzde için 0 ile 100 arasında olmalıdır.",
      }
    )
    .refine(
      (offer) => {
        if (offer.addCountDown) {
          return offer.countDownMinute > 0;
        }
      },
      {
        error: "Geri sayım dakikası 0'dan büyük olmalıdır.",
      }
    ),
});

export const BaseCampaignSchema = z.object({
  uniqueId: z.cuid2({ error: "Geçersiz kampanya kimliği." }).nullish(),
  status: z.enum(CampaignStatus, {
    error: "Geçersiz kampanya durumu.",
  }),
  title: z
    .string({ error: "Başlık zorunludur" })
    .min(1, {
      error: "Başlık zorunludur",
    })
    .max(256, {
      error: "Başlık en fazla 256 karakter olabilir",
    }),
  currencies: z
    .array(
      z.enum(Currency, {
        error: "Bu alan geçerli bir para birimi olmalıdır.",
      })
    )
    .min(1, {
      error: "En az bir para birimi seçilmelidir.",
    })
    .refine(
      (val) => {
        const isUnique = new Set(val).size === val.length;
        return isUnique;
      },
      {
        message: "Para birimleri benzersiz olmalıdır.",
      }
    ),
  dates: DiscountDatesSchema,
  requirements: RequirementsSchema,
  offers: z
    .array(OfferSchema)
    .min(1, {
      error: "En az bir teklif eklemelisiniz.",
    })
    .refine(
      (offers) => {
        const orders = offers.map((offer) => offer.order);
        const uniqueOrders = new Set(orders);
        return uniqueOrders.size === orders.length;
      },
      {
        error: "Teklif sıraları benzersiz olmalıdır.",
      }
    ),
});

export const MustBuyableProductsSchema = z
  .object({
    productIds: z
      .array(
        z.cuid2({
          error: "Geçersiz ürün kimliği.",
        })
      )
      .nullish(),
    variantIds: z
      .array(
        z
          .cuid2({
            error: "Geçersiz varyant kimliği.",
          })
          .nullish()
      )
      .nullish(),
  })
  .refine(
    (data) => {
      const hasProducts = data.productIds && data.productIds.length > 0;
      const hasVariants = data.variantIds && data.variantIds.length > 0;
      return hasProducts || hasVariants;
    },
    {
      message: "En az bir ürün veya varyant seçmelisiniz.",
      path: ["productIds"],
    }
  );

export const CrossSellingCampaignSchema = z.object({
  type: z.literal<CampaignType>(CampaignType.CROSS_SELLING),
  ...BaseCampaignSchema.shape,
  campaignOfferTargetType: z.enum(CampaignOfferTargetPage, {
    error: "Geçersiz kampanya teklif hedef sayfası.",
  }),
  conditions: z
    .object({
      isAllProducts: z.boolean(),
      productIds: z
        .array(z.cuid2({ error: "Geçersiz ürün kimliği." }))
        .nullish(),
      variantIds: z
        .array(
          z.cuid2({
            error: "Geçersiz varyant kimliği.",
          })
        )
        .nullish(),
    })
    .refine(
      (data) => {
        if (data.isAllProducts) return true;
        const hasProducts = data.productIds && data.productIds.length > 0;
        const hasVariants = data.variantIds && data.variantIds.length > 0;
        return hasProducts || hasVariants;
      },
      {
        error: "En az bir ürün veya varyant seçmelisiniz.",
      }
    ),
});

export const UpSellingCampaignSchema = z.object({
  type: z.literal<CampaignType>(CampaignType.UP_SELLING),
  ...BaseCampaignSchema.shape,
  buyableProducts: MustBuyableProductsSchema,
});

export const CampaignZodSchema = z.discriminatedUnion("type", [
  CrossSellingCampaignSchema,
  UpSellingCampaignSchema,
]);

export type BaseCampaignZodType = z.infer<typeof BaseCampaignSchema>;
export type CampaignZodType = z.infer<typeof CampaignZodSchema>;
export type CrossSellingCampaignType = z.infer<
  typeof CrossSellingCampaignSchema
>;
export type UpSellingCampaignType = z.infer<typeof UpSellingCampaignSchema>;
export type UppSellOfferZodType = z.infer<typeof OfferSchema>;
