import * as z from "zod";
export const colorHex = z
  .string({
    error: "Renk kodu zorunludur.",
  })
  .regex(/^#([A-Fa-f0-9]{6})$/, {
    error: "Geçersiz renk kodu. Hex formatında olmalıdır.",
  });

export interface Pagination {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

const Cuid2Schema = z.cuid2({ error: "Geçersiz kimlik" });
export const ProductCarouselRequestSchema = z
  .object({
    productIds: z.array(Cuid2Schema).default([]), // Boş gelirse hata vermez, boş dizi kabul eder
    variantIds: z.array(Cuid2Schema).default([]),
  })
  .refine((data) => data.productIds.length > 0 || data.variantIds.length > 0, {
    error: "En az bir ürün veya varyant ID'si gönderilmelidir.",
    path: ["productIds"], // Hatayı productIds alanına bağlar
  });

export type ProductCarouselRequestType = z.infer<
  typeof ProductCarouselRequestSchema
>;
