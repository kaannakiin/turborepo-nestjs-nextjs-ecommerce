import { Injectable } from '@nestjs/common';
import { Currency, Prisma } from '@repo/database';
import { ProductPageSortOption, RESERVED_KEYS } from '@repo/shared';
import { Pagination } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

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

@Injectable()
export class ProductViewService {
  constructor(private readonly prismaService: PrismaService) {}

  async getProducts(
    input: ProductViewInput,
    currency: Currency,
  ): Promise<ProductViewResult> {
    const where = this.buildWhere(input, currency);
    const offset = (input.page - 1) * input.limit;

    const [items, total] = await Promise.all([
      this.prismaService.productListingView.findMany({
        where,
        orderBy: this.getOrderBy(input.sort),
        skip: offset,
        take: input.limit,
        select: {
          productId: true,
          variantId: true,
          finalPrice: true,
          originalPrice: true,
          discountPercentage: true,
          stock: true,
        },
      }),
      this.prismaService.productListingView.count({ where }),
    ]);

    return {
      items,
      pagination: {
        currentPage: input.page,
        perPage: input.limit,
        totalCount: total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  private buildWhere(
    input: ProductViewInput,
    currency: Currency,
  ): Prisma.ProductListingViewWhereInput {
    const variantGroupOptionSlugs = this.parseVariantFilters(
      input.variantFilters,
    );

    return {
      currency,
      priceRank: 1,

      ...(input.categoryIds?.length && {
        categoryIds: { hasSome: input.categoryIds },
      }),

      ...(input.brandIds?.length && {
        brandId: { in: input.brandIds },
      }),

      ...(input.tagIds?.length && {
        tagIds: { hasSome: input.tagIds },
      }),

      ...(input.categorySlugs?.length && {
        categorySlugs: { hasSome: input.categorySlugs },
      }),

      ...(input.brandSlugs?.length && {
        brandSlugs: { hasSome: input.brandSlugs },
      }),

      ...(input.tagSlugs?.length && {
        tagSlugs: { hasSome: input.tagSlugs },
      }),

      ...(variantGroupOptionSlugs.length > 0 && {
        variantGroupOptionSlugs: { hasSome: variantGroupOptionSlugs },
      }),

      ...(input.minPrice && { finalPrice: { gte: input.minPrice } }),
      ...(input.maxPrice && { finalPrice: { lte: input.maxPrice } }),
    };
  }
  private parseVariantFilters(
    filters?: Record<string, string | string[]>,
  ): string[] {
    if (!filters) return [];

    return Object.entries(filters)
      .filter(([key]) => !RESERVED_KEYS.includes(key))
      .flatMap(([groupSlug, value]) => {
        const options = Array.isArray(value)
          ? value
          : value
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean);
        return options.map((optSlug) => `${groupSlug}:${optSlug}`);
      });
  }

  private getOrderBy(
    sort: ProductPageSortOption,
  ): Prisma.ProductListingViewOrderByWithRelationInput {
    switch (sort) {
      case ProductPageSortOption.PRICE_ASC:
        return { finalPrice: 'asc' };
      case ProductPageSortOption.PRICE_DESC:
        return { finalPrice: 'desc' };
      case ProductPageSortOption.OLDEST:
        return { createdAt: 'asc' };
      case ProductPageSortOption.NEWEST:
      default:
        return { createdAt: 'desc' };
    }
  }
}
