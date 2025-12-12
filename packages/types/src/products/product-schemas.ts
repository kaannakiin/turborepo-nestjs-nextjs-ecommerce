import {
  $Enums,
  AssetType,
  Currency,
  Locale,
  Prisma,
  ProductType,
  VariantGroupRenderType,
  VariantGroupType,
} from "@repo/database/client";
import { parseDocument } from "htmlparser2";
import * as z from "zod";
/**
 * Asset tiplerine karşılık gelen MIME type'ları tanımlar.
 * Her asset tipi için izin verilen dosya formatlarının MIME type listesi.
 */
export const MIME_TYPES = {
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "svg+xml",
  ] as string[],
  VIDEO: ["video/webm"] as string[],
  AUDIO: ["audio/mpeg", "audio/mp4"] as string[],
  DOCUMENT: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ] as string[],
} as Record<AssetType, string[]>;

/**
 * Belirtilen asset tipi için izin verilen MIME type'ları döndürür.
 *
 * @param type - Asset tipi
 * @returns MIME type dizisi veya tip bulunamazsa boş dizi
 *
 * @example
 * getMimeTypesForAssetType(AssetType.IMAGE)
 * // ["image/jpeg", "image/png", "image/webp", "image/gif"]
 */
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

/**
 * Dosya yükleme için Zod validation şeması oluşturur.
 * Dosya boyutu, tipi ve içeriği için validasyon kuralları uygular.
 *
 * @param type - İzin verilen asset tipi veya tipleri
 * @param maxSize - Maksimum dosya boyutu (byte cinsinden, varsayılan: 10MB)
 * @returns Zod dosya validation şeması
 *
 * Validasyon kuralları:
 * - Dosya geçerli bir File instance'ı olmalı
 * - Dosya boş olmamalı (size > 0)
 * - Dosya boyutu maxSize'ı geçmemeli
 * - Dosya tipi belirtilen asset tiplerinden birine uygun olmalı
 *
 * @example
 * const imageSchema = FileSchema({ type: AssetType.IMAGE });
 * const multiTypeSchema = FileSchema({
 *   type: [AssetType.IMAGE, AssetType.VIDEO],
 *   maxSize: 5 * 1024 * 1024 // 5MB
 * });
 */
export const FileSchema = ({
  type,
  maxSize = 10 * 1024 * 1024,
}: {
  type: AssetType[] | AssetType;
  maxSize?: number;
}) => {
  const allowedTypes = Array.isArray(type) ? type : [type];
  const allowedMimeTypes = allowedTypes.flatMap(getMimeTypesForAssetType);

  return z
    .instanceof(File, {
      error: "Geçerli bir dosya yükleyiniz.",
    })
    .refine((file) => file.size > 0, {
      error: "Dosya boş olamaz.",
    })
    .refine((file) => file.size <= maxSize, {
      error: `Dosya boyutu en fazla ${maxSize / (1024 * 1024)} MB olabilir.`,
    })
    .refine((file) => allowedMimeTypes.includes(file.type), {
      error: `Sadece ${getAssetTypeMessage(allowedTypes)} yükleyebilirsiniz.`,
    });
};

export const htmlDescriptionSchema = z
  .string()
  .min(1, { error: "Açıklama zorunludur." })
  .max(10000, { error: "Açıklama en fazla 10.000 karakter olabilir." })
  .refine(
    (value) => {
      const dangerousTags =
        /<(script|iframe|object|embed|form|input|button|meta|link|style)/i;
      return !dangerousTags.test(value);
    },
    {
      error: "Güvenlik nedeniyle bazı HTML etiketlerine izin verilmez.",
    }
  )
  .refine(
    (value) => {
      try {
        parseDocument(value);
        return true;
      } catch {
        return false;
      }
    },
    { error: "HTML etiketleri düzgün kapatılmalıdır." }
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
      .optional()
      .nullable(),
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

export const BaseProductSchema = z
  .object({
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
      }),
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
      .optional()
      .nullable(),
    images: z
      .array(
        z.object({
          file: FileSchema({ type: ["IMAGE", "VIDEO"] }),
          order: z.number().min(0),
        })
      )
      .optional()
      .nullable(),
    brandId: z.cuid2({ error: "Geçersiz marka kimliği" }).optional().nullable(),
    categories: z
      .array(z.cuid2({ error: "Geçersiz kategori kimliği" }))
      .optional()
      .nullable(),
    googleTaxonomyId: z
      .cuid2({ error: "Geçersiz Google Taksonomi kimliği" })
      .optional()
      .nullable(),
  })
  .check(({ issues, value }) => {
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

    // Sadece duplicate order kontrolü
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

    // Tüm order'ların (existing + new) unique olduğunu kontrol et
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
          order: z.number().min(0),
        })
      )
      .optional()
      .nullable(),
    images: z
      .array(
        z.object({
          file: FileSchema({ type: ["IMAGE", "VIDEO"] }),
          order: z.number().min(0),
        })
      )
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
  })
  .check(({ issues, value, aborted }) => {
    const assetLimit = 10;
    const existingCount = value.existingImages?.length || 0;
    const newCount = value.images?.length || 0;
    const totalAsset = existingCount + newCount;

    // 1. Toplam sayı kontrolü
    if (totalAsset > assetLimit) {
      issues.push({
        code: "custom",
        input: ["images"],
        path: ["images"],
        message: `Toplam varlık sayısı ${assetLimit} ile sınırlıdır.`,
      });
    }

    // 2. Mevcut görsellerin kendi içinde sıra (order) kontrolü
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

    // 3. Yeni görsellerin kendi içinde sıra (order) kontrolü
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

    // 4. Mevcut ve yeni görsellerin çakışma kontrolü
    const allOrders = [
      ...(value.existingImages?.map((img) => img.order) || []),
      ...(value.images?.map((img) => img.order) || []),
    ];

    const hasOverallDuplicates = new Set(allOrders).size !== allOrders.length;

    if (hasOverallDuplicates) {
      // Hatayı images altına ekliyoruz
      issues.push({
        code: "custom",
        input: ["images"],
        path: ["images"],
        message:
          "Mevcut ve yeni görsellerin sıra numaraları birbirleriyle çakışmamalıdır.",
      });
    }
  });

