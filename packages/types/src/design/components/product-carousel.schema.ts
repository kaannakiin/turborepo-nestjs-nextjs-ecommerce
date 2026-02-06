import { z } from "zod";
import {
  colorHex,
  componentBreakpointSchema,
  DesignComponentType,
  MantineSize,
} from "../../common";
import type { AdminProductTableProductData } from "../../products/product-prisma-types";

export const DesignProductCarouselProductSchema = z
  .object({
    uniqueId: z.cuid2(),
    productData: z.custom<AdminProductTableProductData>().nullish(),
    isCustomBadgeActive: z.boolean({ error: "Badge durumu gereklidir." }),
    customBadgeText: z
      .string()
      .min(1, { error: "Badge yazısı en az 1 karakter olmalıdır." })
      .max(128, { error: "Badge yazısı en fazla 128 karakter olabilir." })
      .nullish(),
    customBadgeColor: colorHex.nullish(),
    customBadgeTextColor: colorHex.nullish(),
    order: z.number().int().default(0),
  })
  .refine(
    (data) => {
      if (data.isCustomBadgeActive) {
        return data.customBadgeText;
      }
      return true;
    },
    {
      error: "Badge aktif olduğunda badge yazısı gereklidir.",
    },
  );

export type DesignProductCarouselProductSchemaInputType = z.input<
  typeof DesignProductCarouselProductSchema
>;
export type DesignProductCarouselProductSchemaOutputType = z.output<
  typeof DesignProductCarouselProductSchema
>;

export const DesignProductCarouselSchema = z.object({
  uniqueId: z.cuid2(),
  type: z.literal(DesignComponentType.PRODUCT_CAROUSEL),
  title: z
    .string()
    .min(1, { error: "Başlık en az 1 karakter olmalıdır." })
    .max(256, { error: "Başlık en fazla 256 karakter olabilir." })
    .nullish(),
  subtitle: z
    .string()
    .min(1, { error: "Alt başlık en az 1 karakter olmalıdır." })
    .max(512, { error: "Alt başlık en fazla 512 karakter olabilir." })
    .nullish(),
  titleColor: colorHex.nullish(),
  subtitleColor: colorHex.nullish(),
  titleSize: z
    .enum(MantineSize, { error: "Geçersiz başlık boyutu." })
    .default("lg"),
  subtitleSize: z
    .enum(MantineSize, { error: "Geçersiz alt başlık boyutu." })
    .default("md"),
  backgroundColor: colorHex.nullish(),
  products: z
    .array(DesignProductCarouselProductSchema, {
      error: "Geçersiz ürün listesi.",
    })
    .min(1, { error: "En az 1 ürün eklemelisiniz." }),
  breakPoints: componentBreakpointSchema,
  showPrice: z.boolean({ error: "Fiyat gösterim durumu gereklidir." }),
  showAddToCartButton: z.boolean({
    error: "Sepete ekle butonu durumu gereklidir.",
  }),
});

export type DesignProductCarouselSchemaInputType = z.input<
  typeof DesignProductCarouselSchema
>;
export type DesignProductCarouselSchemaOutputType = z.output<
  typeof DesignProductCarouselSchema
>;
