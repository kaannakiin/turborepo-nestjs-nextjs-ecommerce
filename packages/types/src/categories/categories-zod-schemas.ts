import { Locale } from "@repo/database/client";
import { FileSchema, htmlDescriptionSchema } from "../common/zod-schemas";
import { z } from "zod";

export const CategoryTranslationSchema = z.object({
  locale: z.enum(Locale),
  name: z
    .string()
    .min(1, "Kategori adı en az 1 karakter olabilir")
    .max(256, "Kategori adı en fazla 256 karakter olabilir"),
  slug: z
    .string()
    .min(1, "Kategori slug'ı en az 1 karakter olabilir")
    .max(256, "Kategori slug'ı en fazla 256 karakter olabilir"),
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

export const CategorySchema = z.object({
  uniqueId: z.cuid2("Geçersiz kategori kimliği"),
  translations: z
    .array(CategoryTranslationSchema)
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
  parentId: z.cuid2().optional().nullable(),
  image: FileSchema({ type: "IMAGE" }).optional().nullable(),
  existingImage: z
    .url({ error: "Geçersiz resim URL'si" })
    .optional()
    .nullable(),
});
export type CategoryZodType = z.infer<typeof CategorySchema>;
export type CategoryTranslation = z.infer<typeof CategoryTranslationSchema>;
