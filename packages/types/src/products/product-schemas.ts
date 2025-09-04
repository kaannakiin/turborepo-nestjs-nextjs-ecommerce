import { $Enums, AssetType, Locale, VariantGroupType } from "@repo/database";
import * as z from "zod";

export const MIME_TYPES = {
  IMAGE: [
    "image/jpeg", // .jpg, .jpeg - En yaygın
    "image/png", // .png - Şeffaflık için
    "image/webp", // .webp - Modern, küçük boyut
    "image/gif", // .gif - Animasyonlu ürün görselleri için
  ] as string[],

  VIDEO: ["video/webm"] as string[],

  AUDIO: [
    "audio/mpeg", // .mp3 - En yaygın ses formatı
    "audio/mp4", // .m4a - iPhone/iPad için
  ] as string[],

  DOCUMENT: [
    "application/pdf", // .pdf - Kataloglar, kılavuzlar
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/plain", // .txt - Basit dökümanlar
  ] as string[],
} as Record<AssetType, string[]>;

export const getMimeTypesForAssetType = (type: AssetType): string[] => {
  return MIME_TYPES[type] || [];
};

export const getAssetTypeMessage = (types: AssetType[] | AssetType): string => {
  const typeArray = Array.isArray(types) ? types : [types];

  const messages = typeArray.map((type) => {
    switch (type) {
      case AssetType.IMAGE:
        return "resim dosyaları (JPEG, PNG, GIF, WebP, SVG)";
      case AssetType.VIDEO:
        return "video dosyaları (MP4, AVI, MOV, WebM)";
      case AssetType.AUDIO:
        return "ses dosyaları (MP3, WAV, AAC, FLAC)";
      case AssetType.DOCUMENT:
        return "döküman dosyaları (PDF, DOC, DOCX, XLS, XLSX, TXT)";
      default:
        return "desteklenen dosyalar";
    }
  });

  return messages.join(" veya ");
};

export const FileSchema = ({ type }: { type: AssetType[] | AssetType }) => {
  const allowedTypes = Array.isArray(type) ? type : [type];
  const allowedMimeTypes = allowedTypes.flatMap(getMimeTypesForAssetType);

  return z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: "Dosya boş olamaz.",
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: `Dosya boyutu 10MB'dan küçük olmalıdır.`,
    })
    .refine((file) => allowedMimeTypes.includes(file.type), {
      message: `Sadece ${getAssetTypeMessage(allowedTypes)} yükleyebilirsiniz.`,
    })
    .refine(
      (file) => {
        // Dosya adı kontrolü (opsiyonel)
        const fileName = file.name;
        return fileName.length > 0 && fileName.length <= 255;
      },
      {
        message: "Dosya adı 1-255 karakter arasında olmalıdır.",
      }
    );
};

export const htmlDescriptionSchema = z
  .string()
  .min(1, { message: "Açıklama zorunludur." })
  .max(10000, { message: "Açıklama en fazla 10.000 karakter olabilir." })
  .refine(
    (value) => {
      const dangerousTags =
        /<(script|iframe|object|embed|form|input|button|meta|link|style)/i;
      return !dangerousTags.test(value);
    },
    {
      message: "Güvenlik nedeniyle bazı HTML etiketlerine izin verilmez.",
    }
  )
  .refine(
    (value) => {
      const openTags = (value.match(/<[^\/][^>]*>/g) || []).length;
      const closeTags = (value.match(/<\/[^>]*>/g) || []).length;
      const selfClosingTags = (value.match(/<[^>]*\/>/g) || []).length;

      return openTags - selfClosingTags <= closeTags;
    },
    {
      message: "HTML etiketleri düzgün kapatılmalıdır.",
    }
  )
  .optional()
  .nullable();

export const VariantOptionTranslationSchema = z.object({
  locale: z.enum(Locale),
  name: z
    .string({
      error: "Geçerli bir isim giriniz.",
    })
    .min(1, "İsim zorunludur.")
    .max(256, {
      message: "İsim 256 karakterden uzun olamaz.",
    }),
  slug: z
    .string({
      error: "Geçerli bir slug giriniz.",
    })
    .min(1, "Slug zorunludur.")
    .max(256, {
      message: "Slug 256 karakterden uzun olamaz.",
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
      message: "Geçerli bir hex renk kodu giriniz (örn: #FF0000)",
    })
    .nullable()
    .optional(),
  file: FileSchema({ type: "IMAGE" }).optional().nullable(),
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
      message: "Variant Grup adı 256 karakterden uzun olamaz.",
    }),
  slug: z
    .string({ error: "Slug zorunludur." })
    .min(1, "Slug zorunludur.")
    .max(256, {
      message: "Slug 256 karakterden uzun olamaz.",
    }),
});

