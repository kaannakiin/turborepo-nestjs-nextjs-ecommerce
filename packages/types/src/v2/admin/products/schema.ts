import { Currency } from "@repo/database";
import { z } from "zod";

export const productFilterDefaultValues: ProductFilterFormValues = {
  attributes: [],
  brandIds: [],
  categoryIds: [],
  tagIds: [],
  minPrice: undefined,
  maxPrice: undefined,
  currency: "TRY",
  hasStock: null,
  isActive: null,
  isVariant: null,
  saveFilterName: "",
  isSavedFilter: false,
};

export const ProductFilterSchema = z
  .object({
    categoryIds: z
      .array(z.cuid2({ message: "Geçersiz Kategori ID" }))
      .nullish(),
    brandIds: z.array(z.cuid2({ message: "Geçersiz Marka ID" })).nullish(),
    tagIds: z.array(z.cuid2({ message: "Geçersiz Etiket ID" })).nullish(),

    minPrice: z
      .number({ error: "Geçersiz fiyat" })
      .min(0, {
        error: "Geçersiz fiyat",
      })
      .max(Number.MAX_SAFE_INTEGER, {
        error: "Geçersiz fiyat",
      })
      .nullish(),
    maxPrice: z
      .number({ error: "Geçersiz fiyat" })
      .min(0, { error: "Geçersiz fiyat" })
      .max(Number.MAX_SAFE_INTEGER, {
        error: "Geçersiz fiyat",
      })
      .nullish(),

    currency: z
      .enum(Currency, {
        error: "Geçersiz para birimi",
      })
      .default(Currency.TRY),

    isActive: z.boolean().nullish(),
    hasStock: z.boolean().nullish(),
    isVariant: z.boolean().nullish(),

    attributes: z
      .array(
        z.object({
          groupId: z.cuid2({ message: "Özellik grubu seçmelisiniz" }),
          optionIds: z
            .array(z.cuid2())
            .min(1, { message: "En az bir seçenek seçmelisiniz" }),
        })
      )
      .optional(),

    saveFilterName: z
      .string()
      .trim()
      .max(50, { message: "Filtre adı çok uzun" })
      .optional()
      .or(z.literal("")),

    isSavedFilter: z.boolean().default(false),
  })
  .check(({ value: val, issues }) => {
    if (
      val.minPrice !== undefined &&
      val.maxPrice !== undefined &&
      !isNaN(val.minPrice) &&
      !isNaN(val.maxPrice)
    ) {
      if (val.minPrice > val.maxPrice) {
        issues.push({
          input: ["minPrice"],
          code: "custom",
          message: "Min fiyat, Max fiyattan büyük olamaz",
          path: ["minPrice"],
        });
      }
    }

    if (val.isSavedFilter) {
      if (!val.saveFilterName || val.saveFilterName.length < 3) {
        issues.push({
          input: ["saveFilterName"],
          code: "custom",
          message: "Kaydetmek için en az 3 karakterlik bir isim girmelisiniz",
          path: ["saveFilterName"],
        });
      }
    }
  });

export type ProductFilterFormValues = z.input<typeof ProductFilterSchema>;
