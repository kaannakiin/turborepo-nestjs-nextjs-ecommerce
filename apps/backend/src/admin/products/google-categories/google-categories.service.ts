import { Injectable } from '@nestjs/common';
import { TaxonomyCategoryWithChildren } from '@repo/types';
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
}
