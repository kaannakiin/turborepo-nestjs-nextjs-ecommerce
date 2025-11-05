import { $Enums, Prisma } from "@repo/database";
import { UseMutationResult } from "@repo/shared";
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

export type CartActionResponse = {
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
  cart: CartV3 | null | undefined;
  isCartLoading: boolean;
  addNewItem: UseMutationResult<CartV3, Error, CartItemV3>;
  increaseItemQuantity: UseMutationResult<CartV3, Error, CartItemParams>;
  decreaseItemQuantity: UseMutationResult<CartV3, Error, CartItemParams>;
  removeItem: UseMutationResult<CartV3, Error, CartItemParams>;
  updateItemQuantity: UseMutationResult<CartV3, Error, UpdateQtyParams>;
  clearCart: UseMutationResult<CartV3, Error, string>;
  mergeCarts: UseMutationResult<CartV3, Error, string>;
  setOrderNote: UseMutationResult<CartV3, Error, string>;
};

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

export const productAssetSelect = {
  orderBy: {
    order: "asc",
  },
  where: {
    asset: { type: "IMAGE" },
  },
  take: 1,
  select: {
    asset: { select: { url: true, type: true } },
  },
} as const satisfies Prisma.ProductInclude["assets"];

export const productPriceSelect = {
  select: {
    price: true,
    currency: true,
    discountedPrice: true,
  },
} as const satisfies Prisma.ProductInclude["prices"];

export const productVariantOptionsSelect = {
  orderBy: [
    {
      productVariantOption: {
        productVariantGroup: {
          order: "asc",
        },
      },
    },
    {
      productVariantOption: {
        order: "asc",
      },
    },
  ],
  select: {
    productVariantOption: {
      select: {
        productVariantGroup: {
          select: {
            renderVisibleType: true,
          },
        },
        variantOption: {
          select: {
            id: true,
            translations: {
              select: { locale: true, name: true, slug: true },
            },
            asset: {
              select: { url: true, type: true },
            },
            hexValue: true,
            variantGroup: {
              select: {
                id: true,
                translations: {
                  select: { locale: true, name: true, slug: true },
                },
                type: true,
              },
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.ProductVariantCombinationInclude["options"];

export const addressSelectForCart = {
  include: {
    city: {
      select: {
        id: true,
        name: true,
      },
    },
    district: {
      select: {
        name: true,
        id: true,
      },
    },
    country: {
      select: {
        id: true,
        name: true,
        translations: true,
        emoji: true,
      },
    },
    state: {
      select: {
        id: true,
        name: true,
      },
    },
  },
} as const satisfies Prisma.CartInclude["shippingAddress"];
export const cargoRuleSelectForCart = {
  select: {
    id: true,
    currency: true,
    name: true,
    price: true,
    ruleType: true,
  },
} as const satisfies Prisma.CartInclude["cargoRule"];

export const cartItemIncludeForCart = {
  where: {
    quantity: { gt: 0 },
    isVisible: true,
    deletedAt: null,
    visibleCause: null,
  },
  orderBy: {
    createdAt: "asc",
  },
  include: {
    product: {
      include: {
        assets: productAssetSelect,
        prices: productPriceSelect,
        translations: true,
      },
    },
    variant: {
      include: {
        assets: productAssetSelect,
        prices: productPriceSelect,
        translations: true,
        options: productVariantOptionsSelect,
      },
    },
  },
} as const satisfies Prisma.CartInclude["items"];

export type CartWithRelations = Prisma.CartGetPayload<{
  include: {
    items: typeof cartItemIncludeForCart;
  };
}>;

export type CartWithRelationForCheckoutPage = Prisma.CartGetPayload<{
  include: {
    items: typeof cartItemIncludeForCart;
    billingAddress: typeof addressSelectForCart;
    shippingAddress: typeof addressSelectForCart;
    cargoRule: typeof cargoRuleSelectForCart;
    user: true;
  };
}>;
