import { BadRequestException, Injectable } from '@nestjs/common';
import { Locale } from '@repo/database';
import { filterReservedKeys } from '@repo/shared';
import {
  CategoryPageFilters,
  CategoryProductsResponse,
  TreeNode,
  RawCategoryRow,
  ParsedFilters,
  FiltersResponse,
  ProductPageSortOption,
} from '@repo/types';
import { CurrencyLocaleService } from 'src/common/services/currency-locale.service';
import { LocaleService } from 'src/common/services/locale/locale.service';
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

  async getCategoryProducts(
    slug: string,
    filters: CategoryPageFilters,
  ): Promise<CategoryProductsResponse> {
    const locale = this.localeService.getLocale();
    const currency =
      await this.currencyLocaleService.getCurrencyForLocale(locale);

    const { categoryTree, allCategoryIds } = await this.getCategoryMetadata(
      slug,
      locale,
    );
    const parsedFilters = this.parseFilters(filters);

    const productResult = await this.productViewService.getProducts(
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
    );

    const products = await this.productViewService.getProductDetails(
      productResult.items,
      locale,
    );

    return {
      treeNode: categoryTree,
      products,
      pagination: productResult.pagination,
    };
  }

  async getCategoryFilters(
    slug: string,
    filters: Omit<CategoryPageFilters, 'sort' | 'page' | 'limit'>,
  ): Promise<FiltersResponse> {
    const locale = this.localeService.getLocale();
    const currency =
      await this.currencyLocaleService.getCurrencyForLocale(locale);

    const { allCategoryIds } = await this.getCategoryMetadata(slug, locale);

    const parsedFilters = this.parseFilters({
      ...filters,
      sort: ProductPageSortOption.NEWEST,
      page: 1,
      limit: 1,
    });

    const baseWhere = this.productViewService.buildBaseWhere(currency, {
      categoryIds: allCategoryIds,
    });

    const where = this.productViewService.applyFiltersToWhere(
      baseWhere,
      parsedFilters,
    );

    return this.productViewService.getAvailableFilters(
      where,
      parsedFilters,
      currency,
      locale,
      {
        includeBrands: true,
        includeTags: true,
        includeCategories: false,
        includeVariants: true,
      },
    );
  }

  private async getCategoryMetadata(slug: string, locale: Locale) {
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

    return {
      categoryTree,
      allCategoryIds: this.productViewService.collectAllIds(categoryTree),
    };
  }

  parseFilters(filters: CategoryPageFilters): ParsedFilters {
    const getArray = (value: string | undefined): string[] => {
      if (!value) return [];
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    };

    const cleanVariantFilters = filterReservedKeys(filters.variantFilters);

    const variantFilters: Record<string, string[]> = {};
    Object.entries(cleanVariantFilters).forEach(([key, value]) => {
      const options = Array.isArray(value)
        ? value
        : value
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);

      if (options.length > 0) {
        variantFilters[key] = options;
      }
    });

    return {
      brandSlugs: getArray(filters.brands),
      tagSlugs: getArray(filters.tags),
      categorySlugs: getArray(filters.categories),
      variantFilters,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
      page: Math.max(1, filters.page),
      limit: Math.min(50, Math.max(1, filters.limit)),
    };
  }

  private async getCategoryTreeWithRawSql(
    categoryId: string,
    locale: Locale,
  ): Promise<TreeNode | null> {
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

    const nodeMap = new Map<string, TreeNode>();

    rows.forEach((row) => {
      nodeMap.set(row.id, {
        id: row.id,
        name: row.name || '',
        slug: row.slug || '',
        locale,
        description: row.description || undefined,
        metaTitle: row.metaTitle || undefined,
        metaDescription: row.metaDescription || undefined,
        imageUrl: row.imageUrl || undefined,
        imageType: row.imageType || null,
        children: [],
        parent: undefined,
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
          currentNode.parent = parentNode;
        }
      }
    });

    return rootNode;
  }
}
