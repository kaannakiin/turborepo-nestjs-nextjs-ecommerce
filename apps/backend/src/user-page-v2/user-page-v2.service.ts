import { Injectable } from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database';
import { getSortIndexFromQuery } from '@repo/shared';
import {
  CategoryPagePreparePageReturnData,
  GetCategoryProductsZodType,
  ProductAndVariantWhereInput,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

type CategoryHierarchyNode = {
  id: string;
  name: string;
  slug: string;
  level: number;
  type: 'parent' | 'child';
};

@Injectable()
export class UserPageV2Service {
  constructor(private prisma: PrismaService) {}

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
        await this.prisma.$queryRaw<CategoryHierarchyNode[]>(query);

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
    const category = await this.prisma.categoryTranslation.findUnique({
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

    const variantGroup = await this.prisma.variantGroup.findMany({
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

    const brands = await this.prisma.brand.findMany({
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
  }: GetCategoryProductsZodType): Promise<{
    success: boolean;
  }> {
    const take = 12;
    const skip = (page - 1) * take;
    const sortType = getSortIndexFromQuery(sort);

    return {
      success: true,
    };
  }
}
