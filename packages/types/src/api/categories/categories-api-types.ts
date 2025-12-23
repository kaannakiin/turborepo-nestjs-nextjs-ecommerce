import { AssetType, Currency, Locale, Prisma } from "@repo/database";
import { ProductPageSortOption } from "@repo/shared";
import { UiProductType as InfinityScrollPageProductType } from "../../common/common-queries";
import { Pagination } from "../../shared-schema";
export interface BaseNode {
  id: string;
  name: string;
  slug: string;
  locale: Locale;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  imageType?: AssetType;
}

export interface TreeNode extends BaseNode {
  children?: TreeNode[];
  parent?: TreeNode;
}

export interface ProductTagNode extends BaseNode {
  color?: string;
  icon?: string;
  priority?: number;
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

export const InfinityScrollPageFilterBrandQuery = {
  translations: true,
  id: true,
  image: { select: { url: true, type: true } },
} as const satisfies Prisma.BrandSelect;

export type InfinityScrollPageFilterBrandType = Prisma.BrandGetPayload<{
  select: typeof InfinityScrollPageFilterBrandQuery;
}>;

export const InfinityScrollPageFilterProducTagQuery = {
  id: true,
  translations: true,
  color: true,
  icon: true,
  priority: true,
} as const satisfies Prisma.ProductTagSelect;

export type InfinityScrollPageFilterProducTagType =
  Prisma.ProductTagGetPayload<{
    select: typeof InfinityScrollPageFilterProducTagQuery;
  }>;

export const InfinityScrollPageFilterVariantGroupQuery = {
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

export type InfinityScrollPageFilterVariantGroupType =
  Prisma.VariantGroupGetPayload<{
    select: typeof InfinityScrollPageFilterVariantGroupQuery;
  }>;

export const InfinityScrollPageFilterCategoryQuery = {
  translations: true,
  image: { select: { url: true, type: true } },
  id: true,
} as const satisfies Prisma.CategorySelect;

export type InfinityScrollPageFilterCategoryType = Prisma.CategoryGetPayload<{
  select: typeof InfinityScrollPageFilterCategoryQuery;
}>;

export interface ProductViewInput {
  sort: ProductPageSortOption;
  page: number;
  limit: number;
  minPrice?: number;
  maxPrice?: number;

  categoryIds?: string[];
  brandIds?: string[];
  tagIds?: string[];

  categorySlugs?: string[];
  brandSlugs?: string[];
  tagSlugs?: string[];
  variantFilters?: Record<string, string | string[]>;
}

export interface ProductViewResult {
  items: {
    productId: string;
    variantId: string;
    finalPrice: number;
    originalPrice: number;
    discountPercentage: number;
    stock: number;
  }[];
  pagination: Pagination;
}

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

export type InfinityScrollPageReturnType = {
  treeNode: TreeNode;
  products: InfinityScrollPageProductType[];
  pagination: Pagination;
  filters: {
    brands: InfinityScrollPageFilterBrandType[];
    tags: InfinityScrollPageFilterProducTagType[];
    variantGroups: InfinityScrollPageFilterVariantGroupType[];
    categories: InfinityScrollPageFilterCategoryType[];
  };
};
