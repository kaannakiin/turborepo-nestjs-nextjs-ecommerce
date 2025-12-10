import { Locale, Prisma } from "@repo/database";
const assetSelect = {
  take: 1,
  orderBy: { order: "asc" },
  where: { asset: { type: "IMAGE" } },
  select: { asset: { select: { url: true } } },
} as const satisfies Prisma.ProductAssetFindManyArgs;

const variantCombinationsQuery = {
  include: {
    assets: assetSelect,
    prices: true,
    translations: true,
    options: {
      orderBy: [
        {
          productVariantOption: { productVariantGroup: { order: "asc" } },
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
                asset: {
                  select: {
                    url: true,
                    type: true,
                  },
                },
                hexValue: true,
                translations: true,
                variantGroup: {
                  select: {
                    type: true,
                    translations: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.ProductVariantCombinationFindManyArgs;

export const GetProductAdminTableQuery = {
  assets: assetSelect,
  brand: {
    select: {
      id: true,
      translations: {
        select: {
          locale: true,
          name: true,
        },
      },
    },
  },
  prices: true,
  categories: {
    select: {
      category: {
        select: {
          translations: true,
        },
      },
    },
  },
  translations: true,
  tags: {
    select: {
      productTag: {
        select: {
          translations: true,
        },
      },
    },
  },
  taxonomyCategory: {
    select: {
      originalName: true,
    },
  },
  variantCombinations: variantCombinationsQuery,
} as const satisfies Prisma.ProductInclude;

export type GetProductAdminTableQueryType = Prisma.ProductGetPayload<{
  include: typeof GetProductAdminTableQuery;
}>;

export const ProductAdminTableWhereInputFunc = (
  search: string,
  locale: Locale
): Prisma.ProductWhereInput => {
  const cleanedSearch = search.trim();
  if (!cleanedSearch) {
    return {};
  }
  return {
    ...(cleanedSearch && {
      OR: [
        {
          translations: {
            some: {
              locale: locale,
              OR: [
                { name: { contains: cleanedSearch, mode: "insensitive" } },
                { slug: { contains: cleanedSearch, mode: "insensitive" } },
                {
                  description: {
                    contains: cleanedSearch,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        },
        { sku: { contains: cleanedSearch, mode: "insensitive" } },
        { barcode: { contains: cleanedSearch, mode: "insensitive" } },
        {
          brand: {
            translations: {
              some: {
                locale: locale,
                name: { contains: cleanedSearch, mode: "insensitive" },
              },
            },
          },
        },

        {
          categories: {
            some: {
              category: {
                translations: {
                  some: {
                    locale: locale,
                    name: { contains: cleanedSearch, mode: "insensitive" },
                  },
                },
              },
            },
          },
        },

        {
          variantCombinations: {
            some: {
              OR: [
                { sku: { contains: cleanedSearch, mode: "insensitive" } },
                { barcode: { contains: cleanedSearch, mode: "insensitive" } },
              ],
            },
          },
        },

        {
          variantGroups: {
            some: {
              options: {
                some: {
                  variantOption: {
                    translations: {
                      some: {
                        locale: locale,
                        name: {
                          contains: cleanedSearch,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ],
    }),
  };
};
