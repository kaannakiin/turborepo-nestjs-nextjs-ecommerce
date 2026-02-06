import { AssetType } from "@repo/database";
import { z } from "zod";
import {
  aspectRatioSchema,
  colorHex,
  DesignComponentType,
  FileSchema,
} from "../../common";

export const DesignSliderSlideSchema = z
  .object({
    uniqueId: z.cuid2(),
    image: FileSchema({
      type: ["IMAGE"],
      error: "Lütfen bir görsel yükleyin.",
    }),
    existingAsset: z
      .object({
        url: z.url({
          error: "Geçersiz asset URL'i.",
        }),
        type: z.enum(AssetType, {
          error: "Geçersiz asset tipi.",
        }),
      })
      .nullish(),
    mobileAsset: FileSchema({
      type: ["IMAGE"],
      error: "Lütfen bir görsel yükleyin.",
    }).nullish(),
    mobileExistingAsset: z
      .object({
        url: z.url({
          error: "Geçersiz asset URL'i.",
        }),
        type: z.enum(AssetType, {
          error: "Geçersiz asset tipi.",
        }),
      })
      .nullish(),
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
    buttonText: z
      .string()
      .min(1, { error: "Buton yazısı en az 1 karakter olmalıdır." })
      .max(64, { error: "Buton yazısı en fazla 64 karakter olabilir." })
      .nullish(),
    buttonLink: z.url({ error: "Geçerli bir URL giriniz." }).nullish(),
    titleColor: colorHex.nullish(),
    subtitleColor: colorHex.nullish(),
    buttonColor: colorHex.nullish(),
    buttonTextColor: colorHex.nullish(),
    order: z.number().int().default(0),
    withOverlay: z.boolean().default(false),
  })
  .refine(
    (data) => {
      const hasDesktopImage = data.image !== null && data.image !== undefined;
      const hasExistingAsset =
        data.existingAsset !== null && data.existingAsset !== undefined;
      return hasDesktopImage || hasExistingAsset;
    },
    { message: "Masaüstü için bir görsel yüklemeniz gerekmektedir." },
  )
  .refine(
    (data) => {
      const hasDesktopImage = data.image !== null && data.image !== undefined;
      const hasExistingAsset =
        data.existingAsset !== null && data.existingAsset !== undefined;
      return !(hasDesktopImage && hasExistingAsset);
    },
    { message: "Mevcut görseli silmeden yeni görsel ekleyemezsiniz." },
  )
  .refine(
    (data) => {
      const hasMobileAsset =
        data.mobileAsset !== null && data.mobileAsset !== undefined;
      const hasMobileExisting =
        data.mobileExistingAsset !== null &&
        data.mobileExistingAsset !== undefined;
      return !(hasMobileAsset && hasMobileExisting);
    },
    {
      message: "Mobil için mevcut görseli silmeden yeni görsel ekleyemezsiniz.",
    },
  );

export type DesignSliderSlideSchemaInputType = z.input<
  typeof DesignSliderSlideSchema
>;
export type DesignSliderSlideSchemaOutputType = z.output<
  typeof DesignSliderSlideSchema
>;

export const DesignSliderSchema = z.object({
  uniqueId: z.cuid2(),
  type: z.literal(DesignComponentType.SLIDER),
  autoplay: z.boolean({ error: "Otomatik oynatma durumu gereklidir." }),
  autoplayInterval: z
    .int({ error: "Geçersiz otomatik oynatma aralığı." })
    .min(1000)
    .max(30000)
    .default(5000),
  showArrows: z.boolean({ error: "Ok gösterimi durumu gereklidir." }),
  showDots: z.boolean({ error: "Nokta gösterimi durumu gereklidir." }),
  slides: z
    .array(DesignSliderSlideSchema, { error: "Geçersiz slayt listesi." })
    .min(1, { error: "En az 1 slayt eklemelisiniz." }),
  aspectRatio: aspectRatioSchema.default("16/9"),
  mobileAspectRatio: aspectRatioSchema.default("9/16"),
});

export type DesignSliderSchemaInputType = z.input<typeof DesignSliderSchema>;
export type DesignSliderSchemaOutputType = z.output<typeof DesignSliderSchema>;
