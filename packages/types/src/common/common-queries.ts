import { Prisma } from "@repo/database";

export const commonProductAssetsQuery = {
  orderBy: {
    order: "asc",
  },
  select: {
    asset: {
      select: {
        url: true,
        type: true,
      },
    },
  },
} as const satisfies Prisma.Product$assetsArgs;

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
          asset: {
            select: {
              url: true,
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
} as const satisfies Prisma.ProductVariantCombinationOptionSelect;
