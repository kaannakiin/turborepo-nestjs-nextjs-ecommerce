import { z } from "zod";
import { Prisma } from "@repo/database";
import {
  commonProductAssetsQuery,
  variantOptionsQuery,
  variantsOptionsOrderByQuery,
} from "../../../common/common-queries";
import { ProductBulkAction } from "../../../shared/shared-enum";

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

export const BulkActionSchema = z.object({
  action: z.enum(ProductBulkAction),
  productIds: z.array(z.cuid2()),
  otherDetails: z
    .object({
      reason: z.string().min(2).max(256).nullish(),
      categoryId: z.cuid2().nullish(),
      brandId: z.cuid2().nullish(),
      tagIds: z.array(z.cuid2()).nullish(),
      taxonomyId: z.cuid2().nullish(),
      supplierId: z.cuid2().nullish(),
      percent: z.number().nullish(),
      amount: z.number().nullish(),
      stock: z.number().nullish(),
    })
    .nullish(),
});

export type BulkActionZodType = z.infer<typeof BulkActionSchema>;
export interface BulkActionResult {
  success: boolean;
  affectedCount: number;
}
