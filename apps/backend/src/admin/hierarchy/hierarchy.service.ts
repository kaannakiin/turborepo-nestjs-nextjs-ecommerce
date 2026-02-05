import { Injectable } from '@nestjs/common';
import {
  BrandHierarchyView,
  CategoryHierarchyView,
  Locale,
  TagHierarchyView,
} from '@repo/database';
import { Pagination } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HierarchyService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCategoriesHierarchy(
    locale: Locale,
    limit?: number,
    page?: number,
    search?: string,
  ): Promise<{
    data: CategoryHierarchyView[];
    pagination: Pagination;
  }> {
    const safeLimit = Math.min(limit || 20, 100);
    const safePage = Math.max(page || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const where = {
      locale,
      ...(search?.trim() && {
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' as const } },
          { slug: { contains: search.trim(), mode: 'insensitive' as const } },
          {
            description: {
              contains: search.trim(),
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const [categories, total] = await Promise.all([
      this.prismaService.categoryHierarchyView.findMany({
        where,
        take: safeLimit,
        skip,
        orderBy: [{ depth: 'asc' }, { name: 'asc' }],
      }),
      this.prismaService.categoryHierarchyView.count({ where }),
    ]);

    return {
      data: categories,
      pagination: {
        currentPage: page,
        perPage: safeLimit,
        totalCount: total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getBrandsHierarchy(
    locale: Locale,
    limit?: number,
    page?: number,
    search?: string,
  ): Promise<{
    data: BrandHierarchyView[];
    pagination: Pagination;
  }> {
    const safeLimit = Math.min(limit || 20, 100);
    const safePage = Math.max(page || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const where = {
      locale,
      ...(search?.trim() && {
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' as const } },
          { slug: { contains: search.trim(), mode: 'insensitive' as const } },
          {
            description: {
              contains: search.trim(),
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const [brands, total] = await Promise.all([
      this.prismaService.brandHierarchyView.findMany({
        where,
        take: safeLimit,
        skip,
        orderBy: [{ depth: 'asc' }, { name: 'asc' }],
      }),
      this.prismaService.brandHierarchyView.count({ where }),
    ]);

    return {
      data: brands,
      pagination: {
        currentPage: page,
        perPage: safeLimit,
        totalCount: total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getTagsHierarchy(
    locale: Locale,
    limit?: number,
    page?: number,
    search?: string,
  ): Promise<{
    data: TagHierarchyView[];
    pagination: Pagination;
  }> {
    const safeLimit = Math.min(limit || 20, 100);
    const safePage = Math.max(page || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const where = {
      locale,
      ...(search?.trim() && {
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' as const } },
          { slug: { contains: search.trim(), mode: 'insensitive' as const } },
        ],
      }),
    };

    const [tags, total] = await Promise.all([
      this.prismaService.tagHierarchyView.findMany({
        where,
        take: safeLimit,
        skip,
        orderBy: [{ depth: 'asc' }, { name: 'asc' }],
      }),
      this.prismaService.tagHierarchyView.count({ where }),
    ]);

    return {
      data: tags,
      pagination: {
        currentPage: page,
        perPage: safeLimit,
        totalCount: total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }
}
