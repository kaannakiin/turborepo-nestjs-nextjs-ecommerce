import { AssetType, Locale, Prisma } from "@repo/database";
import { ProductPageSortOption } from "@repo/shared";
import { UiProductType } from "../../common/common-queries";
import { Pagination } from "../../shared-schema";

export interface BaseNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
}

export interface TreeNode extends BaseNode {
  locale: Locale;
  imageType?: AssetType | null;
  children?: TreeNode[];
  parent?: TreeNode;
}

export interface BrandNode extends BaseNode {
  children: BrandNode[];
  parent?: BrandNode;
}

export interface TagNode extends BaseNode {
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

export interface PageFilters {
  brands?: string;
  tags?: string;
  categories?: string;
  minPrice?: number;
  maxPrice?: number;
  sort: ProductPageSortOption;
  page: number;
  limit: number;
  variantFilters: Record<string, string | string[]>;
}

export type CategoryPageFilters = PageFilters;
export type BrandPageFilters = Omit<PageFilters, "brands">;
export type TagPageFilters = Omit<PageFilters, "tags">;

export interface ParsedFilters {
  brandSlugs: string[];
  tagSlugs: string[];
  categorySlugs: string[];
  variantFilters: Record<string, string[]>;
  minPrice?: number;
  maxPrice?: number;
  sort: ProductPageSortOption;
  page: number;
  limit: number;
}

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

export const PageFilterBrandQuery = {
  id: true,
  translations: true,
  image: { select: { url: true, type: true } },
} as const satisfies Prisma.BrandSelect;

export type PageFilterBrandType = Prisma.BrandGetPayload<{
  select: typeof PageFilterBrandQuery;
}>;

export const PageFilterTagQuery = {
  id: true,
  translations: true,
  color: true,
  icon: true,
  priority: true,
} as const satisfies Prisma.ProductTagSelect;

export type PageFilterTagType = Prisma.ProductTagGetPayload<{
  select: typeof PageFilterTagQuery;
}>;

export const PageFilterCategoryQuery = {
  id: true,
  translations: true,
  image: { select: { url: true, type: true } },
} as const satisfies Prisma.CategorySelect;

export type PageFilterCategoryType = Prisma.CategoryGetPayload<{
  select: typeof PageFilterCategoryQuery;
}>;

export const PageFilterVariantGroupQuery = {
  id: true,
  type: true,
  translations: true,
  productVariantGroups: {
    select: { renderVisibleType: true },
  },
  options: {
    select: {
      id: true,
      hexValue: true,
      translations: true,
      asset: { select: { url: true, type: true } },
    },
  },
} as const satisfies Prisma.VariantGroupSelect;

export type PageFilterVariantGroupType = Prisma.VariantGroupGetPayload<{
  select: typeof PageFilterVariantGroupQuery;
}>;

export interface FiltersResponse {
  brands: PageFilterBrandType[];
  tags: PageFilterTagType[];
  categories: PageFilterCategoryType[];
  variantGroups: PageFilterVariantGroupType[];
}

export interface CategoryProductsResponse {
  treeNode: TreeNode;
  products: UiProductType[];
  pagination: Pagination;
}

export interface BrandProductsResponse {
  brand: BrandNode;
  products: UiProductType[];
  pagination: Pagination;
}

export interface TagProductsResponse {
  tag: TagNode;
  products: UiProductType[];
  pagination: Pagination;
}

export interface BaseProductsResponse {
  products: UiProductType[];
  pagination: Pagination;
}

export type PageMetadata =
  | { type: "category"; node: TreeNode }
  | { type: "brand"; node: BrandNode }
  | { type: "tag"; node: TagNode };

export interface ProductsPageResponse extends BaseProductsResponse {
  metadata: PageMetadata;
}

export interface CategoryProductsResponse extends BaseProductsResponse {
  treeNode: TreeNode;
}

export interface BrandProductsResponse extends BaseProductsResponse {
  brand: BrandNode;
}

export interface TagProductsResponse extends BaseProductsResponse {
  tag: TagNode;
}

export const isCategoryResponse = (
  response: ProductsPageResponse
): response is ProductsPageResponse & {
  metadata: { type: "category"; node: TreeNode };
} => {
  return response.metadata.type === "category";
};

export const isBrandResponse = (
  response: ProductsPageResponse
): response is ProductsPageResponse & {
  metadata: { type: "brand"; node: BrandNode };
} => {
  return response.metadata.type === "brand";
};

export const isTagResponse = (
  response: ProductsPageResponse
): response is ProductsPageResponse & {
  metadata: { type: "tag"; node: TagNode };
} => {
  return response.metadata.type === "tag";
};
