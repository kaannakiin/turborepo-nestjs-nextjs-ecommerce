import { z } from "zod";
import { colorHex, DesignComponentType, FileSchema } from "../../common";
import { AssetType } from "@repo/database";

export const DesignSliderSlideSchema = z.object({
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
});

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
});

export type DesignSliderSchemaInputType = z.input<typeof DesignSliderSchema>;
export type DesignSliderSchemaOutputType = z.output<typeof DesignSliderSchema>;
