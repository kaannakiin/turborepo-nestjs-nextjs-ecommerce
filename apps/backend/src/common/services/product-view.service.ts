import { Injectable } from '@nestjs/common';
import { Currency, Locale, Prisma } from '@repo/database';
import { isAnyReservedKey } from '@repo/shared';
import {
  FiltersResponse,
  PageFilterBrandQuery,
  PageFilterBrandType,
  PageFilterCategoryQuery,
  PageFilterCategoryType,
  PageFilterTagQuery,
  PageFilterTagType,
  PageFilterVariantGroupQuery,
  PageFilterVariantGroupType,
  ParsedFilters,
  ProductViewInput,
  ProductViewResult,
  TreeNode,
  uiProductInclude,
  ProductPageSortOption,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

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

  async getProductDetails(items: ProductViewResult['items'], locale: Locale) {
    if (items.length === 0) return [];

    const uniqueProductIds = [...new Set(items.map((i) => i.productId))];

    const products = await this.prismaService.product.findMany({
      where: {
        id: { in: uniqueProductIds },
        active: true,
        translations: { some: { locale } },
      },
      include: uiProductInclude({
        variantWhere: {
          id: { in: items.map((i) => i.variantId) },
          stock: { gt: 0 },
          active: true,
        },
      }),
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const seenIds = new Set<string>();

    return items
      .map((item) => {
        if (seenIds.has(item.productId)) return null;
        seenIds.add(item.productId);
        return productMap.get(item.productId);
      })
      .filter((p): p is NonNullable<typeof p> => p !== null && p !== undefined);
  }

  async getAvailableFilters(
    baseWhere: Prisma.ProductListingViewWhereInput,
    currentFilters: ParsedFilters,
    currency: Currency,
    locale: Locale,
    options: {
      includeBrands?: boolean;
      includeTags?: boolean;
      includeCategories?: boolean;
      includeVariants?: boolean;
    } = {
      includeBrands: true,
      includeTags: true,
      includeCategories: false,
      includeVariants: true,
    },
  ): Promise<FiltersResponse> {
    const [brands, tags, categories, variantGroups] = await Promise.all([
      options.includeBrands
        ? this.getAvailableBrands(baseWhere, currentFilters, currency, locale)
        : [],
      options.includeTags
        ? this.getAvailableTags(baseWhere, currentFilters, currency, locale)
        : [],
      options.includeCategories
        ? this.getAvailableCategories(
            baseWhere,
            currentFilters,
            currency,
            locale,
          )
        : [],
      options.includeVariants
        ? this.getAvailableVariantGroups(
            baseWhere,
            currentFilters,
            currency,
            locale,
          )
        : [],
    ]);

    return { brands, tags, categories, variantGroups };
  }

  private async getAvailableBrands(
    baseWhere: Prisma.ProductListingViewWhereInput,
    currentFilters: ParsedFilters,
    currency: Currency,
    locale: Locale,
  ): Promise<PageFilterBrandType[]> {
    const where: Prisma.ProductListingViewWhereInput = {
      ...baseWhere,
      brandSlugs: undefined,
    };

    const productIds = await this.getProductIdsFromView(where);

    const brands = await this.prismaService.brand.findMany({
      where: {
        translations: { some: { locale } },
        products: {
          some: {
            id: { in: productIds },
            active: true,
            translations: { some: { locale } },
          },
        },
      },
      select: PageFilterBrandQuery,
    });

    return brands.filter((brand) =>
      brand.translations.some((t) => t.locale === locale),
    );
  }

  private async getAvailableTags(
    baseWhere: Prisma.ProductListingViewWhereInput,
    currentFilters: ParsedFilters,
    currency: Currency,
    locale: Locale,
  ): Promise<PageFilterTagType[]> {
    const where: Prisma.ProductListingViewWhereInput = {
      ...baseWhere,
      tagSlugs: undefined,
    };

    const productIds = await this.getProductIdsFromView(where);

    const tags = await this.prismaService.productTag.findMany({
      where: {
        translations: { some: { locale } },
        products: {
          some: {
            product: {
              id: { in: productIds },
              active: true,
              translations: { some: { locale } },
            },
          },
        },
      },
      select: PageFilterTagQuery,
    });

    return tags.filter((tag) =>
      tag.translations.some((t) => t.locale === locale),
    );
  }

  private async getAvailableCategories(
    baseWhere: Prisma.ProductListingViewWhereInput,
    currentFilters: ParsedFilters,
    currency: Currency,
    locale: Locale,
  ): Promise<PageFilterCategoryType[]> {
    const where: Prisma.ProductListingViewWhereInput = {
      ...baseWhere,
      categoryIds: undefined,
      categorySlugs: undefined,
    };

    const productIds = await this.getProductIdsFromView(where);

    const categories = await this.prismaService.category.findMany({
      where: {
        translations: { some: { locale } },
        products: {
          some: {
            product: {
              id: { in: productIds },
              active: true,
              translations: { some: { locale } },
            },
          },
        },
      },
      select: PageFilterCategoryQuery,
    });

    return categories.filter((cat) =>
      cat.translations.some((t) => t.locale === locale),
    );
  }

  private async getAvailableVariantGroups(
    baseWhere: Prisma.ProductListingViewWhereInput,
    currentFilters: ParsedFilters,
    currency: Currency,
    locale: Locale,
  ): Promise<PageFilterVariantGroupType[]> {
    const allVariantGroupSlugs = Object.keys(currentFilters.variantFilters);

    if (allVariantGroupSlugs.length === 0) {
      return this.getAllVariantGroupsWithOptions(baseWhere, locale);
    }

    const groupOptionsMap = new Map<string, Set<string>>();

    await Promise.all(
      allVariantGroupSlugs.map(async (groupSlug) => {
        const filtersWithoutCurrentGroup = { ...currentFilters.variantFilters };
        delete filtersWithoutCurrentGroup[groupSlug];

        const variantSlugs = this.buildVariantFilterSlugs(
          filtersWithoutCurrentGroup,
        );

        const where: Prisma.ProductListingViewWhereInput = {
          ...baseWhere,
          ...(variantSlugs.length > 0 && {
            variantGroupOptionSlugs: { hasSome: variantSlugs },
          }),
        };

        const variants = await this.prismaService.productListingView.findMany({
          where,
          select: { variantGroupOptionSlugs: true },
          distinct: ['variantGroupOptionSlugs'],
        });

        const optionSlugs = new Set<string>();
        variants.forEach((variant) => {
          variant.variantGroupOptionSlugs.forEach((slugPair) => {
            const [vgSlug, optSlug] = slugPair.split(':');
            if (vgSlug === groupSlug) {
              optionSlugs.add(optSlug);
            }
          });
        });

        if (optionSlugs.size > 0) {
          groupOptionsMap.set(groupSlug, optionSlugs);
        }
      }),
    );

    if (groupOptionsMap.size === 0) return [];

    const variantGroups = await this.prismaService.variantGroup.findMany({
      where: {
        translations: {
          some: {
            locale,
            slug: { in: Array.from(groupOptionsMap.keys()) },
          },
        },
      },
      select: PageFilterVariantGroupQuery,
    });

    return variantGroups
      .map((vg) => {
        const groupSlug = vg.translations.find(
          (t) => t.locale === locale,
        )?.slug;
        if (!groupSlug) return null;

        const availableOptionSlugs = groupOptionsMap.get(groupSlug);
        if (!availableOptionSlugs) return null;

        const filteredOptions = vg.options.filter((opt) =>
          opt.translations.some(
            (t) => t.locale === locale && availableOptionSlugs.has(t.slug),
          ),
        );

        if (filteredOptions.length === 0) return null;

        return { ...vg, options: filteredOptions };
      })
      .filter((vg): vg is PageFilterVariantGroupType => vg !== null);
  }

  private async getAllVariantGroupsWithOptions(
    where: Prisma.ProductListingViewWhereInput,
    locale: Locale,
  ): Promise<PageFilterVariantGroupType[]> {
    const availableVariants =
      await this.prismaService.productListingView.findMany({
        where,
        select: { variantGroupOptionSlugs: true },
        distinct: ['variantGroupOptionSlugs'],
      });

    const groupOptionMap = new Map<string, Set<string>>();
    availableVariants.forEach((variant) => {
      variant.variantGroupOptionSlugs.forEach((slugPair) => {
        const [groupSlug, optionSlug] = slugPair.split(':');
        if (!groupOptionMap.has(groupSlug)) {
          groupOptionMap.set(groupSlug, new Set());
        }
        groupOptionMap.get(groupSlug)!.add(optionSlug);
      });
    });

    if (groupOptionMap.size === 0) return [];

    const variantGroups = await this.prismaService.variantGroup.findMany({
      where: {
        translations: {
          some: {
            locale,
            slug: { in: Array.from(groupOptionMap.keys()) },
          },
        },
      },
      select: PageFilterVariantGroupQuery,
    });

    return variantGroups
      .map((vg) => {
        const groupSlug = vg.translations.find(
          (t) => t.locale === locale,
        )?.slug;
        if (!groupSlug) return null;

        const availableOptionSlugs = groupOptionMap.get(groupSlug);
        if (!availableOptionSlugs) return null;

        const filteredOptions = vg.options.filter((opt) =>
          opt.translations.some(
            (t) => t.locale === locale && availableOptionSlugs.has(t.slug),
          ),
        );

        if (filteredOptions.length === 0) return null;

        return { ...vg, options: filteredOptions };
      })
      .filter((vg): vg is PageFilterVariantGroupType => vg !== null);
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

  buildBaseWhere(
    currency: Currency,
    options: {
      categoryIds?: string[];
      brandIds?: string[];
      tagIds?: string[];
    },
  ): Prisma.ProductListingViewWhereInput {
    return {
      currency,
      priceRank: 1,
      ...(options.categoryIds?.length && {
        categoryIds: { hasSome: options.categoryIds },
      }),
      ...(options.brandIds?.length && { brandId: { in: options.brandIds } }),
      ...(options.tagIds?.length && { tagIds: { hasSome: options.tagIds } }),
    };
  }

  applyFiltersToWhere(
    baseWhere: Prisma.ProductListingViewWhereInput,
    filters: ParsedFilters,
  ): Prisma.ProductListingViewWhereInput {
    const variantSlugs = this.buildVariantFilterSlugs(filters.variantFilters);

    return {
      ...baseWhere,
      ...(filters.brandSlugs.length > 0 && {
        brandSlugs: { hasSome: filters.brandSlugs },
      }),
      ...(filters.tagSlugs.length > 0 && {
        tagSlugs: { hasSome: filters.tagSlugs },
      }),
      ...(filters.categorySlugs.length > 0 && {
        categorySlugs: { hasSome: filters.categorySlugs },
      }),
      ...(variantSlugs.length > 0 && {
        variantGroupOptionSlugs: { hasSome: variantSlugs },
      }),
      ...(filters.minPrice && { finalPrice: { gte: filters.minPrice } }),
      ...(filters.maxPrice && { finalPrice: { lte: filters.maxPrice } }),
    };
  }

  private buildVariantFilterSlugs(filters: Record<string, string[]>): string[] {
    return Object.entries(filters).flatMap(([groupSlug, options]) =>
      options.map((optSlug) => `${groupSlug}:${optSlug}`),
    );
  }

  private parseVariantFilters(
    filters?: Record<string, string | string[]>,
  ): string[] {
    if (!filters) return [];

    return Object.entries(filters)
      .filter(([key]) => !isAnyReservedKey(key))
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

  private async getProductIdsFromView(
    where: Prisma.ProductListingViewWhereInput,
  ): Promise<string[]> {
    const products = await this.prismaService.productListingView.findMany({
      where,
      select: { productId: true },
      distinct: ['productId'],
    });
    return products.map((p) => p.productId);
  }

  collectAllIds(node: TreeNode): string[] {
    const ids: string[] = [node.id];
    if (node.children?.length) {
      for (const child of node.children) {
        ids.push(...this.collectAllIds(child));
      }
    }
    return ids;
  }
}
