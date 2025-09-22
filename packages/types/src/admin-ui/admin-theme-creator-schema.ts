import { $Enums } from "@repo/database";
import * as z from "zod";
import { FileSchema } from "../products/product-schemas";
import {
  FontFamily,
  MantineFontWeight,
  MantineSize,
  TextAlign,
} from "../shared/shared-enum";
const colorSchema = z
  .string({
    error: "Renk kodu zorunludur",
  })
  .refine(
    (val) => {
      return /^#([0-9A-F]{3}){1,2}$/i.test(val);
    },
    { error: "Geçersiz renk kodu" }
  );
export const SliderSchema = z
  .object({
    uniqueId: z.cuid2({
      error: "Geçersiz ID",
    }),
    desktopAsset: FileSchema({
      type: ["IMAGE", "VIDEO"],
    })
      .optional()
      .nullable(),
    mobileAsset: FileSchema({
      type: ["IMAGE", "VIDEO"],
    })
      .optional()
      .nullable(),
    existingDesktopAsset: z
      .object({
        url: z
          .url({
            error: "Geçersiz URL",
          })
          .startsWith("https", {
            error: "URL 'https' ile başlamalıdır.",
          }),
        type: z
          .enum($Enums.AssetType, {
            error: "Geçersiz dosya türü",
          })
          .refine((val) => val === "IMAGE" || val === "VIDEO", {
            message: "Dosya türü sadece 'IMAGE' veya 'VIDEO' olabilir.",
          }),
      })
      .optional()
      .nullable(),
    existingMobileAsset: z
      .object({
        url: z
          .url({
            error: "Geçersiz URL",
          })
          .startsWith("https", {
            error: "URL 'https' ile başlamalıdır.",
          }),
        type: z
          .enum($Enums.AssetType, {
            error: "Geçersiz dosya türü",
          })
          .refine((val) => val === "IMAGE" || val === "VIDEO", {
            message: "Dosya türü sadece 'IMAGE' veya 'VIDEO' olabilir.",
          }),
      })
      .optional()
      .nullable(),
    customLink: z
      .union([
        z.url().startsWith("https", {
          error: "URL 'https' ile başlamalıdır.",
        }),
        z.literal("").transform(() => null),
        z.null(),
      ])
      .optional(),
  })
  .refine(
    (data) => {
      // Desktop asset kontrolü: Ya desktopAsset ya da existingDesktopAsset olmalı (ikisi birden olamaz)
      const hasDesktopAsset = data.desktopAsset != null;
      const hasExistingDesktopAsset = data.existingDesktopAsset != null;

      // En az birisi olmalı
      if (!hasDesktopAsset && !hasExistingDesktopAsset) {
        return false;
      }

      // İkisi birden olamaz
      if (hasDesktopAsset && hasExistingDesktopAsset) {
        return false;
      }

      return true;
    },
    {
      message:
        "Ya desktopAsset ya da existingDesktopAsset belirtilmelidir, ikisi birden olamaz.",
    }
  )
  .refine(
    (data) => {
      // Mobile asset kontrolü: Eğer existingMobileAsset varsa mobileAsset olamaz
      const hasMobileAsset = data.mobileAsset != null;
      const hasExistingMobileAsset = data.existingMobileAsset != null;

      // İkisi birden olamaz (ama ikisi de olmayabilir çünkü mobile optional)
      if (hasMobileAsset && hasExistingMobileAsset) {
        return false;
      }

      return true;
    },
    {
      message: "mobileAsset ve existingMobileAsset aynı anda belirtilemez.",
    }
  );

export type SliderType = z.infer<typeof SliderSchema>;
// Slider with order for internal use in components array
export const SliderWithOrderSchema = SliderSchema.safeExtend({
  order: z
    .number({
      error: "Sıra zorunlu",
    })
    .min(0, { error: "Sıra 0 veya daha büyük olmalı" })
    .int({ message: "Sıra tam sayı olmalı" }),
});

export type SliderWithOrderType = z.infer<typeof SliderWithOrderSchema>;

export const MarqueeSchema = z.object({
  uniqueId: z.cuid2({
    error: "Geçersiz ID",
  }),
  reverse: z.boolean(),
  repeat: z
    .number({ error: "Tekrar sayısı zorunludur." })
    .min(10, { error: "Tekrar sayısı en az 10 olmalıdır." })
    .max(50, { error: "Tekrar sayısı en fazla 50 olabilir." }),
  text: z
    .string({
      error: "Metin zorunludur.",
    })
    .min(1, { error: "Metin en az 1 karakter olmalıdır." })
    .max(256, {
      error: "Metin en fazla 256 karakter olmalıdır.",
    }),
  duration: z
    .number({
      error: "Süre zorunludur.",
    })
    .nonnegative({
      error: "Süre negatif olamaz",
    })
    .min(0.1, { error: "Süre en az 0.1 saniye olmalıdır." })
    .max(60, { error: "Süre en fazla 60 saniye olabilir." })
    .optional()
    .nullable(),
  fontSize: z
    .enum(MantineSize, {
      error: "Geçersiz boyut",
    })
    .optional()
    .nullable(),
  paddingY: z
    .enum(MantineSize, {
      error: "Geçersiz boyut",
    })
    .optional()
    .nullable(),
  backgroundColor: colorSchema,
  textColor: colorSchema,
  pauseOnHover: z.boolean(),
  fontWeight: z.enum(MantineFontWeight, {
    error: "Geçersiz font ağırlığı",
  }),
});

