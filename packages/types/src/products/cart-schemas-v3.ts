import { $Enums, Prisma } from "@repo/database";
import {
  MutateFunction,
  UseMutateFunction,
  UseMutationResult,
} from "@repo/shared";
import * as z from "zod";

export type CartItemV3 = {
  productId: string;
  productSlug: string;
  productName: string;
  price: number;
  quantity: number;
  discountedPrice?: number;
  whereAdded: $Enums.WhereAdded;
  productAsset?: { url: string; type: $Enums.AssetType };
  productBrand?: {
    brandId: string;
    name: string;
    brandSlug: string;
    brandAsset?: { url: string; type: $Enums.AssetType };
  };
  categories?: Array<{
    categoryId: string;
    name: string;
    categorySlug: string;
    categoryAsset?: { url: string; type: $Enums.AssetType };
  }>;
  variantId?: string;
  variantOptions?: Array<{
    variantGroupName: string;
    variantGroupSlug: string;
    variantOptionName: string;
    variantOptionSlug: string;
    variantOptionHexValue?: string;
    variantOptionAsset?: { url: string; type: $Enums.AssetType };
  }>;
};

export type CartV3 = {
  cartId: string;
  items: Array<CartItemV3>;
  totalItems: number;
  totalPrice: number;
  totalDiscount: number;
  currency: $Enums.Currency;
  locale: $Enums.Locale;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  orderNote?: string;
  userId?: string;
};

export type CartActionResponseV3 = {
  success: boolean;
  message?: string;
  newCart?: CartV3;
};

type CartItemParams = { productId: string; variantId?: string };
type UpdateQtyParams = {
  productId: string;
  quantity: number;
  variantId?: string;
};

export type CartV3ContextType = {
  /** Mevcut sepet verisi (useQuery'den) */
  cart: CartV3 | null | undefined; // Başlangıçta null/undefined olabilir
  /** Sepet verisinin yüklenme durumu (useQuery'den) */
  isCartLoading: boolean;

  /** * Sepeti manuel olarak yeniden sorgulamak için.
   * (Bunu provider'daki useQuery'den dönen 'refetch' fonksiyonu ile bağlayabilirsin)
   */
  refreshCart: () => void; // Veya Promise<QueryObserverResult<...>>

  // --- MUTASYONLAR ---
  // Hepsi 'UseMutationResult' tipinde olmalı.
  // İlk generic (CartV3), 'onSuccess'te dönen datadır.
  // Üçüncü generic (örn: CartItemV3), 'mutate' fonksiyonunun aldığı parametredir.

  addNewItem: UseMutationResult<
    CartV3, // Dönen veri (newCart)
    Error, // Hata
    CartItemV3 // 'mutate' parametresi
  >;

  increaseItemQuantity: UseMutationResult<
    CartV3,
    Error,
    CartItemParams // { productId, variantId }
  >;

  decreaseItemQuantity: UseMutationResult<CartV3, Error, CartItemParams>;

  removeItem: UseMutationResult<CartV3, Error, CartItemParams>;

  updateItemQuantity: UseMutationResult<
    CartV3,
    Error,
    UpdateQtyParams // { productId, quantity, variantId }
  >;

  clearCart: UseMutationResult<
    CartV3,
    Error,
    string // cartId
  >;

  mergeCarts: UseMutationResult<
    CartV3,
    Error,
    string // oldCartId
  >;

  setOrderNote: UseMutationResult<
    CartV3,
    Error,
    string // note
  >;
};

export const AddCartReqBodyV3Schema = z.object({
  productId: z.cuid2({
    error: "Geçersiz ürün kimliği",
  }),
  variantId: z
    .cuid2({
      error: "Geçersiz varyant kimliği",
    })
    .optional()
    .nullable(),
  cartId: z
    .cuid2({
      error: "Geçersiz sepet kimliği",
    })
    .optional()
    .nullable(),
  whereAdded: z.enum($Enums.WhereAdded),
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

export type CartItemWithRelations = Prisma.CartItemGetPayload<{
  include: {
    product: {
      include: {
        categories: {
          select: {
            category: {
              select: {
                id: true;
                translations: true;
                image: { select: { url: true; type: true } };
              };
            };
          };
        };
        translations: true;
        prices: true;
        brand: {
          select: {
            id: true;
            translations: true;
            image: { select: { url: true; type: true } };
          };
        };
        assets: {
          select: {
            asset: {
              select: {
                url: true;
                type: true;
              };
            };
          };
        };
      };
    };
    variant: {
      include: {
        assets: {
          select: { asset: { select: { url: true; type: true } } };
        };
        options: {
          include: {
            productVariantOption: {
              include: {
                variantOption: {
                  select: {
                    id: true;
                    asset: { select: { url: true; type: true } };
                    hexValue: true;
                    translations: true;
                    variantGroup: {
                      select: {
                        id: true;
                        translations: true;
                        type: true;
                      };
                    };
                  };
                };
              };
            };
          };
        };
        prices: true;
        translations: true;
        product: {
          include: {
            categories: {
              select: {
                category: {
                  select: {
                    id: true;
                    translations: true;
                    image: { select: { url: true; type: true } };
                  };
                };
              };
            };
            translations: true;
            brand: {
              select: {
                id: true;
                translations: true;
                image: { select: { url: true; type: true } };
              };
            };
            assets: {
              select: {
                asset: {
                  select: {
                    url: true;
                    type: true;
                  };
                };
              };
            };
          };
        };
      };
    };
  };
}>;
