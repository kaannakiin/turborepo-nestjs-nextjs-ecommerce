import { $Enums, AssetType } from "@repo/database";
import * as z from "zod";
import { DiscountDatesSchema } from "../../discounts/discount.schema";
import { FileSchema } from "../../products/product-schemas";
import { colorHex } from "../../shared-schema";
import {
  AspectRatio,
  MantineFontWeight,
  MantineSize,
  ThemeComponents,
} from "../../shared/shared-enum";

export const SlideSchema = z
  .object({
    desktopView: z.object({
      file: FileSchema({ type: ["VIDEO", "IMAGE"] }).nullish(),
      existingAsset: z
        .object({
          url: z.url({ error: "Geçersiz URL" }),
          type: z.enum(AssetType, {
            error: "Geçerli bir değer seçiniz.",
          }),
        })
        .nullish(),
    }),
    mobileView: z
      .object({
        file: FileSchema({ type: ["VIDEO", "IMAGE"] }).nullish(),
        existingAsset: z
          .object({
            url: z.url({ error: "Geçersiz URL" }),
            type: z.enum(AssetType, {
              error: "Geçerli bir değer seçiniz.",
            }),
          })
          .nullish(),
      })
      .nullish(),
    conditionDates: DiscountDatesSchema,
  })
  .check(({ value: data, issues }) => {
    const hasDesktopFile = data.desktopView.file != null;
    const hasDesktopExisting = data.desktopView.existingAsset != null;

    if (!hasDesktopFile && !hasDesktopExisting) {
      issues.push({
        code: "custom",
        message:
          "Desktop görünümü için bir dosya veya mevcut asset seçilmelidir",
        path: ["desktopView"],
        input: data.desktopView,
      });
    }

    if (hasDesktopFile && hasDesktopExisting) {
      issues.push({
        code: "custom",
        message: "Hem yeni dosya hem de mevcut asset seçilemez",
        path: ["desktopView"],
        input: data.desktopView,
      });
    }

    if (data.mobileView != null) {
      const hasMobileFile = data.mobileView.file != null;
      const hasMobileExisting = data.mobileView.existingAsset != null;

      if (hasMobileFile && hasMobileExisting) {
        issues.push({
          code: "custom",
          message: "Hem yeni dosya hem de mevcut asset seçilemez",
          path: ["mobileView"],
          input: data.mobileView,
        });
      }
    }
  });

export const SliderSchema = SlideSchema.safeExtend({
  sliderId: z.cuid2(),
  order: z
    .number({ error: "Slayt sıralaması zorunludur." })
    .int({ error: "Slayt sıralaması tam sayı olmalıdır." })
    .min(0, {
      error: "Slayt sıralaması 0 veya daha büyük bir sayı olmalıdır.",
    }),
}).refine(
  (slide) => {
    const hasMobile = slide.mobileView != null;
    const hasDesktop = slide.desktopView != null;
    return hasDesktop || hasMobile;
  },
  {
    error: "Slayt en az bir görüntüleme (desktop veya mobile) içermelidir.",
  }
);

export const SliderComponentSchema = z.object({
  componentId: z.cuid2(),
  type: z.literal<ThemeComponents>("SLIDER"),
  order: z
    .number({ error: "Component sıralaması zorunludur." })
    .int({ error: "Component sıralaması tam sayı olmalıdır." })
    .min(0, {
      error: "Component sıralaması 0 veya daha büyük bir sayı olmalıdır.",
    }),
  sliders: z
    .array(SliderSchema)
    .min(1, { error: "Slider component en az 1 slayt içermelidir." })
    .refine(
      (sliders) => {
        const orders = sliders.map((slider) => slider.order);
        const uniqueOrders = new Set(orders);
        return orders.length === uniqueOrders.size;
      },
      {
        error: "Slayt sıralamaları benzersiz olmalıdır.",
      }
    ),
  options: z.object({
    aspectRatio: z.enum(AspectRatio, {
      error: "Geçerli bir aspect ratio değeri seçiniz.",
    }),
    mobileAspectRatio: z
      .enum(AspectRatio, {
        error: "Geçerli bir mobile aspect ratio değeri seçiniz.",
      })
      .nullish(),
    autoPlay: z.boolean(),
    autoPlayInterval: z
      .number({ error: "Otomatik oynatma aralığı zorunludur." })
      .int({ error: "Otomatik oynatma aralığı tam sayı olmalıdır." })
      .nonnegative({
        error: "Otomatik oynatma aralığı negatif olamaz.",
      })
      .min(1000, {
        error: "Otomatik oynatma aralığı en az 1000 ms olmalıdır.",
      })
      .max(60000, {
        error: "Otomatik oynatma aralığı en fazla 60000 ms olmalıdır.",
      }),
    loop: z.boolean(),
    showIndicators: z.boolean(),
    showArrows: z.boolean(),
  }),
});

