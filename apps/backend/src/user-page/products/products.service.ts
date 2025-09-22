import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductListComponentType, ProductPageDataType } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService as AdminProductService } from '../../admin/products/products.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminProductService: AdminProductService,
  ) {}

  async getProductBySlug(slug: string): Promise<ProductPageDataType> {
    const product = await this.prisma.product.findFirst({
      where: {
        translations: {
          some: {
            OR: [
              {
                slug: { equals: slug, mode: 'insensitive' },
              },
              {
                name: { equals: slug, mode: 'insensitive' },
              },
            ],
          },
        },
        active: true,
      },
      include: {
        prices: true,

        assets: {
          orderBy: {
            order: 'asc',
          },
          select: {
            asset: {
              select: {
                url: true,
                type: true,
              },
            },
          },
        },
        brand: {
          select: {
            translations: {
              select: {
                name: true,
                locale: true,
                metaDescription: true,
                metaTitle: true,
                slug: true,
              },
            },
          },
        },
        taxonomyCategory: true,
        translations: {
          select: {
            name: true,
            locale: true,
            metaDescription: true,
            metaTitle: true,
            slug: true,
            description: true,
          },
        },
        variantGroups: {
          orderBy: {
            order: 'asc',
          },
          where: {
            product: {
              translations: {
                some: {
                  slug: { contains: slug, mode: 'insensitive' },
                },
              },
            },
          },
          include: {
            options: {
              where: {
                productVariantGroup: {
                  product: {
                    translations: {
                      some: {
                        slug: { contains: slug, mode: 'insensitive' },
                      },
                    },
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
              include: {
                variantOption: {
                  include: {
                    asset: { select: { url: true, type: true } },
                    translations: true,
                  },
                },
              },
            },
            variantGroup: {
              include: {
                translations: true,
              },
            },
          },
        },
        variantCombinations: {
          where: {
            AND: [
              {
                stock: {
                  gt: 0,
                },
              },
              { active: true },
            ],
          },
          include: {
            translations: {
              select: {
                locale: true,
                metaDescription: true,
                metaTitle: true,
                description: true,
              },
            },
            prices: {
              select: {
                price: true,
                currency: true,
                discountedPrice: true,
              },
            },
            assets: {
              orderBy: {
                order: 'asc',
              },
              select: {
                asset: {
                  select: {
                    url: true,
                    type: true,
                  },
                },
              },
            },
            options: {
              where: {
                combination: {
                  AND: [
                    {
                      active: true,
                    },
                    {
                      stock: { gt: 0 },
                    },
                  ],
                },

                productVariantOption: {
                  productVariantGroup: {
                    product: {
                      translations: {
                        some: {
                          slug: { contains: slug, mode: 'insensitive' },
                        },
                      },
                    },
                  },
                },
              },
              orderBy: {
                productVariantOption: {
                  productVariantGroup: {
                    order: 'asc',
                  },
                },
              },
              include: {
                productVariantOption: {
                  select: {
                    variantOption: {
                      select: {
                        asset: { select: { url: true, type: true } },
                        translations: {
                          select: {
                            locale: true,
                            name: true,
                            slug: true,
                          },
                        },
                        hexValue: true,
                        variantGroup: {
                          select: {
                            translations: {
                              select: {
                                name: true,
                                slug: true,
                                locale: true,
                              },
                            },
                            type: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        categories: {
          where: {
            product: {
              translations: {
                some: {
                  slug: { contains: slug, mode: 'insensitive' },
                },
              },
            },
          },
          include: {
            category: {
              select: {
                translations: true,
                childCategories: true,
                parentCategory: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new BadRequestException('Product not found or inactive');
    }

    return product;
  }

  async getProductSimilar(productId: string) {
    // Ana ürünün bilgilerini al
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const categoryIds = product.categories.map((c) => c.categoryId);
    const similarProducts: Array<
      ProductPageDataType & {
        similarityType: 'random' | 'brand' | 'category' | 'taxonomy';
      }
    > = [];

    if (product.brandId) {
      const brandProducts = await this.prisma.product.findMany({
        where: {
          AND: [
            { brandId: product.brandId },
            { NOT: { id: productId } }, // Kendisini hariç tut
            { active: true },
            {
              OR: [
                { stock: { gt: 0 } }, // Normal ürünler için stok kontrolü
                {
                  variantCombinations: {
                    some: {
                      AND: [{ stock: { gt: 0 } }, { active: true }],
                    },
                  },
                }, // Variant ürünler için stok kontrolü
              ],
            },
          ],
        },
        take: 6, // Brand'den maksimum 6 ürün
        orderBy: { createdAt: 'desc' },
        include: {
          prices: true,
          assets: {
            orderBy: {
              order: 'asc',
            },
            select: {
              asset: {
                select: {
                  url: true,
                  type: true,
                },
              },
            },
          },
          categories: {
            where: {
              productId: productId,
            },
            include: {
              category: {
                include: {
                  translations: true,
                  childCategories: true,
                  parentCategory: true,
                },
              },
            },
          },
          brand: {
            select: {
              translations: {
                select: {
                  name: true,
                  locale: true,
                  metaDescription: true,
                  metaTitle: true,
                  slug: true,
                },
              },
            },
          },
          taxonomyCategory: true,
          translations: {
            select: {
              name: true,
              locale: true,
              metaDescription: true,
              metaTitle: true,
              slug: true,
              description: true,
            },
          },
          variantGroups: {
            orderBy: {
              order: 'asc',
            },
            where: {
              product: {
                id: productId,
              },
            },
            include: {
              options: {
                where: {
                  productVariantGroup: {
                    product: {
                      id: productId,
                    },
                  },
                },
                orderBy: {
                  order: 'asc',
                },
                include: {
                  variantOption: {
                    include: {
                      asset: { select: { url: true, type: true } },
                      translations: true,
                    },
                  },
                },
              },
              variantGroup: {
                include: {
                  translations: true,
                },
              },
            },
          },
          variantCombinations: {
            where: {
              AND: [
                {
                  stock: {
                    gt: 0,
                  },
                },
                { active: true },
              ],
            },
            include: {
              translations: {
                select: {
                  locale: true,
                  metaDescription: true,
                  metaTitle: true,
                  description: true,
                },
              },
              prices: {
                select: {
                  price: true,
                  currency: true,
                  discountedPrice: true,
                },
              },
              assets: {
                orderBy: {
                  order: 'asc',
                },
                select: {
                  asset: {
                    select: {
                      url: true,
                      type: true,
                    },
                  },
                },
              },
              options: {
                where: {
                  combination: {
                    AND: [
                      {
                        active: true,
                      },
                      {
                        stock: { gt: 0 },
                      },
                    ],
                  },
                },
                orderBy: {
                  productVariantOption: {
                    productVariantGroup: {
                      order: 'asc',
                    },
                  },
                },
                include: {
                  productVariantOption: {
                    select: {
                      variantOption: {
                        select: {
                          asset: { select: { url: true, type: true } },
                          translations: {
                            select: {
                              locale: true,
                              name: true,
                              slug: true,
                            },
                          },
                          hexValue: true,
                          variantGroup: {
                            select: {
                              translations: {
                                select: {
                                  name: true,
                                  slug: true,
                                  locale: true,
                                },
                              },
                              type: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      similarProducts.push(
        ...brandProducts.map((p) => ({
          ...p,
          similarityType: 'brand' as const,
        })),
      );
    }

    // 2. AYNI KATEGORİLERDEN ÜRÜNLER
    if (categoryIds.length > 0) {
      const currentProductIds = similarProducts.map((p) => p.id);

      const categoryProducts = await this.prisma.product.findMany({
        where: {
          AND: [
            {
              categories: {
                some: {
                  categoryId: { in: categoryIds },
                },
              },
            },
            { NOT: { id: { in: [...currentProductIds, productId] } } }, // Zaten eklenenleri ve kendisini hariç tut
            { active: true },
            {
              OR: [
                { stock: { gt: 0 } },
                {
                  variantCombinations: {
                    some: {
                      AND: [{ stock: { gt: 0 } }, { active: true }],
                    },
                  },
                },
              ],
            },
          ],
        },
        take: 8, // Kategori'den maksimum 8 ürün
        orderBy: { createdAt: 'desc' },
        include: {
          categories: {
            where: {
              productId: productId,
            },
            include: {
              category: {
                include: {
                  translations: true,
                  childCategories: true,
                  parentCategory: true,
                },
              },
            },
          },
          prices: true,
          assets: {
            orderBy: {
              order: 'asc',
            },
            select: {
              asset: {
                select: {
                  url: true,
                  type: true,
                },
              },
            },
          },
          brand: {
            select: {
              translations: {
                select: {
                  name: true,
                  locale: true,
                  metaDescription: true,
                  metaTitle: true,
                  slug: true,
                },
              },
            },
          },
          taxonomyCategory: true,
          translations: {
            select: {
              name: true,
              locale: true,
              metaDescription: true,
              metaTitle: true,
              slug: true,
              description: true,
            },
          },
          variantGroups: {
            orderBy: {
              order: 'asc',
            },
            where: {
              product: {
                id: productId,
              },
            },
            include: {
              options: {
                where: {
                  productVariantGroup: {
                    product: {
                      id: productId,
                    },
                  },
                },
                orderBy: {
                  order: 'asc',
                },
                include: {
                  variantOption: {
                    include: {
                      asset: { select: { url: true, type: true } },
                      translations: true,
                    },
                  },
                },
              },
              variantGroup: {
                include: {
                  translations: true,
                },
              },
            },
          },
          variantCombinations: {
            where: {
              AND: [
                {
                  stock: {
                    gt: 0,
                  },
                },
                { active: true },
              ],
            },
            include: {
              translations: {
                select: {
                  locale: true,
                  metaDescription: true,
                  metaTitle: true,
                  description: true,
                },
              },
              prices: {
                select: {
                  price: true,
                  currency: true,
                  discountedPrice: true,
                },
              },
              assets: {
                orderBy: {
                  order: 'asc',
                },
                select: {
                  asset: {
                    select: {
                      url: true,
                      type: true,
                    },
                  },
                },
              },
              options: {
                where: {
                  combination: {
                    AND: [
                      {
                        active: true,
                      },
                      {
                        stock: { gt: 0 },
                      },
                    ],
                  },
                },
                orderBy: {
                  productVariantOption: {
                    productVariantGroup: {
                      order: 'asc',
                    },
                  },
                },
                include: {
                  productVariantOption: {
                    select: {
                      variantOption: {
                        select: {
                          asset: { select: { url: true, type: true } },
                          translations: {
                            select: {
                              locale: true,
                              name: true,
                              slug: true,
                            },
                          },
                          hexValue: true,
                          variantGroup: {
                            select: {
                              translations: {
                                select: {
                                  name: true,
                                  slug: true,
                                  locale: true,
                                },
                              },
                              type: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      similarProducts.push(
        ...categoryProducts.map((p) => ({
          ...p,
          similarityType: 'category' as const,
        })),
      );
    }

    // 3. AYNI GOOGLE TAXONOMY'DEN ÜRÜNLER (Eğer yeterli ürün yoksa)
    if (similarProducts.length < 10 && product.taxonomyCategoryId) {
      const currentProductIds = similarProducts.map((p) => p.id);

      const taxonomyProducts = await this.prisma.product.findMany({
        where: {
          AND: [
            { taxonomyCategoryId: product.taxonomyCategoryId },
            { NOT: { id: { in: [...currentProductIds, productId] } } },
            { active: true },
            {
              OR: [
                { stock: { gt: 0 } },
                {
                  variantCombinations: {
                    some: {
                      AND: [{ stock: { gt: 0 } }, { active: true }],
                    },
                  },
                },
              ],
            },
          ],
        },
        take: 10 - similarProducts.length, // Eksik sayıyı tamamla
        orderBy: { createdAt: 'desc' },
        include: {
          prices: true,
          categories: {
            where: {
              productId: productId,
            },
            include: {
              category: {
                include: {
                  translations: true,
                  childCategories: true,
                  parentCategory: true,
                },
              },
            },
          },
          assets: {
            orderBy: {
              order: 'asc',
            },
            select: {
              asset: {
                select: {
                  url: true,
                  type: true,
                },
              },
            },
          },
          brand: {
            select: {
              translations: {
                select: {
                  name: true,
                  locale: true,
                  metaDescription: true,
                  metaTitle: true,
                  slug: true,
                },
              },
            },
          },
          taxonomyCategory: true,
          translations: {
            select: {
              name: true,
              locale: true,
              metaDescription: true,
              metaTitle: true,
              slug: true,
              description: true,
            },
          },
          variantGroups: {
            orderBy: {
              order: 'asc',
            },
            where: {
              product: {
                id: productId,
              },
            },
            include: {
              options: {
                where: {
                  productVariantGroup: {
                    product: {
                      id: productId,
                    },
                  },
                },
                orderBy: {
                  order: 'asc',
                },
                include: {
                  variantOption: {
                    include: {
                      asset: { select: { url: true, type: true } },
                      translations: true,
                    },
                  },
                },
              },
              variantGroup: {
                include: {
                  translations: true,
                },
              },
            },
          },
          variantCombinations: {
            where: {
              AND: [
                {
                  stock: {
                    gt: 0,
                  },
                },
                { active: true },
              ],
            },
            include: {
              translations: {
                select: {
                  locale: true,
                  metaDescription: true,
                  metaTitle: true,
                  description: true,
                },
              },
              prices: {
                select: {
                  price: true,
                  currency: true,
                  discountedPrice: true,
                },
              },
              assets: {
                orderBy: {
                  order: 'asc',
                },
                select: {
                  asset: {
                    select: {
                      url: true,
                      type: true,
                    },
                  },
                },
              },
              options: {
                where: {
                  combination: {
                    AND: [
                      {
                        active: true,
                      },
                      {
                        stock: { gt: 0 },
                      },
                    ],
                  },
                },
                orderBy: {
                  productVariantOption: {
                    productVariantGroup: {
                      order: 'asc',
                    },
                  },
                },
                include: {
                  productVariantOption: {
                    select: {
                      variantOption: {
                        select: {
                          asset: { select: { url: true, type: true } },
                          translations: {
                            select: {
                              locale: true,
                              name: true,
                              slug: true,
                            },
                          },
                          hexValue: true,
                          variantGroup: {
                            select: {
                              translations: {
                                select: {
                                  name: true,
                                  slug: true,
                                  locale: true,
                                },
                              },
                              type: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      similarProducts.push(
        ...taxonomyProducts.map((p) => ({
          ...p,
          similarityType: 'taxonomy' as const,
        })),
      );
    }

    // 4. RASTGELE ÜRÜNLER (Eğer hala yeterli değilse)
    if (similarProducts.length < 12) {
      const currentProductIds = similarProducts.map((p) => p.id);

      const randomProducts = await this.prisma.product.findMany({
        where: {
          AND: [
            { NOT: { id: { in: [...currentProductIds, productId] } } },
            { active: true },
            {
              OR: [
                { stock: { gt: 0 } },
                {
                  variantCombinations: {
                    some: {
                      AND: [{ stock: { gt: 0 } }, { active: true }],
                    },
                  },
                },
              ],
            },
          ],
        },
        take: 8 - similarProducts.length,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: {
            where: {
              productId: productId,
            },
            include: {
              category: {
                include: {
                  translations: true,
                  childCategories: true,
                  parentCategory: true,
                },
              },
            },
          },
          prices: true,
          assets: {
            orderBy: {
              order: 'asc',
            },
            select: {
              asset: {
                select: {
                  url: true,
                  type: true,
                },
              },
            },
          },
          brand: {
            select: {
              translations: {
                select: {
                  name: true,
                  locale: true,
                  metaDescription: true,
                  metaTitle: true,
                  slug: true,
                },
              },
            },
          },
          taxonomyCategory: true,
          translations: {
            select: {
              name: true,
              locale: true,
              metaDescription: true,
              metaTitle: true,
              slug: true,
              description: true,
            },
          },
          variantGroups: {
            orderBy: {
              order: 'asc',
            },
            where: {
              product: {
                id: productId,
              },
            },
            include: {
              options: {
                where: {
                  productVariantGroup: {
                    product: {
                      id: productId,
                    },
                  },
                },
                orderBy: {
                  order: 'asc',
                },
                include: {
                  variantOption: {
                    include: {
                      asset: { select: { url: true, type: true } },
                      translations: true,
                    },
                  },
                },
              },
              variantGroup: {
                include: {
                  translations: true,
                },
              },
            },
          },
          variantCombinations: {
            where: {
              AND: [
                {
                  stock: {
                    gt: 0,
                  },
                },
                { active: true },
              ],
            },
            include: {
              translations: {
                select: {
                  locale: true,
                  metaDescription: true,
                  metaTitle: true,
                  description: true,
                },
              },
              prices: {
                select: {
                  price: true,
                  currency: true,
                  discountedPrice: true,
                },
              },
              assets: {
                orderBy: {
                  order: 'asc',
                },
                select: {
                  asset: {
                    select: {
                      url: true,
                      type: true,
                    },
                  },
                },
              },
              options: {
                where: {
                  combination: {
                    AND: [
                      {
                        active: true,
                      },
                      {
                        stock: { gt: 0 },
                      },
                    ],
                  },
                },
                orderBy: {
                  productVariantOption: {
                    productVariantGroup: {
                      order: 'asc',
                    },
                  },
                },
                include: {
                  productVariantOption: {
                    select: {
                      variantOption: {
                        select: {
                          asset: { select: { url: true, type: true } },
                          translations: {
                            select: {
                              locale: true,
                              name: true,
                              slug: true,
                            },
                          },
                          hexValue: true,
                          variantGroup: {
                            select: {
                              translations: {
                                select: {
                                  name: true,
                                  slug: true,
                                  locale: true,
                                },
                              },
                              type: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      similarProducts.push(
        ...randomProducts.map((p) => ({
          ...p,
          similarityType: 'random' as const,
        })),
      );
    }

    const priorityOrder = { brand: 1, category: 2, taxonomy: 3, random: 4 };

    return {
      totalCount: similarProducts.length,
      products: similarProducts
        .sort(
          (a, b) =>
            priorityOrder[a.similarityType] - priorityOrder[b.similarityType],
        )
        .map((p) => {
          const { similarityType, ...rest } = p;
          return rest;
        }),
    };
  }

  async getProductsByIdsForProductListCarousel(
    items: ProductListComponentType['items'],
  ) {
    const mainProductItems = items.filter((item) => !item.variantId);
    const variantItems = items.filter((item) => item.variantId);

    const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
    const requestedVariantIds = variantItems.map((item) => item.variantId);

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: uniqueProductIds, // ✅ Sadece unique product ID'leri kullan
        },
      },
      include: {
        translations: true,
        assets: {
          take: 1,
          orderBy: {
            order: 'asc',
          },
          select: {
            asset: {
              select: {
                url: true,
                type: true,
              },
            },
          },
        },
        brand: {
          select: {
            translations: true,
          },
        },
        prices: true,
        variantCombinations: {
          where: {
            AND: [
              { active: true },
              { stock: { gt: 0 } },
              // ✅ Eğer bu ürün için varyant istenmişse sadece istenen varyantları getir
              // Eğer main product istenmişse de en az 1 varyant getir (varsayılan için)
              requestedVariantIds.length > 0
                ? {
                    OR: [
                      { id: { in: requestedVariantIds } },
                      // Main product için de varsayılan varyant
                      ...(mainProductItems.some(
                        (item) => item.productId === uniqueProductIds[0],
                      )
                        ? [{}] // Boş condition - tüm aktif varyantları getir
                        : []),
                    ],
                  }
                : {}, // Hiç spesifik varyant istenmemişse tüm aktif varyantları getir
            ],
          },
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            assets: {
              take: 1,
              orderBy: {
                order: 'asc',
              },
              select: {
                asset: {
                  select: {
                    url: true,
                    type: true,
                  },
                },
              },
            },
            translations: true,
            prices: true,
            options: {
              orderBy: {
                productVariantOption: {
                  productVariantGroup: {
                    order: 'asc',
                  },
                },
              },
              select: {
                productVariantOption: {
                  select: {
                    variantOption: {
                      select: {
                        id: true,
                        hexValue: true,
                        asset: { select: { url: true, type: true } },
                        translations: true,
                      },
                    },
                    productVariantGroup: {
                      select: {
                        variantGroup: {
                          include: {
                            translations: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return this.adminProductService.convertToModalProductCard(products);
  }
}
