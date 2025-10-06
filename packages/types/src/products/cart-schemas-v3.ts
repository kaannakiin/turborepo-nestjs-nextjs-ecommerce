import { $Enums, Prisma } from "@repo/database";
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

export type CartV3ContextType = {
  /** Mevcut sepet verisi */
  cart: CartV3;

  /**
   * Sepeti yeniler ve güncel sepet verisini getirir
   * @returns Başarı durumu ve güncellenmiş sepet bilgisi
   */
  refreshCart: () => Promise<{
    success: boolean;
    message?: string;
    newCart?: CartV3;
  }>;

  /**
   * Sepete yeni bir ürün ekler
   * @param params - Eklenecek ürün bilgileri
   * @returns Sepet işlem sonucu
   * @remarks Yalnızca bir ürün ilk kez sepete eklendiğinde çağırılmalıdır. Miktarı artırmak için `increaseItemQuantity` kullanın.
   */
  addNewItem: (params: CartItemV3) => Promise<CartActionResponseV3>;

  /**
   * Bir ürünü sepetten tamamen kaldırır
   * @param productId - Kaldırılacak ürünün ID'si
   * @param variantId - Ürün varyantının ID'si (opsiyonel)
   * @returns Sepet işlem sonucu
   */
  removeItem: (
    productId: string,
    variantId?: string
  ) => Promise<CartActionResponseV3>;

  /**
   * Sepetteki bir ürünün miktarını belirtilen değere günceller
   * @param productId - Güncellenecek ürünün ID'si
   * @param quantity - Yeni miktar değeri
   * @param variantId - Ürün varyantının ID'si (opsiyonel)
   * @returns Sepet işlem sonucu
   */
  updateItemQuantity: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => Promise<CartActionResponseV3>;

  /**
   * Sepetteki bir ürünün miktarını 1 azaltır
   * @param productId - Azaltılacak ürünün ID'si
   * @param variantId - Ürün varyantının ID'si (opsiyonel)
   * @returns Sepet işlem sonucu
   */
  decreaseItemQuantity: (
    productId: string,
    variantId?: string
  ) => Promise<CartActionResponseV3>;

  /**
   * Sepetteki bir ürünün miktarını 1 artırır
   * @param productId - Artırılacak ürünün ID'si
   * @param variantId - Ürün varyantının ID'si (opsiyonel)
   * @returns Sepet işlem sonucu
   */
  increaseItemQuantity: (
    productId: string,
    variantId?: string
  ) => Promise<CartActionResponseV3>;

  /**
   * Eski bir sepeti mevcut sepetle birleştirir
   * @param oldCartId - Birleştirilecek eski sepetin ID'si
   * @returns Sepet işlem sonucu
   */
  mergeCarts: (oldCartId: string) => Promise<CartActionResponseV3>;

  /**
   * Sepetteki tüm ürünleri temizler
   * @returns Sepet işlem sonucu
   */
  clearCart: () => Promise<CartActionResponseV3>;

  /**
   * Sipariş için not ekler veya günceller
   * @param note - Sipariş notu
   * @returns Sepet işlem sonucu
   */
  setOrderNote: (note: string) => Promise<CartActionResponseV3>;
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
