import * as z from "zod";
import { FileSchema } from "../../products/product-schemas";
import { $Enums } from "@repo/database";
import { DiscountDatesSchema } from "../../discounts/discount.schema";
import { colorHex } from "../../shared-schema";
import { MantineFontWeight, MantineSize } from "../../shared/shared-enum";

export const Pages = {
  HOME: "HOME",
  PRODUCT: "PRODUCT",
} as const;
export type Pages = (typeof Pages)[keyof typeof Pages];

export const SliderV2Schema = z
  .object({
    desktopView: z.object({
      file: FileSchema({ type: ["VIDEO", "IMAGE"] }).nullish(),
      existingAsset: z
        .object({
          url: z.url({ error: "Geçersiz URL" }),
          type: z.enum($Enums.AssetType, {
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
            type: z.enum($Enums.AssetType, {
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

export const SlideItemSchema = SliderV2Schema.safeExtend({
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
  type: z.literal<$Enums.LayoutComponentType>("SLIDER"),
  order: z
    .number({ error: "Component sıralaması zorunludur." })
    .int({ error: "Component sıralaması tam sayı olmalıdır." })
    .min(0, {
      error: "Component sıralaması 0 veya daha büyük bir sayı olmalıdır.",
    }),
  sliders: z
    .array(SlideItemSchema)
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
});

export const MarqueeComponentSchema = z.object({
  type: z.literal<$Enums.LayoutComponentType>("MARQUEE"),
  order: z.number({ error: "Component sıralaması zorunludur." }).int().min(0),

  items: z
    .array(
      z
        .object({
          text: z.string({ error: "Marquee metni zorunludur." }).nullish(),
          link: z.url({ error: "Geçersiz link URL'si." }).nullish(),
          image: FileSchema({ type: ["IMAGE"] }).nullish(),
        })
        .refine(
          (item) => {
            const hasText = item.text != null && item.text.trim() !== "";
            const hasImage = item.image != null;
            return hasText || hasImage;
          },
          {
            error:
              "Her marquee öğesi en az bir metin veya bir resim içermelidir.",
          }
        )
    )
    .min(1, { error: "Marquee en az bir metin içermelidir." }),
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
});

export const ThemeComponentSchema = z.discriminatedUnion("type", [
  SliderComponentSchema,
  MarqueeComponentSchema,
]);

export const ThemeV2Schema = z.array(ThemeComponentSchema).refine(
  (components) => {
    const orders = components.map((component) => component.order);
    const uniqueOrders = new Set(orders);
    return orders.length === uniqueOrders.size;
  },
  {
    error: "Component sıralamaları benzersiz olmalıdır.",
  }
);

export const PagesThemeV2Schema = z.discriminatedUnion("page", [
  z.object({
    page: z.literal<Pages>("HOME"),
    theme: ThemeV2Schema,
  }),
]);

//Slider Schemalar
export type SliderSchemaType = z.infer<typeof SliderV2Schema>;
export type SlideItemSchemaType = z.infer<typeof SlideItemSchema>;
export type SliderComponentSchemaType = z.infer<typeof SliderComponentSchema>;

//Marquee Schema
export type MarqueeComponentSchemaType = z.infer<typeof MarqueeComponentSchema>;

export type ThemeComponentSchemaType = z.infer<typeof ThemeComponentSchema>;
export type ThemeV2SchemaType = z.infer<typeof ThemeV2Schema>;

export const ThemeV2DefaultValues: ThemeV2SchemaType = [];
