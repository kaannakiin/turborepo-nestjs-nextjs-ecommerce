import { $Enums } from "@repo/database";
import { createId } from "@repo/shared";
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
          type: z.enum($Enums.AssetType, {
            error: "Geçerli bir değer seçiniz.",
          }),
        })
        .nullish(),
      aspectRatio: z.enum(AspectRatio, {
        error: "Geçerli bir aspect ratio değeri seçiniz.",
      }),
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
        aspectRatio: z.enum(AspectRatio, {
          error: "Geçerli bir aspect ratio değeri seçiniz.",
        }),
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
            .nullish(), // <-- BURASI EKLENDİ
        })
        .check(({ value: item, issues }) => {
          const hasText = item.text != null && item.text.trim() !== "";
          const hasNewImage = item.image != null;
          const hasExistingImage = item.existingImage != null;

          // Kural A: Hem yeni resim hem de mevcut resim bir arada olamaz
          if (hasNewImage && hasExistingImage) {
            issues.push({
              code: "custom",
              message: "Hem yeni resim hem de mevcut resim seçilemez.",
              path: ["image"], // Hatayı 'image' alanına ata
              input: item.image,
            });
            issues.push({
              code: "custom",
              message: "Hem yeni resim hem de mevcut resim seçilemez.",
              path: ["existingImage"], // Hatayı 'existingImage' alanına ata4
              input: item.existingImage,
            });
          }

          // Kural B: En az biri dolu olmalı (Metin VEYA Yeni Resim VEYA Mevcut Resim)
          if (!hasText && !hasNewImage && !hasExistingImage) {
            issues.push({
              code: "custom",
              message: "Öğe, bir metin VEYA bir resim içermelidir.",
              path: ["text"], // Hatayı 'text' alanına ata
              input: item.text,
            });
          }
        })
    )
    // GÜNCELLEME 3: Hata mesajı düzeltildi
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

