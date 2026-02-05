import { z } from "zod";
import {
  colorHex,
  DesignComponentType,
  existingAssetSchema,
  FileSchema,
  MantineSize,
  TextAlign,
} from "../../common";

export const DesignEmailSignupSchema = z.object({
  uniqueId: z.cuid2(),
  type: z.literal(DesignComponentType.EMAIL_SIGNUP),
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
  placeholderText: z
    .string()
    .min(1, { error: "Placeholder en az 1 karakter olmalıdır." })
    .max(128, { error: "Placeholder en fazla 128 karakter olabilir." })
    .default("E-posta adresinizi girin"),
  buttonText: z
    .string()
    .min(1, { error: "Buton yazısı en az 1 karakter olmalıdır." })
    .max(64, { error: "Buton yazısı en fazla 64 karakter olabilir." })
    .default("Abone Ol"),
  successMessage: z
    .string()
    .min(1, { error: "Başarı mesajı en az 1 karakter olmalıdır." })
    .max(256, { error: "Başarı mesajı en fazla 256 karakter olabilir." })
    .default("Başarıyla abone oldunuz!"),

  backgroundImage: FileSchema({
    type: ["IMAGE"],
    error: "Lütfen bir görsel yükleyin.",
  }).nullish(),
  existingBackgroundAsset: existingAssetSchema.nullish(),
  backgroundColor: colorHex.nullish(),
  overlayOpacity: z
    .int({ error: "Geçersiz overlay opaklık değeri." })
    .min(0)
    .max(100)
    .default(50),

  titleColor: colorHex.nullish(),
  titleSize: z
    .enum(MantineSize, { error: "Geçersiz başlık boyutu." })
    .default("xl"),
  subtitleColor: colorHex.nullish(),
  subtitleSize: z
    .enum(MantineSize, { error: "Geçersiz alt başlık boyutu." })
    .default("md"),

  buttonColor: colorHex.nullish(),
  buttonTextColor: colorHex.nullish(),

  alignment: z
    .enum(TextAlign, { error: "Geçersiz hizalama." })
    .default("center"),
  compact: z.boolean({ error: "Kompakt mod durumu gereklidir." }),
  minHeight: z
    .int({ error: "Geçersiz minimum yükseklik." })
    .min(100)
    .max(800)
    .default(300),

  paddingVertical: z
    .int({ error: "Geçersiz dikey padding." })
    .min(0)
    .max(200)
    .default(48),
  paddingHorizontal: z
    .int({ error: "Geçersiz yatay padding." })
    .min(0)
    .max(200)
    .default(24),
});

export type DesignEmailSignupSchemaInputType = z.input<
  typeof DesignEmailSignupSchema
>;
export type DesignEmailSignupSchemaOutputType = z.output<
  typeof DesignEmailSignupSchema
>;
