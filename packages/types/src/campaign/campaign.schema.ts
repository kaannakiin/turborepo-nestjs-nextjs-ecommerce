import { $Enums } from "@repo/database";
import z from "zod";
import { DiscountDatesSchema } from "../discounts/discount.schema";

export const CampaignOfferType = {
  CROSS_SELLING: "CROSS_SELLING",
  UP_SELLING: "UP_SELLING",
};

export type CampaignOfferType =
  (typeof CampaignOfferType)[keyof typeof CampaignOfferType];

export const CampaignOfferTargetPage = {
  CHECKOUT: "CHECKOUT",
  POST_CHECKOUT: "POST_CHECKOUT",
  PRODUCT: "PRODUCT",
};
export type CampaignOfferTargetPage =
  (typeof CampaignOfferTargetPage)[keyof typeof CampaignOfferTargetPage];

export const BaseCampaignSchema = z.object({
  translations: z.array(
    z.object({
      locale: z.enum($Enums.Locale, {
        error: "Bu alan geçerli bir dil kodu olmalıdır.",
      }),
      title: z
        .string({ error: "Başlık zorunludur" })
        .min(1, {
          error: "Başlık zorunludur",
        })
        .max(256, {
          error: "Başlık en fazla 256 karakter olabilir",
        }),
    })
  ),
  currencies: z
    .array(
      z.enum($Enums.Currency, {
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
      path: ["productIds"], // veya ["variantIds"] hatayı nerede göstermek istersen
    }
  );

export const CrossSellingCampaignSchema = z.object({
  type: z.literal<CampaignOfferType>(CampaignOfferType.CROSS_SELLING),
  ...BaseCampaignSchema.shape,
});

export const UpSellingCampaignSchema = z.object({
  type: z.literal<CampaignOfferType>(CampaignOfferType.UP_SELLING),
  ...BaseCampaignSchema.shape,
  buyableProducts: MustBuyableProductsSchema,
});

export const CampaignZodSchema = z.discriminatedUnion("type", [
  CrossSellingCampaignSchema,
  UpSellingCampaignSchema,
]);

export type CampaignZodType = z.infer<typeof CampaignZodSchema>;
export type CrossSellingCampaignType = z.infer<
  typeof CrossSellingCampaignSchema
>;
export type UpSellingCampaignType = z.infer<typeof UpSellingCampaignSchema>;

export type ProductModalData = {
  id: string;
  name: string;
  image?: string;
  sub?: ProductModalData[];
};

export type SearchableProductModalData = {
  data: ProductModalData;
  total: number;
};
