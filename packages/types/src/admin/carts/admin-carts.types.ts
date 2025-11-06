import { Prisma } from "@repo/database";
import { Pagination } from "../../shared-schema";
import {
  productAssetSelect,
  productPriceSelect,
  productVariantOptionsSelect,
} from "../../products/cart-schemas-v3";

export type CartWhereInput = Prisma.CartWhereInput;
export type GetAllCartsReturnType = {
  success: boolean;
  message: string;
  data?: {
    carts: Prisma.CartGetPayload<{
      include: {
        user: true;
        _count: {
          select: {
            items: true;
            orderAttempts: true;
          };
        };
      };
    }>[];
    pagination: Pagination;
  };
};

export type GetCartForAdminReturnType = {
  success: boolean;
  message: string;
  cart?: Prisma.CartGetPayload<{
    include: {
      user: true;
      cartActivityLogs: {
        orderBy: {
          createdAt: "desc";
        };
      };
      cartPaymentCheckAttempts: true;
      orderAttempts: true;
      items: {
        include: {
          product: {
            include: {
              assets: typeof productAssetSelect;
              prices: typeof productPriceSelect;
              translations: true;
            };
          };
          variant: {
            include: {
              assets: typeof productAssetSelect;
              prices: typeof productPriceSelect;
              translations: true;
              options: typeof productVariantOptionsSelect;
            };
          };
          logs: {
            orderBy: {
              createdAt: "desc";
            };
          };
        };
      };
    };
  }>;
};
