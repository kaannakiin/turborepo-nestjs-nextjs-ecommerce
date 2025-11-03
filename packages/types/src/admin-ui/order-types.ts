import { OrderItemSchema, Prisma } from "@repo/database";
import {
  CartItemForPayment,
  GetCartForPaymentReturnType,
  ShippingAddressPayload,
} from "../api/admin/payment/payment.types";

type OptionsArray = Prisma.ProductVariantCombinationGetPayload<{
  include: {
    options: {
      orderBy: [
        {
          productVariantOption: {
            productVariantGroup: {
              order: "asc";
            };
          };
        },
        {
          productVariantOption: { order: "asc" };
        },
      ];
      select: {
        productVariantOption: {
          select: {
            variantOption: {
              select: {
                id: true;
                hexValue: true;
                translations: true;
                asset: {
                  select: {
                    url: true;
                    type: true;
                  };
                };
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
  };
}>["options"];

export type BuyedVariant =
  OptionsArray[number]["productVariantOption"]["variantOption"][];

export type ProductSnapshotForVariant = Omit<
  Prisma.ProductVariantCombinationGetPayload<{
    include: {
      assets: {
        take: 1;
        orderBy: {
          order: "asc";
        };
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
        orderBy: [
          {
            productVariantOption: {
              productVariantGroup: {
                order: "asc";
              };
            };
          },
          {
            productVariantOption: { order: "asc" };
          },
        ];
        select: {
          productVariantOption: {
            select: {
              variantOption: {
                select: {
                  id: true;
                  hexValue: true;
                  translations: true;
                  asset: {
                    select: {
                      url: true;
                      type: true;
                    };
                  };
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
      product: {
        include: {
          translations: true;
          assets: {
            take: 1;
            p;
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
  }>,
  "options"
>;
export type ProductSnapshot = Prisma.ProductGetPayload<{
  include: {
    assets: {
      take: 1;
      orderBy: {
        order: "asc";
      };
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
  };
}>;

export type OrderPageReturnType = {
  success: boolean;
  message?: string;
  order?: Prisma.OrderSchemaGetPayload<{
    include: {
      user: {
        select: {
          id: true;
          name: true;
          email: true;
          surname: true;
          phone: true;
        };
      };
      orderItems: true;
    };
  }>;
};

export type GetOrderByIdForPaymentReturnData = Prisma.OrderSchemaGetPayload<{
  include: {
    itemsSchema: {
      select: {
        variantId: true;
        productId: true;
        quantity: true;
      };
    };
  };
}>;

export type OrderItemWithSnapshot = Omit<
  OrderItemSchema,
  "prodcutSnapshot" | "variantSnapshot"
> & {
  productSnapshot: CartItemForPayment["product"];
  variantSnapshot?: CartItemForPayment["variant"];
};
export type OrderWithSnapshot = Omit<
  Prisma.OrderSchemaGetPayload<{
    include: {
      user: {
        select: {
          id: true;
          name: true;
          surname: true;
          email: true;
          phone: true;
        };
      };
      shipments: true;
      transactions: true;
    };
  }>,
  "shippingAddressSnapshot" | "billingAddressSnapshot" | "cargoRuleSnapshot"
> & {
  shippingAddressSnapshot: ShippingAddressPayload;
  billingAddressSnapshot?: ShippingAddressPayload;
  cargoRuleSnapshot: GetCartForPaymentReturnType["data"]["cart"]["cargoRule"];
};

export type AdminGetOrdersReturnType = {
  success: boolean;
  orders?: Array<OrderWithSnapshot & { itemSchema: OrderItemWithSnapshot[] }>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminGetOrderReturnType = {
  success: boolean;
  message: string;
  order?: OrderWithSnapshot & { itemSchema: OrderItemWithSnapshot[] };
};
