import { $Enums } from "@repo/database";
import * as z from "zod";

export const MarqueeItemSchema = z.object({
  uniqueId: z.cuid2({
    error: "Her marquee öğesinin benzersiz bir kimliği olmalıdır",
  }),
  text: z
    .string({ error: "Marquee metni zorunludur" })
    .min(1, "Marquee metni en az 1 karakter olabilir")
    .max(256, "Marquee metni en fazla 256 karakter olabilir"),
  textColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, {
      message: "Geçersiz hex renk kodu",
    })
    .optional()
    .nullable(),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, {
      message: "Geçersiz hex renk kodu",
    })
    .optional()
    .nullable(),
});

export const MarqueeSchema = z.object({
  xaxisDirection: z.enum($Enums.XAXISDIRECTION, {
    error: "Yön değeri geçersiz",
  }),
  yaxisDirection: z.enum($Enums.YAXISDIRECTION, {
    error: "Yön değeri geçersiz",
  }),
  pauseOnHover: z.boolean(),
  duration: z
    .number({
      error: "Süre belirtilmeli",
    })
    .min(1, { message: "Süre en az 1 saniye olabilir" })
    .max(60, { message: "Süre en fazla 60 saniye olabilir" }),
  items: z
    .array(
      MarqueeItemSchema.safeExtend({
        order: z
          .number({
            error: "Sıra numarası belirtilmeli",
          })
          .min(0, { message: "Sıra numarası en az 0 olabilir" })
          .int("Sıra numarası tam sayı olmalıdır"),
      })
    )
    .refine(
      (items) => {
        const orders = items.map((item) => item.order);
        const uniqueOrders = new Set(orders);
        if (orders.length === uniqueOrders.size) {
          return true;
        }
        return false;
      },
      {
        error: "Marquee öğelerinin sıra numaraları benzersiz olmalıdır",
      }
    ),
});

export type MarqueeItem = z.infer<typeof MarqueeItemSchema>;
export type Marquee = z.infer<typeof MarqueeSchema>;