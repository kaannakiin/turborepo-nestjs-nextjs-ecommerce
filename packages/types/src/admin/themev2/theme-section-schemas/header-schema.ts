import { z } from "zod";
import { FileSchema } from "../../../products/product-schemas";
import { colorHex } from "../../../shared-schema";

export const AnnouncementSchema = z.object({
  textColor: colorHex,
  backgroundColor: colorHex,
  text: z.string().max(200, "Maksimum 200 karakter olmalıdır."),
  url: z
    .url("Geçersiz URL formatı.")
    .max(2048, "Maksimum 2048 karakter olmalıdır."),
});

export const HeaderLinkTypeEnum = z.enum([
  "brand",
  "category",
  "tag",
  "custom",
]);

export const HeaderLinkSchema = z
  .object({
    linkId: z.cuid2({ error: "Geçersiz Link Kimliği" }),
    type: HeaderLinkTypeEnum,
    name: z.string().max(100).optional(),
    tagId: z.cuid2({ error: "Geçersiz Etiket Kimliği" }).nullish(),
    brandId: z.cuid2({ error: "Geçersiz Marka Kimliği" }).nullish(),
    categoryId: z.cuid2({ error: "Geçersiz Kategori Kimliği" }).nullish(),
    customText: z.string().max(50, "Maksimum 50 karakter olmalıdır.").nullish(),
    customUrl: z
      .string()
      .url("Geçersiz URL formatı.")
      .max(2048, "Maksimum 2048 karakter olmalıdır.")
      .nullish(),
    order: z.number().int().min(0),
  })
  .refine(
    (data) => {
      switch (data.type) {
        case "brand":
          return !!data.brandId;
        case "category":
          return !!data.categoryId;
        case "tag":
          return !!data.tagId;
        case "custom":
          return !!data.customText && !!data.customUrl;
        default:
          return false;
      }
    },
    {
      message: "Seçilen tipe göre gerekli alan doldurulmalıdır.",
    }
  );

export const HeaderConfigSchema = z.object({
  backgroundColor: colorHex.nullish(),
  textColor: colorHex.nullish(),
});

export const HeaderSchema = z.object({
  logo: FileSchema({ type: ["VIDEO", "IMAGE"] }).nullish(),
  announcements: z
    .array(AnnouncementSchema, {
      error: "Bildirimler zorunludur.",
    })
    .max(10, "En fazla 10 bildirim olabilir.")
    .nullish(),
  links: z
    .array(HeaderLinkSchema)
    .max(20, "En fazla 20 link olabilir.")
    .nullish(),
  config: HeaderConfigSchema.nullish(),
});

export type HeaderLinkType = z.infer<typeof HeaderLinkTypeEnum>;
export type AnnouncementInputType = z.input<typeof AnnouncementSchema>;
export type AnnouncementOutputType = z.output<typeof AnnouncementSchema>;
export type HeaderLinkInputType = z.input<typeof HeaderLinkSchema>;
export type HeaderLinkOutputType = z.output<typeof HeaderLinkSchema>;
export type HeaderInputType = z.input<typeof HeaderSchema>;
export type HeaderOutputType = z.output<typeof HeaderSchema>;
