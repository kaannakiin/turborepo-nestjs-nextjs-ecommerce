import { Injectable } from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database';
import { getSortIndexFromQuery, ProductPageSortOption } from '@repo/shared';
import {
  CategoryHierarchyNode,
  CategoryPagePreparePageReturnData,
  GetCategoryProductsResponse,
  GetCategoryProductsZodType,
  ProductAndVariantWhereInput,
  ProductUnifiedViewData,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Belirtilen bir kategorinin tüm üst ebeveynlerini (breadcrumb) ve tüm alt kategorilerini (çocukları, torunları vb.)
   * tek ve performanslı bir veritabanı sorgusuyla getirir.
   * @param categoryId Bilgileri alınacak olan kategorinin ID'si
   * @param locale Dil seçeneği, varsayılan 'TR'
   */
  private async getAllCategoryParentAndChildren(
    categoryId: string,
    locale: $Enums.Locale = 'TR',
  ): Promise<{
    success: boolean;
    parentCategories?: Array<{
      id: string;
      name: string;
      slug: string;
      level: number;
    }>;
    childrenCategories?: Array<{
      id: string;
      name: string;
      slug: string;
      level: number;
    }>;
  }> {
    const query = Prisma.sql`
    WITH RECURSIVE
      "FullHierarchy" AS (
        SELECT id, "parentCategoryId", 0 AS level
        FROM "Category" WHERE "parentCategoryId" IS NULL
        UNION ALL
        SELECT c.id, c."parentCategoryId", fh.level + 1
        FROM "Category" c
        JOIN "FullHierarchy" fh ON c."parentCategoryId" = fh.id
      ),
      "Ancestors" AS (
        SELECT id, "parentCategoryId", level
        FROM "FullHierarchy" WHERE id = ${categoryId}
        UNION ALL
        SELECT fh.id, fh."parentCategoryId", fh.level
        FROM "FullHierarchy" fh
        JOIN "Ancestors" a ON fh.id = a."parentCategoryId"
      ),
      "Descendants" AS (
        SELECT id, "parentCategoryId", level
        FROM "FullHierarchy" WHERE id = ${categoryId}
        UNION ALL
        SELECT fh.id, fh."parentCategoryId", fh.level
        FROM "FullHierarchy" fh
        JOIN "Descendants" d ON fh."parentCategoryId" = d.id
      )
    SELECT a.id, a.level, ct.name, ct.slug, 'parent' as type
    FROM "Ancestors" a
    JOIN "CategoryTranslation" ct ON a.id = ct."categoryId"
    -- DEĞİŞİKLİK BURADA: Tip dönüşümü eklendi
    WHERE a.id != ${categoryId} AND ct.locale = ${locale}::"Locale"

    UNION ALL

    SELECT d.id, d.level, ct.name, ct.slug, 'child' as type
    FROM "Descendants" d
    JOIN "CategoryTranslation" ct ON d.id = ct."categoryId"
    -- DEĞİŞİKLİK BURADA: Tip dönüşümü eklendi
    WHERE d.id != ${categoryId} AND ct.locale = ${locale}::"Locale";
  `;

    try {
      const results =
        await this.prismaService.$queryRaw<CategoryHierarchyNode[]>(query);

      const parentCategories: CategoryHierarchyNode[] = [];
      const childrenCategories: CategoryHierarchyNode[] = [];

      for (const node of results) {
        if (node.type === 'parent') {
          parentCategories.push(node);
        } else {
          childrenCategories.push(node);
        }
      }

      parentCategories.sort((a, b) => a.level - b.level);

      return {
        success: true,
        parentCategories,
        childrenCategories,
      };
    } catch (error) {
      console.error(
        `Failed to fetch hierarchy for category ${categoryId}:`,
        error,
      );
      return { success: false };
    }
  }

  async getCategoryBySlug(
    slug: string,
    locale: $Enums.Locale = 'TR',
  ): Promise<CategoryPagePreparePageReturnData> {
    const category = await this.prismaService.categoryTranslation.findUnique({
      where: {
        locale_slug: {
          locale,
          slug,
        },
      },
      include: {
        category: {
          select: {
            image: {
              select: {
                url: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      return {
        success: false,
        message: 'Kategori bulunamadı.',
        brands: null,
        hiearchy: null,
        variantGroups: null,
        category: null,
      };
    }

    const hierarchy = await this.getAllCategoryParentAndChildren(
      category.categoryId,
      locale,
    );

    const hierarchyCategoryIds = [
      ...(hierarchy.success &&
      hierarchy.childrenCategories &&
      hierarchy.childrenCategories.length > 0
        ? hierarchy.childrenCategories.map((c) => c.id)
        : []),
      category.categoryId,
    ];

    const variantGroup = await this.prismaService.variantGroup.findMany({
      where: {
        productVariantGroups: {
          some: {
            product: {
              categories: {
                some: {
                  categoryId: { in: hierarchyCategoryIds },
                },
              },
              active: true,
              isVariant: true,
              variantCombinations: {
                some: {
                  active: true,
                  stock: {
                    gt: 0,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        translations: {
          select: {
            name: true,
            locale: true,
            slug: true,
          },
        },
        type: true,
        options: {
          where: {
            productVariantOptions: {
              some: {
                combinations: {
                  some: {
                    combination: {
                      active: true,
                      stock: {
                        gt: 0,
                      },
                      product: {
                        active: true,
                        isVariant: true,
                        categories: {
                          some: {
                            categoryId: { in: hierarchyCategoryIds },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            translations: true,
            hexValue: true,
            asset: {
              select: {
                url: true,
                type: true,
              },
            },
          },
        },
      },
    });

    const brands = await this.prismaService.brand.findMany({
      where: {
        products: {
          some: {
            AND: [
              {
                OR: [ProductAndVariantWhereInput],
              },
              {
                categories: {
                  some: {
                    categoryId: { in: hierarchyCategoryIds },
                  },
                },
              },
            ],
          },
        },
      },
      select: {
        translations: true,
        image: {
          select: {
            url: true,
            type: true,
          },
        },
      },
    });

    return {
      message: 'Kategori başarıyla yüklendi.',
      success: true,
      variantGroups: variantGroup,
      category,
      brands,
      hiearchy: hierarchy.success
        ? {
            childrenCategories: hierarchy.childrenCategories,
            parentCategories: hierarchy.parentCategories,
          }
        : null,
    };
  }

  async getCategoryProducts({
    query,
    categoryIds,
    page,
    sort,
  }: GetCategoryProductsZodType): Promise<GetCategoryProductsResponse> {
    const take = 12;
    const skip = (page - 1) * take;
    const sortType = getSortIndexFromQuery(sort);
    const currency: $Enums.Currency = 'TRY';
    const locale: $Enums.Locale = 'TR';

    if (!categoryIds || categoryIds.length === 0) {
      return {
        success: false,
        message: "En az bir kategori ID'si sağlanmalıdır.",
      };
    }

    const filterConditions: Prisma.Sql[] = [];

    for (const [key, value] of Object.entries(query)) {
      if (!value) continue;

      let filterValues: string[];

      if (typeof value === 'string') {
        filterValues = value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (Array.isArray(value)) {
        filterValues = value;
      } else {
        continue;
      }

      if (filterValues.length === 0) continue;

      if (key === 'brand') {
        filterConditions.push(Prisma.sql`
          "brandId" IN (
            SELECT "brandId" FROM "BrandTranslation" WHERE slug = ANY(${filterValues}::text[]) AND locale = ${locale}::"Locale"
          )
        `);
      } else {
        filterConditions.push(Prisma.sql`
          EXISTS (
            SELECT 1
            FROM jsonb_array_elements("variantOptions") AS vo
            WHERE vo->>'variantGroupSlug' = ${key}
            AND vo->>'variantOptionSlug' = ANY(${filterValues}::text[])
          )
        `);
      }
    }

    const dynamicFilters =
      filterConditions.length > 0
        ? Prisma.sql`AND ${Prisma.join(filterConditions, ' AND ')}`
        : Prisma.empty;

    const categoryFilter =
      categoryIds && categoryIds.length > 0
        ? Prisma.sql`
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(categories) AS cat
      WHERE cat->>'id' = ANY(${categoryIds}::text[])
    )
  `
        : Prisma.empty;

    const whereClause = Prisma.sql`
      WHERE
        active = true
        AND "isProductActive" = true
        AND stock > 0
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(prices) AS price WHERE price->>'currency' = ${currency}
        )
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements("productTranslations") AS trans WHERE trans->>'locale' = ${locale}
        )
        ${categoryFilter}
        ${dynamicFilters}
    `;

    const orderByClause = this.getOrderBySql(sortType, currency, locale);

    const baseQuery = Prisma.sql`
    WITH "RankedView" AS (
      SELECT
        *,
        ROW_NUMBER() OVER(
          PARTITION BY "productId"
          ORDER BY (
            SELECT
              COALESCE(
                NULLIF(CAST(p->>'discountedPrice' AS DECIMAL), 0),
                CAST(p->>'price' AS DECIMAL)
              )
            FROM jsonb_array_elements(prices) AS p
            WHERE p->>'currency' = ${currency}::text
            LIMIT 1
          ) ASC NULLS LAST, 
          "createdAt" DESC 
        ) as rn
      FROM "ProductUnifiedView"
      ${whereClause}
    )
    SELECT
      id, "productId", "combinationId", "entryType", sku, barcode, type, stock, active,
      "isProductActive", "brandId", "taxonomyCategoryId", "createdAt", "updatedAt",
      "visibleAllCombinations", prices, "productTranslations", "productAssets",
      categories, "variantTranslation", "variantAssets", "variantOptions"
    FROM "RankedView"
    WHERE ("visibleAllCombinations" = true OR rn = 1)
  `;

    const productsQuery = Prisma.sql`
      ${baseQuery}
      ${orderByClause}
      LIMIT ${take}
      OFFSET ${skip}
    `;

    const countQuery = Prisma.sql`
      SELECT COUNT(*)::int FROM (${baseQuery}) AS "final_products"
    `;

    const [products, countResult] = await this.prismaService.$transaction([
      this.prismaService.$queryRaw<ProductUnifiedViewData[]>(productsQuery),
      this.prismaService.$queryRaw<{ count: number }[]>(countQuery),
    ]);

    const totalCount = Number(countResult[0]?.count || 0);

    return {
      success: true,
      products,
      pagination: {
        totalCount: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / take),
        hasNextPage: page * take < totalCount,
        hasPreviousPage: page > 1,
      },
    };
  }

  private getOrderBySql(
    sortType: ProductPageSortOption,
    currency: string,
    locale: string,
  ): Prisma.Sql {
    switch (sortType) {
      case ProductPageSortOption.NEWEST:
        return Prisma.sql`ORDER BY "createdAt" DESC`;

      case ProductPageSortOption.OLDEST:
        return Prisma.sql`ORDER BY "createdAt" ASC`;

      case ProductPageSortOption.PRICE_ASC:
        return Prisma.sql`
        ORDER BY (
          SELECT COALESCE(
            NULLIF(CAST(price->>'discountedPrice' AS DECIMAL), 0),
            CAST(price->>'price' AS DECIMAL)
          )
          FROM jsonb_array_elements(prices) AS price
          WHERE price->>'currency' = ${currency}
          LIMIT 1
        ) ASC NULLS LAST
      `;

      case ProductPageSortOption.PRICE_DESC:
        return Prisma.sql`
        ORDER BY (
          SELECT COALESCE(
            NULLIF(CAST(price->>'discountedPrice' AS DECIMAL), 0),
            CAST(price->>'price' AS DECIMAL)
          )
          FROM jsonb_array_elements(prices) AS price
          WHERE price->>'currency' = ${currency}
          LIMIT 1
        ) DESC NULLS LAST
      `;

      case ProductPageSortOption.A_Z:
        return Prisma.sql`
        ORDER BY (
          SELECT trans->>'name'
          FROM jsonb_array_elements("productTranslations") AS trans
          WHERE trans->>'locale' = ${locale}
          LIMIT 1
        ) ASC NULLS LAST
      `;

      case ProductPageSortOption.Z_A:
        return Prisma.sql`
        ORDER BY (
          SELECT trans->>'name'
          FROM jsonb_array_elements("productTranslations") AS trans
          WHERE trans->>'locale' = ${locale}
          LIMIT 1
        ) DESC NULLS LAST
      `;

      default:
        return Prisma.sql`ORDER BY "createdAt" DESC`;
    }
  }
}
