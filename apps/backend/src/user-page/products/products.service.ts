import { BadRequestException, Injectable } from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database/client';
import {
  GetProductPageReturnType,
  Languages,
  ProductListComponentType,
  ProductPageDataType,
  Sitemap,
  Videos,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService as AdminProductService } from '../../admin/products/products.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminProductService: AdminProductService,
    private readonly configService: ConfigService,
  ) {}

  async getProductBySlug(
    slug: string,
    locale: $Enums.Locale,
  ): Promise<GetProductPageReturnType> {
    const productTranslation =
      await this.prismaService.productTranslation.findUnique({
        where: {
          locale_slug: {
            locale,
            slug,
          },
        },
      });
    if (!productTranslation) {
      return {
        success: false,
        message: 'Ürün bulunamadı.',
        data: null,
      };
    }

    const mainProduct = await this.prismaService.product.findUnique({
      where: {
        id: productTranslation.productId,
      },
      include: {
        assets: {
          orderBy: {
            order: 'asc',
          },
          include: {
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
              where: { locale },
              select: {
                description: true,
                metaDescription: true,
                metaTitle: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        categories: {
          where: {
            category: {
              translations: {
                some: { locale },
              },
              products: {
                some: {
                  product: {
                    OR: [
                      {
                        active: true,
                        stock: { gt: 0 },
                        isVariant: false,
                      },
                      {
                        active: true,
                        variantCombinations: {
                          some: {
                            active: true,
                            stock: { gt: 0 },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          select: {
            category: {
              select: {
                id: true,
                translations: {
                  where: { locale },
                  select: {
                    name: true,
                    slug: true,
                    locale: true,
                    metaTitle: true,
                    metaDescription: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
        prices: {
          select: {
            price: true,
            currency: true,
            discountedPrice: true,
          },
        },
        translations: {
          where: { locale },
          select: {
            name: true,
            locale: true,
            metaDescription: true,
            metaTitle: true,
            slug: true,
            description: true,
          },
        },
        taxonomyCategory: {
          select: {
            googleId: true,
          },
        },
        variantGroups: {
          orderBy: {
            order: 'asc',
          },
          where: {
            product: {
              active: true,
              variantCombinations: {
                some: {
                  active: true,
                  stock: { gt: 0 },
                },
              },
            },
          },
          include: {
            variantGroup: {
              select: {
                id: true,
                type: true,
                translations: {
                  where: {
                    locale,
                  },
                  select: {
                    locale: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            options: {
              orderBy: {
                order: 'asc',
              },
              where: {
                combinations: {
                  some: {
                    combination: {
                      active: true,
                      stock: { gt: 0 },
                    },
                    productVariantOption: {
                      productVariantGroup: {
                        product: {
                          active: true,
                        },
                      },
                    },
                  },
                },
              },
              select: {
                order: true,
                variantOption: {
                  select: {
                    id: true,
                    asset: { select: { url: true, type: true } },
                    hexValue: true,
                    translations: {
                      where: { locale },
                      select: {
                        locale: true,
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        variantCombinations: {
          where: {
            active: true,
            stock: { gt: 0 },
            product: {
              active: true,
            },
          },
          include: {
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
            translations: {
              where: { locale },
              select: {
                locale: true,
                metaDescription: true,
                metaTitle: true,
                description: true,
              },
            },
            prices: true,
            options: {
              select: {
                productVariantOption: {
                  select: {
                    order: true,
                    variantOption: {
                      select: {
                        id: true,
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

    if (!mainProduct) {
      return {
        success: false,
        message: 'Ürün bulunamadı.',
        data: null,
      };
    }
    return {
      success: true,
      message: 'Ürün başarıyla bulundu.',
      data: mainProduct,
    };
  }

  async getProductSimilar(productId: string) {
    // Ana ürünün bilgilerini al
    const product = await this.prismaService.product.findUnique({
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
      const brandProducts = await this.prismaService.product.findMany({
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

      const categoryProducts = await this.prismaService.product.findMany({
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

      const taxonomyProducts = await this.prismaService.product.findMany({
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

      const randomProducts = await this.prismaService.product.findMany({
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

    const products = await this.prismaService.product.findMany({
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

  getTranslation = (
    translations: { locale: string; [key: string]: any }[] | undefined,
    locale: string,
    field: string = 'slug',
  ): string | null => {
    if (!translations) return null;
    const translation = translations.find(
      (t) => t.locale.toLowerCase() === locale.toLowerCase(),
    );
    return translation ? translation[field] : null;
  };

  async getAllProductsSitemap() {
    let baseUrl =
      this.configService.get<string>('WEB_UI_REDIRECT') ||
      'http://localhost:3000';

    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    console.log('Base URL for sitemap:', baseUrl);
    const allLocales = ['tr', 'en', 'de'];
    const defaultLocale = 'tr';
    const visibleProductWhere: Prisma.ProductWhereInput = {
      active: true,
      OR: [
        { isVariant: false, stock: { gt: 0 } },
        {
          isVariant: true,
          variantCombinations: {
            some: { active: true, stock: { gt: 0 } },
          },
        },
      ],
    };

    const products = await this.prismaService.product.findMany({
      where: visibleProductWhere,
      select: {
        id: true,
        translations: true,
        assets: {
          orderBy: { order: 'asc' },
          take: 1,
          select: { asset: { select: { url: true, type: true } } },
        },
        prices: true,
        updatedAt: true,
        active: true,
        isVariant: true,
        createdAt: true,
        variantCombinations: {
          where: {
            active: true,
            stock: { gt: 0 },
          },
          select: {
            id: true,
            updatedAt: true,
            prices: true,
            assets: {
              orderBy: { order: 'asc' },
              take: 1,
              select: { asset: { select: { url: true, type: true } } },
            },
            options: {
              orderBy: [
                {
                  productVariantOption: {
                    productVariantGroup: { order: 'asc' },
                  },
                },
                { productVariantOption: { order: 'asc' } },
              ],
              select: {
                productVariantOption: {
                  select: {
                    variantOption: {
                      select: {
                        translations: true,
                        variantGroup: {
                          select: {
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

    const leafCategories = await this.prismaService.category.findMany({
      where: {
        products: {
          some: {
            product: visibleProductWhere,
          },
        },
      },
      select: { id: true },
    });
    const leafCategoryIds = leafCategories.map((c) => c.id);
    let allVisibleCategoryIds: string[] = [];
    if (leafCategoryIds.length > 0) {
      const ancestorCategories = await this.prismaService.$queryRaw<
        [{ id: string }]
      >`
        WITH RECURSIVE Ancestors AS (
          SELECT id, "parentCategoryId"
          FROM "Category"
          WHERE id IN (${Prisma.join(leafCategoryIds)})

          UNION ALL

          SELECT c.id, c."parentCategoryId"
          FROM "Category" c
          INNER JOIN Ancestors a ON c.id = a."parentCategoryId"
        )
        SELECT DISTINCT id FROM Ancestors;
      `;
      allVisibleCategoryIds = ancestorCategories.map((c) => c.id);
    }

    const categories = await this.prismaService.category.findMany({
      where: {
        id: { in: allVisibleCategoryIds },
      },
      select: {
        id: true,
        updatedAt: true,
        translations: {
          select: { locale: true, slug: true },
        },
      },
    });

    const leafBrands = await this.prismaService.brand.findMany({
      where: {
        products: {
          some: visibleProductWhere,
        },
      },
      select: { id: true },
    });
    const leafBrandIds = leafBrands.map((b) => b.id);

    let allVisibleBrandIds: string[] = [];
    if (leafBrandIds.length > 0) {
      const ancestorBrands = await this.prismaService.$queryRaw<
        [{ id: string }]
      >`
        WITH RECURSIVE Ancestors AS (
          SELECT id, "parentBrandId"
          FROM "Brand"
          WHERE id IN (${Prisma.join(leafBrandIds)})

          UNION ALL

          SELECT b.id, b."parentBrandId"
          FROM "Brand" b
          INNER JOIN Ancestors a ON b.id = a."parentBrandId"
        )
        SELECT DISTINCT id FROM Ancestors;
      `;
      allVisibleBrandIds = ancestorBrands.map((b) => b.id);
    }

    const brands = await this.prismaService.brand.findMany({
      where: {
        id: { in: allVisibleBrandIds },
      },
      select: {
        id: true,
        updatedAt: true,
        translations: {
          select: { locale: true, slug: true },
        },
      },
    });

    const sitemapEntryMap = new Map<string, Sitemap[number]>();

    //product
    for (const locale of allLocales) {
      for (const product of products) {
        if (product.isVariant) {
          for (const combo of product.variantCombinations) {
            const productSlug = this.getTranslation(
              product.translations,
              locale,
              'slug',
            );
            if (!productSlug) continue;

            const queryParams = new URLSearchParams();
            let allOptionsTranslated = true;

            for (const option of combo.options) {
              const groupSlug = this.getTranslation(
                option.productVariantOption.variantOption.variantGroup
                  .translations,
                locale,
                'slug',
              );
              const optionSlug = this.getTranslation(
                option.productVariantOption.variantOption.translations,
                locale,
                'slug',
              );

              if (groupSlug && optionSlug) {
                queryParams.append(groupSlug, optionSlug);
              } else {
                allOptionsTranslated = false;
                break;
              }
            }

            if (!allOptionsTranslated) continue;

            const url = new URL(baseUrl);
            if (locale === defaultLocale) {
              url.pathname = `/${productSlug}`;
            } else {
              url.pathname = `/${locale}/${productSlug}`;
            }
            url.search = queryParams.toString();

            const fullUrl = url.href;
            const comboKey = `combo-${combo.id}`;
            const comboLastMod = combo.updatedAt || product.updatedAt;

            if (!sitemapEntryMap.has(comboKey)) {
              sitemapEntryMap.set(comboKey, {
                url: fullUrl,
                lastModified: comboLastMod,
                alternates: {
                  languages: {},
                },
              });
            } else {
              const entry = sitemapEntryMap.get(comboKey)!;
              entry.alternates!.languages![locale] = fullUrl;
              if (comboLastMod > entry.lastModified!) {
                entry.lastModified = comboLastMod;
              }
            }
          }
        } else {
          const productSlug = this.getTranslation(
            product.translations,
            locale,
            'slug',
          );
          if (!productSlug) continue;

          const url = new URL(baseUrl);
          if (locale === defaultLocale) {
            url.pathname = `/${productSlug}`;
          } else {
            url.pathname = `/${locale}/${productSlug}`;
          }

          const fullUrl = url.href;
          const productKey = `product-${product.id}`;

          if (!sitemapEntryMap.has(productKey)) {
            sitemapEntryMap.set(productKey, {
              url: fullUrl,
              lastModified: product.updatedAt,
              alternates: {
                languages: {},
              },
            });
          } else {
            const entry = sitemapEntryMap.get(productKey)!;
            entry.alternates!.languages![locale] = fullUrl;
            if (product.updatedAt > entry.lastModified!) {
              entry.lastModified = product.updatedAt;
            }
          }
        }
      }
    }

    //category
    for (const locale of allLocales) {
      for (const category of categories) {
        const categorySlug = this.getTranslation(
          category.translations,
          locale,
          'slug',
        );
        if (!categorySlug) continue;

        const url = new URL(baseUrl);
        if (locale === defaultLocale) {
          url.pathname = `/categories/${categorySlug}`;
        } else {
          url.pathname = `/${locale}/categories/${categorySlug}`;
        }

        const fullUrl = url.href;
        const categoryKey = `category-${category.id}`; // Benzersiz key

        if (!sitemapEntryMap.has(categoryKey)) {
          sitemapEntryMap.set(categoryKey, {
            url: fullUrl,
            lastModified: category.updatedAt,
            alternates: {
              languages: {},
            },
          });
        } else {
          const entry = sitemapEntryMap.get(categoryKey)!;
          entry.alternates!.languages![locale] = fullUrl;
          if (category.updatedAt > entry.lastModified!) {
            entry.lastModified = category.updatedAt;
          }
        }
      }
    }

    //brand
    for (const locale of allLocales) {
      for (const brand of brands) {
        const brandSlug = this.getTranslation(
          brand.translations,
          locale,
          'slug',
        );
        if (!brandSlug) continue;

        const url = new URL(baseUrl);
        if (locale === defaultLocale) {
          url.pathname = `/brands/${brandSlug}`;
        } else {
          url.pathname = `/${locale}/brands/${brandSlug}`;
        }

        const fullUrl = url.href;
        const brandKey = `brand-${brand.id}`;

        if (!sitemapEntryMap.has(brandKey)) {
          sitemapEntryMap.set(brandKey, {
            url: fullUrl,
            lastModified: brand.updatedAt,
            alternates: {
              languages: {},
            },
          });
        } else {
          const entry = sitemapEntryMap.get(brandKey)!;
          entry.alternates!.languages![locale] = fullUrl;
          if (brand.updatedAt > entry.lastModified!) {
            entry.lastModified = brand.updatedAt;
          }
        }
      }
    }

    let finalSitemap = Array.from(sitemapEntryMap.values());

    for (const entry of finalSitemap) {
      const entryUrl = new URL(entry.url);
      const firstSegment = entryUrl.pathname.split('/')[1];
      const entryLocale = allLocales.includes(firstSegment)
        ? firstSegment
        : defaultLocale;

      if (
        entry.alternates?.languages &&
        entry.alternates.languages[entryLocale]
      ) {
        delete entry.alternates.languages[entryLocale];
      }
    }

    finalSitemap = finalSitemap.map((entry) => {
      entry.url = entry.url.replace(/&/g, '&amp;');

      if (entry.alternates?.languages) {
        for (const lang in entry.alternates.languages) {
          entry.alternates.languages[lang] = entry.alternates.languages[
            lang
          ].replace(/&/g, '&amp;');
        }
      }
      return entry;
    });

    return finalSitemap;
  }
}
