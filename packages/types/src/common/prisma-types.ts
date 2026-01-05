import {
  AssetType,
  Prisma,
  UserRole,
  VariantGroupRenderType,
  VariantGroupType,
} from "@repo/database/client";

export interface Pagination {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export type ProductCart = {
  id: string;
  isVariant: boolean;
  name: string;
  sku: string;
  barcode: string;
  images: { url: string; type: AssetType }[];
  price: number;
  discountPrice?: number;
  url: string;
  variantOptions?: Array<{
    optionId: string;
    optionName: string;
    optionAsset?: { url: string; type: AssetType };
    optionHexValue?: string;
    optionGroupId: string;
    optionGroupName: string;
    optionGroupType: VariantGroupType;
    optionGroupRenderType: VariantGroupRenderType;
  }>;
};

export const variantQueryIncludeV2 = {
  assets: {
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
          productVariantGroup: {
            select: {
              renderVisibleType: true,
            },
          },
          variantOption: {
            include: {
              asset: true,
              translations: true,
              variantGroup: {
                include: {
                  translations: true,
                },
              },
            },
          },
        },
      },
    },
  },
  product: {
    select: {
      assets: {
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
} satisfies Prisma.ProductVariantCombinationInclude;

export const productQueryIncludeV2 = {
  assets: {
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
} as const satisfies Prisma.ProductInclude;

export type VariantMapInputType = Prisma.ProductVariantCombinationGetPayload<{
  include: typeof variantQueryIncludeV2;
}>;

export type ProductMapInputType = Prisma.ProductGetPayload<{
  include: typeof productQueryIncludeV2;
}>;
export type TokenPayload = {
  id: string;
  name: string;
  jti: string;
  role: UserRole;
  email?: string;
  phone?: string;
  image?: string;
};
