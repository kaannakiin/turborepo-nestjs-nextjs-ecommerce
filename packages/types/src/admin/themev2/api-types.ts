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
          variantOption: { include: { translations: { where: { locale: "TR" } } } },
          productVariantGroup: {
            include: { variantGroup: { include: { translations: { where: { locale: "TR" } } } } },
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
