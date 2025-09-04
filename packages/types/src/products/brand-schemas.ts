import { $Enums, Prisma } from "@repo/database";
import * as z from "zod";
import { FileSchema, htmlDescriptionSchema } from "./product-schemas";

export const BrandTranslationSchema = z.object({
  locale: z.enum($Enums.Locale),
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

// types/index.ts
export type AdminBrandTableData = Prisma.BrandGetPayload<{
  include: {
    translations: {
      select: {
        name: true;
        locale: true;
        slug: true;
      };
    };
    image: {
      select: {
        url: true;
      };
    };
    parentBrand: {
      include: {
        translations: {
          select: {
            name: true;
            locale: true;
          };
        };
      };
    };
    _count: {
      select: {
        childBrands: true;
        products: true;
      };
    };
  };
}>;

export type BrandSelectType = Prisma.BrandGetPayload<{
  select: {
    id: true;
    translations: {
      select: {
        locale: true;
        name: true;
      };
    };
  };
}>;
export type BrandsResponse = {
  success: boolean;
  data: AdminBrandTableData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
};

export type Brand = z.infer<typeof BrandSchema>;
export type BrandTranslation = z.infer<typeof BrandTranslationSchema>;