export const VariantGroupSchema = z.object({
  uniqueId: z.cuid2(),
  translations: z
    .array(VariantGroupTranslationSchema)
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
        message: "Her dil için yalnızca bir çeviri sağlanmalıdır.",
      }
    ),
  type: z.enum(VariantGroupType),
  options: z.array(VariantOptionSchema).min(1, {
    message: "En az bir varyant seçeneği olmalıdır.",
  }),
});

export const ProductPriceSchema = z
  .object({
    currency: z.enum($Enums.Currency),
    price: z
      .number()
      .positive({ message: "Fiyat 0'dan büyük olmalıdır." })
      .max(Number.MAX_SAFE_INTEGER, {
        message: "Fiyat çok büyük.",
      }),
    discountPrice: z
      .number()
      .min(0, { message: "İndirimli fiyat 0'dan küçük olamaz." })
      .max(Number.MAX_SAFE_INTEGER, {
        message: "Fiyat çok büyük.",
      })
      .optional()
      .nullable(),
    buyedPrice: z
      .number()
      .positive({ message: "Satın alınan fiyat 0'dan büyük olmalıdır." })
      .max(Number.MAX_SAFE_INTEGER, {
        message: "Fiyat çok büyük.",
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
      message: "İndirimli fiyat normal fiyattan büyük olamaz.",
      path: ["discountPrice"],
    }
  );

export const ProductTranslationSchema = z.object({
  locale: z.enum($Enums.Locale),
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

export const BaseProductSchema = z
  .object({
    type: z.enum($Enums.ProductType),
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
        })
      )
      .optional()
      .nullable(),
    images: z
      .array(FileSchema({ type: ["IMAGE", "VIDEO"] }))
      .optional()
      .nullable(),
    brandId: z.cuid2({ error: "Geçersiz marka kimliği" }).optional().nullable(),
    categories: z
      .array(z.cuid2({ error: "Geçersiz kategori kimliği" }))
      .optional()
      .nullable(),
  })
  .check(({ issues, value }) => {
    const assetLimit = 10;
    const totalAsset =
      value.existingImages?.length || 0 + value.images?.length || 0;
    if (totalAsset > assetLimit) {
      issues.push({
        path: ["images"],
        message: `Toplam varlık sayısı ${assetLimit} ile sınırlıdır.`,
        code: "custom",
        input: ["images"],
      });
    }
  });

export const CombinatedVariantsSchema = z.object({
  variantIds: z
    .array(
      z.object({
        variantGroupId: z.cuid2(),
        variantOptionId: z.cuid2(),
      })
    )
    .min(1, { message: "En az bir varyant seçmelisiniz." }),
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
    }),
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
      })
    )
    .optional()
    .nullable(),
  images: z
    .array(FileSchema({ type: ["IMAGE", "VIDEO"] }))
    .optional()
    .nullable(),
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
});

export const VariantProductSchema = BaseProductSchema.omit({
  prices: true,
}).safeExtend({
  uniqueId: z.cuid2(),
  existingVariants: z.array(VariantGroupSchema).min(1, {
    error: "En az bir varyant grubu eklemelisiniz.",
  }),
  combinatedVariants: z.array(CombinatedVariantsSchema).min(1, {
    error: "En az bir kombinasyon varyantı eklemelisiniz.",
  }),
});

export const Cuid2Schema = z.cuid2({ error: "Geçersiz kimlik" });

export type Cuid2ZodType = z.infer<typeof Cuid2Schema>;
export type VariantProductZodType = z.infer<typeof VariantProductSchema>;
export type VariantGroupTranslationZodType = z.infer<
  typeof VariantGroupTranslationSchema
>;
export type VariantGroupZodType = z.infer<typeof VariantGroupSchema>;
export type VariantOptionZodType = z.infer<typeof VariantOptionSchema>;
export type VariantOptionTranslationZodType = z.infer<
  typeof VariantOptionTranslationSchema
>;
