import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@repo/database';
import {
  $Enums,
  CategoryGridComponentReturnData,
  CategoryPageChildCategories,
  CategoryPageDataType,
  CategoryPageParentCategories,
  CategoryPageProductsReturnType,
  CategoryPageProductsType,
  GetCategoryPageReturnType,
  ProductCardProps,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';
interface GetProductsParams {
  categoryId: string;
  page: number;
  sort: number;
  otherParams: Record<string, string | string[]>;
  locale?: $Enums.Locale;
  currency?: $Enums.Currency;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}
  private transformProductsToProductCards(
    products: CategoryPageProductsType[],
    locale: $Enums.Locale = 'TR',
    currency: $Enums.Currency = 'TRY',
  ): ProductCardProps[] {
    const productCards: ProductCardProps[] = [];

    products.forEach((product) => {
      // Product temel bilgileri
      const productTranslation =
        product.translations?.find((t) => t.locale === locale) ||
        product.translations?.[0];
      const productSlug = productTranslation?.slug || '';

      // Product assets
      const firstAsset = product.assets?.[0] || null;
      const secondAsset = product.assets?.[1] || null;

      // Product prices (sadece TRY currency olanları filtrele)
      const productPrices =
        product.prices?.filter((price) => price.currency === currency) || null;

      if (!product.isVariant) {
        // Basit ürün - tek kart
        productCards.push({
          productId: product.id,
          productTranslation: product.translations || [],
          firstAsset,
          secondAsset,
          productPrices,
          productBrand: product.brand,
          productStock: product.stock,
          productSlug,
        });
      } else {
        // Variant ürün - her kombinasyon için ayrı kart
        product.variantGroups?.forEach((variantGroup) => {
          variantGroup.options?.forEach((option) => {
            option.combinations?.forEach((combinationWrapper) => {
              const combination = combinationWrapper.combination;

              // Variant prices (sadece TRY currency olanları filtrele)
              const variantPrices =
                combination.prices?.filter(
                  (price) => price.currency === currency,
                ) || [];

              // Variant assets
              const variantFirstAsset = combination.assets?.[0] || null;
              const variantSecondAsset = combination.assets?.[1] || null;

              // Variant slug oluştur
              const variantGroupTranslation =
                variantGroup.variantGroup?.translations?.find(
                  (t) => t.locale === locale,
                ) || variantGroup.variantGroup?.translations?.[0];
              const variantOptionTranslation =
                option.variantOption?.translations?.find(
                  (t) => t.locale === locale,
                ) || option.variantOption?.translations?.[0];

              const variantGroupSlug = variantGroupTranslation?.slug || '';
              const variantOptionSlug = variantOptionTranslation?.slug || '';

              // Search params olarak variant slug oluştur
              const variantSlug =
                variantGroupSlug && variantOptionSlug
                  ? `${productSlug}?${variantGroupSlug}=${variantOptionSlug}`
                  : productSlug;

              productCards.push({
                productId: product.id,
                productTranslation: product.translations || [],
                firstAsset,
                secondAsset,
                productPrices,
                productBrand: product.brand,
                productStock: product.stock,
                productSlug,
                combinationInfo: {
                  variantId: combination.id,
                  variantSlug,
                  variantPrices,
                  variantGroups: [
                    {
                      variantGroupId: variantGroup.variantGroupId,
                      translations:
                        variantGroup.variantGroup?.translations || [],
                      type: variantGroup.variantGroup?.type || 'LIST',
                      options: option.variantOption,
                    },
                  ],
                  variantFirstAsset,
                  variantSecondAsset,
                  variantTranslations: combination.translations || [],
                },
              });
            });
          });
        });
      }
    });

    return productCards;
  }
  private async getCategoryParents(
    categoryId: string,
    level: number = 1,
  ): Promise<CategoryPageParentCategories[]> {
    const parents: CategoryPageParentCategories[] = [];
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { parentCategoryId: true },
    });

    if (!category?.parentCategoryId) {
      return parents;
    }

    const parentCategory = await this.prisma.category.findUnique({
      where: { id: category.parentCategoryId },
      include: {
        translations: {
          select: {
            locale: true,
            name: true,
            slug: true,
          },
        },
        image: {
          select: {
            url: true,
            type: true,
          },
        },
      },
    });

    if (parentCategory) {
      const grandParent = await this.prisma.category.findUnique({
        where: { id: parentCategory.id },
        select: { parentCategoryId: true },
      });

      parents.push({
        parentId: grandParent?.parentCategoryId || null,
        id: parentCategory.id,
        level,
        translations: parentCategory.translations,
        image: parentCategory.image,
      });

      const grandParents = await this.getCategoryParents(
        parentCategory.id,
        level + 1,
      );
      parents.push(...grandParents);
    }

    return parents;
  }

  private async getCategoryChildren(
    categoryId: string,
    level: number = 1,
  ): Promise<CategoryPageChildCategories[]> {
    const children: CategoryPageChildCategories[] = [];

    const directChildren = await this.prisma.category.findMany({
      where: {
        parentCategoryId: categoryId,
        products: {
          some: {
            product: {
              OR: [
                {
                  active: true,
                  isVariant: false,
                  stock: {
                    gt: 0,
                  },
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
      include: {
        translations: {
          select: {
            locale: true,
            name: true,
            slug: true,
          },
        },
        image: {
          select: {
            url: true,
            type: true,
          },
        },
      },
    });

    // Her child için
    for (const child of directChildren) {
      // Child'ı listeye ekle
      children.push({
        parentId: categoryId,
        id: child.id,
        level,
        translations: child.translations,
        image: child.image,
      });

      // Bu child'ın child'larını recursive olarak al
      const grandChildren = await this.getCategoryChildren(child.id, level + 1);
      children.push(...grandChildren);
    }

    return children;
  }

  private async buildCategoryPageData(
    categoryId: string,
  ): Promise<CategoryPageDataType> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        translations: {
          select: {
            locale: true,
            metaTitle: true,
            metaDescription: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        image: {
          select: {
            url: true,
            type: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    const parentCategories = await this.getCategoryParents(categoryId);

    const childCategories = await this.getCategoryChildren(categoryId);

    const sortedParents = parentCategories.sort((a, b) => b.level - a.level);
    const sortedChildren = childCategories.sort((a, b) => a.level - b.level);

    return {
      id: category.id,
      level: 0, // Ana kategori level 0
      translations: category.translations,
      image: category.image,
      parentCategories: sortedParents,
      childCategories: sortedChildren,
    };
  }

  async getCategoryPage(
    slug: string,
    allParams: Record<string, string | string[]>,
  ): Promise<GetCategoryPageReturnType> {
    const category = await this.prisma.category.findFirst({
      where: {
        translations: {
          some: {
            slug: {
              contains: slug,
              mode: 'insensitive',
            },
          },
        },
        products: {
          some: {
            product: {
              OR: [
                {
                  active: true,
                  isVariant: false,
                  stock: {
                    gt: 0,
                  },
                },
                {
                  isVariant: true,
                  active: true,
                  variantCombinations: {
                    some: {
                      active: true,
                      stock: {
                        gt: 0,
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    const data = await this.buildCategoryPageData(category.id);
    const categoryWithChildrenIds = [
      category.id,
      ...data.childCategories.map((child) => child.id),
    ];

    const brands = await this.prisma.brand.findMany({
      where: {
        products: {
          some: {
            AND: [
              {
                OR: [
                  {
                    active: true,
                    stock: {
                      gt: 0,
                    },
                    isVariant: false,
                  },
                  {
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
                ],
              },
              {
                categories: {
                  some: {
                    categoryId: { in: categoryWithChildrenIds },
                  },
                },
              },
            ],
          },
        },
      },
      select: {
        id: true,
        translations: true,
        image: {
          select: {
            url: true,
            type: true,
          },
        },
      },
    });

    const dynamicVariantGroups = await this.prisma.variantGroup.findMany({
      where: {
        productVariantGroups: {
          some: {
            product: {
              categories: {
                some: {
                  categoryId: { in: categoryWithChildrenIds },
                },
              },
              active: true,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        type: true,
        translations: true,
        options: {
          where: {
            productVariantOptions: {
              some: {
                productVariantGroup: {
                  product: {
                    OR: [
                      {
                        active: true,
                        isVariant: false,
                        stock: {
                          gt: 0,
                        },
                      },
                      {
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
                    ],
                    categories: {
                      some: {
                        categoryId: { in: categoryWithChildrenIds },
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
            id: true,
            asset: {
              select: {
                url: true,
                type: true,
              },
            },
            hexValue: true,
            translations: true,
          },
        },
      },
    });

    return { variantGroups: dynamicVariantGroups, category: data, brands };
  }

  async getProductsByCategory({
    categoryId,
    otherParams,
    page,
    sort,
    currency,
    locale,
  }: GetProductsParams): Promise<CategoryPageProductsReturnType> {
    const take = 12;
    const skip = (page - 1) * take;
    const { brands, ...other } = otherParams;
    const paramsVariantGroups = Object.keys(other);
    const paramsVariantGroupsValues = Object.values(other);

    const childCategories = await this.getCategoryChildren(categoryId);
    const categoryIds = [
      categoryId,
      ...childCategories.map((child) => child.id),
    ];

    const productWhere: Prisma.ProductWhereInput = {
      categories: {
        some: {
          categoryId: { in: categoryIds },
        },
      },
      ...(brands && brands.length > 0
        ? {
            brand: {
              translations: {
                some: {
                  OR: [
                    {
                      slug: {
                        in: Array.isArray(brands) ? brands : [brands],
                        mode: 'insensitive',
                      },
                    },
                    {
                      name: {
                        in: Array.isArray(brands) ? brands : [brands],
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
            },
          }
        : {}),
      ...(paramsVariantGroups && paramsVariantGroups.length > 0
        ? {
            variantGroups: {
              some: {
                variantGroup: {
                  translations: {
                    some: {
                      OR: [
                        {
                          slug: {
                            in: paramsVariantGroups,
                            mode: 'insensitive',
                          },
                        },
                        {
                          name: {
                            in: paramsVariantGroups,
                            mode: 'insensitive',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          }
        : {}),
      ...(paramsVariantGroupsValues && paramsVariantGroups.length > 0
        ? {
            variantCombinations: {
              some: {
                options: {
                  some: {
                    productVariantOption: {
                      variantOption: {
                        translations: {
                          some: {
                            OR: [
                              {
                                slug: {
                                  in: paramsVariantGroupsValues.flatMap(
                                    (value) =>
                                      Array.isArray(value) ? value : [value],
                                  ),
                                  mode: 'insensitive',
                                },
                              },
                              {
                                name: {
                                  in: paramsVariantGroupsValues.flatMap(
                                    (value) =>
                                      Array.isArray(value) ? value : [value],
                                  ),
                                  mode: 'insensitive',
                                },
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          }
        : {}),
      OR: [
        {
          active: true,
          isVariant: false,
          stock: {
            gt: 0,
          },
        },
        {
          active: true,
          isVariant: true,
          variantCombinations: {
            some: {
              stock: {
                gt: 0,
              },
              active: true,
            },
          },
        },
      ],
    };

    const products = await this.prisma.product.findMany({
      where: { ...productWhere },
      take,
      skip,
      include: {
        translations: true,
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
        taxonomyCategory: true,
        prices: true,
        brand: {
          select: {
            translations: true,
            image: {
              select: {
                url: true,
                type: true,
              },
            },
          },
        },
        variantGroups: {
          orderBy: {
            order: 'asc',
          },
          take: 1,
          include: {
            options: {
              orderBy: {
                order: 'asc',
              },
              include: {
                combinations: {
                  take: 1,
                  orderBy: {
                    productVariantOption: {
                      order: 'asc',
                    },
                  },
                  include: {
                    combination: {
                      include: {
                        prices: true,
                        translations: true,
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
                      },
                    },
                  },
                },
                variantOption: {
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
            },
            variantGroup: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });

    const totalProducts = await this.prisma.product.count({
      where: { ...productWhere },
    });
    const transformedProducts = this.transformProductsToProductCards(products);

    return {
      products: transformedProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / take),
        totalProducts,
        hasNextPage: page < Math.ceil(totalProducts / take),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getCategoriesByIds(
    categoryIds: string[],
  ): Promise<CategoryGridComponentReturnData[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        imageId: { not: null },
        id: { in: categoryIds },
        products: {
          some: {
            product: {
              OR: [
                {
                  active: true,
                  isVariant: false,
                  stock: {
                    gt: 0,
                  },
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
      select: {
        image: {
          select: {
            url: true,
            type: true,
          },
        },
        translations: true,
        id: true,
      },
    });
    return categories;
  }
}
