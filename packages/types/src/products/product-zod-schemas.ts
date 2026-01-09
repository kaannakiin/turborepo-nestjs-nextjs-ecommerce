import {
  AssetType,
  Currency,
  Locale,
  ProductType,
  VariantGroupRenderType,
  VariantGroupType,
} from "@repo/database/client";
import * as z from "zod";
import { ProductBulkAction } from "../common";
import { FileSchema, htmlDescriptionSchema } from "../common/zod-schemas";

export const VariantOptionTranslationSchema = z.object({
  locale: z.enum(Locale),
  name: z
    .string({
      error: "Geçerli bir isim giriniz.",
    })
    .min(1, "İsim zorunludur.")
    .max(256, {
      error: "İsim 256 karakterden uzun olamaz.",
    }),
  slug: z
    .string({
      error: "Geçerli bir slug giriniz.",
    })
    .min(1, "Slug zorunludur.")
    .max(256, {
      error: "Slug 256 karakterden uzun olamaz.",
    }),
});

export const VariantOptionSchema = z.object({
  uniqueId: z.cuid2(),
  translations: z
    .array(VariantOptionTranslationSchema)
    .refine(
      (val) => {
        const isTrLocale = val.some((item) => item.locale === Locale.TR);
        return isTrLocale;
      },
      {
        error: " En az bir çeviri Türkçe (TR) olmalıdır.",
      }
    )
    .refine(
      (val) => {
        const locales = val.map((item) => item.locale);
        return locales.length === new Set(locales).size;
      },
      {
        error: "Her dil için yalnızca bir çeviri sağlanmalıdır.",
      }
    ),
  hexValue: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, {
      error: "Geçerli bir hex renk kodu giriniz (örn: #FF0000)",
    })
    .nullable()
    .optional(),
  file: FileSchema({ type: "IMAGE" }).nullish(),
  existingFile: z
    .url({ error: "Lütfen geçerli bir url giriniz" })
    .optional()
    .nullable(),
});

export const VariantGroupTranslationSchema = z.object({
  locale: z.enum(Locale),
  name: z
    .string({ error: "Variant Grup adı zorunludur." })
    .min(1, "Variant Grup adı zorunludur.")
    .max(256, {
      error: "Variant Grup adı 256 karakterden uzun olamaz.",
    }),
  slug: z
    .string({ error: "Slug zorunludur." })
    .min(1, "Slug zorunludur.")
    .max(256, {
      error: "Slug 256 karakterden uzun olamaz.",
    }),
});

export const VariantGroupSchema = z.object({
  uniqueId: z.cuid2({ error: "Geçersiz varyant grup kimliği." }),
  renderVisibleType: z.enum(VariantGroupRenderType),
  translations: z
    .array(VariantGroupTranslationSchema, {
      error: "Variant Grup çevirileri zorunludur.",
    })
    .refine(
      (val) => {
        const isTrLocale = val.some((item) => item.locale === Locale.TR);
        return isTrLocale;
      },
      {
        error: " En az bir çeviri Türkçe (TR) olmalıdır.",
      }
    )
    .refine(
      (data) => {
        const locales = data.map((item) => item.locale);
        return locales.length === new Set(locales).size;
      },
      {
        error: "Her dil için yalnızca bir çeviri sağlanmalıdır.",
      }
    ),
  type: z.enum(VariantGroupType),
  options: z.array(VariantOptionSchema).min(1, {
    error: "En az bir varyant seçeneği olmalıdır.",
  }),
});

export const ProductPriceSchema = z
  .object({
    currency: z.enum(Currency),
    price: z
      .number()
      .positive({ error: "Fiyat 0'dan büyük olmalıdır." })
      .max(Number.MAX_SAFE_INTEGER, {
        error: "Fiyat çok büyük.",
      }),
    discountPrice: z
      .number()
      .min(0, { error: "İndirimli fiyat 0'dan küçük olamaz." })
      .max(Number.MAX_SAFE_INTEGER, {
        error: "Fiyat çok büyük.",
      })
      .nullish(),
    buyedPrice: z
      .number()
      .positive({ error: "Satın alınan fiyat 0'dan büyük olmalıdır." })
      .max(Number.MAX_SAFE_INTEGER, {
        error: "Fiyat çok büyük.",
      })
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.discountPrice && data.discountPrice > 0) {
        return data.discountPrice <= data.price;
      }
      return true;
    },
    {
      error: "İndirimli fiyat normal fiyattan büyük olamaz.",
      path: ["discountPrice"],
    }
  );

