import { Currency, Locale, Prisma } from "@repo/database";

export const commonProductAssetsQuery = {
  orderBy: {
    order: "asc",
  },
  select: {
    order: true,
    asset: {
      select: {
        url: true,
        type: true,
      },
    },
  },
} as const satisfies Prisma.Product$assetsArgs;

export const commonProductBrandQuery = {
  image: {
    select: {
      type: true,
      url: true,
    },
  },
  translations: true,
} as const satisfies Prisma.BrandInclude;

export const variantsOptionsOrderByQuery = [
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
] as const satisfies Prisma.ProductVariantCombinationOptionOrderByWithRelationInput[];

export const variantOptionsQuery = {
  productVariantOption: {
    select: {
      id: true,
      productVariantGroup: {
        select: {
          renderVisibleType: true,
        },
      },
      variantOption: {
        select: {
          id: true,
          asset: {
            select: {
              url: true,
            },
          },
          hexValue: true,
          translations: true,
          variantGroup: {
            select: {
              id: true,
              type: true,
              translations: true,
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.ProductVariantCombinationOptionSelect;

export const commonProductVariantClause = (
  currency: Currency,
  locale: Locale
): Prisma.ProductVariantCombinationWhereInput => {
  return {
    active: true,
    stock: { gt: 0 },
    prices: {
      some: {
        currency,
      },
    },
    translations: {
      some: {
        locale,
      },
    },
  };
};

export const commonProductWhereClause = (
  currency: Currency,
  locale: Locale
): Prisma.ProductWhereInput => {
  return {
    active: true,
    deletedAt: null,
    deletedBy: null,
    deleteReason: null,
    translations: {
      some: {
        locale,
      },
    },
    variants: {
      some: {
        active: true,
        stock: { gt: 0 },
        prices: {
          some: {
            currency,
          },
        },
      },
    },
  };
};

export const uiProductInclude = ({
  variantWhere,
}: {
  variantWhere?: Prisma.ProductVariantCombinationWhereInput;
}) => {
  return {
    translations: true,
    assets: commonProductAssetsQuery,
    brand: {
      include: commonProductBrandQuery,
    },
    categories: {
      select: {
        category: {
          include: {
            translations: true,
            image: {
              select: {
                url: true,
                type: true,
              },
            },
          },
        },
      },
    },
    tags: {
      select: {
        productTag: {
          include: {
            translations: true,
          },
        },
      },
    },
    variantGroups: {
      take: 1,
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        order: true,
        renderVisibleType: true,
        variantGroup: {
          select: {
            id: true,
            type: true,
            translations: true,
          },
        },
        options: {
          orderBy: {
            order: "asc",
          },
          where: {
            combinations: {
              some: {
                combination: {
                  stock: { gt: 0 },
                  active: true,
                },
              },
            },
          },
          select: {
            id: true,
            order: true,
            variantOption: {
              select: {
                id: true,
                hexValue: true,
                asset: {
                  select: {
                    url: true,
                  },
                },
                translations: true,
              },
            },
          },
        },
      },
    },
    variants: {
      where: variantWhere,
      include: {
        assets: commonProductAssetsQuery,
        prices: true,
        translations: true,
        options: {
          orderBy: variantsOptionsOrderByQuery,
          select: variantOptionsQuery,
        },
      },
    },
  } as const satisfies Prisma.ProductInclude;
};

export type UiProductType = Prisma.ProductGetPayload<{
  include: ReturnType<typeof uiProductInclude>;
}>;

export const productDetailInclude = (locale: Locale, currency: Currency) => {
  const variantWhere = commonProductVariantClause(currency, locale);

  return {
    translations: {
      where: { locale },
    },
    assets: commonProductAssetsQuery,
    taxonomyCategory: {
      select: {
        id: true,
        googleId: true,
        originalName: true,
        path: true,
        pathNames: true,
      },
    },
    brand: {
      include: commonProductBrandQuery,
    },
    categories: {
      select: {
        category: {
          select: {
            id: true,
            translations: {
              where: { locale },
              select: {
                name: true,
                slug: true,
              },
            },
            image: {
              select: {
                url: true,
                type: true,
              },
            },
          },
        },
      },
    },
    tags: {
      orderBy: {
        productTag: {
          priority: "asc",
        },
      },
      select: {
        productTag: {
          select: {
            id: true,
            color: true,
            icon: true,
            translations: {
              where: { locale },
            },
          },
        },
      },
    },
    variantGroups: {
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        order: true,
        renderVisibleType: true,
        variantGroup: {
          select: {
            id: true,
            type: true,
            translations: {
              where: { locale },
            },
          },
        },
        options: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            order: true,

            combinations: {
              select: {
                combinationId: true,
                combination: {
                  select: {
                    stock: true,
                  },
                },
              },
            },
            variantOption: {
              select: {
                id: true,
                hexValue: true,
                asset: {
                  select: {
                    url: true,
                    type: true,
                  },
                },
                translations: {
                  where: { locale },
                },
              },
            },
          },
        },
      },
    },
    variants: {
      where: variantWhere,
      include: {
        assets: commonProductAssetsQuery,
        prices: {
          where: { currency },
        },
        translations: {
          where: { locale },
        },
        options: {
          orderBy: variantsOptionsOrderByQuery,
          select: variantOptionsQuery,
        },
      },
    },
  } as const satisfies Prisma.ProductInclude;
};

export type ProductDetailType = Prisma.ProductGetPayload<{
  include: ReturnType<typeof productDetailInclude>;
}>;

export type ProductDetailVariant = ProductDetailType["variants"][number];
export type ProductDetailVariantGroup =
  ProductDetailType["variantGroups"][number];
export type ProductDetailVariantOption =
  ProductDetailVariantGroup["options"][number];
export type ProductDetailTag = ProductDetailType["tags"][number];
export type ProductDetailCategory = ProductDetailType["categories"][number];
export type ProductDetailAsset = ProductDetailType["assets"][number];
