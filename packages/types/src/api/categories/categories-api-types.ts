import { AssetType, Currency, Locale, Prisma } from "@repo/database";
import { ProductPageSortOption } from "@repo/shared";
import { Pagination } from "../../shared-schema";
import { UiProductType } from "../../common/common-queries";

export interface CategoryTreeData {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  locale: Locale;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  imageType?: AssetType;
  children?: CategoryTreeData[];
  parentCategory?: CategoryTreeData;
}

export interface RawCategoryRow {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  imageUrl: string | null;
  imageType: AssetType | null;
  depth: number;
}

export type ProductSortBy =
  | "price_asc"
  | "price_desc"
  | "discount_asc"
  | "discount_desc"
  | "newest"
  | "oldest";

export interface ProductListingParams {
  categoryIds: string[];
  locale: Locale;
  page?: number;
  limit?: number;
  sortBy?: ProductSortBy;
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  brandIds?: string[];
}

export interface ProductListingResponse<T> {
  products: T[];
  pagination: Pagination;
}

export const CateogoryPageBrandQuery = {
  translations: true,
  id: true,
  image: { select: { url: true, type: true } },
} as const satisfies Prisma.BrandSelect;

export type CategoryPageBrandType = Prisma.BrandGetPayload<{
  select: typeof CateogoryPageBrandQuery;
}>;

export const CategoryPageProductTagQuery = {
  id: true,
  translations: true,
  color: true,
  icon: true,
  priority: true,
} as const satisfies Prisma.ProductTagSelect;

export type CategoryPageProductTagType = Prisma.ProductTagGetPayload<{
  select: typeof CategoryPageProductTagQuery;
}>;

export const CategoryPageVariantGroupQuery = {
  translations: true,
  type: true,
  id: true,
  options: {
    select: {
      id: true,
      hexValue: true,
      translations: true,
      asset: {
        select: {
          url: true,
          type: true,
        },
      },
    },
  },
} as const satisfies Prisma.VariantGroupSelect;

export type CategoryPageVariantGroupType = Prisma.VariantGroupGetPayload<{
  select: typeof CategoryPageVariantGroupQuery;
}>;

export interface CategoryPageFilters {
  sort: ProductPageSortOption;
  page: number;
  limit: number;
  minPrice?: number;
  maxPrice?: number;
  tags?: string;
  brands?: string;
  variantFilters: Record<string, string | string[]>;
}

export type CategoryPageReturnType = {
  category: CategoryTreeData;
  products: UiProductType[];
  pagination: Pagination;
  filters: {
    brands: CategoryPageBrandType[];
    tags: CategoryPageProductTagType[];
    variantGroups: CategoryPageVariantGroupType[];
  };
};
