import { z } from "zod";
import { WhereAdded } from "@repo/database/client";

export const AddCartReqBodyV3Schema = z.object({
  productId: z.cuid2({
    error: "Geçersiz ürün kimliği",
  }),
  variantId: z
    .cuid2({
      error: "Geçersiz varyant kimliği",
    })
    .nullish(),
  cartId: z
    .cuid2({
      error: "Geçersiz sepet kimliği",
    })
    .nullish(),
  whereAdded: z.enum(WhereAdded),
});

export type AddCartReqBodyV3Type = z.infer<typeof AddCartReqBodyV3Schema>;

export const DecraseOrIncreaseCartItemReqBodyV3Schema = z.object({
  cartId: z.cuid2({
    error: "Geçersiz sepet kimliği",
  }),
  productId: z.cuid2({
    error: "Geçersiz ürün kimliği",
  }),
  variantId: z
    .cuid2({
      error: "Geçersiz varyant kimliği",
    })
    .optional()
    .nullable(),
});

export type DecraseOrIncreaseCartItemReqBodyV3Type = z.infer<
  typeof DecraseOrIncreaseCartItemReqBodyV3Schema
>;
