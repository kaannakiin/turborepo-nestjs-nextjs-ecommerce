import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@repo/database';
import {
  AdminProductTableProductData,
  adminProductTableQuery,
  Pagination,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getProducts(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{
    products: AdminProductTableProductData[];
    pagination?: Pagination;
  }> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.ProductWhereInput = search?.trim()
      ? {
          OR: [
            {
              translations: {
                some: {
                  name: { contains: search.trim(), mode: 'insensitive' },
                },
              },
            },
            {
              translations: {
                some: {
                  slug: { contains: search.trim(), mode: 'insensitive' },
                },
              },
            },
            {
              variantGroups: {
                some: {
                  variantGroup: {
                    translations: {
                      some: {
                        name: { contains: search.trim(), mode: 'insensitive' },
                      },
                    },
                  },
                },
              },
            },
            {
              variantGroups: {
                some: {
                  variantGroup: {
                    translations: {
                      some: {
                        slug: { contains: search.trim(), mode: 'insensitive' },
                      },
                    },
                  },
                },
              },
            },
            {
              variantGroups: {
                some: {
                  variantGroup: {
                    options: {
                      some: {
                        translations: {
                          some: {
                            name: {
                              contains: search.trim(),
                              mode: 'insensitive',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              variantGroups: {
                some: {
                  variantGroup: {
                    options: {
                      some: {
                        translations: {
                          some: {
                            slug: {
                              contains: search.trim(),
                              mode: 'insensitive',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        }
      : {};

    try {
      const [products, total] = await Promise.all([
        this.prismaService.product.findMany({
          where,
          take,
          skip,
          include: adminProductTableQuery,
        }),

        this.prismaService.product.count({ where }),
      ]);
      return {
        products: products,
        pagination: {
          currentPage: page,
          totalCount: total,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }
}