export const ProductTranslationSchema = z.object({
  locale: z.enum(Locale),
  name: z
    .string({
      error: "Ürün adı zorunludur.",
    })
    .min(1, "Ürün adı zorunludur.")
    .max(256, {
      error: "Ürün adı 256 karakterden uzun olamaz.",
    }),
  description: htmlDescriptionSchema,
  slug: z
    .string({
      error: "Slug zorunludur.",
    })
    .min(1, "Slug zorunludur.")
    .max(256, {
      error: "Slug 256 karakterden uzun olamaz.",
    }),
  metaTitle: z
    .string({ error: "Meta başlık zorunludur." })
    .max(60, { error: "Meta başlık 60 karakterden uzun olamaz." })
    .optional()
    .nullable(),
  metaDescription: z
    .string({
      error: "Meta açıklama zorunludur.",
    })
    .max(160, { error: "Meta açıklama 160 karakterden uzun olamaz." })
    .optional()
    .nullable(),
});

export const BaseProductSchemaCore = z.object({
  uniqueId: z.cuid2(),
  active: z.boolean(),
  sku: z
    .string({
      error: "SKU zorunludur.",
    })
    .max(100, {
      error: "SKU 100 karakterden uzun olamaz.",
    }),
  barcode: z
    .string({
      error: "Barkod zorunludur.",
    })
    .max(100, {
      error: "Barkod 100 karakterden uzun olamaz.",
    })
    .nullish(),
  stock: z
    .number({ error: "Stok zorunludur." })
    .min(0, { error: "Stok 0'dan küçük olamaz." })
    .max(Number.MAX_SAFE_INTEGER, {
      error: "Stok çok büyük",
    }),
  type: z.enum(ProductType),
  translations: z
    .array(ProductTranslationSchema)
    .refine(
      (val) => {
        const isTrLocale = val.some((item) => item.locale === Locale.TR);
        return isTrLocale;
      },
      {
        error: " En az bir çeviri Türkçe (TR) olmalıdır.",
      }
    )
    .refine(
      (val) => {
        const isUnique =
          val.length === new Set(val.map((item) => item.locale)).size;
        return isUnique;
      },
      {
        error: "Her dil için yalnızca bir çeviri sağlanmalıdır.",
      }
    ),
  prices: z
    .array(ProductPriceSchema)
    .refine(
      (val) => {
        const isTrExists = val.some((item) => item.currency === "TRY");
        return isTrExists;
      },
      {
        error: "Türk Lirası (TRY) fiyatı bulunmalıdır.",
        path: ["prices"],
      }
    )
    .refine(
      (val) => {
        const isCurrenciesUnique =
          new Set(val.map((item) => item.currency)).size === val.length;
        return isCurrenciesUnique;
      },
      {
        error: "Para birimi eşsiz olmalıdır",
        path: ["prices"],
      }
    ),
  existingImages: z
    .array(
      z.object({
        url: z.url({ error: "Lütfen geçerli bir url giriniz" }),
        type: z.enum(AssetType),
        order: z.number().min(0),
      })
    )
    .nullish(),
  images: z
    .array(
      z.object({
        file: FileSchema({ type: ["IMAGE", "VIDEO"] }),
        order: z.number().min(0),
      })
    )
    .nullish(),
  brandId: z.cuid2({ error: "Geçersiz marka kimliği" }).nullish(),
  tagIds: z.array(z.cuid2({ error: "Geçersiz etiket kimliği" })).nullish(),
  categories: z
    .array(z.cuid2({ error: "Geçersiz kategori kimliği" }))
    .nullish(),
  googleTaxonomyId: z
    .cuid2({ error: "Geçersiz Google Taksonomi kimliği" })
    .nullish(),
});

