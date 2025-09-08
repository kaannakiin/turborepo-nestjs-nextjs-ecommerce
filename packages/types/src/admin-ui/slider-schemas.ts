import { $Enums } from "@repo/database";
import * as z from "zod";
import { FileSchema } from "../products/product-schemas";

export const SliderItemSchema = z
  .object({
    uniqueId: z.cuid2({
      error: "Her slider öğesinin benzersiz bir kimliği olmalıdır",
    }),
    desktopAsset: FileSchema({
      type: ["IMAGE", "VIDEO"],
    })
      .optional()
      .nullable(),
    mobileAsset: FileSchema({
      type: ["IMAGE", "VIDEO"],
    })
      .optional()
      .nullable(),
    existingDesktopAsset: z
      .object({
        url: z.url().optional().nullable(),
        type: z.enum($Enums.AssetType),
      })
      .optional()
      .nullable(),
    existingMobileAsset: z
      .object({
        url: z.url().optional().nullable(),
        type: z.enum($Enums.AssetType),
      })
      .optional()
      .nullable(),
    customLink: z
      .url({ error: "Geçersiz özel bağlantı" })
      .optional()
      .nullable(),
    productLink: z.cuid2().optional().nullable(),
    categoryLink: z.cuid2().optional().nullable(),
    brandLink: z.cuid2().optional().nullable(),
    startDate: z
      .date({
        error: "Geçersiz başlangıç tarihi",
      })
      .optional()
      .nullable(),
    endDate: z
      .date({
        error: "Geçersiz bitiş tarihi",
      })
      .optional()
      .nullable(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const activeLinks = [
        data.customLink,
        data.productLink,
        data.categoryLink,
        data.brandLink,
      ].filter((link) => link !== null && link !== undefined && link !== "");
      return activeLinks.length <= 1;
    },
    {
      error: "Yalnızca bir link türü seçebilirsiniz",
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      error: "Bitiş tarihi, başlangıç tarihinden sonra olmalıdır",
      path: ["endDate"], // Hatanın hangi field'da gösterileceğini belirtir
    }
  )
  .refine((data) => {
    if (data.existingDesktopAsset && !data.desktopAsset) {
      return true;
    }
    return false;
  });

export const SliderSchema = z
  .object({
    sliders: z
      .array(
        SliderItemSchema.safeExtend({
          order: z
            .number({
              message: "Slider öğesinin sırasını belirtmelisiniz",
            })
            .int("Sıra numarası tam sayı olmalıdır")
            .min(0, "Sıra numarası 0'dan küçük olamaz"),
        })
      )
      .min(1, {
        message: "En az bir slider öğesi eklemelisiniz",
      }),
    isAutoPlay: z.boolean(),
    autoPlayInterval: z
      .number({
        message: "Otomatik oynatma aralığını belirtmelisiniz",
      })
      .min(1000, {
        message: "Otomatik oynatma aralığı en az 1000 ms olmalıdır",
      })
      .max(10000, {
        message: "Otomatik oynatma aralığı en fazla 10000 ms olmalıdır",
      })
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (
        data.isAutoPlay &&
        (!data.autoPlayInterval || data.autoPlayInterval <= 0)
      ) {
        return false;
      }
      return true;
    },
    {
      error: "Otomatik oynatma aktifken geçerli bir aralık belirtmelisiniz",
      path: ["autoPlayInterval"],
    }
  )
  .refine(
    (data) => {
      const orders = data.sliders.map((slider) => slider.order);
      const uniqueOrders = new Set(orders);
      return orders.length === uniqueOrders.size;
    },
    {
      error: "Slider öğelerinin sıra numaraları benzersiz olmalıdır",
      path: ["sliders"],
    }
  )
  .refine(
    (data) => {
      const orders = data.sliders
        .map((slider) => slider.order)
        .sort((a, b) => a - b);

      for (let i = 0; i < orders.length; i++) {
        if (orders[i] !== i) {
          return false;
        }
      }
      return true;
    },
    {
      error:
        "Slider sıra numaraları 0'dan başlayarak ardışık olmalıdır (0, 1, 2, ...)",
      path: ["sliders"],
    }
  );

export type Slider = z.infer<typeof SliderSchema>;
export type SliderItem = z.infer<typeof SliderItemSchema>;

export const OrderUpdateSchema = z
  .array(
    z.object({
      uniqueId: z.cuid2({
        error: "Her slider öğesinin benzersiz bir kimliği olmalıdır",
      }),
      order: z.number({
        error: " Sıra numarasını belirtmelisiniz",
      }),
    })
  )
  .refine(
    (data) => {
      const orders = data.map((item) => item.order);
      const uniqueOrders = new Set(orders);
      return orders.length === uniqueOrders.size;
    },
    {
      error: "Sıra numaraları benzersiz olmalıdır",
      path: ["order"],
    }
  );

export type OrderUpdate = z.infer<typeof OrderUpdateSchema>;
