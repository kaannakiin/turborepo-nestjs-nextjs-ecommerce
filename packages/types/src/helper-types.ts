import { Prisma } from "@repo/database";

export type CheckoutPageCartType = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
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
        };
        variant: {
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
            translations: true;
            prices: true;
            options: {
              orderBy: {
                productVariantOption: {
                  productVariantGroup: {
                    order: "asc";
                  };
                };
              };
              include: {
                productVariantOption: {
                  select: {
                    variantOption: {
                      select: {
                        translations: true;
                        asset: {
                          select: {
                            url: true;
                            type: true;
                          };
                        };
                        hexValue: true;
                      };
                    };
                    productVariantGroup: {
                      select: {
                        variantGroup: {
                          select: {
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
        };
      };
    };
    billingAddress: {
      include: {
        city: { select: { id: true; name: true } };
        country: { select: { id: true; translations: true } };
        state: { select: { id: true; name: true } };
      };
    };
    shippingAddress: {
      include: {
        city: { select: { id: true; name: true } };
        country: { select: { id: true; translations: true } };
        state: { select: { id: true; name: true } };
      };
    };
    user: true;
  };
}>;
