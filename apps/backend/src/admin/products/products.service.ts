import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Locale, Prisma, User } from '@repo/database';
import {
  AdminProductTableProductData,
  adminProductTableQuery,
  BaseProductZodType,
  BulkActionZodType,
  CombinatedVariantsZodType,
  commonProductAssetsQuery,
  Pagination,
  ProductPriceZodType,
  ProductTranslationZodType,
  VariantGroupTranslationZodType,
  VariantGroupZodType,
  variantOptionsQuery,
  VariantOptionTranslationZodType,
  VariantProductZodType,
  variantsOptionsOrderByQuery,
} from '@repo/types';
import { ProductBulkActionService } from 'src/common/services/product-bulk-action.service';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly minioService: MinioService,
    private readonly productBulkActionService: ProductBulkActionService,
  ) {}
  private logger = new Logger(ProductsService.name);

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

  async getProductById(id: string): Promise<{
    success: boolean;
    product?: VariantProductZodType | BaseProductZodType;
  }> {
    try {
      const product = await this.prismaService.product.findUnique({
        where: { id },
        include: {
          translations: true,
          variantGroups: {
            orderBy: { order: 'asc' },
            select: {
              renderVisibleType: true,
              variantGroup: {
                select: {
                  id: true,
                  translations: true,
                  type: true,
                },
              },
              options: {
                orderBy: { order: 'asc' },
                select: {
                  variantOption: {
                    select: {
                      id: true,
                      asset: {
                        select: {
                          url: true,
                          type: true,
                        },
                      },
                      translations: true,
                      hexValue: true,
                    },
                  },
                },
              },
            },
          },
          tags: true,
          assets: commonProductAssetsQuery,
          categories: {
            orderBy: { createdAt: 'asc' },
            select: {
              categoryId: true,
            },
          },
          variants: {
            select: {
              active: true,
              assets: commonProductAssetsQuery,
              prices: true,
              translations: true,
              barcode: true,
              sku: true,
              stock: true,
              id: true,
              isDefault: true,
              options: {
                orderBy: variantsOptionsOrderByQuery,
                select: variantOptionsQuery,
              },
            },
          },
        },
      });

      return {
        success: true,
        product:
          product.variants.length > 0 && product.variants[0]?.isDefault
            ? ({
                active: product.active,
                barcode: product.variants[0].barcode,
                brandId: product.brandId || null,
                prices: product.variants[0].prices.map((price) => ({
                  currency: price.currency,
                  price: price.price,
                  buyedPrice: price.buyedPrice,
                  discountPrice: price.discountedPrice,
                })),
                existingImages: product.assets.map((asset) => ({
                  order: asset.order,
                  type: asset.asset.type,
                  url: asset.asset.url,
                })) as BaseProductZodType['existingImages'],
                sku: product.variants[0].sku,
                stock: product.variants[0].stock,
                translations: product.translations.map((t) => ({
                  name: t.name,
                  description: t.description,
                  slug: t.slug,
                  locale: t.locale,
                  metaDescription: t.metaDescription,
                  metaTitle: t.metaTitle,
                })),
                type: product.type,
                uniqueId: product.id,
                categories: product.categories.map((c) => c.categoryId),
                googleTaxonomyId: product.taxonomyCategoryId,
                images: [],
                tagIds: product.tags.map((tag) => tag.productTagId),
              } as BaseProductZodType)
            : ({
                type: product.type,
                active: product.active,
                uniqueId: product.id,
                tagIds: product.tags.map((tag) => tag.productTagId),
                translations: product.translations.map((t) => ({
                  name: t.name,
                  description: t.description,
                  slug: t.slug,
                  locale: t.locale,
                  metaDescription: t.metaDescription,
                  metaTitle: t.metaTitle,
                })),
                brandId: product.brandId || null,
                images: [],
                existingImages: product.assets.map((asset) => ({
                  order: asset.order,
                  type: asset.asset.type,
                  url: asset.asset.url,
                })) as VariantProductZodType['existingImages'],
                categories: product.categories.map((c) => c.categoryId),
                googleTaxonomyId: product.taxonomyCategoryId,
                combinatedVariants: product.variants.map((variant) => ({
                  active: variant.active,
                  barcode: variant.barcode,
                  prices: variant.prices.map((price) => ({
                    currency: price.currency,
                    price: price.price,
                    buyedPrice: price.buyedPrice,
                    discountPrice: price.discountedPrice,
                  })),
                  images: [],
                  existingImages: variant.assets.map((asset) => ({
                    order: asset.order,
                    type: asset.asset.type,
                    url: asset.asset.url,
                  })) as VariantProductZodType['combinatedVariants'][number]['existingImages'],
                  sku: variant.sku,
                  stock: variant.stock,
                  translations: variant.translations.map((t) => ({
                    locale: t.locale,
                    description: t.description,
                    metaDescription: t.metaDescription,
                    metaTitle: t.metaTitle,
                  })) as VariantProductZodType['combinatedVariants'][number]['translations'],
                  variantIds: variant.options.map((option) => ({
                    variantGroupId:
                      option.productVariantOption.variantOption.variantGroup.id,
                    variantOptionId:
                      option.productVariantOption.variantOption.id,
                  })) as VariantProductZodType['combinatedVariants'][number]['variantIds'],
                })),
                visibleAllCombinations: product.visibleAllCombinations,
                existingVariants: product.variantGroups.map((vg) => ({
                  uniqueId: vg.variantGroup.id,
                  translations: vg.variantGroup.translations.map((t) => ({
                    locale: t.locale,
                    name: t.name,
                    slug: t.slug,
                  })),
                  type: vg.variantGroup.type,
                  renderVisibleType: vg.renderVisibleType,
                  options: vg.options.map((vo) => ({
                    translations: vo.variantOption.translations.map((t) => ({
                      locale: t.locale,
                      name: t.name,
                      slug: t.slug,
                    })),
                    uniqueId: vo.variantOption.id,
                    existingFile: vo.variantOption.asset
                      ? vo.variantOption.asset.url
                      : (null as VariantProductZodType['existingVariants'][number]['options'][number]['existingFile']),
                    file: null,
                    hexValue: vo.variantOption.hexValue,
                  })) as VariantProductZodType['existingVariants'][number]['options'],
                })),
              } as VariantProductZodType),
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch product by ID');
    }
  }

  async deleteProductAsset(
    url: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const asset = await this.prismaService.asset.findUnique({
        where: { url },
        include: {
          productAsset: {
            select: {
              id: true,
              productId: true,
              variantId: true,
            },
          },
        },
      });

      if (!asset) {
        return {
          success: false,
          message: 'Asset bulunamadı',
        };
      }

      await this.prismaService.$transaction(async (tx) => {
        const affectedProductIds = [
          ...new Set(
            asset.productAsset
              .filter((pa) => pa.productId)
              .map((pa) => pa.productId!),
          ),
        ];

        const affectedVariantIds = [
          ...new Set(
            asset.productAsset
              .filter((pa) => pa.variantId)
              .map((pa) => pa.variantId!),
          ),
        ];

        await tx.productAsset.deleteMany({
          where: { assetId: asset.id },
        });

        await this.reorderProductAssets(tx, affectedProductIds);

        await this.reorderVariantAssets(tx, affectedVariantIds);

        await tx.asset.delete({
          where: { id: asset.id },
        });
      });

      await this.minioService.deleteAsset(url);

      return {
        success: true,
        message: 'Asset başarıyla silindi',
      };
    } catch (error) {
      this.logger.error('Error deleting product asset', error);
      throw new InternalServerErrorException('Failed to delete product asset');
    }
  }

  private async reorderProductAssets(
    tx: Prisma.TransactionClient,
    productIds: string[],
  ) {
    for (const productId of productIds) {
      const assets = await tx.productAsset.findMany({
        where: { productId },
        orderBy: { order: 'asc' },
      });

      for (let i = 0; i < assets.length; i++) {
        await tx.productAsset.update({
          where: { id: assets[i].id },
          data: { order: i },
        });
      }
    }
  }

  private async reorderVariantAssets(
    tx: Prisma.TransactionClient,
    variantIds: string[],
  ) {
    for (const variantId of variantIds) {
      const assets = await tx.productAsset.findMany({
        where: { variantId },
        orderBy: { order: 'asc' },
      });

      for (let i = 0; i < assets.length; i++) {
        await tx.productAsset.update({
          where: { id: assets[i].id },
          data: { order: i },
        });
      }
    }
  }

  async createOrUpdateBasicProduct(data: BaseProductZodType): Promise<{
    success: boolean;
    productId: string;
    message: string;
  }> {
    const { uniqueId, translations, prices, ...productData } = data;

    return await this.prismaService.$transaction(async (tx) => {
      const product = await tx.product.upsert({
        where: { id: uniqueId },
        create: {
          id: uniqueId,
          type: productData.type,
          active: productData.active,
          brandId: productData.brandId,
          taxonomyCategoryId: productData.googleTaxonomyId,
        },
        update: {
          type: productData.type,
          active: productData.active,
          brandId: productData.brandId,
          taxonomyCategoryId: productData.googleTaxonomyId,
        },
      });

      await this.upsertProductTranslations(tx, product.id, translations);

      if (productData.categories?.length) {
        await this.syncProductCategories(
          tx,
          product.id,
          productData.categories,
        );
      }

      if (productData.tagIds?.length) {
        await this.syncProductTags(tx, product.id, productData.tagIds);
      }

      const existingDefaultVariant =
        await tx.productVariantCombination.findFirst({
          where: {
            productId: product.id,
            isDefault: true,
          },
        });

      const defaultVariant = await tx.productVariantCombination.upsert({
        where: { id: existingDefaultVariant?.id ?? '' },
        create: {
          productId: product.id,
          sku: productData.sku,
          barcode: productData.barcode,
          stock: productData.stock,
          active: productData.active,
          isDefault: true,
        },
        update: {
          sku: productData.sku,
          barcode: productData.barcode,
          stock: productData.stock,
          active: productData.active,
        },
      });

      await this.upsertCombinationPrices(tx, defaultVariant.id, prices);

      return {
        success: true,
        productId: product.id,
        message: existingDefaultVariant
          ? 'Ürün başarıyla güncellendi.'
          : 'Ürün başarıyla oluşturuldu.',
      };
    });
  }

  async createProductImage(
    file: Express.Multer.File,
    productId?: string,
    variantId?: string,
  ) {
    if (!productId && !variantId) {
      throw new BadRequestException(
        'Ürün IDsi veya Varyant IDsi sağlanmalıdır.',
      );
    }

    if (productId && variantId) {
      throw new BadRequestException(
        'Sadece Ürün IDsi veya Varyant IDsi sağlanmalıdır, ikisi birden değil.',
      );
    }

    try {
      const { entity, type } = await this.validateAndGetEntityAsset(
        productId,
        variantId,
      );

      const uploadResult = await this.minioService.uploadAsset({
        bucketName: 'products',
        file,
        isNeedOg: true,
        isNeedThumbnail: true,
      });

      if (!uploadResult.success) {
        throw new InternalServerErrorException('Asset yükleme başarısız oldu.');
      }

      const lastOrder = entity.assets.at(-1)?.order ?? -1;
      const newOrder = lastOrder + 1;

      await this.prismaService.asset.create({
        data: {
          url: uploadResult.data.url,
          type: uploadResult.data.type,
          productAsset: {
            create: {
              ...(type === 'product'
                ? { productId: entity.id }
                : { variantId: entity.id }),
              order: newOrder,
            },
          },
        },
      });

      return {
        success: true,
        message:
          type === 'product'
            ? 'Ürün görseli başarıyla oluşturuldu.'
            : 'Varyant görseli başarıyla oluşturuldu.',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error creating product image', error);
      throw new InternalServerErrorException('Failed to create product image');
    }
  }

  private async validateAndGetEntityAsset(
    productId?: string,
    variantId?: string,
  ) {
    if (productId) {
      const product = await this.prismaService.product.findUnique({
        where: { id: productId },
        include: {
          assets: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!product) {
        throw new BadRequestException('Geçersiz ürün IDsi sağlandı.');
      }

      if (product.assets.length >= 10) {
        throw new BadRequestException(
          'Bir ürün en fazla 10 adet görsel içerebilir.',
        );
      }

      return { entity: product, type: 'product' as const };
    }

    const variant =
      await this.prismaService.productVariantCombination.findUnique({
        where: { id: variantId },
        include: {
          assets: {
            orderBy: { order: 'asc' },
          },
        },
      });

    if (!variant) {
      throw new BadRequestException('Geçersiz varyant IDsi sağlandı.');
    }

    if (variant.assets.length >= 10) {
      throw new BadRequestException(
        'Bir varyant en fazla 10 adet görsel içerebilir.',
      );
    }

    return { entity: variant, type: 'variant' as const };
  }

  async createOrUpdateVariantProduct(data: VariantProductZodType) {
    const {
      uniqueId,
      translations,
      existingVariants,
      combinatedVariants,
      ...productData
    } = data;
    return await this.prismaService.$transaction(async (tx) => {
      const product = await tx.product.upsert({
        where: { id: uniqueId },
        create: {
          id: uniqueId,
          type: productData.type,
          active: productData.active,
          brandId: productData.brandId,
          taxonomyCategoryId: productData.googleTaxonomyId,
          visibleAllCombinations: productData.visibleAllCombinations,
          translations: {
            createMany: {
              data: translations.map((t) => ({
                locale: t.locale,
                name: t.name,
                slug: t.slug,
                description: t.description,
                metaTitle: t.metaTitle,
                metaDescription: t.metaDescription,
              })),
            },
          },
        },
        update: {
          type: productData.type,
          active: productData.active,
          visibleAllCombinations: productData.visibleAllCombinations,
          brandId: productData.brandId,
          taxonomyCategoryId: productData.googleTaxonomyId,
        },
      });

      await this.upsertProductTranslations(tx, product.id, translations);

      if (productData.categories?.length) {
        await this.syncProductCategories(
          tx,
          product.id,
          productData.categories,
        );
      }

      if (productData.tagIds?.length) {
        await this.syncProductTags(tx, product.id, productData.tagIds);
      }

      const variantMappings = await this.processVariantGroups(
        tx,
        product.id,
        existingVariants,
      );

      const combinations = await this.processCombinations(
        tx,
        product.id,
        combinatedVariants,
        variantMappings,
      );

      return {
        productId: product.id,
        combinations: combinations.map((c) => ({
          id: c.id,
          sku: c.sku,
        })),
      };
    });
  }

  private async processVariantGroups(
    tx: Prisma.TransactionClient,
    productId: string,
    existingVariants: VariantGroupZodType[],
  ) {
    const variantMappings: Map<
      string,
      { groupId: string; optionMap: Map<string, string> }
    > = new Map();

    for (
      let groupIndex = 0;
      groupIndex < existingVariants.length;
      groupIndex++
    ) {
      const variantGroup = existingVariants[groupIndex];

      const dbVariantGroup = await tx.variantGroup.upsert({
        where: { id: variantGroup.uniqueId },
        create: {
          id: variantGroup.uniqueId,
          type: variantGroup.type,
        },
        update: {
          type: variantGroup.type,
        },
      });

      await this.upsertVariantGroupTranslations(
        tx,
        dbVariantGroup.id,
        variantGroup.translations,
      );

      const productVariantGroup = await tx.productVariantGroup.upsert({
        where: {
          productId_variantGroupId: {
            productId,
            variantGroupId: dbVariantGroup.id,
          },
        },
        create: {
          productId,
          variantGroupId: dbVariantGroup.id,
          order: groupIndex,
          renderVisibleType: variantGroup.renderVisibleType,
        },
        update: {
          order: groupIndex,
          renderVisibleType: variantGroup.renderVisibleType,
        },
      });

      const optionMap = new Map<string, string>();

      for (
        let optionIndex = 0;
        optionIndex < variantGroup.options.length;
        optionIndex++
      ) {
        const option = variantGroup.options[optionIndex];

        const dbVariantOption = await tx.variantOption.upsert({
          where: { id: option.uniqueId },
          create: {
            id: option.uniqueId,
            variantGroupId: dbVariantGroup.id,
            hexValue: option.hexValue,
          },
          update: {
            hexValue: option.hexValue,
          },
        });

        await this.upsertVariantOptionTranslations(
          tx,
          dbVariantOption.id,
          option.translations,
        );

        const productVariantOption = await tx.productVariantOption.upsert({
          where: {
            productVariantGroupId_variantOptionId: {
              productVariantGroupId: productVariantGroup.id,
              variantOptionId: dbVariantOption.id,
            },
          },
          create: {
            productVariantGroupId: productVariantGroup.id,
            variantOptionId: dbVariantOption.id,
            order: optionIndex,
          },
          update: {
            order: optionIndex,
          },
        });

        optionMap.set(option.uniqueId, productVariantOption.id);
      }

      variantMappings.set(variantGroup.uniqueId, {
        groupId: productVariantGroup.id,
        optionMap,
      });
    }

    return variantMappings;
  }

  private async processCombinations(
    tx: Prisma.TransactionClient,
    productId: string,
    combinatedVariants: CombinatedVariantsZodType[],
    variantMappings: Map<
      string,
      { groupId: string; optionMap: Map<string, string> }
    >,
  ) {
    const combinations: { id: string; sku: string | null }[] = [];

    const existingCombinations = await tx.productVariantCombination.findMany({
      where: { productId },
      include: {
        options: {
          select: {
            productVariantOptionId: true,
          },
        },
      },
    });

    for (const combo of combinatedVariants) {
      const comboOptionIds: string[] = [];
      for (const variantId of combo.variantIds) {
        const mapping = variantMappings.get(variantId.variantGroupId);
        if (mapping) {
          const optionId = mapping.optionMap.get(variantId.variantOptionId);
          if (optionId) {
            comboOptionIds.push(optionId);
          }
        }
      }

      const existingCombo = existingCombinations.find((ec) => {
        const existingOptionIds = ec.options
          .map((o) => o.productVariantOptionId)
          .sort();
        const newOptionIds = [...comboOptionIds].sort();

        return (
          existingOptionIds.length === newOptionIds.length &&
          existingOptionIds.every((id, index) => id === newOptionIds[index])
        );
      });

      const combination = existingCombo
        ? await tx.productVariantCombination.update({
            where: { id: existingCombo.id },
            data: {
              sku: combo.sku,
              barcode: combo.barcode,
              stock: combo.stock,
              active: combo.active,
            },
          })
        : await tx.productVariantCombination.create({
            data: {
              productId,
              sku: combo.sku,
              barcode: combo.barcode,
              stock: combo.stock,
              active: combo.active,
            },
          });

      if (!existingCombo) {
        for (const optionId of comboOptionIds) {
          await tx.productVariantCombinationOption.create({
            data: {
              combinationId: combination.id,
              productVariantOptionId: optionId,
            },
          });
        }
      }

      await this.upsertCombinationTranslations(
        tx,
        combination.id,
        combo.translations,
      );

      await this.upsertCombinationPrices(tx, combination.id, combo.prices);

      combinations.push({ id: combination.id, sku: combination.sku });
    }

    return combinations;
  }

  private async upsertProductTranslations(
    tx: Prisma.TransactionClient,
    productId: string,
    translations: ProductTranslationZodType[],
  ) {
    for (const t of translations) {
      await tx.productTranslation.upsert({
        where: {
          locale_productId: {
            locale: t.locale,
            productId,
          },
        },
        create: {
          productId,
          locale: t.locale,
          name: t.name,
          slug: t.slug,
          description: t.description,
          metaTitle: t.metaTitle,
          metaDescription: t.metaDescription,
        },
        update: {
          name: t.name,
          slug: t.slug,
          description: t.description,
          metaTitle: t.metaTitle,
          metaDescription: t.metaDescription,
        },
      });
    }
  }

  private async upsertVariantGroupTranslations(
    tx: Prisma.TransactionClient,
    variantGroupId: string,
    translations: VariantGroupTranslationZodType[],
  ) {
    for (const t of translations) {
      await tx.variantGroupTranslation.upsert({
        where: {
          locale_variantGroupId: {
            locale: t.locale,
            variantGroupId,
          },
        },
        create: {
          variantGroupId,
          locale: t.locale,
          name: t.name,
          slug: t.slug,
        },
        update: {
          name: t.name,
          slug: t.slug,
        },
      });
    }
  }

  private async upsertVariantOptionTranslations(
    tx: Prisma.TransactionClient,
    variantOptionId: string,
    translations: VariantOptionTranslationZodType[],
  ) {
    for (const t of translations) {
      await tx.variantOptionTranslation.upsert({
        where: {
          variantOptionId_locale: {
            locale: t.locale,
            variantOptionId,
          },
        },
        create: {
          variantOptionId,
          locale: t.locale,
          name: t.name,
          slug: t.slug,
        },
        update: {
          name: t.name,
          slug: t.slug,
        },
      });
    }
  }

  private async upsertCombinationTranslations(
    tx: Prisma.TransactionClient,
    combinationId: string,
    translations: {
      locale: Locale;
      description?: string | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
    }[],
  ) {
    for (const t of translations) {
      await tx.productVariantTranslation.upsert({
        where: {
          combinationId_locale: {
            combinationId,
            locale: t.locale,
          },
        },
        create: {
          combinationId,
          locale: t.locale,
          description: t.description,
          metaTitle: t.metaTitle,
          metaDescription: t.metaDescription,
        },
        update: {
          description: t.description,
          metaTitle: t.metaTitle,
          metaDescription: t.metaDescription,
        },
      });
    }
  }

  private async upsertCombinationPrices(
    tx: Prisma.TransactionClient,
    variantId: string,
    prices: ProductPriceZodType[],
  ) {
    for (const p of prices) {
      await tx.productPrice.upsert({
        where: {
          variantId_currency: {
            variantId,
            currency: p.currency,
          },
        },
        create: {
          variantId,
          currency: p.currency,
          price: p.price,
          discountedPrice: p.discountPrice,
          buyedPrice: p.buyedPrice,
        },
        update: {
          price: p.price,
          discountedPrice: p.discountPrice,
          buyedPrice: p.buyedPrice,
        },
      });
    }
  }

  private async syncProductCategories(
    tx: Prisma.TransactionClient,
    productId: string,
    categoryIds: string[],
  ) {
    await tx.productCategory.deleteMany({
      where: { productId },
    });

    if (categoryIds.length > 0) {
      await tx.productCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          productId,
          categoryId,
        })),
      });
    }
  }

  private async syncProductTags(
    tx: Prisma.TransactionClient,
    productId: string,
    tagIds: string[],
  ) {
    await tx.productTagOnProduct.deleteMany({
      where: { productId },
    });

    if (tagIds.length > 0) {
      await tx.productTagOnProduct.createMany({
        data: tagIds.map((productTagId) => ({
          productId,
          productTagId,
        })),
      });
    }
  }

  public async bulkAction(data: BulkActionZodType, user: User) {
    return this.productBulkActionService.performBulkAction(data, user);
  }
}
