import { AssetType, Prisma } from "@repo/database";
import { Pagination } from "../../shared-schema";

export const variantQueryInclude = {
  translations: { where: { locale: "TR" } },
  product: {
    include: {
      translations: { where: { locale: "TR" } },
      assets: { take: 1, include: { asset: true } },
    },
  },
  assets: {
    take: 1,
    include: { asset: { select: { url: true, type: true } } },
  },
  options: {
    include: {
      productVariantOption: {
        include: {
          variantOption: {
            include: { translations: { where: { locale: "TR" } } },
          },
          productVariantGroup: {
            include: {
              variantGroup: {
                include: { translations: { where: { locale: "TR" } } },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ProductVariantCombinationInclude;

export const productQueryInclude = {
  translations: { where: { locale: "TR" } },
  assets: {
    orderBy: { order: "asc" },
    take: 1,
    include: { asset: { select: { url: true, type: true } } },
  },

  variantCombinations: {
    include: variantQueryInclude,
  },
} satisfies Prisma.ProductInclude;

export type ProductWithPayload = Prisma.ProductGetPayload<{
  include: typeof productQueryInclude;
}>;

export type VariantWithPayload = Prisma.ProductVariantCombinationGetPayload<{
  include: typeof variantQueryInclude;
}>;

export interface ProductSelectResult {
  id: string;
  name: string;
  isVariant: boolean;
  stock: number;
  sku: string | null;
  image?: { url: string; type: AssetType };
  variantCombinations: Array<{
    variantId: string;
    variantGroupId: string;
    variantGroupName: string;
    variantOptionId: string;
    variantOptionName: string;
    variantOptionValue: string;
  }>;
  variants?: ProductSelectResult[];
}

export type SearchableProductModalResponseType = {
  success: boolean;
  pagination?: Pagination;
  selectedData: ProductSelectResult[];
  data: ProductSelectResult[];
};

export const ThemeProductCarouselProductPayload = {
  assets: {
    take: 2,
    orderBy: { order: "asc" },
    select: {
      asset: {
        select: {
          url: true,
          type: true,
        },
      },
    },
  },
  translations: true,
  prices: true,
} as const satisfies Prisma.ProductInclude;

export const ThemeProductCarouselVariantPayload = {
  assets: {
    take: 2,
    orderBy: { order: "asc" },
    select: {
      asset: {
        select: {
          url: true,
          type: true,
        },
      },
    },
  },
  prices: true,
  translations: true,
  product: {
    select: {
      assets: {
        take: 2,
        orderBy: { order: "asc" },
        select: {
          asset: {
            select: {
              url: true,
              type: true,
            },
          },
        },
      },
      translations: true,
    },
  },
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
              asset: {
                select: {
                  url: true,
                  type: true,
                },
              },
              translations: true,
              hexValue: true,
              variantGroup: {
                select: {
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
} as const satisfies Prisma.ProductVariantCombinationInclude;

export type ProductCarouselItemDataType = {
  success: boolean;
  products: Array<
    Prisma.ProductGetPayload<{
      include: typeof ThemeProductCarouselProductPayload;
    }>
  >;
  variants: Array<
    Prisma.ProductVariantCombinationGetPayload<{
      include: typeof ThemeProductCarouselVariantPayload;
    }>
  >;
};
