import { Prisma } from "@repo/database";
import { Pagination } from "../../../shared-schema";

export const adminCategoryTableQuery = {
  image: {
    select: {
      type: true,
      url: true,
    },
  },
  parentCategory: {
    select: {
      translations: true,
    },
  },
  parentCategoryId: true,
  translations: true,
  _count: {
    select: {
      childCategories: true,
      products: true,
    },
  },
  createdAt: true,
  id: true,
} as const satisfies Prisma.CategorySelect;

export type AdminCategoryTableType = Prisma.CategoryGetPayload<{
  select: typeof adminCategoryTableQuery;
}>;
export type AdminCategoryTableReturnType = {
  success: boolean;
  categories?: AdminCategoryTableType[];
  pagination?: Pagination;
};