export const VariantProductSchema = BaseProductSchema.omit({
  prices: true,
  stock: true,
  active: true,
  barcode: true,
  sku: true,
}).safeExtend({
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
export type BodyCuid2ZodType = z.infer<typeof BodyCuid2Schema>;
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

export type BaseProductZodType = z.infer<typeof BaseProductSchema>;

export type AdminProductTableData = Prisma.ProductGetPayload<{
  include: {
    _count: {
      select: {
        variantCombinations: true;
      };
    };
    assets: {
      where: {
        asset: { type: "IMAGE" };
      };
      take: 1;
      orderBy: { order: "asc" };
      select: {
        asset: {
          select: { url: true; type: true };
        };
      };
    };
    translations: {
      where: { locale: "TR" };
      select: {
        name: true;
      };
    };
    prices: {
      where: { currency: "TRY" };
      select: {
        price: true;
        discountedPrice: true;
      };
    };
    variantCombinations: {
      select: {
        stock: true;
        assets: {
          where: {
            asset: { type: "IMAGE" };
          };
          take: 1;
          orderBy: { order: "asc" };
          select: {
            asset: {
              select: { url: true; type: true };
            };
          };
        };
        prices: {
          where: { currency: "TRY" };
          select: {
            price: true;
            discountedPrice: true;
          };
        };
      };
    };
  };
}> & {
  // Computed fields
  priceDisplay: string;
  stockDisplay: string;
  finalImage: string | null;
  finalImageType: AssetType | null;
};

export type GetProductPageReturnType = {
  success: boolean;
  message: string;
  data: Prisma.ProductGetPayload<{
    include: {
      assets: {
        orderBy: {
          order: "asc";
        };
        include: {
          asset: {
            select: {
              url: true;
              type: true;
            };
          };
        };
      };
      brand: {
        select: {
          translations: {
            where: { locale };
            select: {
              description: true;
              metaDescription: true;
              metaTitle: true;
              name: true;
              slug: true;
            };
          };
        };
      };
      categories: {
        where: {
          category: {
            translations: {
              some: { locale };
            };
            products: {
              some: {
                product: {
                  OR: [
                    {
                      active: true;
                      stock: { gt: 0 };
                      isVariant: false;
                    },
                    {
                      active: true;
                      variantCombinations: {
                        some: {
                          active: true;
                          stock: { gt: 0 };
                        };
                      };
                    },
                  ];
                };
              };
            };
          };
        };
        select: {
          category: {
            select: {
              id: true;
              translations: {
                where: { locale };
                select: {
                  name: true;
                  slug: true;
                  locale: true;
                  metaTitle: true;
                  metaDescription: true;
                  description: true;
                };
              };
            };
          };
        };
      };
      prices: {
        select: {
          price: true;
          currency: true;
          discountedPrice: true;
        };
      };
      translations: {
        where: { locale };
        select: {
          name: true;
          locale: true;
          metaDescription: true;
          metaTitle: true;
          slug: true;
          description: true;
        };
      };
      taxonomyCategory: {
        select: {
          googleId: true;
        };
      };
      variantGroups: {
        orderBy: {
          order: "asc";
        };
        where: {
          product: {
            active: true;
            variantCombinations: {
              some: {
                active: true;
                stock: { gt: 0 };
              };
            };
          };
        };
        include: {
          variantGroup: {
            select: {
              id: true;
              type: true;
              translations: {
                where: {
                  locale;
                };
                select: {
                  locale: true;
                  name: true;
                  slug: true;
                };
              };
            };
          };
          options: {
            orderBy: {
              order: "asc";
            };
            where: {
              combinations: {
                some: {
                  combination: {
                    active: true;
                    stock: { gt: 0 };
                  };
                  productVariantOption: {
                    productVariantGroup: {
                      product: {
                        active: true;
                      };
                    };
                  };
                };
              };
            };
            select: {
              order: true;
              variantOption: {
                select: {
                  id: true;
                  asset: { select: { url: true; type: true } };
                  hexValue: true;
                  translations: {
                    where: { locale };
                    select: {
                      locale: true;
                      name: true;
                      slug: true;
                    };
                  };
                };
              };
            };
          };
        };
      };
      variantCombinations: {
        where: {
          active: true;
          stock: { gt: 0 };
          product: {
            active: true;
          };
        };
        include: {
          assets: {
            orderBy: {
              order: "asc";
            };
            select: {
              asset: {
                select: {
                  url: true;
                  type: true;
                };
              };
            };
          };
          translations: {
            where: { locale };
            select: {
              locale: true;
              metaDescription: true;
              metaTitle: true;
              description: true;
            };
          };
          prices: true;
          options: {
            select: {
              productVariantOption: {
                select: {
                  order: true;
                  variantOption: {
                    select: {
                      id: true;
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  }> | null;
};

export type ProductPageDataType = Prisma.ProductGetPayload<{
  include: {
    prices: true;
    assets: {
      orderBy: {
        order: "asc";
      };
      select: {
        asset: {
          select: {
            url: true;
            type: true;
          };
        };
      };
    };
    brand: {
      select: {
        translations: {
          select: {
            name: true;
            locale: true;
            metaDescription: true;
            metaTitle: true;
            slug: true;
          };
        };
      };
    };
    taxonomyCategory: true;
    translations: {
      select: {
        name: true;
        locale: true;
        metaDescription: true;
        metaTitle: true;
        slug: true;
        description: true;
      };
    };
    variantGroups: {
      orderBy: {
        order: "asc";
      };
      where: {
        product: {
          translations: {
            some: {
              slug: { contains: string; mode: "insensitive" };
            };
          };
        };
      };
      include: {
        options: {
          where: {
            productVariantGroup: {
              product: {
                translations: {
                  some: {
                    slug: { contains: string; mode: "insensitive" };
                  };
                };
              };
            };
          };
          orderBy: {
            order: "asc";
          };
          include: {
            variantOption: {
              include: {
                asset: { select: { url: true; type: true } };
                translations: true;
              };
            };
          };
        };
        variantGroup: {
          include: {
            translations: true;
          };
        };
      };
    };
    variantCombinations: {
      where: {
        AND: [
          {
            stock: {
              gt: 0;
            };
          },
          { active: true },
        ];
      };
      include: {
        translations: {
          select: {
            locale: true;
            metaDescription: true;
            metaTitle: true;
            description: true;
          };
        };
        prices: {
          select: {
            price: true;
            currency: true;
            discountedPrice: true;
          };
        };
        assets: {
          orderBy: {
            order: "asc";
          };
          select: {
            asset: {
              select: {
                url: true;
                type: true;
              };
            };
          };
        };
        options: {
          where: {
            combination: {
              AND: [
                {
                  active: true;
                },
                {
                  stock: { gt: 0 };
                },
              ];
            };

            productVariantOption: {
              productVariantGroup: {
                product: {
                  translations: {
                    some: {
                      slug: { contains: string; mode: "insensitive" };
                    };
                  };
                };
              };
            };
          };
          orderBy: {
            productVariantOption: {
              productVariantGroup: {
                order: "asc";
              };
            };
          };
          include: {
            productVariantOption: {
              select: {
                variantOption: {
                  select: {
                    asset: { select: { url: true; type: true } };
                    translations: {
                      select: {
                        locale: true;
                        name: true;
                        slug: true;
                      };
                    };
                    hexValue: true;
                    variantGroup: {
                      select: {
                        translations: {
                          select: {
                            name: true;
                            slug: true;
                            locale: true;
                          };
                        };
                        type: true;
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
    categories: {
      where: {
        product: {
          translations: {
            some: {
              slug: { contains: string; mode: "insensitive" };
            };
          };
        };
      };
      include: {
        category: {
          select: {
            translations: true;
            childCategories: true;
            parentCategory: true;
          };
        };
      };
    };
  };
}>;

export type ModalProductCardForAdmin = {
  productId: string;
  variantId: string | null;
  productName: string;
  productSlug: string;
  brandName: string | null;
  isVariant: boolean;
  price: number;
  discountedPrice: number | null;
  currency: $Enums.Currency;
  image: { url: string; type: $Enums.AssetType } | null;
  variants:
    | {
        productVariantGroupId: string;
        productVariantGroupName: string;
        productVariantGroupSlug: string;
        productVariantOptionId: string;
        productVariantOptionName: string;
        productVariantOptionSlug: string;
        hexValue: string | null;
        asset: { url: string; type: $Enums.AssetType } | null;
      }[]
    | null;
};
