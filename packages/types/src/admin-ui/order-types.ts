import { Prisma } from "@repo/database";

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
  order?: Prisma.OrderGetPayload<{
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