export const CombinatedVariantsSchema = z
  .object({
    variantIds: z
      .array(
        z.object({
          variantGroupId: z.cuid2(),
          variantOptionId: z.cuid2(),
        })
      )
      .min(1, { error: "En az bir varyant seçmelisiniz." }),
    sku: z
      .string({
        error: "SKU zorunludur.",
      })
      .max(100, {
        error: "SKU 100 karakterden uzun olamaz.",
      }),
    barcode: z
      .string({
        error: "Barkod zorunludur.",
      })
      .max(100, {
        error: "Barkod 100 karakterden uzun olamaz.",
      })
      .nullish(),
    prices: z
      .array(ProductPriceSchema)
      .refine(
        (val) => {
          const isTrExists = val.some((item) => item.currency === "TRY");
          return isTrExists;
        },
        {
          error: "Türk Lirası (TRY) fiyatı bulunmalıdır.",
          path: ["prices"],
        }
      )
      .refine(
        (val) => {
          const isCurrenciesUnique =
            new Set(val.map((item) => item.currency)).size === val.length;
          return isCurrenciesUnique;
        },
        {
          error: "Para birimi eşsiz olmalıdır",
          path: ["prices"],
        }
      ),
    existingImages: z
      .array(
        z.object({
          url: z.url({ error: "Lütfen geçerli bir url giriniz" }),
          type: z.enum(AssetType),
          order: z.number().min(0),
        })
      )
      .nullish(),
    images: z
      .array(
        z.object({
          file: FileSchema({ type: ["IMAGE", "VIDEO"] }),
          order: z.number().min(0),
        })
      )
      .nullish(),
    translations: z
      .array(
        ProductTranslationSchema.omit({
          name: true,
          slug: true,
        })
      )
      .refine(
        (val) => {
          const isTrLocale = val.some((item) => item.locale === Locale.TR);
          return isTrLocale;
        },
        {
          error: " En az bir çeviri Türkçe (TR) olmalıdır.",
        }
      )
      .refine(
        (val) => {
          const isUnique =
            val.length === new Set(val.map((item) => item.locale)).size;
          return isUnique;
        },
        {
          error: "Her dil için yalnızca bir çeviri sağlanmalıdır.",
        }
      ),
    active: z.boolean(),
    stock: z
      .number({ error: "Stok zorunludur." })
      .min(0, { error: "Stok 0'dan küçük olamaz." })
      .max(Number.MAX_SAFE_INTEGER, {
        error: "Stok çok büyük",
      }),
  })
  .check(({ issues, value, aborted }) => {
    const assetLimit = 10;
    const existingCount = value.existingImages?.length || 0;
    const newCount = value.images?.length || 0;
    const totalAsset = existingCount + newCount;

    if (totalAsset > assetLimit) {
      issues.push({
        code: "custom",
        input: ["images"],
        path: ["images"],
        message: `Toplam varlık sayısı ${assetLimit} ile sınırlıdır.`,
      });
    }

    if (value.existingImages && value.existingImages.length > 0) {
      const existingOrders = value.existingImages.map((img) => img.order);
      const hasDuplicateOrders =
        new Set(existingOrders).size !== existingOrders.length;

      if (hasDuplicateOrders) {
        issues.push({
          code: "custom",
          input: ["images"],
          path: ["existingImages"],
          message: "Mevcut görsellerin sıra numaraları benzersiz olmalıdır.",
        });
      }
    }

    if (value.images && value.images.length > 0) {
      const newOrders = value.images.map((img) => img.order);
      const hasDuplicateOrders = new Set(newOrders).size !== newOrders.length;

      if (hasDuplicateOrders) {
        issues.push({
          code: "custom",
          input: ["images"],
          path: ["images"],
          message: "Yeni görsellerin sıra numaraları benzersiz olmalıdır.",
        });
      }
    }

    const allOrders = [
      ...(value.existingImages?.map((img) => img.order) || []),
      ...(value.images?.map((img) => img.order) || []),
    ];

    const hasOverallDuplicates = new Set(allOrders).size !== allOrders.length;

    if (hasOverallDuplicates) {
      issues.push({
        code: "custom",
        input: ["images"],
        path: ["images"],
        message:
          "Mevcut ve yeni görsellerin sıra numaraları birbirleriyle çakışmamalıdır.",
      });
    }
  });

