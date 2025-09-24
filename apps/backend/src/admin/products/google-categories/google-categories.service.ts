import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/database';
import {
  GoogleTaxonomyCategory,
  TaxonomyCategoryWithChildren,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GoogleCategoriesService {
  constructor(private prisma: PrismaService) {}

  async getTaxonomy(): Promise<TaxonomyCategoryWithChildren[]> {
    const categories = await this.prisma.taxonomyCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        googleId: true,
        parentId: true,
        path: true,
        pathNames: true,
        depth: true,
        originalName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { depth: 'asc' },
    });

    const categoryMap: Record<string, TaxonomyCategoryWithChildren> = {};
    const roots: TaxonomyCategoryWithChildren[] = [];

    // İlk önce tüm kategorileri map'e ekle
    for (const category of categories) {
      const categoryWithChildren: TaxonomyCategoryWithChildren = {
        ...category,
        children: [],
      };
      categoryMap[category.id] = categoryWithChildren;
    }

    // Sonra parent-child ilişkilerini kur
    for (const category of categories) {
      const item = categoryMap[category.id];
      if (category.parentId && categoryMap[category.parentId]) {
        const parent = categoryMap[category.parentId];
        parent.children!.push(item);
      } else {
        roots.push(item);
      }
    }

    return roots;
  }

  async getTaxonomiesHaveNoParent(
    id?: string,
  ): Promise<GoogleTaxonomyCategory[]> {
    const where: Prisma.TaxonomyCategoryWhereInput = {
      ...(id
        ? {
            id,
          }
        : {
            parentId: null,
          }),
    };

    return this.prisma.taxonomyCategory.findMany({
      where,
      select: {
        id: true,
        originalName: true,
        _count: {
          select: {
            children: true,
          },
        },
        children: {
          select: {
            id: true,
            originalName: true,
            _count: {
              select: {
                children: true,
              },
            },
          },
        },
      },
    });
  }
  async getParentId(id: string): Promise<{ parentId: string | null }> {
    const category = await this.prisma.taxonomyCategory.findUnique({
      where: { id },
      select: { parentId: true },
    });

    return { parentId: category?.parentId || null };
  }
}
