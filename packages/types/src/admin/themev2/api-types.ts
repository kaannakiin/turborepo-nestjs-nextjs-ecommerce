import { AssetType, Prisma } from "@repo/database";
import { Pagination } from "../../shared-schema";
import * as z from "zod";

export const CarouselProductsDtoSchema = z.object({
  productIds: z.array(z.cuid2()),
  variantIds: z.array(z.cuid2()),
});

export type CarouselProductsDto = z.infer<typeof CarouselProductsDtoSchema>;

const variantQueryInclude = {
  assets: {
    where: { asset: { type: "IMAGE" } },
    take: 1,
    select: {
      asset: { select: { url: true, type: true } },
    },
  },
  translations: true,
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
              hexValue: true,
              variantGroup: {
                select: {
                  translations: true,
                  id: true,
                },
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
    include: {
      assets: {
        where: { asset: { type: "IMAGE" } },
        take: 1,
        select: {
          asset: { select: { url: true, type: true } },
        },
      },
      translations: true,
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
                  hexValue: true,
                  variantGroup: {
                    select: {
                      translations: true,
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
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