export const MarqueeComponentSchema = z.object({
  componentId: z.cuid2(),
  type: z.literal<ThemeComponents>("MARQUEE"),
  order: z.number({ error: "Component sıralaması zorunludur." }).int().min(0),
  items: z
    .array(
      z
        .object({
          itemId: z.cuid2(),
          text: z.string({ error: "Marquee metni zorunludur." }).nullish(),
          link: z
            .url({ error: "Geçersiz link URL'si." })
            .startsWith("https://", {
              error: "Link 'https://' ile başlamalıdır.",
            })
            .nullish(),
          image: FileSchema({
            type: ["IMAGE"],
            maxSize: 5 * 1024 * 1024,
          }).nullish(),

          existingImage: z
            .object({
              url: z.url({ error: "Geçersiz URL" }),
              type: z.enum($Enums.AssetType, {
                error: "Geçerli bir değer seçiniz.",
              }),
            })
            .nullish(),
        })
        .check(({ value: item, issues }) => {
          const hasText = item.text != null && item.text.trim() !== "";
          const hasNewImage = item.image != null;
          const hasExistingImage = item.existingImage != null;

          if (hasNewImage && hasExistingImage) {
            issues.push({
              code: "custom",
              message: "Hem yeni resim hem de mevcut resim seçilemez.",
              path: ["image"],
              input: item.image,
            });
            issues.push({
              code: "custom",
              message: "Hem yeni resim hem de mevcut resim seçilemez.",
              path: ["existingImage"],
              input: item.existingImage,
            });
          }

          if (!hasText && !hasNewImage && !hasExistingImage) {
            issues.push({
              code: "custom",
              message: "Öğe, bir metin VEYA bir resim içermelidir.",
              path: ["text"],
              input: item.text,
            });
          }
        })
    )

    .min(1, { error: "Marquee en az bir öğe içermelidir." }),
  options: z.object({
    backgroundColor: colorHex.nullish(),
    textColor: colorHex.nullish(),
    fontSize: z
      .enum(MantineSize, { error: "Geçerli bir font boyutu seçiniz." })
      .nullish(),
    fontWeight: z
      .enum(MantineFontWeight, { error: "Geçerli bir font kalınlığı seçiniz." })
      .nullish(),
    paddingY: z
      .enum(MantineSize, {
        error: "Geçerli bir dikey padding değeri seçiniz.",
      })
      .nullish(),
    speed: z
      .number({ error: "Hız değeri zorunludur." })
      .positive({ error: "Hız pozitif bir sayı olmalıdır." }),
    pauseOnHover: z.boolean(),
    isReverse: z.boolean(),
  }),
});
export const CarouselItemSchema = z
  .object({
    productId: z.cuid2().optional().nullable(),
    variantId: z.cuid2().optional().nullable(),
    customTitle: z.string().optional(),
    customImage: z.url().optional(),
    badgeText: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.productId && !data.variantId) {
        return false;
      }
    },
    {
      error: "Ürün veya Varyant ID'si zorunludur.",
    }
  );

export const CarouselConfigSchema = z.object({
  slidesPerViewDesktop: z.number().min(1).max(6),
  slidesPerViewTablet: z.number().min(1).max(4),
  slidesPerViewMobile: z.number().min(1).max(2),
  autoplay: z.boolean(),
  autoplaySpeed: z.number().min(1000),
  loop: z.boolean(),
  showArrows: z.boolean(),
  showDots: z.boolean(),
  showAddToCartButton: z.boolean(),
  aspectRatio: z.enum(AspectRatio, {
    error: "Geçerli bir aspect ratio değeri seçiniz.",
  }),
});

export const ProductCarouselComponentSchema = z.object({
  componentId: z.cuid2({
    error: "Geçerli bir component ID'si giriniz.",
  }),
  type: z.literal("PRODUCT_CAROUSEL"),
  order: z.number({ error: "Sıralama zorunludur." }).int().min(0),
  title: z.string().max(100).optional(),
  description: z.string().max(300).optional(),
  config: CarouselConfigSchema,
  items: z
    .array(CarouselItemSchema)
    .min(1, { message: "Carousel içinde en az 1 ürün olmalıdır." })
    .max(20, { message: "Carousel içine en fazla 20 ürün ekleyebilirsiniz." }),
});

export const ThemeComponentSchema = z.discriminatedUnion("type", [
  SliderComponentSchema,
  MarqueeComponentSchema,
  ProductCarouselComponentSchema,
]);

export const ThemeSchema = z.object({
  components: z.array(ThemeComponentSchema).refine(
    (components) => {
      const orders = components.map((component) => component.order);
      const uniqueOrders = new Set(orders);
      return orders.length === uniqueOrders.size;
    },
    {
      error: "Component sıralamaları benzersiz olmalıdır.",
    }
  ),
});

//Slider Schemalar
export type SliderInputType = z.input<typeof SliderSchema>;
export type SliderOutputType = z.infer<typeof SliderSchema>;

export type SlideInputType = z.input<typeof SlideSchema>;
export type SlideOutputType = z.infer<typeof SlideSchema>;

export type SliderComponentInputType = z.input<typeof SliderComponentSchema>;
export type SliderComponentOutputType = z.infer<typeof SliderComponentSchema>;

export type MarqueeComponentInputType = z.input<typeof MarqueeComponentSchema>;
export type MarqueeComponentOutputType = z.infer<typeof MarqueeComponentSchema>;

export type CarouselItemInputType = z.input<typeof CarouselItemSchema>;
export type CarouselItemOutputType = z.infer<typeof CarouselItemSchema>;

export type CarouselConfigInputType = z.input<typeof CarouselConfigSchema>;
export type CarouselConfigOutputType = z.infer<typeof CarouselConfigSchema>;

export type ProductCarouselComponentInputType = z.input<
  typeof ProductCarouselComponentSchema
>;
export type ProductCarouselComponentOutputType = z.infer<
  typeof ProductCarouselComponentSchema
>;

export type ThemeComponentInputType = z.input<typeof ThemeComponentSchema>;
export type ThemeComponentOutputType = z.infer<typeof ThemeComponentSchema>;

export type ThemeInputType = z.input<typeof ThemeSchema>;
export type ThemeOutputType = z.infer<typeof ThemeSchema>;
