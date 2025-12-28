import { Prisma } from "@repo/database";
import {
  commonProductAssetsQuery,
  variantOptionsQuery,
  variantsOptionsOrderByQuery,
} from "../../../common/common-queries";

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
