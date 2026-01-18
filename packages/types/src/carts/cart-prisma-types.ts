import { $Enums, Currency, Locale, Prisma } from "@repo/database/client";
import {
  commonProductAssetsQuery,
  commonProductVariantWhereClause,
  variantOptionsQuery,
} from "../common";

export const activeCartItemFilter = {
  where: {
    isVisible: true,
    deletedAt: null,
  },
  orderBy: { createdAt: "desc" as const },
} as const satisfies Prisma.Cart$itemsArgs;

export const cartItemArgs = (
  currency?: Currency,
  locale?: Locale,
): Prisma.Cart$itemsArgs => {
  return {
    where: {
      isVisible: true,
      deletedAt: null,
      visibleCause: null,
      variant: {
        ...commonProductVariantWhereClause(
          currency as Currency,
          locale as Locale,
        ),
      },
    },
    include: {
      variant: {
        include: {
          assets: commonProductAssetsQuery,
          prices: {
            where: {
              currency: currency || "TRY",
            },
          },
          options: {
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
            where: {
              combination: {
                ...commonProductVariantWhereClause(
                  currency as Currency,
                  locale as Locale,
                ),
              },
            },
            select: { ...variantOptionsQuery },
          },
          product: {
            include: {
              assets: commonProductAssetsQuery,
              translations: {
                where: {
                  locale: locale || "TR",
                },
              },
            },
          },
        },
      },
    },
  };
};

const cartItemInclude = {
  variant: {
    include: {
      assets: commonProductAssetsQuery,
      prices: true,
      options: {
        select: { ...variantOptionsQuery },
      },
      product: {
        include: {
          assets: commonProductAssetsQuery,
          translations: true,
        },
      },
    },
  },
} as const;

export type CartItemWithVariant = Prisma.CartItemGetPayload<{
  include: typeof cartItemInclude;
}>;

export type CartType = {
  cartId: string;
  userId: string | null;
  totalItems: number;
  totalProducts: number;
  totalAmount: number;
  totalDiscount: number;
  currency: Currency;
  locale: Locale;
  items: CartItemWithVariant[];
};

export type InvalidItemDetail = {
  cartItemId: string;
  variantId: string;
  productName: string;
  cause: $Enums.inVisibleCause;
};

export type CartValidationResult = {
  itemsToHide: Array<{ id: string; cause: $Enums.inVisibleCause }>;
  validCount: number;
};

export type RestoreResult = {
  restoredCount: number;
  restoredItemIds: string[];
};

export type CartContextUpdateResponse = {
  cart: CartType;
  invalidItems: InvalidItemDetail[];
  restoredItems: string[];
  contextChanged: boolean;
};
