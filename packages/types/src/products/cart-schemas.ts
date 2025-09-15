import { $Enums } from "@repo/database";
import * as z from "zod";

export const AddCartItemToCartBody = z.object({
  userId: z
    .cuid2({ error: "Geçersiz kullanıcı kimliği" })
    .optional()
    .nullable(),
  productId: z.cuid2({ error: "Geçersiz ürün kimliği" }),
  variantId: z
    .cuid2({ error: "Geçersiz varyant kimliği" })
    .optional()
    .nullable(),
  quantity: z
    .int({ error: "Geçersiz miktar" })
    .min(1, {
      error: "Miktar en az 1 olmalı ve maksimum güvenli tamsayıyı geçemez",
    })
    .max(Number.MAX_SAFE_INTEGER, {
      error: "Miktar en az 1 olmalı ve maksimum güvenli tamsayıyı geçemez",
    }),
  cartId: z.cuid2({ error: "Geçersiz sepet kimliği" }).optional().nullable(),
});

export type AddCartItemToCartBodyType = z.infer<typeof AddCartItemToCartBody>;

export type CartContextType = {
  addItem: (data: AddCartItemToCartBodyType) => Promise<CartType>;
  removeItem: (
    data: Pick<
      AddCartItemToCartBodyType,
      "cartId" | "productId" | "variantId" | "quantity"
    >
  ) => Promise<CartType | null>;
  clearCart: () => Promise<null>;
  switchLocale: (locale: $Enums.Locale) => Promise<CartType | null>;
  switchCurrency: (currency: $Enums.Currency) => Promise<CartType | null>;
  cart: CartType | null;
};

export type CartType = {
  cartId: string;
  userId: string | null;
  totalItems: number;
  totalPrice: number;
  totalDiscount: number; // Total discount amount
  totalDiscountedPrice: number; // Discounted total
  currency: $Enums.Currency;
  locale: $Enums.Locale;
  items: CartItemType[];
  createdAt: Date;
};

export type CartItemType = {
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  discountedPrice: number;
  currency: $Enums.Currency;
  productName: string;
  productSlug: string;
  productAsset: { url: string; type: $Enums.AssetType } | null;
  variantAsset: { url: string; type: $Enums.AssetType } | null;
  variantOptions?: Array<{
    variantGroupName: string;
    variantOptionName: string;
    variantGroupSlug: string;
    variantOptionSlug: string;
    variantOptionHexColor?: string | null;
    variantOptionAsset?: { url: string; type: $Enums.AssetType } | null;
    variantOptionId: string;
    variantGroupId: string;
    variantGroupType: $Enums.VariantGroupType;
  }>;
};
