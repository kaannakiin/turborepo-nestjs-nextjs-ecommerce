import { $Enums, Prisma } from "@repo/database";
import z from "zod";
import { DiscountDatesSchema } from "../discounts/discount.schema";

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
        [$Enums.DiscountType.FIXED_AMOUNT, $Enums.DiscountType.PERCENTAGE],
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
          $Enums.AllowedDiscountedItemsBy.discounted_price,
          $Enums.AllowedDiscountedItemsBy.price,
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
        return offer.discountType === $Enums.DiscountType.FIXED_AMOUNT
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
  status: z.enum($Enums.CampaignStatus, {
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
  type: z.literal<$Enums.CampaignType>($Enums.CampaignType.CROSS_SELLING),
  ...BaseCampaignSchema.shape,
  campaignOfferTargetType: z.enum($Enums.CampaignOfferTargetPage, {
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
  type: z.literal<$Enums.CampaignType>($Enums.CampaignType.UP_SELLING),
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

export type ProductModalData = {
  id: string;
  name: string;
  image?: string;
  sub?: ProductModalData[];
};

export type SearchableProductModalData = {
  data: ProductModalData[];
  total: number;
};

export type UpSellProductReturnType = {
  success: boolean;
  message: string;
  product?: {
    productId: string;
    productName: string;
    productSlug: string;
    price: number;
    discountedPrice?: number;
    variantId?: string;
    asset?: { url: string; type: $Enums.AssetType };
    variantOptions?: Array<{
      variantGroupId: string;
      variantGroupName: string;
      variantGroupSlug: string;
      variantOptionId: string;
      variantOptionName: string;
      variantOptionSlug: string;
      variantOptionHexValue?: string;
      variantOptionAsset?: { url: string; type: $Enums.AssetType };
    }>;
  };
};

export const UpSellCampaignDefaultValues: UpSellingCampaignType = {
  type: $Enums.CampaignType.UP_SELLING,
  title: "",
  status: $Enums.CampaignStatus.DRAFT,
  currencies: ["TRY"],
  requirements: {
    addMaxCartAmount: false,
    addMinCartAmount: false,
    maxCartAmount: null,
    minCartAmount: null,
  },
  dates: {
    addEndDate: false,
    addStartDate: false,
    endDate: null,
    startDate: null,
  },
  buyableProducts: { productIds: null, variantIds: null },
  offers: [
    {
      order: 1,
      title: "",
      description: "",
      offer: {
        addCountDown: false,
        countDownMinute: null,
        discountType: "PERCENTAGE",
        discountValue: 0,
        discountValueAppliedByPrice: "price",
        showPrroductIfInCart: false,
      },
      productId: null,
      variantId: null,
    },
  ],
};

export const CrossSellingCampaignDefaultValues: CrossSellingCampaignType = {
  type: $Enums.CampaignType.CROSS_SELLING,
  currencies: ["TRY"],
  status: $Enums.CampaignStatus.DRAFT,
  requirements: {
    addMaxCartAmount: false,
    addMinCartAmount: false,
    maxCartAmount: null,
    minCartAmount: null,
  },
  title: "",
  dates: {
    addEndDate: false,
    addStartDate: false,
    endDate: null,
    startDate: null,
  },
  campaignOfferTargetType: $Enums.CampaignOfferTargetPage.CHECKOUT_PAGE,
  conditions: { isAllProducts: true, productIds: null, variantIds: null },
  offers: [
    {
      order: 1,
      title: "",
      description: "",
      offer: {
        addCountDown: false,
        countDownMinute: null,
        discountType: "PERCENTAGE",
        discountValue: 0,
        discountValueAppliedByPrice: "price",
        showPrroductIfInCart: false,
      },
      productId: null,
      variantId: null,
    },
  ],
};

export type GetCampaignsReturnType = {
  success: boolean;
  message: string;
  data?: Prisma.CampaignGetPayload<{
    include: { _count: { select: { offers: true } } };
  }>[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
};
