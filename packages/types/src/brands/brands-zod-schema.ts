import { Locale } from "@repo/database/client";
import * as z from "zod";
import { FileSchema, htmlDescriptionSchema } from "../common/zod-schemas";

export const BrandTranslationSchema = z.object({
  locale: z.enum(Locale),
  name: z
    .string({ error: "Marka adı zorunludur" })
    .min(1, { message: "Marka adı en az 1 karakter olmalıdır" })
    .max(256, { message: "Marka adı en fazla 256 karakter olabilir" }),
  slug: z
    .string({ error: "Slug zorunludur" })
    .min(1, { message: "Slug en az 1 karakter olmalıdır" })
    .max(256, { message: "Slug en fazla 256 karakter olabilir" }),
  description: htmlDescriptionSchema,
  metaTitle: z
    .string({ error: "Meta başlığı zorunludur" })
    .max(256, {
      error: " Meta başlığı en fazla 256 karakter olabilir",
    })
    .optional()
    .nullable(),
  metaDescription: z
    .string({ error: "Meta açıklaması zorunludur" })
    .max(512, { error: "Meta açıklaması en fazla 512 karakter olabilir" })
    .optional()
    .nullable(),
});
export const BrandSchema = z.object({
  uniqueId: z.cuid2({ error: "Geçersiz marka kimliği" }),
  translations: z
    .array(BrandTranslationSchema)
    .refine(
      (val) => {
        const isTRLocaleExists = val.some((t) => t.locale === "TR");
        return isTRLocaleExists;
      },
      {
        error: "En az bir Türkçe (TR) çeviri eklemelisiniz",
      }
    )
    .refine(
      (val) => {
        const locales = val.map((t) => t.locale);
        const uniqueLocales = new Set(locales);
        return locales.length === uniqueLocales.size;
      },
      {
        error: "Her dil için yalnızca bir çeviri ekleyebilirsiniz",
      }
    ),
  image: FileSchema({ type: "IMAGE" }).optional().nullable(),
  existingImage: z
    .url({ error: "Geçersiz resim URL'si" })
    .optional()
    .nullable(),
  parentId: z.cuid2({ error: "Geçersiz marka kimliği" }).optional().nullable(),
});

export type BrandZodType = z.infer<typeof BrandSchema>;
export type BrandTranslation = z.infer<typeof BrandTranslationSchema>;
