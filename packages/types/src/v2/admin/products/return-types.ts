import { Prisma } from "@repo/database";

export const adminProductFindAllProductQuery = {
  assets: {
    where: {
      asset: { type: "IMAGE" },
    },
    orderBy: {
      order: "asc",
    },
    take: 1,
    select: {
      asset: {
        select: {
          url: true,
        },
      },
    },
  },
  translations: true,
  prices: true,
  variantCombinations: {
    include: {
      assets: {
        where: {
          asset: { type: "IMAGE" },
        },
        orderBy: {
          order: "asc",
        },
        take: 1,
        select: {
          asset: {
            select: {
              url: true,
            },
          },
        },
      },
      prices: true,
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
        select: {
          productVariantOption: {
            select: {
              variantOption: {
                select: {
                  id: true,
                  translations: true,
                  asset: {
                    select: {
                      type: true,
                      url: true,
                    },
                  },
                  hexValue: true,
                  variantGroup: {
                    select: {
                      translations: true,
                      type: true,
                      id: true,
                    },
                  },
                },
              },
              productVariantGroup: { select: { renderVisibleType: true } },
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.ProductInclude;
