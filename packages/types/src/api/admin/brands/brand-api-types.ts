import { Prisma } from "@repo/database";
import { Pagination } from "../../../shared-schema";

export const adminBrandTableQuery = {
  translations: true,
  id: true,
  parentBrandId: true,
  image: { select: { url: true, type: true } },
  parentBrand: {
    select: {
      translations: true,
    },
  },
  _count: {
    select: {
      childBrands: true,
      products: true,
    },
  },
  createdAt: true,
} as const satisfies Prisma.BrandSelect;

export type AdminBrandTableBrandData = Prisma.BrandGetPayload<{
  select: typeof adminBrandTableQuery;
}>;
export type BrandTableApiResponse = {
  success: boolean;
  brands?: AdminBrandTableBrandData[];
  pagination?: Pagination;
};

export type BrandIdAndName = {
  id: string;
  name: string;
};
