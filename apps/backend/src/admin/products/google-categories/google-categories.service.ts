import { Injectable } from '@nestjs/common';
import { TaxonomyCategory } from '@repo/database';
import { NewTaxonomyCategory, SimplifiedTaxonomyCategory } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GoogleCategoriesService {
  constructor(private prismaService: PrismaService) {}

  async getCategoriesByDepth(depth: number): Promise<NewTaxonomyCategory> {
    try {
      const categories = await this.prismaService.taxonomyCategory.findMany({
        where: {
          depth,
        },
        select: {
          id: true,
          pathNames: true,
          originalName: true,
          _count: {
            select: {
              children: {
                where: {
                  depth: depth + 1,
                },
              },
            },
          },
        },
      });
      return {
        success: true,
        categories,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  async getCategoriesByParentId(
    parentId: string,
  ): Promise<NewTaxonomyCategory> {
    try {
      const categories = await this.prismaService.taxonomyCategory.findMany({
        where: {
          parentId: parentId,
        },
        select: {
          id: true,
          pathNames: true,
          originalName: true,
          _count: {
            select: {
              children: true,
            },
          },
        },
      });
      return {
        success: true,
        categories,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  async getCategoriesBySearch(search: string): Promise<NewTaxonomyCategory> {
    try {
      if (search.trim() === '' || search.length < 3) {
        return {
          success: false,
        };
      }

      const cleanSearch = search.trim();

      const categories = await this.prismaService.taxonomyCategory.findMany({
        where: {
          OR: [
            {
              originalName: {
                contains: cleanSearch,
                mode: 'insensitive',
              },
            },
            {
              pathNames: {
                contains: cleanSearch,
                mode: 'insensitive',
              },
            },
            {
              path: {
                contains: cleanSearch,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          pathNames: true,
          originalName: true,
          _count: {
            select: {
              children: true,
            },
          },
        },
      });
      return {
        success: true,
        categories,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  async getCategoryWithAncestors(
    categoryId: string,
  ): Promise<SimplifiedTaxonomyCategory[]> {
    if (!categoryId) {
      return [];
    }

    const results: (TaxonomyCategory & { childrenCount: BigInt })[] = await this
      .prismaService.$queryRaw`
        WITH RECURSIVE AncestorPath AS (
            
            SELECT
                id,
                "originalName",
                "parentId",
                "depth",
                (SELECT COUNT(*) FROM "TaxonomyCategory" AS "child" WHERE "child"."parentId" = "TaxonomyCategory".id) AS "childrenCount"
            FROM "TaxonomyCategory"
            WHERE id = ${categoryId}

            UNION ALL

            
            SELECT
                t.id,
                t."originalName",
                t."parentId",
                t."depth",
                (SELECT COUNT(*) FROM "TaxonomyCategory" AS "child" WHERE "child"."parentId" = t.id) AS "childrenCount"
            FROM "TaxonomyCategory" t
            INNER JOIN AncestorPath ap ON t.id = ap."parentId"
        )
        
        SELECT
          id,
          "originalName",
          "parentId",
          "childrenCount"
        FROM AncestorPath
        ORDER BY "depth" ASC; 
      `;

    return results.map((cat) => ({
      id: cat.id,
      name: cat.originalName,
      hasChildren: Number(cat.childrenCount) > 0,
      parentId: cat.parentId,
    }));
  }

  async getAncestorIds(categoryId: string): Promise<string[]> {
    if (!categoryId) {
      return [];
    }

    const results: { id: string }[] = await this.prismaService.$queryRaw`
      WITH RECURSIVE AncestorPath AS (
          SELECT id, "parentId"
          FROM "TaxonomyCategory"
          WHERE id = ${categoryId}

          UNION ALL

          SELECT t.id, t."parentId"
          FROM "TaxonomyCategory" t
          INNER JOIN AncestorPath ap ON t.id = ap."parentId"
      )
      SELECT id FROM AncestorPath;
    `;

    return results.map((r) => r.id);
  }

  async getCategoryDetailsById(
    id: string,
  ): Promise<SimplifiedTaxonomyCategory | null> {
    const cat = await this.prismaService.taxonomyCategory.findUnique({
      where: { id },
      select: {
        id: true,
        originalName: true,
        parentId: true,
        _count: { select: { children: true } },
      },
    });

    if (!cat) return null;

    return {
      id: cat.id,
      name: cat.originalName,
      hasChildren: cat._count.children > 0,
      parentId: cat.parentId,
    };
  }
}
