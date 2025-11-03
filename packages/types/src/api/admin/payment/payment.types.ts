import { Prisma } from "@repo/database";

export const addressInclude: Prisma.AddressSchemaInclude = {
  city: { select: { id: true, name: true } },
  country: {
    select: {
      id: true,
      name: true,
      emoji: true,
      translations: true,
    },
  },
  district: { select: { name: true, id: true } },
  state: { select: { id: true, name: true } },
};

export type ShippingAddressPayload = Prisma.AddressSchemaGetPayload<{
  include: {
    city: { select: { id: true; name: true } };
    country: {
      select: {
        id: true;
        name: true;
        emoji: true;
        translations: true;
      };
    };
    district: { select: { name: true; id: true } };
    state: { select: { id: true; name: true } };
  };
}>;

const variantOptionsOrderBy: Prisma.ProductVariantCombinationOptionOrderByWithRelationInput[] =
  [
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
  ];

export const GetCartItemForPaymentInclude = {
  product: {
    include: {
      assets: {
        orderBy: {
          order: "asc",
        },
        select: {
          asset: {
            select: { url: true, type: true },
          },
        },
      },
      translations: true,
      prices: true,
    },
  },
  variant: {
    include: {
      assets: {
        orderBy: {
          order: "asc",
        },
        select: {
          asset: {
            select: { url: true, type: true },
          },
        },
      },
      prices: true,
      translations: true,
      options: {
        orderBy: variantOptionsOrderBy,
        select: {
          productVariantOption: {
            select: {
              variantOption: {
                select: {
                  asset: { select: { url: true, type: true } },
                  hexValue: true,
                  translations: true,
                  id: true,
                  variantGroup: {
                    select: {
                      id: true,
                      translations: true,
                      type: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const GetCartForPaymentIncludeCartType: Prisma.CartInclude = {
  user: true,
  billingAddress: {
    include: addressInclude,
  },
  shippingAddress: {
    include: addressInclude,
  },
  cargoRule: {
    select: {
      id: true,
      price: true,
      name: true,
      currency: true,
    },
  },
  orderAttempts: {
    where: {
      paymentStatus: { in: ["PARTIALLY_PAID", "PAID"] },
    },
  },
  items: {
    where: {
      isVisible: true,
      deletedAt: null,
      visibleCause: null,
      quantity: { gt: 0 },
      OR: [
        {
          variant: null,
          variantId: null,
          product: { active: true, stock: { gt: 0 } },
        },
        {
          variant: { active: true, stock: { gt: 0 } },
          product: { active: true },
        },
      ],
    },
    include: GetCartItemForPaymentInclude,
  },
};

export type GetCartForPaymentReturnType = {
  success: boolean;
  message: string;
  data?: {
    totalPrice: number;
    discountAmount: number;
    shippingCost: number;
    totalFinalPrice: number;
    cart: Prisma.CartGetPayload<{
      include: typeof GetCartForPaymentIncludeCartType;
    }>;
  };
};

export type CartForPayment = NonNullable<
  GetCartForPaymentReturnType["data"]
>["cart"];

export type CartItemForPayment = Prisma.CartItemGetPayload<{
  include: typeof GetCartItemForPaymentInclude;
}>;
