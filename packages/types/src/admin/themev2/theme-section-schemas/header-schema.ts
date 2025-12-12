import { z } from "zod";
import { FileSchema } from "../../../products/product-schemas";
import { colorHex } from "../../../shared-schema";

export const announcementSchema = z.object({
  textColor: colorHex,
  backgroundColor: colorHex,
});

export const headerLinksSchema = z
  .object({
    tagId: z.cuid2({ error: "Geçersiz Etiket Kimliği" }).nullish(),
    brandId: z.cuid2({ error: "Geçersiz Marka Kimliği" }).nullish(),
    categoryId: z.cuid2({ error: "Geçersiz Kategori Kimliği" }).nullish(),
  })
  .refine(
    (data) => {
      const hasTag = data.tagId != null;
      const hasBrand = data.brandId != null;
      const hasCategory = data.categoryId != null;
      return hasTag || hasBrand || hasCategory;
    },
    {
      message: "En az bir kimlik (etiket, marka veya kategori) zorunludur.",
    }
  );

export const HeaderSchema = z.object({
  logo: FileSchema({ type: ["VIDEO", "IMAGE"] }).nullish(),
  announcements: z
    .array(announcementSchema, {
      error: "Bildirimler zorunludur.",
    })
    .nullish()
    .refine(
      (data) => {
        if (data?.length > 10) {
          return false;
        }
        return true;
      },
      {
        message: "En fazla 10 bildirim olabilir.",
      }
    ),
  links: z
    .array(headerLinksSchema.safeExtend({ order: z.number().int().min(0) }))
    .nullish()
    .refine(
      (data) => {
        const orders = data.map((link) => link.order);
        const uniqueOrders = new Set(orders);
        return orders.length === uniqueOrders.size;
      },
      {
        message: "Sıralamalar benzersiz olmalıdır.",
      }
    ),
});
