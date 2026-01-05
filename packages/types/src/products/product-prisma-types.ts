import { Prisma } from "@repo/database/client";
import {
  commonProductAssetsQuery,
  variantOptionsQuery,
  variantsOptionsOrderByQuery,
} from "../common";

export type GetProductPageReturnType = {
  success: boolean;
  message: string;
  data: Prisma.ProductGetPayload<{
    include: {
      assets: {
        orderBy: {
          order: "asc";
        };
        include: {
          asset: {
            select: {
              url: true;
              type: true;
            };
          };
        };
      };
      brand: {
        select: {
          translations: {
            where: { locale };
            select: {
              description: true;
              metaDescription: true;
              metaTitle: true;
              name: true;
              slug: true;
            };
          };
        };
      };
      categories: {
        where: {
          category: {
            translations: {
              some: { locale };
            };
            products: {
              some: {
                product: {
                  OR: [
                    {
                      active: true;
                      stock: { gt: 0 };
                      isVariant: false;
                    },
                    {
                      active: true;
                      variantCombinations: {
                        some: {
                          active: true;
                          stock: { gt: 0 };
                        };
                      };
                    },
                  ];
                };
              };
            };
          };
        };
        select: {
          category: {
            select: {
              id: true;
              translations: {
                where: { locale };
                select: {
                  name: true;
                  slug: true;
                  locale: true;
                  metaTitle: true;
                  metaDescription: true;
                  description: true;
                };
              };
            };
          };
        };
      };
      prices: {
        select: {
          price: true;
          currency: true;
          discountedPrice: true;
        };
      };
      translations: {
        where: { locale };
        select: {
          name: true;
          locale: true;
          metaDescription: true;
          metaTitle: true;
          slug: true;
          description: true;
        };
      };
      taxonomyCategory: {
        select: {
          googleId: true;
        };
      };
      variantGroups: {
        orderBy: {
          order: "asc";
        };
        where: {
          product: {
            active: true;
            variantCombinations: {
              some: {
                active: true;
                stock: { gt: 0 };
              };
            };
          };
        };
        include: {
          variantGroup: {
            select: {
              id: true;
              type: true;
              translations: {
                where: {
                  locale;
                };
                select: {
                  locale: true;
                  name: true;
                  slug: true;
                };
              };
            };
          };
          options: {
            orderBy: {
              order: "asc";
            };
            where: {
              combinations: {
                some: {
                  combination: {
                    active: true;
                    stock: { gt: 0 };
                  };
                  productVariantOption: {
                    productVariantGroup: {
                      product: {
                        active: true;
                      };
                    };
                  };
                };
              };
            };
            select: {
              order: true;
              variantOption: {
                select: {
                  id: true;
                  asset: { select: { url: true; type: true } };
                  hexValue: true;
                  translations: {
                    where: { locale };
                    select: {
                      locale: true;
                      name: true;
                      slug: true;
                    };
                  };
                };
              };
            };
          };
        };
      };
      variantCombinations: {
        where: {
          active: true;
          stock: { gt: 0 };
          product: {
            active: true;
          };
        };
        include: {
          assets: {
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
          translations: {
            where: { locale };
            select: {
              locale: true;
              metaDescription: true;
              metaTitle: true;
              description: true;
            };
          };
          prices: true;
          options: {
            select: {
              productVariantOption: {
                select: {
                  order: true;
                  variantOption: {
                    select: {
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
  }> | null;
};

export type ProductPageDataType = Prisma.ProductGetPayload<{
  include: {
    assets: {
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
    brand: {
      select: {
        translations: {
          select: {
            name: true;
            locale: true;
            metaDescription: true;
            metaTitle: true;
            slug: true;
          };
        };
      };
    };
    taxonomyCategory: true;
    translations: {
      select: {
        name: true;
        locale: true;
        metaDescription: true;
        metaTitle: true;
        slug: true;
        description: true;
      };
    };
    variantGroups: {
      orderBy: {
        order: "asc";
      };
      where: {
        product: {
          translations: {
            some: {
              slug: { contains: string; mode: "insensitive" };
            };
          };
        };
      };
      include: {
        options: {
          where: {
            productVariantGroup: {
              product: {
                translations: {
                  some: {
                    slug: { contains: string; mode: "insensitive" };
                  };
                };
              };
            };
          };
          orderBy: {
            order: "asc";
          };
          include: {
            variantOption: {
              include: {
                asset: { select: { url: true; type: true } };
                translations: true;
              };
            };
          };
        };
        variantGroup: {
          include: {
            translations: true;
          };
        };
      };
    };
    variants: {
      where: {
        AND: [
          {
            stock: {
              gt: 0;
            };
          },
          { active: true },
        ];
      };
      include: {
        translations: {
          select: {
            locale: true;
            metaDescription: true;
            metaTitle: true;
            description: true;
          };
        };
        prices: {
          select: {
            price: true;
            currency: true;
            discountedPrice: true;
          };
        };
        assets: {
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
        options: {
          where: {
            combination: {
              AND: [
                {
                  active: true;
                },
                {
                  stock: { gt: 0 };
                },
              ];
            };

            productVariantOption: {
              productVariantGroup: {
                product: {
                  translations: {
                    some: {
                      slug: { contains: string; mode: "insensitive" };
                    };
                  };
                };
              };
            };
          };
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
                    asset: { select: { url: true; type: true } };
                    translations: {
                      select: {
                        locale: true;
                        name: true;
                        slug: true;
                      };
                    };
                    hexValue: true;
                    variantGroup: {
                      select: {
                        translations: {
                          select: {
                            name: true;
                            slug: true;
                            locale: true;
                          };
                        };
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
    categories: {
      where: {
        product: {
          translations: {
            some: {
              slug: { contains: string; mode: "insensitive" };
            };
          };
        };
      };
      include: {
        category: {
          select: {
            translations: true;
            childCategories: true;
            parentCategory: true;
          };
        };
      };
    };
  };
}>;

export const adminProductTableQuery = {
  assets: commonProductAssetsQuery,
  translations: true,
  variants: {
    include: {
      prices: true,
      translations: true,
      assets: commonProductAssetsQuery,
      options: {
        orderBy: variantsOptionsOrderByQuery,
        select: variantOptionsQuery,
      },
    },
  },
} as const satisfies Prisma.ProductInclude;

export type AdminProductTableProductData = Prisma.ProductGetPayload<{
  include: typeof adminProductTableQuery;
}>;

export interface BulkActionResult {
  success: boolean;
  affectedCount: number;
}
