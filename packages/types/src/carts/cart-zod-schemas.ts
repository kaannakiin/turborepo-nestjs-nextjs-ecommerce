import { Currency, Locale, WhereAdded } from "@repo/database/client";
import { z } from "zod";

const ItemIdSchema = z.object({
  itemId: z.cuid2({
    error: "Geçersiz ürün ID'si",
  }),
});

const QuantitySchema = z.object({
  quantity: z
    .number({
      error: "Geçersiz adet",
    })
    .min(1, { error: "Adet en az 1 olmalıdır" })
    .max(Number.MAX_SAFE_INTEGER, {
      error: "Adet en fazla " + Number.MAX_SAFE_INTEGER + " olabilir",
    }),
});

const CartIdSchema = z.object({
  cartId: z.cuid2({
    error: "Geçersiz sepet ID'si",
  }),
});

export const AddCartItemSchema = ItemIdSchema.safeExtend({
  ...QuantitySchema.shape,
  whereAdded: z.enum(WhereAdded),
});

export const RemoveCartItemSchema = ItemIdSchema;

export const ClearCartSchema = CartIdSchema;

export const DecreaseCartItemQuantitySchema = z.object({
  ...ItemIdSchema.shape,
  ...QuantitySchema.shape,
});

export const IncreaseCartItemQuantitySchema = z.object({
  ...ItemIdSchema.shape,
  ...QuantitySchema.shape,
});

export const UpdateLocaleCart = z.object({
  locale: z.enum(Locale, {
    error: "Geçersiz dil",
  }),
  currency: z.enum(Currency, {
    error: "Geçersiz para birimi",
  }),
});

export type RemoveCartItemZodType = z.infer<typeof RemoveCartItemSchema>;

export type AddCartItemZodType = z.infer<typeof AddCartItemSchema>;

export type ClearCartZodType = z.infer<typeof ClearCartSchema>;

export type DecreaseCartItemQuantityZodType = z.infer<
  typeof DecreaseCartItemQuantitySchema
>;

export type IncreaseCartItemQuantityZodType = z.infer<
  typeof IncreaseCartItemQuantitySchema
>;

export type UpdateLocaleCartZodType = z.infer<typeof UpdateLocaleCart>;
