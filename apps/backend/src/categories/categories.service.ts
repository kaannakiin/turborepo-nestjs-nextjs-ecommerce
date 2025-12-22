import { BadRequestException, Injectable } from '@nestjs/common';
import { Locale, Prisma } from '@repo/database';
import { RESERVED_KEYS } from '@repo/shared';
import {
  CategoryPageBrandType,
  CategoryPageFilters,
  CategoryPageProductTagQuery,
  CategoryPageProductTagType,
  CategoryPageReturnType,
  CategoryPageVariantGroupQuery,
  CategoryPageVariantGroupType,
  CategoryTreeData,
  CateogoryPageBrandQuery,
  commonProductWhereClause,
  RawCategoryRow,
  uiProductInclude,
} from '@repo/types';
import { CurrencyLocaleService } from 'src/common/services/currency-locale.service';
import { LocaleService } from 'src/common/services/locale.service';
import { ProductViewService } from 'src/common/services/product-view.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly localeService: LocaleService,
    private readonly currencyLocaleService: CurrencyLocaleService,
    private readonly productViewService: ProductViewService,
  ) {}

  async getCategoryPageBySlug(
    slug: string,
    filters: CategoryPageFilters,
  ): Promise<CategoryPageReturnType> {
    const locale = this.localeService.getLocale();
    const currency = this.currencyLocaleService.getCurrencyLocaleMap(locale);

    const categoryTranslation =
      await this.prismaService.categoryTranslation.findUnique({
        where: { locale_slug: { locale, slug } },
        select: { categoryId: true },
      });

    if (!categoryTranslation) {
      throw new BadRequestException('Aradığınız kategori bulunamadı.');
    }

    const categoryTree = await this.getCategoryTreeWithRawSql(
      categoryTranslation.categoryId,
      locale,
    );

    if (!categoryTree) {
      throw new BadRequestException('Kategori ağacı oluşturulamadı.');
    }

    const allCategoryIds = this.collectAllCategoryIds(categoryTree);
    const commonProductWhere = commonProductWhereClause(currency, locale);

    const baseProductWhere: Prisma.ProductWhereInput = {
      ...commonProductWhere,
      categories: {
        some: { categoryId: { in: allCategoryIds } },
      },
    };

    const parsedFilters = this.parseFilters(filters);

    const [sidebarData, productResult] = await Promise.all([
      Promise.all([
        this.prismaService.brand.findMany({
          where: { products: { some: baseProductWhere } },
          select: CateogoryPageBrandQuery,
        }),

        this.prismaService.productTag.findMany({
          where: { products: { some: { product: baseProductWhere } } },
          select: CategoryPageProductTagQuery,
        }),
        this.prismaService.variantGroup.findMany({
          where: {
            productVariantGroups: { some: { product: baseProductWhere } },
          },
          select: CategoryPageVariantGroupQuery,
        }),
      ]),

      this.productViewService.getProducts(
        {
          categoryIds: allCategoryIds,
          brandSlugs: parsedFilters.brandSlugs,
          tagSlugs: parsedFilters.tagSlugs,
          variantFilters: parsedFilters.variantFilters,
          minPrice: parsedFilters.minPrice,
          maxPrice: parsedFilters.maxPrice,
          sort: parsedFilters.sort,
          page: parsedFilters.page,
          limit: parsedFilters.limit,
        },
        currency,
      ),
    ]);

    const [brands, tags, variantGroups] = sidebarData;
    const products = await this.getProductDetails(productResult.items, locale);

    return {
      category: categoryTree,
      filters: {
        brands: this.mapBrands(brands, locale),
        tags: this.mapTags(tags, locale),
        variantGroups: this.mapVariantGroups(variantGroups, locale),
      },
      products,
      pagination: productResult.pagination,
    };
  }

  private parseFilters(filters: CategoryPageFilters) {
    const getArray = (value: string | undefined): string[] => {
      if (!value) return [];
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    };

    const variantFilters: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(filters.variantFilters)) {
      if (RESERVED_KEYS.includes(key)) continue;
      const options = Array.isArray(value)
        ? value
        : value
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);
      if (options.length > 0) {
        variantFilters[key] = options;
      }
    }

    return {
      brandSlugs: getArray(filters.brands),
      tagSlugs: getArray(filters.tags),
      variantFilters,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
      page: Math.max(1, filters.page),
      limit: Math.min(50, Math.max(1, filters.limit)),
    };
  }

  private async getProductDetails(
    items: {
      productId: string;
      variantId: string;
      finalPrice: number;
      originalPrice: number;
      discountPercentage: number;
      stock: number;
    }[],
    locale: Locale,
  ) {
    if (items.length === 0) return [];

    const products = await this.prismaService.product.findMany({
      where: {
        id: { in: items.map((i) => i.productId) },
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

    return products;
  }

  private mapBrands(
    brands: CategoryPageBrandType[],
    locale: Locale,
  ): CategoryPageBrandType[] {
    return brands.filter((brand) =>
      brand.translations.some((t) => t.locale === locale),
    );
  }

  private mapTags(
    tags: CategoryPageProductTagType[],
    locale: Locale,
  ): CategoryPageProductTagType[] {
    return tags.filter((tag) =>
      tag.translations.some((t) => t.locale === locale),
    );
  }

  private mapVariantGroups(
    variantGroups: CategoryPageVariantGroupType[],
    locale: Locale,
  ): CategoryPageVariantGroupType[] {
    return variantGroups
      .filter((vg) => vg.translations.some((t) => t.locale === locale))
      .map((vg) => ({
        ...vg,
        options: vg.options.filter((opt) =>
          opt.translations.some((t) => t.locale === locale),
        ),
      }))
      .filter((vg) => vg.options.length > 0);
  }

  private async getCategoryTreeWithRawSql(
    categoryId: string,
    locale: Locale,
  ): Promise<CategoryTreeData | null> {
    const rows = await this.prismaService.$queryRaw<RawCategoryRow[]>`
      WITH RECURSIVE 
      ancestors AS (
        SELECT id, "parentCategoryId", "imageId", 0 as depth 
        FROM "Category" 
        WHERE id = ${categoryId}
        
        UNION ALL
        
        SELECT c.id, c."parentCategoryId", c."imageId", a.depth - 1
        FROM "Category" c
        INNER JOIN ancestors a ON c.id = a."parentCategoryId"
      ),
      
      descendants AS (
        SELECT id, "parentCategoryId", "imageId", 0 as depth 
        FROM "Category" 
        WHERE id = ${categoryId}
        
        UNION ALL
        
        SELECT c.id, c."parentCategoryId", c."imageId", d.depth + 1
        FROM "Category" c
        INNER JOIN descendants d ON c."parentCategoryId" = d.id
      ),

      all_nodes AS (
        SELECT * FROM ancestors
        UNION
        SELECT * FROM descendants
      )

      SELECT 
        an.id,
        an."parentCategoryId" as "parentId",
        an.depth,
        ct.name,
        ct.slug,
        ct.description,
        ct."metaTitle",
        ct."metaDescription",
        a.url as "imageUrl",
        a.type as "imageType"
      FROM all_nodes an
      LEFT JOIN "CategoryTranslation" ct 
        ON an.id = ct."categoryId" AND ct.locale = ${locale}::"Locale"
      LEFT JOIN "Asset" a 
        ON an."imageId" = a.id
      ORDER BY an.depth ASC;
    `;

    if (!rows || rows.length === 0) return null;

    const rootRow = rows.find((r) => r.depth === 0);
    if (!rootRow) return null;

    const nodeMap = new Map<string, CategoryTreeData>();

    rows.forEach((row) => {
      nodeMap.set(row.id, {
        categoryId: row.id,
        categoryName: row.name || '',
        categorySlug: row.slug || '',
        locale,
        description: row.description || undefined,
        metaTitle: row.metaTitle || undefined,
        metaDescription: row.metaDescription || undefined,
        imageUrl: row.imageUrl || undefined,
        imageType: row.imageType || 'IMAGE',
        children: [],
        parentCategory: undefined,
      });
    });

    const rootNode = nodeMap.get(rootRow.id)!;

    rows.forEach((row) => {
      const currentNode = nodeMap.get(row.id)!;

      if (row.depth > 0 && row.parentId) {
        const parentNode = nodeMap.get(row.parentId);
        if (parentNode) {
          parentNode.children = parentNode.children || [];
          parentNode.children.push(currentNode);
        }
      }

      if (row.parentId) {
        const parentNode = nodeMap.get(row.parentId);
        if (parentNode && row.depth <= 0) {
          currentNode.parentCategory = parentNode;
        }
      }
    });

    return rootNode;
  }

  private collectAllCategoryIds(node: CategoryTreeData): string[] {
    const ids: string[] = [node.categoryId];

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        ids.push(...this.collectAllCategoryIds(child));
      }
    }

    return ids;
  }
}