export const ThemeComponentSchema = z.discriminatedUnion("type", [
  SliderComponentSchema,
  MarqueeComponentSchema,
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

// Slide (tek slayt - order ile birlikte)
export type SlideInputType = z.input<typeof SlideSchema>;
export type SlideOutputType = z.infer<typeof SlideSchema>;

// Slider Component (tüm slider component'i)
export type SliderComponentInputType = z.input<typeof SliderComponentSchema>;
export type SliderComponentOutputType = z.infer<typeof SliderComponentSchema>;

// ============ MARQUEE SCHEMA ============
export type MarqueeComponentInputType = z.input<typeof MarqueeComponentSchema>;
export type MarqueeComponentOutputType = z.infer<typeof MarqueeComponentSchema>;

// ============ THEME SCHEMAS ============

// Theme Component (discriminated union - SLIDER | MARQUEE)
export type ThemeComponentInputType = z.input<typeof ThemeComponentSchema>;
export type ThemeComponentOutputType = z.infer<typeof ThemeComponentSchema>;

// Theme (ana schema - component array'i)
export type ThemeInputType = z.input<typeof ThemeSchema>;
export type ThemeOutputType = z.infer<typeof ThemeSchema>;

export const minimalValidSlide: Omit<SliderInputType, "order" | "sliderId"> = {
  conditionDates: {
    addEndDate: false,
    addStartDate: false,
    endDate: null,
    startDate: null,
  },
  desktopView: {
    file: null,
    aspectRatio: "1/1",
    existingAsset: {
      url: "https://placehold.co/1920x1080/6E44FF/FFFFFF?text=YENI+SLAYT",
      type: "IMAGE",
    },
  },
  mobileView: null,
};

export const minimalValidMarqueeItem: Omit<
  MarqueeComponentOutputType["items"][0],
  "itemId"
> = {
  text: "Yeni Marquee Öğesi",
  link: null,
  image: null,
};

export const ThemeV2DefaultValues: ThemeInputType = {
  components: [
    {
      // İlk Slider - 3 Slaytlı
      componentId: createId(),
      type: "SLIDER",
      order: 0,
      options: {
        autoPlay: true,
        autoPlayInterval: 5000,
        loop: true,
        showIndicators: true,
        showArrows: true,
      },
      sliders: [
        {
          order: 0,
          sliderId: createId(),
          ...minimalValidSlide,
          desktopView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/1920x1080/6E44FF/FFFFFF?text=SLIDER+1+-+SLAYT+1",
              type: "IMAGE",
            },
            aspectRatio: AspectRatio.AUTO,
          },
          mobileView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/720x1280/6E44FF/FFFFFF?text=SLAYT+1+MOBIL",
              type: "IMAGE",
            },
            aspectRatio: AspectRatio.AUTO,
          },
        },
        {
          order: 1,
          sliderId: createId(),
          ...minimalValidSlide,
          desktopView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/1920x1080/FF6B6B/FFFFFF?text=SLIDER+1+-+SLAYT+2",
              type: "IMAGE",
            },
          },
          mobileView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/720x1280/FF6B6B/FFFFFF?text=SLAYT+2+MOBIL",
              type: "IMAGE",
            },
          },
        },
        {
          order: 2,
          sliderId: createId(),
          ...minimalValidSlide,
          desktopView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/1920x1080/4ECDC4/FFFFFF?text=SLIDER+1+-+SLAYT+3+(VIDEO)",
              type: "IMAGE", // Video asseti gibi
            },
          },
          mobileView: null, // Sadece desktop
        },
      ],
    } as SliderComponentInputType,
    // Test için Marquee Component
    {
      componentId: createId(),
      type: "MARQUEE",
      order: 1,
      items: [
        {
          itemId: createId(),
          text: "✨ FIRSATLARI KAÇIRMA",
          link: "https://example.com/firsatlar",
        },
        {
          itemId: createId(),
          text: "🚀 HIZLI KARGO",
          link: "https://example.com/kargo",
        },
        {
          itemId: createId(),
          text: "💳 GÜVENLİ ÖDEME",
        },
        {
          itemId: createId(),
          text: "🎉 YENİ SEZON GELDİ",
          link: "https://example.com/yeni-sezon",
        },
      ],
      options: {
        speed: 40,
        pauseOnHover: true,
        isReverse: false,
        backgroundColor: "#111111",
        textColor: "#FFFFFF",
        fontSize: "sm",
        fontWeight: "bold",
        paddingY: "xs",
      },
    } as MarqueeComponentInputType,
    // İkinci Slider - 2 Slaytlı
    {
      componentId: createId(),
      type: "SLIDER",
      order: 2,
      options: {
        autoPlay: true,
        autoPlayInterval: 5000,
        loop: true,
        showIndicators: true,
        showArrows: true,
      },
      sliders: [
        {
          order: 0,
          sliderId: createId(),
          ...minimalValidSlide,
          desktopView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/1920x1080/F06595/FFFFFF?text=SLIDER+2+-+SLAYT+1",
              type: "IMAGE",
            },
          },
          mobileView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/720x1280/F06595/FFFFFF?text=SLAYT+1+MOBIL",
              type: "IMAGE",
            },
          },
        },
        {
          order: 1,
          sliderId: createId(),
          ...minimalValidSlide,
          desktopView: {
            file: null,
            existingAsset: {
              url: "https://placehold.co/1920x1080/A61E4D/FFFFFF?text=SLIDER+2+-+SLAYT+2",
              type: "IMAGE",
            },
          },
          mobileView: null,
        },
      ],
    } as SliderComponentInputType,

    {
      componentId: createId(),
      type: "MARQUEE",
      order: 3,
      items: [
        {
          itemId: createId(),
          text: "%50 İNDİRİM",
        },
        {
          itemId: createId(),
          text: "SON GÜN 30 KASIM",
        },
        {
          itemId: createId(),
          text: "BLACK FRIDAY",
        },
      ],
      options: {
        speed: 60,
        pauseOnHover: false,
        isReverse: true,
        backgroundColor: "#F8F9FA",
        textColor: "#343A40",
        fontSize: "md",
        paddingY: "sm",
        fontWeight: "normal",
      },
    } as MarqueeComponentInputType,
  ],
};

const getDefaultSlider = (order: number): SliderComponentInputType => ({
  componentId: createId(),
  type: "SLIDER",
  order,
  options: {
    autoPlay: true,
    autoPlayInterval: 5000,
    loop: true,
    showIndicators: true,
    showArrows: true,
  },
  sliders: [
    {
      order: 0,
      sliderId: createId(),
      conditionDates: {
        addEndDate: false,
        addStartDate: false,
        endDate: null,
        startDate: null,
      },
      desktopView: {
        file: null,
        aspectRatio: "16/9",
        existingAsset: {
          url: "https://placehold.co/1920x1080/6E44FF/FFFFFF?text=YENI+SLAYT",
          type: "IMAGE",
        },
      },
      mobileView: null,
    },
  ],
});

const getDefaultMarquee = (order: number): MarqueeComponentInputType => ({
  componentId: createId(),
  type: "MARQUEE",
  order,
  items: [
    {
      itemId: createId(),
      text: "Yeni Marquee Öğesi",
      link: null,
      image: null,
      existingImage: null,
    },
  ],
  options: {
    speed: 60,
    pauseOnHover: false,
    isReverse: false,
    backgroundColor: "#F8F9FA",
    textColor: "#343A40",
    fontSize: "md",
    paddingY: "sm",
    fontWeight: "normal",
  },
});

export const createComponent = (order: number, type: ThemeComponents) => {
  switch (type) {
    case "SLIDER":
      return getDefaultSlider(order);
    case "MARQUEE":
      return getDefaultMarquee(order);
    default:
      throw new Error("Bilinmeyen component türü: " + type);
  }
};