export const BaseProductSchema = BaseProductSchemaCore.check(
  ({ issues, value }) => {
    const assetLimit = 10;
    const existingCount = value.existingImages?.length || 0;
    const newCount = value.images?.length || 0;
    const totalAsset = existingCount + newCount;
    if (totalAsset > assetLimit) {
      issues.push({
        path: ["images"],
        error: `Toplam varlık sayısı ${assetLimit} ile sınırlıdır.`,
        code: "custom",
        input: ["images"],
      });
    }

    if (value.existingImages && value.existingImages.length > 0) {
      const existingOrders = value.existingImages.map((img) => img.order);
      const hasDuplicateOrders =
        new Set(existingOrders).size !== existingOrders.length;

      if (hasDuplicateOrders) {
        issues.push({
          path: ["existingImages"],
          error: "Mevcut görsellerin sıra numaraları benzersiz olmalıdır.",
          code: "custom",
          input: ["existingImages"],
        });
      }
    }

    if (value.images && value.images.length > 0) {
      const newOrders = value.images.map((img) => img.order);
      const hasDuplicateOrders = new Set(newOrders).size !== newOrders.length;

      if (hasDuplicateOrders) {
        issues.push({
          path: ["images"],
          error: "Yeni görsellerin sıra numaraları benzersiz olmalıdır.",
          code: "custom",
          input: ["images"],
        });
      }
    }

    const allOrders = [
      ...(value.existingImages?.map((img) => img.order) || []),
      ...(value.images?.map((img) => img.order) || []),
    ];

    const hasOverallDuplicates = new Set(allOrders).size !== allOrders.length;

    if (hasOverallDuplicates) {
      issues.push({
        path: ["images"],
        error:
          "Mevcut ve yeni görsellerin sıra numaraları birbirleriyle çakışmamalıdır.",
        code: "custom",
        input: ["images"],
      });
    }
  }
);

export const VariantProductSchema = BaseProductSchemaCore.omit({
  prices: true,
  stock: true,
  barcode: true,
  sku: true,
}).safeExtend({
  visibleAllCombinations: z.boolean(),
  existingVariants: z.array(VariantGroupSchema).min(1, {
    error: "En az bir varyant grubu eklemelisiniz.",
  }),
  combinatedVariants: z.array(CombinatedVariantsSchema).min(1, {
    error: "En az bir kombinasyon varyantı eklemelisiniz.",
  }),
});

export const Cuid2Schema = z.cuid2({ error: "Geçersiz kimlik" });
export const BodyCuid2Schema = z.object({
  id: Cuid2Schema,
});

export type BaseProductZodType = z.infer<typeof BaseProductSchema>;
export type BodyCuid2ZodType = z.infer<typeof BodyCuid2Schema>;
export type CombinatedVariantsZodType = z.infer<
  typeof CombinatedVariantsSchema
>;
export type Cuid2ZodType = z.infer<typeof Cuid2Schema>;
export type ProductPriceZodType = z.infer<typeof ProductPriceSchema>;
export type ProductTranslationZodType = z.infer<
  typeof ProductTranslationSchema
>;
export type VariantGroupTranslationZodType = z.infer<
  typeof VariantGroupTranslationSchema
>;
export type VariantGroupZodType = z.infer<typeof VariantGroupSchema>;
export type VariantOptionTranslationZodType = z.infer<
  typeof VariantOptionTranslationSchema
>;
export type VariantOptionZodType = z.infer<typeof VariantOptionSchema>;
export type VariantProductZodType = z.infer<typeof VariantProductSchema>;

export const BulkActionSchema = z.object({
  action: z.enum(ProductBulkAction),
  productIds: z.array(z.cuid2()),
  otherDetails: z
    .object({
      reason: z.string().min(2).max(256).nullish(),
      categoryId: z.cuid2().nullish(),
      brandId: z.cuid2().nullish(),
      tagIds: z.array(z.cuid2()).nullish(),
      taxonomyId: z.cuid2().nullish(),
      supplierId: z.cuid2().nullish(),
      percent: z.number().nullish(),
      amount: z.number().nullish(),
      stock: z.number().nullish(),
    })
    .nullish(),
});

export type BulkActionZodType = z.infer<typeof BulkActionSchema>;
