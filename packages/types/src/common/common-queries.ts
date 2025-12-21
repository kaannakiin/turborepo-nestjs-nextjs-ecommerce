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
}): Prisma.ProductInclude => {
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
  };
};

export type UiProductType = Prisma.ProductGetPayload<{
  include: ReturnType<typeof uiProductInclude>;
}>;