export type MarqueeType = z.infer<typeof MarqueeSchema>;

export const ProductListComponentSchema = z.object({
  uniqueId: z.cuid2({
    error: "Geçersiz ID",
  }),
  items: z
    .array(
      z.object({
        productId: z.cuid2({
          error: "Geçersiz ürün ID'si",
        }),
        variantId: z
          .cuid2({
            error: "Geçersiz varyant ID'si",
          })
          .optional()
          .nullable(),
      })
    )
    .min(1, {
      message: "En az bir ürün eklemelisiniz.",
    })
    .refine(
      (items) => {
        const seen = new Set(
          items.map((item) => `${item.productId}-${item.variantId ?? ""}`)
        );
        return seen.size === items.length;
      },
      {
        message:
          "Aynı ürün ve varyant kombinasyonu birden fazla kez eklenemez.",
      }
    ),
  title: z
    .string({
      error: "Başlık zorunludur.",
    })
    .min(1, { error: "Başlık en az 1 karakter olmalıdır." })
    .max(256, {
      error: "Başlık en fazla 256 karakter olmalıdır.",
    }),
  backgroundColor: colorSchema,
  titleColor: colorSchema,
  textColor: colorSchema,
  titleFontSize: z.enum(MantineSize, {
    error: "Geçersiz boyut",
  }),
});

export type ProductListComponentType = z.infer<
  typeof ProductListComponentSchema
>;

export const CategoryGridComponentSchema = z.object({
  uniqueId: z.cuid2({
    error: "Geçersiz ID",
  }),
  backgroundColor: colorSchema,
  textColor: colorSchema,
  imageScaleOnHover: z.boolean(),
  desktopGridColumns: z
    .number({
      error: "Masaüstü sütun sayısı zorunludur.",
    })
    .min(1, { error: "Masaüstü sütun sayısı en az 1 olmalı." })
    .int({ message: "Masaüstü sütun sayısı tam sayı olmalı." }),
  tabletGridColumns: z
    .number({
      error: "Tablet sütun sayısı zorunludur.",
    })
    .min(1, { error: "Tablet sütun sayısı en az 1 olmalı." })
    .int({ message: "Tablet sütun sayısı tam sayı olmalı." }),
  mobileGridColumns: z
    .number()
    .min(1, {
      error: "Mobil sütun sayısı zorunludur.",
    })
    .int({
      error: "Mobil sütun sayısı tam sayı olmalı.",
    }),
  showImageOverlay: z.boolean(),
  fontWeight: z.enum(MantineFontWeight, {
    error: "Geçersiz font ağırlığı",
  }),
  textAlign: z.enum(TextAlign, {
    error: "Geçersiz metin hizalaması",
  }),
  showCategoryNamesOnImages: z.boolean(),
  categoryIds: z
    .array(
      z.cuid2({
        error: "Geçersiz kategori ID'si",
      }),
      {
        error: "Kategori ID'leri dizisi zorunludur",
      }
    )
    .min(1, {
      error: "En az bir kategori seçmelisiniz.",
    })
    .refine((ids) => new Set(ids).size === ids.length, {
      error: "Aynı kategori birden fazla kez seçilemez.",
    }),
});

export type CategoryGridComponentType = z.infer<
  typeof CategoryGridComponentSchema
>;

export const LayoutComponentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal($Enums.LayoutComponentType.SLIDER),
    layoutOrder: z.literal(1), // Slider her zaman 1 olacak
    data: z.array(SliderWithOrderSchema),
  }),
  z.object({
    type: z.literal($Enums.LayoutComponentType.MARQUEE),
    layoutOrder: z
      .number({
        error: "Sıra zorunlu",
      })
      .min(2, { error: "Marquee sırası en az 2 olmalı" }), // Slider 1 olduğu için 2'den başlasın
    data: MarqueeSchema,
  }),
  z.object({
    type: z.literal($Enums.LayoutComponentType.PRODUCT_LIST),
    layoutOrder: z
      .number({
        error: "Sıra zorunlu",
      })
      .min(2, { error: "Marquee sırası en az 2 olmalı" }),
    data: ProductListComponentSchema,
  }),
  z.object({
    type: z.literal($Enums.LayoutComponentType.CATEGORY_GRID),
    layoutOrder: z
      .number({
        error: "Sıra zorunlu",
      })
      .min(2, { error: "Kategori ızgarası sırası en az 2 olmalı" }),
    data: CategoryGridComponentSchema,
  }),
]);

export type LayoutComponentType = z.infer<typeof LayoutComponentSchema>;

export const MainPageComponentsSchema = z.object({
  primaryColor: colorSchema,
  secondaryColor: colorSchema,
  fontFamily: z.enum(FontFamily, {
    error: "Geçersiz font ailesi",
  }),
  components: z
    .array(LayoutComponentSchema, {
      error: " Bileşenler dizisi zorunludur",
    })
    .refine(
      (components) => {
        const orders = components.map((c) => c.layoutOrder);
        return orders.length === new Set(orders).size;
      },
      {
        error: "Layout sıraları benzersiz olmalıdır.",
      }
    ),
});

export type MainPageComponentsType = z.infer<typeof MainPageComponentsSchema>;
