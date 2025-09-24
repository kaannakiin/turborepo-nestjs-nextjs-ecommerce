import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database';
import { generateProductCodes, slugify } from '@repo/shared';
import {
  AdminProductTableData,
  BaseProductZodType,
  Cuid2ZodType,
  ModalProductCardForAdmin,
  ProductWithVariants,
  VariantGroupZodType,
  VariantProductZodType,
} from '@repo/types';
import { MinioService, ProcessedAsset } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private minioClient: MinioService,
  ) {}

  async getVariants() {
    return this.prisma.variantGroup.findMany({
      include: {
        translations: true,
        options: {
          include: {
            translations: true,
            asset: true,
          },
        },
      },
    });
  }
  async deleteVariantOptionAsset(url: string) {
    const assetExists = await this.prisma.asset.findUnique({
      where: {
        url,
      },
    });
    if (!assetExists) {
      throw new NotFoundException('Resim bulunamadı');
    }
    const deleteResult = await this.minioClient.deleteAsset(url);
    if (!deleteResult.success) {
      throw new InternalServerErrorException(
        'Resim silinirken bir hata oluştu',
      );
    }
    await this.prisma.asset.delete({
      where: {
        url,
      },
    });
    return { success: true, message: 'Resim başarıyla silindi' };
  }

  async createOrUpdateVariants(data: VariantGroupZodType) {
    try {
      const { options, translations, type, uniqueId } = data;
      const variantGroup = await this.prisma.variantGroup.findUnique({
        where: { id: uniqueId },
      });

      if (variantGroup) {
        return await this.updateVariantGroup(uniqueId, {
          options,
          translations,
          type,
        });
      } else {
        return await this.createVariantGroup({ options, translations, type });
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return this.handlePrismaError(error);
      }
      throw error;
    }
  }

  private async updateVariantGroup(
    uniqueId: string,
    data: {
      options: VariantGroupZodType['options'];
      translations: VariantGroupZodType['translations'];
      type: VariantGroupZodType['type'];
    },
  ) {
    return this.prisma.$transaction(async (prisma) => {
      // Variant group'u güncelle
      await prisma.variantGroup.update({
        where: { id: uniqueId },
        data: { type: data.type },
      });

      // Variant Group translations'ları güncelle
      for (const translation of data.translations) {
        await prisma.variantGroupTranslation.upsert({
          where: {
            locale_variantGroupId: {
              locale: translation.locale,
              variantGroupId: uniqueId,
            },
          },
          create: {
            name: translation.name,
            slug: translation.slug
              ? translation.slug.trim()
              : slugify(translation.name),
            locale: translation.locale as $Enums.Locale,
            variantGroupId: uniqueId,
          },
          update: {
            name: translation.name,
            slug: translation.slug
              ? translation.slug.trim()
              : slugify(translation.name),
          },
        });
      }

      // Variant Options'ları güncelle
      for (const option of data.options) {
        await prisma.variantOption.upsert({
          where: {
            id: option.uniqueId,
          },
          create: {
            id: option.uniqueId,
            hexValue: option.hexValue,
            variantGroupId: uniqueId,
          },
          update: {
            hexValue: option.hexValue,
          },
        });

        // Option translations'ları güncelle
        for (const translation of option.translations) {
          await prisma.variantOptionTranslation.upsert({
            where: {
              variantOptionId_locale: {
                locale: translation.locale,
                variantOptionId: option.uniqueId,
              },
            },
            create: {
              name: translation.name,
              slug: translation.slug
                ? translation.slug.trim()
                : slugify(translation.name),
              locale: translation.locale as $Enums.Locale,
              variantOptionId: option.uniqueId,
            },
            update: {
              name: translation.name,
              slug: translation.slug
                ? translation.slug.trim()
                : slugify(translation.name),
            },
          });
        }
      }

      return {
        success: true,
        message: 'Varyant başarıyla güncellendi',
        id: uniqueId,
      };
    });
  }

  private async createVariantGroup(data: {
    options: VariantGroupZodType['options'];
    translations: VariantGroupZodType['translations'];
    type: VariantGroupZodType['type'];
  }) {
    return this.prisma.$transaction(async (prisma) => {
      // Variant group'u oluştur
      const variantGroup = await prisma.variantGroup.create({
        data: {
          type: data.type,
        },
      });

      // Variant Group translations'ları oluştur
      for (const translation of data.translations) {
        await prisma.variantGroupTranslation.create({
          data: {
            name: translation.name,
            slug: translation.slug
              ? translation.slug.trim()
              : slugify(translation.name),
            locale: translation.locale as $Enums.Locale,
            variantGroupId: variantGroup.id,
          },
        });
      }

      // Variant Options'ları oluştur
      for (const option of data.options) {
        await prisma.variantOption.create({
          data: {
            id: option.uniqueId,
            hexValue: option.hexValue,
            variantGroupId: variantGroup.id,
          },
        });

        // Option translations'ları oluştur
        for (const translation of option.translations) {
          await prisma.variantOptionTranslation.create({
            data: {
              name: translation.name,
              slug: translation.slug
                ? translation.slug.trim()
                : slugify(translation.name),
              locale: translation.locale as $Enums.Locale,
              variantOptionId: option.uniqueId,
            },
          });
        }
      }

      return {
        success: true,
        message: 'Varyant başarıyla oluşturuldu',
        id: variantGroup.id,
      };
    });
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        // Unique constraint violation
        const field = error.meta?.target as string[];
        if (field?.includes('slug')) {
          throw new BadRequestException('Bu slug zaten kullanımda');
        }
        if (field?.includes('locale')) {
          throw new BadRequestException('Bu dil için çeviri zaten mevcut');
        }
        throw new BadRequestException('Bu kayıt zaten mevcut');
      }

      case 'P2025': // Record not found
        throw new NotFoundException('Kayıt bulunamadı');

      case 'P2003': // Foreign key constraint
        throw new BadRequestException('İlişkili kayıt bulunamadı');

      case 'P2014': // Required relation missing
        throw new BadRequestException('Gerekli alan eksik');

      default:
        console.error('Prisma Error:', error);
        throw new InternalServerErrorException('Bir hata oluştu');
    }
  }

  async createOrUpdateVariantProduct(data: VariantProductZodType) {
    try {
      const {
        existingVariants,
        combinatedVariants,
        brandId, // Bu alanları ekledik
        categories, // Bu alanları ekledik
        googleTaxonomyId, // Bu alanları ekledik
        ...productData
      } = data;
      return this.prisma.$transaction(
        async (prisma) => {
          // 1. Product oluştur veya güncelle
          let product = await this.prisma.product.findUnique({
            where: {
              id: productData.uniqueId,
            },
            include: {
              categories: true, // Mevcut kategorileri de getir
            },
          });

          if (!product) {
            product = await prisma.product.create({
              data: {
                type: productData.type,
                isVariant: true,
                // Brand ve taxonomy ilişkilerini kur
                ...(brandId && { brand: { connect: { id: brandId } } }),
                ...(googleTaxonomyId && {
                  taxonomyCategory: { connect: { id: googleTaxonomyId } },
                }),
              },
              include: {
                categories: true,
              },
            });

            // Product translations oluştur
            for (const translation of productData.translations) {
              await prisma.productTranslation.create({
                data: {
                  name: translation.name,
                  slug: translation.slug
                    ? translation.slug.trim()
                    : slugify(translation.name),
                  description: translation.description,
                  metaTitle: translation.metaTitle,
                  metaDescription: translation.metaDescription,
                  locale: translation.locale as $Enums.Locale,
                  productId: product.id,
                },
              });
            }
            if (categories && categories.length > 0) {
              await prisma.productCategory.createMany({
                data: categories.map((categoryId) => ({
                  productId: product.id,
                  categoryId,
                })),
              });
            }
          } else {
            // Mevcut product'ı güncelle
            await prisma.product.update({
              where: { id: product.id },
              data: {
                type: productData.type,
                isVariant: true,
                // Brand ve taxonomy güncellemesi
                ...(brandId
                  ? { brand: { connect: { id: brandId } } }
                  : { brand: { disconnect: true } }),
                ...(googleTaxonomyId
                  ? { taxonomyCategory: { connect: { id: googleTaxonomyId } } }
                  : { taxonomyCategory: { disconnect: true } }),
              },
            });
            // Product translations güncelle
            for (const translation of productData.translations) {
              await prisma.productTranslation.upsert({
                where: {
                  locale_productId: {
                    locale: translation.locale,
                    productId: product.id,
                  },
                },
                create: {
                  name: translation.name,
                  slug: translation.slug
                    ? translation.slug.trim()
                    : slugify(translation.name),
                  description: translation.description,
                  metaTitle: translation.metaTitle,
                  metaDescription: translation.metaDescription,
                  locale: translation.locale as $Enums.Locale,
                  productId: product.id,
                },
                update: {
                  name: translation.name,
                  slug: translation.slug
                    ? translation.slug.trim()
                    : slugify(translation.name),
                  description: translation.description,
                  metaTitle: translation.metaTitle,
                  metaDescription: translation.metaDescription,
                },
              });
            }
          }

          if (categories !== undefined) {
            if (categories && categories.length > 0) {
              const existingCategories = await prisma.productCategory.findMany({
                where: { productId: product.id },
                select: { categoryId: true },
              });

              const existingCategoryIds = existingCategories.map(
                (cat) => cat.categoryId,
              );

              const categoriesToDelete = existingCategoryIds.filter(
                (existingId) => !categories.includes(existingId),
              );

              const categoriesToAdd = categories.filter(
                (newId) => !existingCategoryIds.includes(newId),
              );

              // Silinmesi gereken kategorileri sil
              if (categoriesToDelete.length > 0) {
                await prisma.productCategory.deleteMany({
                  where: {
                    productId: product.id,
                    categoryId: { in: categoriesToDelete },
                  },
                });
              }

              // Yeni kategorileri ekle
              if (categoriesToAdd.length > 0) {
                await prisma.productCategory.createMany({
                  data: categoriesToAdd.map((categoryId) => ({
                    productId: product.id,
                    categoryId,
                  })),
                });
              }
            } else {
              // Kategoriler boşsa, tüm kategorileri sil
              await prisma.productCategory.deleteMany({
                where: { productId: product.id },
              });
            }
          }

          // 2. Mevcut kombinasyonları ve resimlerini al (SİLMEDEN ÖNCE)
          const existingCombinationsWithAssets =
            await prisma.productVariantCombination.findMany({
              where: { productId: product.id },
              include: {
                assets: {
                  include: {
                    asset: true,
                  },
                },
                options: {
                  include: {
                    productVariantOption: {
                      include: {
                        productVariantGroup: true,
                      },
                    },
                  },
                },
              },
            });

          // 3. AKILLI ProductVariantGroup güncellemesi
          const currentProductVariantGroups =
            await prisma.productVariantGroup.findMany({
              where: { productId: product.id },
              include: {
                options: {
                  include: {
                    variantOption: true,
                  },
                },
              },
            });

          // Gelen variant group ID'lerini topla
          const incomingVariantGroupIds = existingVariants.map(
            (v) => v.uniqueId,
          );

          // Silinmesi gereken ProductVariantGroup'ları bul
          const groupsToDelete = currentProductVariantGroups.filter(
            (pvg) => !incomingVariantGroupIds.includes(pvg.variantGroupId),
          );

          // Silinecek grupları ve ilişkili verileri temizle
          for (const groupToDelete of groupsToDelete) {
            // İlişkili combination option'ları sil
            for (const option of groupToDelete.options) {
              await prisma.productVariantCombinationOption.deleteMany({
                where: { productVariantOptionId: option.id },
              });
            }

            // ProductVariantOption'ları sil
            await prisma.productVariantOption.deleteMany({
              where: { productVariantGroupId: groupToDelete.id },
            });

            // ProductVariantGroup'u sil
            await prisma.productVariantGroup.delete({
              where: { id: groupToDelete.id },
            });
          }

          // 4. Variant Group'ları işle
          for (
            let groupIndex = 0;
            groupIndex < existingVariants.length;
            groupIndex++
          ) {
            const variantGroup = existingVariants[groupIndex];

            // Global Variant Group var mı kontrol et
            let dbVariantGroup = await prisma.variantGroup.findUnique({
              where: { id: variantGroup.uniqueId },
              include: {
                options: {
                  include: {
                    translations: true,
                  },
                },
              },
            });

            if (!dbVariantGroup) {
              // Yeni global variant group oluştur
              dbVariantGroup = await prisma.variantGroup.create({
                data: {
                  id: variantGroup.uniqueId,
                  type: variantGroup.type,
                },
                include: {
                  options: {
                    include: {
                      translations: true,
                    },
                  },
                },
              });

              // Variant Group translations oluştur
              for (const translation of variantGroup.translations) {
                await prisma.variantGroupTranslation.create({
                  data: {
                    name: translation.name,
                    slug: translation.slug
                      ? translation.slug.trim()
                      : slugify(translation.name),
                    locale: translation.locale as $Enums.Locale,
                    variantGroupId: dbVariantGroup.id,
                  },
                });
              }

              // Variant Options oluştur
              for (const option of variantGroup.options) {
                await prisma.variantOption.create({
                  data: {
                    id: option.uniqueId,
                    hexValue: option.hexValue,
                    variantGroupId: dbVariantGroup.id,
                  },
                });

                // Option translations oluştur
                for (const translation of option.translations) {
                  await prisma.variantOptionTranslation.create({
                    data: {
                      name: translation.name,
                      slug: translation.slug
                        ? translation.slug.trim()
                        : slugify(translation.name),
                      locale: translation.locale as $Enums.Locale,
                      variantOptionId: option.uniqueId,
                    },
                  });
                }
              }
            } else {
              // Mevcut global variant group'u güncelle
              await prisma.variantGroup.update({
                where: { id: variantGroup.uniqueId },
                data: { type: variantGroup.type },
              });

              // Variant Group translations güncelle
              for (const translation of variantGroup.translations) {
                await prisma.variantGroupTranslation.upsert({
                  where: {
                    locale_variantGroupId: {
                      locale: translation.locale,
                      variantGroupId: variantGroup.uniqueId,
                    },
                  },
                  create: {
                    name: translation.name,
                    slug: translation.slug
                      ? translation.slug.trim()
                      : slugify(translation.name),
                    locale: translation.locale as $Enums.Locale,
                    variantGroupId: variantGroup.uniqueId,
                  },
                  update: {
                    name: translation.name,
                    slug: translation.slug
                      ? translation.slug.trim()
                      : slugify(translation.name),
                  },
                });
              }

              // Mevcut option ID'lerini topla
              const existingOptionIds = dbVariantGroup.options.map((o) => o.id);

              // Sadece YENİ option'ları ekle
              for (const option of variantGroup.options) {
                if (!existingOptionIds.includes(option.uniqueId)) {
                  // Yeni option oluştur
                  await prisma.variantOption.create({
                    data: {
                      id: option.uniqueId,
                      hexValue: option.hexValue,
                      variantGroupId: variantGroup.uniqueId,
                    },
                  });

                  // Option translations oluştur
                  for (const translation of option.translations) {
                    await prisma.variantOptionTranslation.create({
                      data: {
                        name: translation.name,
                        slug: translation.slug
                          ? translation.slug.trim()
                          : slugify(translation.name),
                        locale: translation.locale as $Enums.Locale,
                        variantOptionId: option.uniqueId,
                      },
                    });
                  }
                } else {
                  // Mevcut option'ı güncelle
                  await prisma.variantOption.update({
                    where: { id: option.uniqueId },
                    data: { hexValue: option.hexValue },
                  });

                  // Option translations güncelle
                  for (const translation of option.translations) {
                    await prisma.variantOptionTranslation.upsert({
                      where: {
                        variantOptionId_locale: {
                          locale: translation.locale,
                          variantOptionId: option.uniqueId,
                        },
                      },
                      create: {
                        name: translation.name,
                        slug: translation.slug
                          ? translation.slug.trim()
                          : slugify(translation.name),
                        locale: translation.locale as $Enums.Locale,
                        variantOptionId: option.uniqueId,
                      },
                      update: {
                        name: translation.name,
                        slug: translation.slug
                          ? translation.slug.trim()
                          : slugify(translation.name),
                      },
                    });
                  }
                }
              }
            }

            // ProductVariantGroup oluştur/güncelle
            let productVariantGroup =
              await prisma.productVariantGroup.findUnique({
                where: {
                  productId_variantGroupId: {
                    productId: product.id,
                    variantGroupId: variantGroup.uniqueId,
                  },
                },
              });

            if (!productVariantGroup) {
              productVariantGroup = await prisma.productVariantGroup.create({
                data: {
                  productId: product.id,
                  variantGroupId: variantGroup.uniqueId,
                  order: groupIndex,
                },
              });
            } else {
              // Order'ı güncelle
              await prisma.productVariantGroup.update({
                where: { id: productVariantGroup.id },
                data: { order: groupIndex },
              });
            }

            // ProductVariantOption'ları güncelle
            const currentOptions = await prisma.productVariantOption.findMany({
              where: { productVariantGroupId: productVariantGroup.id },
            });

            const incomingOptionIds = variantGroup.options.map(
              (o) => o.uniqueId,
            );

            // Silinmesi gereken option'ları bul ve sil
            const optionsToDelete = currentOptions.filter(
              (o) => !incomingOptionIds.includes(o.variantOptionId),
            );

            for (const optionToDelete of optionsToDelete) {
              // İlişkili combination option'ları sil
              await prisma.productVariantCombinationOption.deleteMany({
                where: { productVariantOptionId: optionToDelete.id },
              });

              // ProductVariantOption'ı sil
              await prisma.productVariantOption.delete({
                where: { id: optionToDelete.id },
              });
            }

            // Yeni option'ları ekle ve mevcut olanları güncelle
            for (
              let optionIndex = 0;
              optionIndex < variantGroup.options.length;
              optionIndex++
            ) {
              const option = variantGroup.options[optionIndex];

              const existingProductOption = currentOptions.find(
                (o) => o.variantOptionId === option.uniqueId,
              );

              if (!existingProductOption) {
                // Yeni option ekle
                await prisma.productVariantOption.create({
                  data: {
                    productVariantGroupId: productVariantGroup.id,
                    variantOptionId: option.uniqueId,
                    order: optionIndex,
                  },
                });
              } else {
                await prisma.productVariantOption.update({
                  where: { id: existingProductOption.id },
                  data: { order: optionIndex },
                });
              }
            }
          }

          // 5. AKILLI Kombinasyon güncellemesi - RESİMLERİ KORU
          const finalCombinations: { id: string; sku: string | null }[] = [];

          for (const combination of combinatedVariants) {
            // Kombinasyonu variantIds'e göre eşleştir
            const existingCombination = existingCombinationsWithAssets.find(
              (ec) => {
                // Önce SKU eşleşmesi kontrol et
                if (ec.sku === combination.sku && combination.sku) {
                  return true;
                }

                // VariantIds eşleşmesi kontrolü
                const existingVariantIds = ec.options.map((o) => ({
                  variantGroupId:
                    o.productVariantOption.productVariantGroup.variantGroupId,
                  variantOptionId: o.productVariantOption.variantOptionId,
                }));

                // Aynı variant kombinasyonu mu kontrol et
                if (
                  existingVariantIds.length === combination.variantIds.length
                ) {
                  const isMatch = combination.variantIds.every((vid) =>
                    existingVariantIds.some(
                      (evid) =>
                        evid.variantGroupId === vid.variantGroupId &&
                        evid.variantOptionId === vid.variantOptionId,
                    ),
                  );
                  return isMatch;
                }
                return false;
              },
            );

            let productCombination;

            if (existingCombination) {
              // Mevcut kombinasyonu güncelle - RESİMLER KORUNUR
              productCombination =
                await prisma.productVariantCombination.update({
                  where: { id: existingCombination.id },
                  data: {
                    sku: combination.sku,
                    barcode: combination.barcode,
                    stock: combination.stock,
                    active: combination.active,
                  },
                });
            } else {
              // Yeni kombinasyon oluştur
              productCombination =
                await prisma.productVariantCombination.create({
                  data: {
                    productId: product.id,
                    sku: combination.sku,
                    barcode: combination.barcode,
                    stock: combination.stock,
                    active: combination.active,
                  },
                });
            }

            // Prices güncelle
            for (const price of combination.prices) {
              await prisma.productPrice.upsert({
                where: {
                  combinationId_currency: {
                    combinationId: productCombination.id,
                    currency: price.currency,
                  },
                },
                create: {
                  currency: price.currency,
                  price: price.price,
                  buyedPrice: price.buyedPrice,
                  discountedPrice: price.discountPrice,
                  combinationId: productCombination.id,
                },
                update: {
                  price: price.price,
                  buyedPrice: price.buyedPrice,
                  discountedPrice: price.discountPrice,
                },
              });
            }

            // Translations güncelle
            for (const translation of combination.translations) {
              await prisma.productVariantTranslation.upsert({
                where: {
                  combinationId_locale: {
                    combinationId: productCombination.id,
                    locale: translation.locale,
                  },
                },
                create: {
                  combinationId: productCombination.id,
                  locale: translation.locale as $Enums.Locale,
                  description: translation.description,
                  metaTitle: translation.metaTitle,
                  metaDescription: translation.metaDescription,
                },
                update: {
                  description: translation.description,
                  metaTitle: translation.metaTitle,
                  metaDescription: translation.metaDescription,
                },
              });
            }

            // Combination option'ları güncelle
            await prisma.productVariantCombinationOption.deleteMany({
              where: { combinationId: productCombination.id },
            });

            for (const variantId of combination.variantIds) {
              const productVariantGroup =
                await prisma.productVariantGroup.findUnique({
                  where: {
                    productId_variantGroupId: {
                      productId: product.id,
                      variantGroupId: variantId.variantGroupId,
                    },
                  },
                });

              if (!productVariantGroup) {
                throw new BadRequestException(
                  `Variant group ${variantId.variantGroupId} bu ürün için bulunamadı`,
                );
              }

              const productVariantOption =
                await prisma.productVariantOption.findUnique({
                  where: {
                    productVariantGroupId_variantOptionId: {
                      productVariantGroupId: productVariantGroup.id,
                      variantOptionId: variantId.variantOptionId,
                    },
                  },
                });

              if (!productVariantOption) {
                throw new BadRequestException(
                  `Variant option ${variantId.variantOptionId} bu ürün için bulunamadı`,
                );
              }

              await prisma.productVariantCombinationOption.create({
                data: {
                  combinationId: productCombination.id,
                  productVariantOptionId: productVariantOption.id,
                },
              });
            }

            finalCombinations.push({
              id: productCombination.id,
              sku: productCombination.sku,
            });
          }

          // 6. Kullanılmayan kombinasyonları temizle
          const usedCombinationIds = finalCombinations.map((fc) => fc.id);
          const orphanedCombinations = existingCombinationsWithAssets.filter(
            (ec) => !usedCombinationIds.includes(ec.id),
          );

          for (const orphanedCombo of orphanedCombinations) {
            // Önce ilişkili verileri sil
            await prisma.productVariantCombinationOption.deleteMany({
              where: { combinationId: orphanedCombo.id },
            });
            await prisma.productPrice.deleteMany({
              where: { combinationId: orphanedCombo.id },
            });
            await prisma.productVariantTranslation.deleteMany({
              where: { combinationId: orphanedCombo.id },
            });
            await prisma.productAsset.deleteMany({
              where: { combinationId: orphanedCombo.id },
            });
            await prisma.productVariantCombination.delete({
              where: { id: orphanedCombo.id },
            });
          }

          return {
            success: true,
            message: 'Varyant ürün başarıyla işlendi',
            data: {
              productId: product.id,
              combinations: finalCombinations,
            },
          };
        },
        { timeout: 100000 },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return this.handlePrismaError(error);
      }
      console.error('Variant Product Error:', error);
      throw new InternalServerErrorException(
        'Varyant ürün işlenirken bir hata oluştu',
      );
    }
  }

  async getProductVariant(id: string): Promise<VariantProductZodType | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        assets: {
          orderBy: {
            order: 'asc',
          },
          select: {
            asset: { select: { url: true, type: true } },
            order: true,
          },
        },
        translations: {
          select: {
            locale: true,
            description: true,
            metaTitle: true,
            metaDescription: true,
            name: true,
            slug: true,
          },
        },
        variantGroups: {
          orderBy: {
            order: 'asc',
          },
          select: {
            order: true,
            variantGroup: {
              select: {
                id: true,
                type: true,
                options: {
                  where: {
                    productVariantOptions: {
                      some: {
                        productVariantGroup: {
                          productId: id,
                        },
                      },
                    },
                  },
                  select: {
                    id: true,
                    hexValue: true,
                    asset: {
                      select: {
                        url: true,
                      },
                    },
                    translations: {
                      select: {
                        locale: true,
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
                translations: {
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
        variantCombinations: {
          select: {
            active: true,
            barcode: true,
            options: {
              select: {
                productVariantOption: {
                  select: {
                    variantOptionId: true,
                    productVariantGroup: {
                      select: {
                        variantGroupId: true,
                      },
                    },
                  },
                },
              },
            },
            prices: {
              select: {
                buyedPrice: true,
                currency: true,
                price: true,
                discountedPrice: true,
              },
            },
            sku: true,
            stock: true,
            translations: {
              select: {
                locale: true,
                description: true,
                metaDescription: true,
                metaTitle: true,
              },
            },
            assets: {
              orderBy: {
                order: 'asc',
              },
              select: {
                order: true,
                asset: {
                  select: { url: true, type: true },
                },
              },
            },
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
    if (!product) {
      return null;
    }
    const data = {
      uniqueId: product.id,
      type: product.type,
      images: [],
      brandId: product.brandId || null,
      googleTaxonomyId: product.taxonomyCategoryId || null,
      categories: product.categories.map((c) => c.category.id) || [],
      existingImages: product.assets.map((a) => {
        return {
          type: a.asset.type,
          url: a.asset.url,
        };
      }) as VariantProductZodType['existingImages'],
      translations: product.translations.map((t) => ({
        locale: t.locale,
        name: t.name,
        slug: t.slug,
        description: t.description,
        metaDescription: t.metaDescription,
        metaTitle: t.metaTitle,
      })),
      existingVariants: product.variantGroups.map((vg) => {
        return {
          options: vg.variantGroup.options.map((option) => ({
            translations: option.translations.map((t) => ({
              locale: t.locale,
              name: t.name,
              slug: t.slug,
            })) as VariantProductZodType['existingVariants'][number]['options'][number]['translations'],
            uniqueId: option.id,
            existingFile: option.asset?.url || null,
            file: null,
            hexValue: option.hexValue,
          })) as VariantProductZodType['existingVariants'][number]['options'],
          translations: vg.variantGroup.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
            slug: t.slug,
          })) as VariantProductZodType['existingVariants'][number]['translations'],
          type: vg.variantGroup.type,
          uniqueId: vg.variantGroup.id,
        };
      }),

      combinatedVariants: product.variantCombinations.map((vc) => {
        return {
          active: vc.active,
          barcode: vc.barcode,
          prices: vc.prices.map((p) => ({
            buyedPrice: p.buyedPrice,
            currency: p.currency,
            price: p.price,
            discountPrice: p.discountedPrice,
          })) as VariantProductZodType['combinatedVariants'][number]['prices'],
          sku: vc.sku,
          stock: vc.stock || 0,
          translations: vc.translations.map((t) => ({
            locale: t.locale,
            description: t.description,
            metaDescription: t.metaDescription,
            metaTitle: t.metaTitle,
          })) as VariantProductZodType['combinatedVariants'][number]['translations'],
          existingImages: vc.assets.map((a) => ({
            order: a.order,
            type: a.asset.type,
            url: a.asset.url,
          })),
          variantIds: vc.options.map((o) => ({
            variantGroupId:
              o.productVariantOption.productVariantGroup.variantGroupId,
            variantOptionId: o.productVariantOption.variantOptionId,
          })) as VariantProductZodType['combinatedVariants'][number]['variantIds'],
        };
      }) as VariantProductZodType['combinatedVariants'],
    } as VariantProductZodType;
    return data;
  }

  async uploadProductsFile(
    files: Array<Express.Multer.File>,
    productId: string,
  ) {
    if (!productId || productId.trim() === '') {
      throw new BadRequestException('Geçersiz ürün IDsi');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('Yüklenecek dosya bulunamadı');
    }

    const dbProduct = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        assets: {
          select: { order: true },
          orderBy: { order: 'desc' },
          take: 1,
        },
      },
    });

    if (!dbProduct) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const uploadPromises = files.map((file) =>
      this.minioClient.uploadAsset({
        bucketName: 'products',
        file,
        isNeedOg: true,
        isNeedThumbnail: true,
      }),
    );

    const uploadResults = await Promise.all(uploadPromises);

    const successfulUploads = uploadResults.filter(
      (result): result is { success: true; data: ProcessedAsset } =>
        result.success && result.data != null,
    );

    if (successfulUploads.length === 0) {
      throw new InternalServerErrorException('Dosyaların hiçbiri yüklenemedi.');
    }

    const lastOrder = dbProduct.assets[0]?.order ?? -1;

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const [index, upload] of successfulUploads.entries()) {
          const newAsset = await tx.asset.create({
            data: {
              url: upload.data.url,
              type: upload.data.type,
            },
          });

          await tx.productAsset.create({
            data: {
              order: lastOrder + 1 + index,
              assetId: newAsset.id,
              productId: productId,
            },
          });
        }
      });
    } catch (error) {
      console.error('Veritabanı transaction hatası:', error);
      throw new InternalServerErrorException(
        'Dosya bilgileri veritabanına kaydedilemedi.',
      );
    }

    return {
      message: `${successfulUploads.length} dosya başarıyla yüklendi.`,
      uploadedCount: successfulUploads.length,
    };
  }

  async deleteProductImage(imageUrl: string) {
    if (!imageUrl) {
      throw new BadRequestException('Görsel URLsi belirtilmedi.');
    }

    // 1. URL'den ilgili Asset kaydını bul.
    const asset = await this.prisma.asset.findUnique({
      where: { url: imageUrl },
    });

    if (!asset) {
      throw new NotFoundException(
        'Veritabanında bu URL ile eşleşen görsel bulunamadı.',
      );
    }

    // 2. Asset'in bağlı olduğu ProductAsset'i bul. ProductId ve order'ı buradan alacağız.
    const productAssetToDelete = await this.prisma.productAsset.findFirst({
      where: { assetId: asset.id },
    });

    // Eğer asset bir ürüne bağlı değilse (örn. bir varyanta bağlıysa) veya bulunamazsa
    if (!productAssetToDelete || !productAssetToDelete.productId) {
      // Burada asset'i direkt silip işlemi bitirebiliriz veya hata dönebiliriz.
      // Şimdilik sadece MinIO'dan silelim ve veritabanı kaydını da silelim.
      await this.minioClient.deleteAsset(imageUrl);

      // Eğer productAssetToDelete varsa, silelim
      if (productAssetToDelete) {
        await this.prisma.productAsset.delete({
          where: { id: productAssetToDelete.id },
        });
      } else {
        // Doğrudan Asset'i sil
        await this.prisma.asset.delete({
          where: { url: imageUrl },
        });
      }

      return {
        success: true,
        message: 'Ürüne bağlı olmayan görsel başarıyla silindi.',
      };
    }

    const { productId } = productAssetToDelete;

    try {
      // 3. MinIO'dan dosyayı silmeyi dene. Başarısız olursa işlemi durdur.
      const deleteImageOnMinio = await this.minioClient.deleteAsset(imageUrl);
      if (!deleteImageOnMinio.success) {
        throw new InternalServerErrorException(
          deleteImageOnMinio.message || 'Görsel MinIO üzerinden silinemedi.',
        );
      }

      // 4. Veritabanı işlemlerini tek bir transaction içinde yap (silme ve yeniden sıralama).
      await this.prisma.$transaction(async (tx) => {
        // a. İlgili ProductAsset'i sil.
        // Şemanızdaki `onDelete: Cascade` sayesinde bu işlem aynı zamanda ilişkili `Asset` kaydını da silecektir.
        await tx.productAsset.delete({
          where: { id: productAssetToDelete.id },
        });

        // b. Ürüne ait kalan tüm asset'leri mevcut sıralarına göre çek.
        const remainingAssets = await tx.productAsset.findMany({
          where: { productId: productId },
          orderBy: { order: 'asc' },
        });

        // c. Kalan asset'leri 0'dan başlayarak yeniden sırala.
        // Sadece sırası değişmesi gerekenleri güncellemek için bir dizi promise oluştur.
        const updatePromises = remainingAssets.map((asset, index) => {
          if (asset.order !== index) {
            return tx.productAsset.update({
              where: { id: asset.id },
              data: { order: index },
            });
          }
          return Promise.resolve(); // Sırası doğruysa bir işlem yapma.
        });

        // d. Tüm güncelleme işlemlerini paralel olarak çalıştır.
        await Promise.all(updatePromises);
      });

      return {
        success: true,
        message: 'Görsel başarıyla silindi ve yeniden sıralandı.',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Görsel silinirken bir hata oluştu.',
      );
    }
  }

  async uploadVariantImage(
    files: Array<Express.Multer.File>,
    combinationId: string,
  ) {
    if (!combinationId || combinationId.trim() === '') {
      throw new BadRequestException('Geçersiz varyant kombinasyon IDsi');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('Yüklenecek dosya bulunamadı');
    }

    // Kombinasyonun var olup olmadığını ve en son resmin sırasını kontrol et
    const combination = await this.prisma.productVariantCombination.findUnique({
      where: { id: combinationId },
      include: {
        assets: {
          select: { order: true },
          orderBy: { order: 'desc' },
          take: 1,
        },
      },
    });

    if (!combination) {
      throw new NotFoundException('Varyant kombinasyonu bulunamadı');
    }

    // Dosyaları paralel olarak MinIO'ya yükle
    const uploadPromises = files.map((file) =>
      this.minioClient.uploadAsset({
        bucketName: 'products', // veya 'variants' gibi ayrı bir bucket
        file,
        isNeedOg: true,
        isNeedThumbnail: true,
      }),
    );

    const uploadResults = await Promise.all(uploadPromises);

    const successfulUploads = uploadResults.filter(
      (result): result is { success: true; data: ProcessedAsset } =>
        result.success && result.data != null,
    );

    if (successfulUploads.length === 0) {
      throw new InternalServerErrorException('Dosyaların hiçbiri yüklenemedi.');
    }

    // Son 'order' değerini al, yoksa -1 ile başla
    const lastOrder = combination.assets[0]?.order ?? -1;

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const [index, upload] of successfulUploads.entries()) {
          // 1. Yeni Asset'i oluştur
          const newAsset = await tx.asset.create({
            data: {
              url: upload.data.url,
              type: upload.data.type,
            },
          });

          // 2. ProductAsset ile Asset'i kombinasyona bağla
          await tx.productAsset.create({
            data: {
              order: lastOrder + 1 + index,
              assetId: newAsset.id,
              combinationId: combinationId, // Anahtar fark: productId yerine combinationId
            },
          });
        }
      });
    } catch (error) {
      console.error('Veritabanı transaction hatası:', error);
      throw new InternalServerErrorException(
        'Dosya bilgileri veritabanına kaydedilemedi.',
      );
    }

    return {
      message: `${successfulUploads.length} dosya başarıyla yüklendi.`,
      uploadedCount: successfulUploads.length,
    };
  }

  async deleteVariantImage(imageUrl: string) {
    if (!imageUrl) {
      throw new BadRequestException('Görsel URLsi belirtilmedi.');
    }

    const asset = await this.prisma.asset.findUnique({
      where: { url: imageUrl },
    });

    if (!asset) {
      throw new NotFoundException(
        'Veritabanında bu URL ile eşleşen görsel bulunamadı.',
      );
    }

    const productAssetToDelete = await this.prisma.productAsset.findFirst({
      where: { assetId: asset.id },
    });

    // Asset'in bir varyant kombinasyonuna bağlı olup olmadığını kontrol et
    if (!productAssetToDelete || !productAssetToDelete.combinationId) {
      throw new BadRequestException(
        'Bu görsel bir varyant kombinasyonuna ait değil.',
      );
    }

    const { combinationId } = productAssetToDelete;

    try {
      // 1. Önce MinIO'dan dosyayı sil
      const deleteImageOnMinio = await this.minioClient.deleteAsset(imageUrl);
      if (!deleteImageOnMinio.success) {
        throw new InternalServerErrorException(
          deleteImageOnMinio.message || 'Görsel MinIO üzerinden silinemedi.',
        );
      }

      // 2. Veritabanı işlemlerini transaction içinde yap
      await this.prisma.$transaction(async (tx) => {
        // a. İlgili ProductAsset ve ilişkili Asset'i sil
        await tx.productAsset.delete({
          where: { id: productAssetToDelete.id },
        });

        // b. Kombinasyona ait kalan tüm asset'leri sıralı çek
        const remainingAssets = await tx.productAsset.findMany({
          where: { combinationId: combinationId }, // Anahtar fark: productId yerine combinationId
          orderBy: { order: 'asc' },
        });

        // c. Kalan asset'leri yeniden sırala
        const updatePromises = remainingAssets.map((asset, index) => {
          if (asset.order !== index) {
            return tx.productAsset.update({
              where: { id: asset.id },
              data: { order: index },
            });
          }
          return Promise.resolve();
        });

        await Promise.all(updatePromises);
      });

      return {
        success: true,
        message: 'Varyant görseli başarıyla silindi ve yeniden sıralandı.',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Varyant görseli silinirken bir hata oluştu.',
      );
    }
  }

  async createOrUpdateBasicProduct(data: Omit<BaseProductZodType, 'images'>) {
    const {
      uniqueId,
      prices,
      translations,
      type,
      brandId,
      categories,
      googleTaxonomyId,
      sku,
      barcode,
      stock,
      active,
    } = data;

    try {
      // Mevcut ürünü kontrol et
      const existingProduct = await this.prisma.product.findUnique({
        where: { id: uniqueId },
        include: {
          variantCombinations: true,
          variantGroups: true,
          translations: true,
          prices: true,
          categories: true,
        },
      });

      // Eğer ürün varsa ve varyantlı ürünse hata ver
      if (
        existingProduct &&
        (existingProduct.variantCombinations.length > 0 ||
          existingProduct.variantGroups.length > 0 ||
          existingProduct.isVariant === true)
      ) {
        throw new BadRequestException(
          'Bu ürün zaten varyantlı ürün olarak işlenmiş, temel ürün olarak güncellenemez.',
        );
      }

      // SKU ve Barcode benzersizlik kontrolü
      let finalSku = sku;
      let finalBarcode = barcode;

      if (!finalSku || !finalBarcode) {
        const productName =
          translations?.find((t) => t.locale === 'TR')?.name ||
          translations?.[0]?.name ||
          'Ürün';

        const generatedCodes = generateProductCodes(productName);

        if (!finalSku) finalSku = generatedCodes.sku;
        if (!finalBarcode) finalBarcode = generatedCodes.barcode;

        // Oluşturulan kodların benzersizliğini kontrol et
        const [skuCheck, barcodeCheck] = await Promise.all([
          this.prisma.product.findFirst({
            where: {
              sku: finalSku,
              id: { not: uniqueId },
            },
          }),
          this.prisma.product.findFirst({
            where: {
              barcode: finalBarcode,
              id: { not: uniqueId },
            },
          }),
        ]);

        if (skuCheck) {
          throw new BadRequestException(
            `Oluşturulan SKU (${finalSku}) zaten kullanılıyor. Lütfen manuel bir SKU girin veya ürün adını değiştirin.`,
          );
        }

        if (barcodeCheck) {
          throw new BadRequestException(
            `Oluşturulan barcode (${finalBarcode}) zaten kullanılıyor. Lütfen manuel bir barcode girin veya ürün adını değiştirin.`,
          );
        }
      } else {
        // Manuel girilen SKU ve barcode'ların benzersizliğini kontrol et
        const [skuCheck, barcodeCheck] = await Promise.all([
          this.prisma.product.findFirst({
            where: {
              sku: finalSku,
              id: { not: uniqueId },
            },
          }),
          this.prisma.product.findFirst({
            where: {
              barcode: finalBarcode,
              id: { not: uniqueId },
            },
          }),
        ]);

        if (skuCheck) {
          throw new BadRequestException(
            `Bu SKU (${finalSku}) zaten kullanılıyor. Lütfen farklı bir SKU girin.`,
          );
        }

        if (barcodeCheck) {
          throw new BadRequestException(
            `Bu barcode (${finalBarcode}) zaten kullanılıyor. Lütfen farklı bir barcode girin.`,
          );
        }
      }

      return await this.prisma.$transaction(async (tx) => {
        // Ana ürünü upsert et
        const product = await tx.product.upsert({
          where: { id: uniqueId },
          update: {
            type,
            isVariant: false,
            sku: finalSku,
            barcode: finalBarcode,
            stock: stock || 0,
            active: active !== undefined ? active : true,
            ...(brandId
              ? { brand: { connect: { id: brandId } } }
              : { brand: { disconnect: true } }),
            ...(googleTaxonomyId
              ? { taxonomyCategory: { connect: { id: googleTaxonomyId } } }
              : { taxonomyCategory: { disconnect: true } }),
          },
          create: {
            id: uniqueId,
            type,
            isVariant: false,
            sku: finalSku,
            barcode: finalBarcode,
            stock: stock || 0,
            active: active !== undefined ? active : true,
            ...(brandId && { brand: { connect: { id: brandId } } }),
            ...(googleTaxonomyId && {
              taxonomyCategory: { connect: { id: googleTaxonomyId } },
            }),
          },
        });

        // Çevirileri upsert et
        if (translations && translations.length > 0) {
          const translationPromises = translations.map((translation) =>
            tx.productTranslation.upsert({
              where: {
                locale_productId: {
                  locale: translation.locale,
                  productId: uniqueId,
                },
              },
              update: {
                name: translation.name,
                slug: translation.slug,
                description: translation.description,
                metaTitle: translation.metaTitle,
                metaDescription: translation.metaDescription,
              },
              create: {
                ...translation,
                productId: uniqueId,
              },
            }),
          );

          await Promise.all(translationPromises);
        }

        // Fiyatları upsert et
        if (prices && prices.length > 0) {
          const pricePromises = prices.map((price) =>
            tx.productPrice.upsert({
              where: {
                productId_currency: {
                  productId: uniqueId,
                  currency: price.currency,
                },
              },
              update: {
                price: price.price,
                buyedPrice: price.buyedPrice || null,
                discountedPrice: price.discountPrice || null,
              },
              create: {
                currency: price.currency,
                price: price.price,
                buyedPrice: price.buyedPrice || null,
                discountedPrice: price.discountPrice || null,
                productId: uniqueId,
              },
            }),
          );

          await Promise.all(pricePromises);
        }

        // Kategorileri yönet
        if (categories !== undefined) {
          if (categories && categories.length > 0) {
            const existingCategories = await tx.productCategory.findMany({
              where: { productId: uniqueId },
              select: { categoryId: true },
            });

            const existingCategoryIds = existingCategories.map(
              (cat) => cat.categoryId,
            );

            const categoriesToDelete = existingCategoryIds.filter(
              (existingId) => !categories.includes(existingId),
            );

            const categoriesToAdd = categories.filter(
              (newId) => !existingCategoryIds.includes(newId),
            );

            if (categoriesToDelete.length > 0) {
              await tx.productCategory.deleteMany({
                where: {
                  productId: uniqueId,
                  categoryId: { in: categoriesToDelete },
                },
              });
            }

            if (categoriesToAdd.length > 0) {
              await tx.productCategory.createMany({
                data: categoriesToAdd.map((categoryId) => ({
                  productId: uniqueId,
                  categoryId,
                })),
              });
            }
          } else {
            await tx.productCategory.deleteMany({
              where: { productId: uniqueId },
            });
          }
        }

        return tx.product.findUnique({
          where: { id: uniqueId },
          include: {
            translations: true,
            prices: true,
            categories: {
              include: {
                category: {
                  include: {
                    translations: true,
                  },
                },
              },
            },
            brand: {
              include: {
                translations: true,
              },
            },
            taxonomyCategory: true,
          },
        });
      });
    } catch (error) {
      // Prisma constraint hataları için özel mesajlar
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        if (target?.includes('sku')) {
          throw new BadRequestException('Bu SKU zaten kullanılıyor.');
        }
        if (target?.includes('barcode')) {
          throw new BadRequestException('Bu barcode zaten kullanılıyor.');
        }
        if (target?.includes('slug')) {
          throw new BadRequestException('Bu slug zaten kullanılıyor.');
        }
        if (target?.includes('productId_currency')) {
          throw new BadRequestException(
            'Aynı para birimi için birden fazla fiyat girilemez.',
          );
        }
      }

      if (error.code === 'P2025') {
        throw new BadRequestException('İlişkili kayıt bulunamadı.');
      }

      // BadRequestException'ları olduğu gibi fırlat
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Diğer hatalar için genel mesaj
      console.error('createOrUpdateBasicProduct error:', error);
      throw new InternalServerErrorException(
        'Ürün işlemi sırasında bir hata oluştu.',
      );
    }
  }

  async getBasicProduct(id: Cuid2ZodType): Promise<BaseProductZodType> {
    const product = await this.prisma.product.findUnique({
      where: { id, isVariant: false },
      include: {
        assets: {
          orderBy: { order: 'asc' },
          select: {
            asset: { select: { url: true, type: true } },
          },
        },
        prices: true,
        categories: {
          select: {
            categoryId: true,
          },
        },
        translations: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }
    return {
      active: product.active,
      prices: product.prices.map((p) => ({
        currency: p.currency,
        price: p.price,
        buyedPrice: p.buyedPrice || undefined,
        discountPrice: p.discountedPrice || undefined,
      })),
      barcode: product.barcode || undefined,
      sku: product.sku || undefined,
      translations: product.translations.map((t) => ({
        locale: t.locale,
        name: t.name,
        slug: t.slug,
        description: t.description,
        metaDescription: t.metaDescription,
        metaTitle: t.metaTitle,
      })),
      type: product.type,
      brandId: product.brandId || undefined,
      categories: product.categories.map((c) => c.categoryId),
      googleTaxonomyId: product.taxonomyCategoryId || undefined,
      uniqueId: product.id,
      images: [],
      existingImages: product.assets.map((a) => {
        return {
          type: a.asset.type,
          url: a.asset.url,
        };
      }) as BaseProductZodType['existingImages'],
      stock: product.stock,
    };
  }

  async getProducts(
    search?: string,
    page: number = 1,
  ): Promise<{
    products: AdminProductTableData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(search && {
        OR: [
          {
            isVariant: false,
            translations: {
              some: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { slug: { contains: slugify(search), mode: 'insensitive' } },
                ],
              },
            },
          },
          {
            isVariant: true,
            translations: {
              some: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { slug: { contains: slugify(search), mode: 'insensitive' } },
                ],
              },
            },
          },
          {
            isVariant: false,
            OR: [
              { sku: { contains: search, mode: 'insensitive' } },
              { barcode: { contains: search, mode: 'insensitive' } },
            ],
          },
          {
            isVariant: true,
            variantCombinations: {
              some: {
                OR: [
                  { sku: { contains: search, mode: 'insensitive' } },
                  { barcode: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          },
          // Marka araması
          {
            brand: {
              translations: {
                some: {
                  name: { contains: search, mode: 'insensitive' },
                },
              },
            },
          },
        ],
      }),
    };

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              variantCombinations: true,
            },
          },
          assets: {
            where: {
              asset: { type: 'IMAGE' },
            },
            take: 1,
            orderBy: { order: 'asc' },
            select: {
              asset: {
                select: { url: true, type: true },
              },
            },
          },
          translations: {
            where: { locale: 'TR' },
            select: {
              name: true,
            },
          },
          prices: {
            where: { currency: 'TRY' },
            select: {
              price: true,
              discountedPrice: true,
            },
          },
          variantCombinations: {
            select: {
              stock: true,
              assets: {
                where: {
                  asset: { type: 'IMAGE' },
                },
                take: 1,
                orderBy: { order: 'asc' },
                select: {
                  asset: {
                    select: { url: true, type: true },
                  },
                },
              },
              prices: {
                where: { currency: 'TRY' },
                select: {
                  price: true,
                  discountedPrice: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: products.map((product): AdminProductTableData => {
        // Görsel öncelik sırası
        const mainImage = product.assets[0]?.asset;
        const variantImage = product.variantCombinations[0]?.assets[0]?.asset;
        const finalImage = mainImage || variantImage;

        // Fiyat hesaplama
        let priceDisplay: string;
        let stockDisplay: string;

        if (product.isVariant && product.variantCombinations.length > 0) {
          // Varyantlı ürün - min/max hesapla
          const allPrices = product.variantCombinations
            .flatMap((vc) => vc.prices)
            .map((p) => p.discountedPrice || p.price)
            .filter((p) => p > 0);

          const allStocks = product.variantCombinations
            .map((vc) => vc.stock)
            .filter((s) => s >= 0);

          if (allPrices.length > 0) {
            const minPrice = Math.min(...allPrices);
            const maxPrice = Math.max(...allPrices);

            if (minPrice === maxPrice) {
              priceDisplay = `₺${minPrice.toLocaleString('tr-TR')}`;
            } else {
              priceDisplay = `₺${minPrice.toLocaleString('tr-TR')} - ₺${maxPrice.toLocaleString('tr-TR')}`;
            }
          } else {
            priceDisplay = '₺0';
          }

          if (allStocks.length > 0) {
            const minStock = Math.min(...allStocks);
            const maxStock = Math.max(...allStocks);

            if (minStock === maxStock) {
              stockDisplay = minStock.toString();
            } else {
              stockDisplay = `${minStock} - ${maxStock}`;
            }
          } else {
            stockDisplay = '0';
          }
        } else {
          // Basit ürün
          const price = product.prices[0];
          const finalPrice = price?.discountedPrice || price?.price || 0;
          priceDisplay = `₺${finalPrice.toLocaleString('tr-TR')}`;
          stockDisplay = product.stock.toString();
        }

        return {
          ...product,
          priceDisplay,
          stockDisplay,
          finalImage: finalImage?.url || null,
          finalImageType: finalImage?.type || null,
        };
      }),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getProductsAndVariants(): Promise<ProductWithVariants[]> {
    const products = await this.prisma.product.findMany({
      where: { isVariant: false },
      select: {
        id: true,
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
      },
    });

    const variants = await this.prisma.product.findMany({
      where: {
        isVariant: true,
      },
      select: {
        id: true,
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
        variantCombinations: {
          select: {
            id: true,
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
                        variantGroup: {
                          select: {
                            translations: {
                              select: {
                                name: true,
                                locale: true,
                              },
                            },
                          },
                        },
                        translations: {
                          select: {
                            locale: true,
                            name: true,
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

    const formattedProducts: ProductWithVariants[] = products.map((p) => ({
      productId: p.id,
      isVariant: false,
      productName:
        p.translations.find((t) => t.locale === 'TR')?.name ||
        p.translations[0]?.name ||
        'İsimsiz Ürün',
    }));

    const formattedVariants: ProductWithVariants[] = variants.map((v) => ({
      productId: v.id,
      isVariant: true,
      productName:
        v.translations.find((t) => t.locale === 'TR')?.name ||
        v.translations[0]?.name ||
        'İsimsiz Ürün',
      variantInfo: v.variantCombinations.map((vc) => ({
        variantId: vc.id,
        variants: vc.options.map((option) => ({
          groupName:
            option.productVariantOption.variantOption.variantGroup.translations.find(
              (t) => t.locale === 'TR',
            )?.name ||
            option.productVariantOption.variantOption.variantGroup
              .translations[0]?.name ||
            'İsimsiz Grup',
          optionName:
            option.productVariantOption.variantOption.translations.find(
              (t) => t.locale === 'TR',
            )?.name ||
            option.productVariantOption.variantOption.translations[0]?.name ||
            'İsimsiz Seçenek',
        })),
      })),
    }));

    return [...formattedProducts, ...formattedVariants];
  }

  async getProductsForSelection(): Promise<{
    products: { id: string; name: string }[];
  }> {
    const products = await this.prisma.product.findMany({
      include: {
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
      },
    });
    return {
      products: products.map((p) => ({
        id: p.id,
        name:
          p.translations.find((t) => t.locale === 'TR')?.name ||
          p.translations[0]?.name ||
          'İsimsiz Ürün',
      })),
    };
  }

  async uploadVariantOptionAsset(file: Express.Multer.File, uniqueId: string) {
    const variantOption = await this.prisma.variantOption.findUnique({
      where: {
        id: uniqueId,
      },
      select: {
        asset: {
          select: {
            url: true,
          },
        },
      },
    });
    if (!variantOption) {
      throw new NotFoundException('Varyant seçeneği bulunamadı');
    }
    if (variantOption.asset) {
      // Mevcut görseli sil
      await this.minioClient.deleteAsset(variantOption.asset.url);
      await this.prisma.asset.delete({
        where: { url: variantOption.asset.url },
      });
    }
    const uploadResult = await this.minioClient.uploadAsset({
      bucketName: 'products',
      file,
      isNeedOg: false,
      isNeedThumbnail: true,
    });
    if (!uploadResult.success || !uploadResult.data) {
      throw new InternalServerErrorException('Dosya yüklenemedi');
    }
    const newAsset = await this.prisma.asset.create({
      data: {
        url: uploadResult.data.url,
        type: uploadResult.data.type,
      },
    });
    await this.prisma.variantOption.update({
      where: { id: uniqueId },
      data: {
        assetId: newAsset.id,
      },
    });
    return {
      success: true,
      message: 'Varyant seçeneği görseli başarıyla yüklendi',
      asset: {
        url: newAsset.url,
        type: newAsset.type,
      },
    };
  }

  convertToModalProductCard(
    products: Prisma.ProductGetPayload<{
      include: {
        translations: true;
        assets: {
          take: 1;
          orderBy: { order: 'asc' };
          select: { asset: { select: { url: true; type: true } } };
        };
        brand: {
          select: { translations: true };
        };
        prices: true;
        variantCombinations: {
          orderBy: { createdAt: 'asc' };
          where: { active: true; stock: { gt: 0 } };
          include: {
            assets: {
              take: 1;
              orderBy: { order: 'asc' };
              select: { asset: { select: { url: true; type: true } } };
            };
            translations: true;
            prices: true;
            options: {
              orderBy: {
                productVariantOption: {
                  productVariantGroup: { order: 'asc' };
                };
              };
              select: {
                productVariantOption: {
                  select: {
                    variantOption: {
                      select: {
                        id: true;
                        hexValue: true;
                        asset: { select: { url: true; type: true } };
                        translations: true;
                      };
                    };
                    productVariantGroup: {
                      select: {
                        variantGroup: {
                          include: { translations: true };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    }>[],
  ): ModalProductCardForAdmin[] {
    const cards: ModalProductCardForAdmin[] = [];

    products.forEach((product) => {
      const brandTranslation =
        product.brand?.translations.find((t) => t.locale === 'TR') ||
        product.brand?.translations[0];

      const productTranslation =
        product.translations.find((t) => t.locale === 'TR') ||
        product.translations[0];

      const brandName = brandTranslation ? brandTranslation.name : null;
      const productName = productTranslation
        ? productTranslation.name
        : 'İsimsiz';
      const productSlug = productTranslation ? productTranslation.slug : '';

      if (product.isVariant && product.variantCombinations.length > 0) {
        // Variantlı ürün: Her variantCombination'ı ayrı ürün olarak ekle
        product.variantCombinations.forEach((combination) => {
          // Variant için fiyat (önce combination'dan, yoksa product'tan)
          const combinationPrice =
            combination.prices.find((p) => p.currency === 'TRY') ||
            combination.prices[0];
          const productPrice =
            product.prices.find((p) => p.currency === 'TRY') ||
            product.prices[0];
          const price = combinationPrice || productPrice;

          // Variant için resim (önce combination'dan, yoksa product'tan)
          const combinationImage = combination.assets[0]?.asset || null;
          const productImage = product.assets[0]?.asset || null;
          const image = combinationImage || productImage;

          // Variant options'ları düzenle
          const variants = combination.options.map((option) => {
            const variantOptionTranslation =
              option.productVariantOption.variantOption.translations.find(
                (t) => t.locale === 'TR',
              ) || option.productVariantOption.variantOption.translations[0];

            const variantGroupTranslation =
              option.productVariantOption.productVariantGroup.variantGroup.translations.find(
                (t) => t.locale === 'TR',
              ) ||
              option.productVariantOption.productVariantGroup.variantGroup
                .translations[0];

            return {
              productVariantGroupId:
                option.productVariantOption.productVariantGroup.variantGroup.id,
              productVariantGroupName: variantGroupTranslation?.name || '',
              productVariantGroupSlug: variantGroupTranslation?.slug || '',
              productVariantOptionId:
                option.productVariantOption.variantOption.id,
              productVariantOptionName: variantOptionTranslation?.name || '',
              productVariantOptionSlug: variantOptionTranslation?.slug || '',
              hexValue: option.productVariantOption.variantOption.hexValue,
              asset: option.productVariantOption.variantOption.asset,
            };
          });

          cards.push({
            productId: product.id,
            variantId: combination.id,
            productName,
            productSlug,
            brandName,
            isVariant: true,
            price: price?.price || 0,
            discountedPrice: price?.discountedPrice || null,
            currency: price?.currency || 'TRY',
            image,
            variants,
          });
        });
      } else {
        // Normal ürün (variantsız)
        const productPrice =
          product.prices.find((p) => p.currency === 'TRY') || product.prices[0];
        const productImage = product.assets[0]?.asset || null;

        cards.push({
          productId: product.id,
          variantId: null,
          productName,
          productSlug,
          brandName,
          isVariant: false,
          price: productPrice?.price || 0,
          discountedPrice: productPrice?.discountedPrice || null,
          currency: productPrice?.currency || 'TRY',
          image: productImage,
          variants: null,
        });
      }
    });

    return cards;
  }

  async getProductAndVariantsForModal(search: string) {
    const searchTerm = search.trim();

    const where: Prisma.ProductWhereInput = {
      active: true,
      ...(searchTerm
        ? {
            OR: [
              // 1. Normal ürünlerde (isVariant: false) sadece ürün adı/slug'ında ara
              {
                isVariant: false,
                stock: { gt: 0 },
                translations: {
                  some: {
                    OR: [
                      { name: { contains: searchTerm, mode: 'insensitive' } },
                      { slug: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                  },
                },
              },
              // 2. Variant ürünlerde ürün adı/slug'ında ara
              {
                isVariant: true,
                translations: {
                  some: {
                    OR: [
                      { name: { contains: searchTerm, mode: 'insensitive' } },
                      { slug: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                  },
                },
              },
              // 3. Variant ürünlerde variant group/option isimlerinde ara
              {
                isVariant: true,
                variantGroups: {
                  some: {
                    OR: [
                      {
                        variantGroup: {
                          translations: {
                            some: {
                              OR: [
                                {
                                  name: {
                                    contains: searchTerm,
                                    mode: 'insensitive',
                                  },
                                },
                                {
                                  slug: {
                                    contains: searchTerm,
                                    mode: 'insensitive',
                                  },
                                },
                              ],
                            },
                          },
                        },
                      },
                      {
                        options: {
                          some: {
                            variantOption: {
                              translations: {
                                some: {
                                  OR: [
                                    {
                                      name: {
                                        contains: searchTerm,
                                        mode: 'insensitive',
                                      },
                                    },
                                    {
                                      slug: {
                                        contains: searchTerm,
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
                    ],
                  },
                },
              },
            ],
          }
        : { active: true }),
    };

    const products = await this.prisma.product.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      include: {
        translations: true,
        assets: {
          take: 1,
          orderBy: {
            order: 'asc',
          },
          select: { asset: { select: { url: true, type: true } } },
        },
        brand: {
          select: {
            translations: true,
          },
        },
        prices: true,
        variantCombinations: {
          orderBy: {
            createdAt: 'asc',
          },
          where: {
            active: true,
            stock: {
              gt: 0,
            },
          },
          include: {
            assets: {
              take: 1,
              orderBy: {
                order: 'asc',
              },
              select: { asset: { select: { url: true, type: true } } },
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
    return this.convertToModalProductCard(products);
  }

  async getSelectedProductsForModal(
    selectedItems: { productId: string; variantId: string }[],
  ) {
    if (!selectedItems || selectedItems.length === 0) {
      return [];
    }

    const orConditions = selectedItems.map((item) => ({
      id: item.productId,
      ...(item.variantId && item.variantId !== 'main'
        ? {
            variantCombinations: {
              some: {
                id: item.variantId,
                active: true,
              },
            },
          }
        : {
            isVariant: false,
          }),
    }));

    const products = await this.prisma.product.findMany({
      where: {
        active: true,
        OR: orConditions,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        translations: true,
        assets: {
          take: 1,
          orderBy: {
            order: 'asc',
          },
          select: { asset: { select: { url: true, type: true } } },
        },
        brand: {
          select: {
            translations: true,
          },
        },
        prices: true,
        variantCombinations: {
          orderBy: {
            createdAt: 'asc',
          },
          where: {
            active: true,
            stock: {
              gt: 0,
            },
          },
          include: {
            assets: {
              take: 1,
              orderBy: {
                order: 'asc',
              },
              select: { asset: { select: { url: true, type: true } } },
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

    return this.convertToModalProductCard(products);
  }

  async getAllProductsIdNameImage(): Promise<
    Array<{
      id: string;
      name: string;
      image: { url: string; type: $Enums.AssetType } | null;
    }>
  > {
    const products = await this.prisma.product.findMany({
      where: {
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
      },
      select: {
        id: true,
        translations: {
          select: {
            name: true,
            locale: true,
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
      },
    });
    return products.map((p) => ({
      id: p.id,
      name:
        p.translations.find((t) => t.locale === 'TR')?.name ||
        p.translations.find((t) => t.locale === 'EN')?.name ||
        p.translations[0]?.name,
      image: p.assets[0]?.asset || null,
    }));
  }
}
