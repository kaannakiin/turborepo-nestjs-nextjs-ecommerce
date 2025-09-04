import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database';
import { slugify } from '@repo/shared';
import { VariantGroupZodType, VariantProductZodType } from '@repo/types';
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
      console.log(error);
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
      const { existingVariants, combinatedVariants, ...productData } = data;

      return this.prisma.$transaction(
        async (prisma) => {
          // 1. Product oluştur veya güncelle
          let product = await this.prisma.product.findUnique({
            where: {
              id: productData.uniqueId,
            },
          });

          if (!product) {
            product = await prisma.product.create({
              data: {
                type: productData.type,
                isVariant: true,
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
          } else {
            // Mevcut product'ı güncelle
            await prisma.product.update({
              where: { id: product.id },
              data: {
                type: productData.type,
                isVariant: true,
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
                // Mevcut option'ın order'ını güncelle
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
      },
    });
    if (!product) {
      return null;
    }
    const data = {
      uniqueId: product.id,
      type: product.type,
      images: [],
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
          stock: vc.stock,
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
    };
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
}
