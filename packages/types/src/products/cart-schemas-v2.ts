import * as z from "zod";
import { $Enums, Prisma } from "@repo/database";

export type CartContextCartItemType = {
  itemId: string;
  productId: string;
  productUrl: string;
  quantity: number;
  productName: string;
  productAsset?: { url: string; type: $Enums.AssetType };
  price: number;
  discountedPrice?: number;
  variantId?: string;
  variantOptions?: Array<{
    variantGroupName: string;
    variantGroupSlug: string;
    variantOptionName: string;
    variantOptionSlug: string;
    variantOptionHexValue?: string;
    variantOptionAsset?: { url: string; type: $Enums.AssetType };
  }>;
  whereAdded: $Enums.WhereAdded;
  variantAsset?: { url: string; type: $Enums.AssetType };
};

export type CartContextCartType = {
  cartId: string;
  status: $Enums.CartStatus;
  totalItems: number;
  totalPrice: number;
  subTotalPrice: number;
  totalDiscount: number;
  taxTotal: number;
  currency: $Enums.Currency;
  locale: $Enums.Locale;
  orderNote?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  items: CartContextCartItemType[];
};

export type CartActionResponse = {
  success: boolean;
  message?: string;
  newCart?: CartContextCartType;
};

export const AddItemToCartV2Schema = z.object({
  cartId: z
    .cuid2({
      error: "Geçersiz sepet IDsi",
    })
    .optional()
    .nullable(),
  productId: z.cuid2({
    error: "Geçersiz ürün IDsi",
  }),
  variantId: z
    .cuid2({
      error: "Geçersiz varyant IDsi",
    })
    .optional()
    .nullable(),
  quantity: z
    .number({
      error: "Geçersiz adet",
    })
    .nonnegative({
      error: "Adet negatif olamaz",
    })
    .min(1, {
      error: "En az 1 adet ekleyebilirsiniz",
    })
    .max(Number.MAX_SAFE_INTEGER, {
      error: "Çok büyük adet",
    }),
  whereAdded: z.enum($Enums.WhereAdded, {
    error: "Lütfen geçerli bir ekleme nedeni seçin",
  }),
});

export type AddItemToCartV2 = z.infer<typeof AddItemToCartV2Schema>;

// Sadece itemId gereken işlemler için (remove, increase, decrease)
export const ItemIdOnlySchema = z.object({
  itemId: z.cuid2({
    error: "Geçersiz ürün IDsi",
  }),
});

export type ItemIdOnlyParams = z.infer<typeof ItemIdOnlySchema>;

export type GetCartByIdReturn = Prisma.CartGetPayload<{
  include: {
    billingAddress: {
      include: {
        city: { select: { id: true; name: true } };
        country: {
          select: { id: true; name: true; emoji: true; translations: true };
        };
        state: {
          select: { id: true; name: true };
        };
      };
    };
    shippingAddress: {
      include: {
        city: { select: { id: true; name: true } };
        country: {
          select: { id: true; name: true; emoji: true; translations: true };
        };
        state: {
          select: { id: true; name: true };
        };
      };
    };
    items: {
      include: {
        product: {
          include: {
            assets: {
              take: 1;
              select: {
                asset: {
                  select: {
                    url: true;
                    type: true;
                  };
                };
              };
            };
            translations: true;
            brand: {
              select: {
                id: true;
                translations: true;
              };
            };
            categories: {
              select: {
                category: {
                  select: {
                    id: true;
                    translations: true;
                  };
                };
              };
            };
            prices: true;
          };
        };
        variant: {
          include: {
            assets: {
              take: 1;
              select: {
                asset: {
                  select: {
                    url: true;
                    type: true;
                  };
                };
              };
            };
            prices: true;
            translations: true;
            options: {
              orderBy: {
                productVariantOption: {
                  productVariantGroup: {
                    order: "asc";
                  };
                };
              };
              select: {
                productVariantOption: {
                  select: {
                    variantOption: {
                      select: {
                        id: true;
                        translations: true;
                        hexValue: true;
                        asset: { select: { url: true; type: true } };
                        variantGroup: {
                          select: {
                            translations: true;
                            type: true;
                            id: true;
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
    user: true;
    cargoRule: true;
  };
}>;

export type CartContextTypeV2 = {
  cart: CartContextCartType | null;
  addItem: (params: AddItemToCartV2) => Promise<CartActionResponse>;
  increaseItemQuantity: (
    params: ItemIdOnlyParams
  ) => Promise<CartActionResponse>;
  decreaseItemQuantity: (
    params: ItemIdOnlyParams
  ) => Promise<CartActionResponse>;
  removeItem: (params: ItemIdOnlyParams) => Promise<CartActionResponse>;
  clearCart: () => Promise<CartActionResponse>;
  updateOrderNote: (note: string) => Promise<CartActionResponse>;
  mergeCarts: () => Promise<CartActionResponse>;
  lastAddedItem: CartContextCartItemType | null;
  popoverOpened: boolean;
  closePopover: () => void; // ✅ Ekle
};

export type AdminCartTableData = {
  cartId: string;
  user?: {
    name: string;
    surname: string;
    email: string;
  };
  currency: $Enums.Currency;
  locale: $Enums.Locale;
  status: $Enums.CartStatus;
  createdAt: Date;
  updatedAt: Date;
  totalItems: number;
  totalPrice: number;
  totalDiscount: number;
  taxTotal: number;
  orderNote?: string;
  items: Array<{
    itemId: string;
    productName: string;
    quantity: number;
    price: number;
    discountedPrice?: number;
    isDeleted: boolean;
    visibleCause: $Enums.inVisibleCause;
    whereAdded: $Enums.WhereAdded;
    productId: string;
    variantId?: string;
    productUrl: string;
    productAsset?: { url: string; type: $Enums.AssetType };
    variantAsset?: { url: string; type: $Enums.AssetType };
    variantOptions?: Array<{
      variantGroupName: string;
      variantGroupSlug: string;
      variantOptionName: string;
      variantOptionSlug: string;
      variantOptionHexValue?: string;
      variantOptionAsset?: { url: string; type: $Enums.AssetType };
    }>;
  }>;
};

export type AdminCartTableSelect = Prisma.CartGetPayload<{
  include: {
    user: true;
    items: {
      orderBy: {
        createdAt: "desc";
      };
      include: {
        product: {
          include: {
            assets: {
              take: 1;
              select: {
                asset: {
                  select: {
                    url: true;
                    type: true;
                  };
                };
              };
            };
            translations: true;
            brand: {
              select: {
                id: true;
                translations: true;
              };
            };
            categories: {
              select: {
                category: {
                  select: {
                    id: true;
                    translations: true;
                  };
                };
              };
            };
            prices: true;
          };
        };
        variant: {
          include: {
            assets: {
              take: 1;
              select: {
                asset: {
                  select: {
                    url: true;
                    type: true;
                  };
                };
              };
            };
            prices: true;
            translations: true;
            options: {
              orderBy: {
                productVariantOption: {
                  productVariantGroup: {
                    order: "asc";
                  };
                };
              };
              select: {
                productVariantOption: {
                  select: {
                    variantOption: {
                      select: {
                        id: true;
                        translations: true;
                        hexValue: true;
                        asset: { select: { url: true; type: true } };
                        variantGroup: {
                          select: {
                            translations: true;
                            type: true;
                            id: true;
                          };
                        };
                      };
                    };
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

export type GetUserCartInfoForCheckoutReturn = Omit<
  GetCartByIdReturn,
  "items"
> & { items: CartContextCartItemType[] };
