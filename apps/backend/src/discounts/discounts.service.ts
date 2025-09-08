import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/database';
import { DiscountTableData, DiscountZodType } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateDiscount(body: DiscountZodType) {
    try {
      // 1. İş mantığı validasyonları
      await this.validateBusinessRules(body);

      return await this.prisma.$transaction(async (tx) => {
        // 2. Ana discount kaydını upsert et
        const discount = await tx.discount.upsert({
          where: {
            id: body.uniqueId,
          },
          create: this.buildDiscountCreateData(body),
          update: this.buildDiscountUpdateData(body),
        });

        // 3. Translations işlemleri
        await this.handleTranslations(tx, body);

        // 4. Kupon işlemleri (sadece MANUAL tipinde)
        if (body.couponGeneration === 'MANUAL') {
          await this.handleCoupons(tx, body);
        } else {
          // AUTOMATIC tipinde kuponları temizle
          await tx.discountCoupon.deleteMany({
            where: { discountId: body.uniqueId },
          });
        }

        // 5. Conditions işlemleri (Buy X Get Y hariç)
        if (body.type !== 'BUY_X_GET_Y') {
          await this.handleConditions(tx, body);
        } else {
          // Buy X Get Y tipinde conditions'ı temizle
          await tx.discountCondition.deleteMany({
            where: { discountId: body.uniqueId },
          });
        }

        // 6. Tam discount bilgisini döndür
        return await this.getFullDiscountById(tx, body.uniqueId);
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  private buildDiscountCreateData(body: DiscountZodType) {
    const baseData = {
      id: body.uniqueId,
      type: body.type,
      isActive: body.isActive,
      couponGeneration: body.couponGeneration,
      // Tüm alanları null olarak başlat
      discountPercentage: null,
      discountAmount: null,
      allowedCurrencies: [],
      buyQuantity: null,
      buyProductId: null,
      buyVariantId: null,
      getQuantity: null,
      getProductId: null,
      getVariantId: null,
      buyXGetYDiscountPercentage: null,
    };

    // Tip bazında alanları doldur
    switch (body.type) {
      case 'PERCENTAGE':
        return {
          ...baseData,
          discountPercentage: body.discountPercentage,
          allowedCurrencies: body.allowedCurrencies,
        };
      case 'FIXED':
        return {
          ...baseData,
          discountAmount: body.discountAmount,
          allowedCurrencies: body.allowedCurrencies,
        };
      case 'BUY_X_GET_Y':
        return {
          ...baseData,
          buyQuantity: body.buyXGetYConfig.buyQuantity,
          buyProductId: body.buyXGetYConfig.buyProductId,
          buyVariantId: body.buyXGetYConfig.buyVariantId,
          getQuantity: body.buyXGetYConfig.getQuantity,
          getProductId: body.buyXGetYConfig.getProductId,
          getVariantId: body.buyXGetYConfig.getVariantId,
          buyXGetYDiscountPercentage: body.buyXGetYConfig.discountPercentage,
        };
      case 'FREE_SHIPPING':
      default:
        return baseData;
    }
  }

  private buildDiscountUpdateData(body: DiscountZodType) {
    const baseData = {
      type: body.type,
      isActive: body.isActive,
      couponGeneration: body.couponGeneration,
      // Önce tüm alanları temizle
      discountPercentage: null,
      discountAmount: null,
      allowedCurrencies: { set: [] },
      buyQuantity: null,
      buyProductId: null,
      buyVariantId: null,
      getQuantity: null,
      getProductId: null,
      getVariantId: null,
      buyXGetYDiscountPercentage: null,
    };

    // Tip bazında alanları doldur
    switch (body.type) {
      case 'PERCENTAGE':
        return {
          ...baseData,
          discountPercentage: body.discountPercentage,
          allowedCurrencies: { set: body.allowedCurrencies },
        };
      case 'FIXED':
        return {
          ...baseData,
          discountAmount: body.discountAmount,
          allowedCurrencies: { set: body.allowedCurrencies },
        };
      case 'BUY_X_GET_Y':
        return {
          ...baseData,
          buyQuantity: body.buyXGetYConfig.buyQuantity,
          buyProductId: body.buyXGetYConfig.buyProductId,
          buyVariantId: body.buyXGetYConfig.buyVariantId,
          getQuantity: body.buyXGetYConfig.getQuantity,
          getProductId: body.buyXGetYConfig.getProductId,
          getVariantId: body.buyXGetYConfig.getVariantId,
          buyXGetYDiscountPercentage: body.buyXGetYConfig.discountPercentage,
        };
      case 'FREE_SHIPPING':
      default:
        return baseData;
    }
  }

  private async handleTranslations(
    tx: Prisma.TransactionClient,
    body: DiscountZodType,
  ) {
    try {
      await tx.discountTranslation.deleteMany({
        where: { discountId: body.uniqueId },
      });

      await tx.discountTranslation.createMany({
        data: body.translations.map((translation) => ({
          discountId: body.uniqueId,
          locale: translation.locale,
          discountTitle: translation.discountTitle,
        })),
      });
    } catch (error) {
      throw new BadRequestException(
        'Çeviri bilgileri kaydedilirken hata oluştu',
      );
    }
  }

  private async handleCoupons(
    tx: Prisma.TransactionClient,
    body: DiscountZodType,
  ) {
    try {
      await tx.discountCoupon.deleteMany({
        where: { discountId: body.uniqueId },
      });

      if (body.coupons && body.coupons.length > 0) {
        await tx.discountCoupon.createMany({
          data: body.coupons.map((coupon) => ({
            discountId: body.uniqueId,
            code: coupon.code,
            limit: coupon.limit,
            perUserLimit: coupon.perUserLimit,
          })),
        });
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Kupon kodu zaten kullanımda. Lütfen farklı bir kod seçin.',
        );
      }
      throw new BadRequestException(
        'Kupon bilgileri kaydedilirken hata oluştu',
      );
    }
  }

  private async handleConditions(
    tx: Prisma.TransactionClient,
    body: DiscountZodType,
  ) {
    try {
      await tx.discountCondition.upsert({
        where: { discountId: body.uniqueId },
        create: {
          discountId: body.uniqueId,
          allProducts: body.conditions.allProducts,
          allUser: body.conditions.allUser,
          onlyRegisteredUsers: body.conditions.onlyRegisteredUsers,
          hasAmountCondition: body.conditions.hasAmountCondition,
          minimumAmount: body.conditions.minimumAmount,
          maximumAmount: body.conditions.maximumAmount,
          hasQuantityCondition: body.conditions.hasQuantityCondition,
          minimumQuantity: body.conditions.minimumQuantity,
          maximumQuantity: body.conditions.maximumQuantity,
          addStartDate: body.conditions.addStartDate,
          startDate: body.conditions.startDate,
          addEndDate: body.conditions.addEndDate,
          endDate: body.conditions.endDate,
        },
        update: {
          allProducts: body.conditions.allProducts,
          allUser: body.conditions.allUser,
          onlyRegisteredUsers: body.conditions.onlyRegisteredUsers,
          hasAmountCondition: body.conditions.hasAmountCondition,
          minimumAmount: body.conditions.minimumAmount,
          maximumAmount: body.conditions.maximumAmount,
          hasQuantityCondition: body.conditions.hasQuantityCondition,
          minimumQuantity: body.conditions.minimumQuantity,
          maximumQuantity: body.conditions.maximumQuantity,
          addStartDate: body.conditions.addStartDate,
          startDate: body.conditions.startDate,
          addEndDate: body.conditions.addEndDate,
          endDate: body.conditions.endDate,
        },
      });

      // Condition ilişkilerini güncelle
      const condition = await tx.discountCondition.findUnique({
        where: { discountId: body.uniqueId },
        select: { id: true },
      });

      if (condition) {
        await this.updateConditionRelations(tx, condition.id, body);
      }
    } catch (error) {
      throw new BadRequestException(
        'Koşul bilgileri kaydedilirken hata oluştu',
      );
    }
  }

  private async validateBusinessRules(body: DiscountZodType): Promise<void> {
    // 1. Kupon kodları benzersizlik kontrolü (sadece MANUAL tipinde)
    if (body.couponGeneration === 'MANUAL' && body.coupons?.length) {
      const existingCoupons = await this.prisma.discountCoupon.findMany({
        where: {
          code: { in: body.coupons.map((c) => c.code) },
          discountId: { not: body.uniqueId },
        },
      });

      if (existingCoupons.length > 0) {
        const duplicateCodes = existingCoupons.map((c) => c.code).join(', ');
        throw new ConflictException(
          `Bu kupon kodları zaten kullanımda: ${duplicateCodes}`,
        );
      }
    }

    // 2. Buy X Get Y için özel validasyonlar
    if (body.type === 'BUY_X_GET_Y') {
      await this.validateBuyXGetY(body);
    } else {
      // Normal indirimler için condition validasyonları
      await this.validateConditions(body);
    }

    // 3. Tarih mantığı kontrolü
    if (
      body.type !== 'BUY_X_GET_Y' &&
      body.conditions.addStartDate &&
      body.conditions.addEndDate &&
      body.conditions.startDate &&
      body.conditions.endDate
    ) {
      if (body.conditions.startDate >= body.conditions.endDate) {
        throw new BadRequestException(
          'Başlangıç tarihi bitiş tarihinden önce olmalıdır',
        );
      }

      const now = new Date();
      if (body.conditions.startDate < now) {
        throw new BadRequestException('Başlangıç tarihi gelecekte olmalıdır');
      }
    }
  }

  private async validateBuyXGetY(body: DiscountZodType) {
    if (body.type !== 'BUY_X_GET_Y') return;

    const config = body.buyXGetYConfig;

    // Buy tarafı için validasyon - en az bir seçim yapılmalı
    const hasBuyProduct = Boolean(config.buyProductId);
    const hasBuyVariant = Boolean(config.buyVariantId);

    if (!hasBuyProduct && !hasBuyVariant) {
      throw new BadRequestException(
        'Alınması gereken ürünler için en az bir ürün veya varyant seçmelisiniz',
      );
    }

    // Buy tarafı için - hem product hem variant seçilemez
    if (hasBuyProduct && hasBuyVariant) {
      throw new BadRequestException(
        'Alınması gereken ürünler için hem ürün hem de varyant seçemezsiniz, sadece birini seçin',
      );
    }

    // Get tarafı için validasyon - en az bir seçim yapılmalı
    const hasGetProduct = Boolean(config.getProductId);
    const hasGetVariant = Boolean(config.getVariantId);

    if (!hasGetProduct && !hasGetVariant) {
      throw new BadRequestException(
        'Kazanılacak ürünler için en az bir ürün veya varyant seçmelisiniz',
      );
    }

    // Get tarafı için - hem product hem variant seçilemez
    if (hasGetProduct && hasGetVariant) {
      throw new BadRequestException(
        'Kazanılacak ürünler için hem ürün hem de varyant seçemezsiniz, sadece birini seçin',
      );
    }

    // Buy ürün/varyant kontrolü
    if (config.buyProductId) {
      const product = await this.prisma.product.findFirst({
        where: { id: config.buyProductId, active: true },
      });
      if (!product) {
        throw new BadRequestException(
          'Seçilen alınacak ürün bulunamadı veya pasif',
        );
      }
    }

    if (config.buyVariantId) {
      const variant = await this.prisma.productVariantCombination.findFirst({
        where: { id: config.buyVariantId, active: true },
        include: {
          product: {
            select: { active: true },
          },
        },
      });
      if (!variant || !variant.product.active) {
        throw new BadRequestException(
          'Seçilen alınacak varyant bulunamadı, pasif veya ürünü pasif',
        );
      }
    }

    // Get ürün/varyant kontrolü
    if (config.getProductId) {
      const product = await this.prisma.product.findFirst({
        where: { id: config.getProductId, active: true },
      });
      if (!product) {
        throw new BadRequestException(
          'Seçilen kazanılacak ürün bulunamadı veya pasif',
        );
      }
    }

    if (config.getVariantId) {
      const variant = await this.prisma.productVariantCombination.findFirst({
        where: { id: config.getVariantId, active: true },
        include: {
          product: {
            select: { active: true },
          },
        },
      });
      if (!variant || !variant.product.active) {
        throw new BadRequestException(
          'Seçilen kazanılacak varyant bulunamadı, pasif veya ürünü pasif',
        );
      }
    }

    // Çapraz kontrol: buy product ile get variant aynı ürüne ait olamaz
    if (config.buyProductId && config.getVariantId) {
      const getVariant = await this.prisma.productVariantCombination.findFirst({
        where: { id: config.getVariantId },
        select: { productId: true },
      });
      if (getVariant && getVariant.productId === config.buyProductId) {
        throw new BadRequestException(
          'Alınacak ürün ile kazanılacak varyant aynı ürüne ait olamaz',
        );
      }
    }

    // Çapraz kontrol: buy variant ile get product aynı ürüne ait olamaz
    if (config.buyVariantId && config.getProductId) {
      const buyVariant = await this.prisma.productVariantCombination.findFirst({
        where: { id: config.buyVariantId },
        select: { productId: true },
      });
      if (buyVariant && buyVariant.productId === config.getProductId) {
        throw new BadRequestException(
          'Alınacak varyant ile kazanılacak ürün aynı ürüne ait olamaz',
        );
      }
    }
  }

  private async validateConditions(body: DiscountZodType) {
    if (body.type === 'BUY_X_GET_Y') return;

    // Ürün ID'leri kontrolü
    if (body.conditions.includedProductIds?.length) {
      const validProducts = await this.prisma.product.findMany({
        where: {
          id: { in: body.conditions.includedProductIds },
          active: true,
        },
        select: { id: true },
      });

      const invalidProductIds = body.conditions.includedProductIds.filter(
        (id) => !validProducts.some((p) => p.id === id),
      );

      if (invalidProductIds.length > 0) {
        throw new BadRequestException(
          `Geçersiz veya pasif ürün ID'leri: ${invalidProductIds.join(', ')}`,
        );
      }
    }

    // Kategori ID'leri kontrolü
    if (body.conditions.includedCategoryIds?.length) {
      const validCategories = await this.prisma.category.findMany({
        where: { id: { in: body.conditions.includedCategoryIds } },
        select: { id: true },
      });

      const invalidCategoryIds = body.conditions.includedCategoryIds.filter(
        (id) => !validCategories.some((c) => c.id === id),
      );

      if (invalidCategoryIds.length > 0) {
        throw new BadRequestException(
          `Geçersiz kategori ID'leri: ${invalidCategoryIds.join(', ')}`,
        );
      }
    }

    // Marka ID'leri kontrolü
    if (body.conditions.includedBrandIds?.length) {
      const validBrands = await this.prisma.brand.findMany({
        where: { id: { in: body.conditions.includedBrandIds } },
        select: { id: true },
      });

      const invalidBrandIds = body.conditions.includedBrandIds.filter(
        (id) => !validBrands.some((b) => b.id === id),
      );

      if (invalidBrandIds.length > 0) {
        throw new BadRequestException(
          `Geçersiz marka ID'leri: ${invalidBrandIds.join(', ')}`,
        );
      }
    }

    // Kullanıcı ID'leri kontrolü
    if (body.conditions.usersIds?.length) {
      const validUsers = await this.prisma.user.findMany({
        where: { id: { in: body.conditions.usersIds } },
        select: { id: true },
      });

      const invalidUserIds = body.conditions.usersIds.filter(
        (id) => !validUsers.some((u) => u.id === id),
      );

      if (invalidUserIds.length > 0) {
        throw new BadRequestException(
          `Geçersiz kullanıcı ID'leri: ${invalidUserIds.join(', ')}`,
        );
      }
    }

    // Varyant ID'leri kontrolü
    if (body.conditions.includedVariantIds?.length) {
      const validVariants =
        await this.prisma.productVariantCombination.findMany({
          where: {
            id: { in: body.conditions.includedVariantIds },
            active: true,
          },
          select: { id: true },
        });

      const invalidVariantIds = body.conditions.includedVariantIds.filter(
        (id) => !validVariants.some((v) => v.id === id),
      );

      if (invalidVariantIds.length > 0) {
        throw new BadRequestException(
          `Geçersiz veya pasif varyant ID'leri: ${invalidVariantIds.join(', ')}`,
        );
      }
    }
  }

  private async updateConditionRelations(
    tx: Prisma.TransactionClient,
    conditionId: string,
    body: DiscountZodType,
  ) {
    try {
      // Ürünler
      if (body.conditions.includedProductIds !== undefined) {
        await tx.discountIncludedProduct.deleteMany({
          where: { conditionId },
        });

        if (body.conditions.includedProductIds?.length > 0) {
          await tx.discountIncludedProduct.createMany({
            data: body.conditions.includedProductIds.map((productId) => ({
              conditionId,
              productId,
            })),
          });
        }
      }

      // Varyantlar
      if (body.conditions.includedVariantIds !== undefined) {
        await tx.discountIncludedVariant.deleteMany({
          where: { conditionId },
        });

        if (body.conditions.includedVariantIds?.length > 0) {
          await tx.discountIncludedVariant.createMany({
            data: body.conditions.includedVariantIds.map((combinationId) => ({
              conditionId,
              combinationId,
            })),
          });
        }
      }

      // Kategoriler
      if (body.conditions.includedCategoryIds !== undefined) {
        await tx.discountIncludedCategory.deleteMany({
          where: { conditionId },
        });

        if (body.conditions.includedCategoryIds?.length > 0) {
          await tx.discountIncludedCategory.createMany({
            data: body.conditions.includedCategoryIds.map((categoryId) => ({
              conditionId,
              categoryId,
            })),
          });
        }
      }

      // Markalar
      if (body.conditions.includedBrandIds !== undefined) {
        await tx.discountIncludedBrand.deleteMany({
          where: { conditionId },
        });

        if (body.conditions.includedBrandIds?.length > 0) {
          await tx.discountIncludedBrand.createMany({
            data: body.conditions.includedBrandIds.map((brandId) => ({
              conditionId,
              brandId,
            })),
          });
        }
      }

      // Kullanıcılar
      if (body.conditions.usersIds !== undefined) {
        await tx.discountIncludedUser.deleteMany({
          where: { conditionId },
        });

        if (body.conditions.usersIds?.length > 0) {
          await tx.discountIncludedUser.createMany({
            data: body.conditions.usersIds.map((userId) => ({
              conditionId,
              userId,
            })),
          });
        }
      }
    } catch (error) {
      throw new BadRequestException(
        'İlişkili veriler güncellenirken hata oluştu',
      );
    }
  }

  private async getFullDiscountById(tx: Prisma.TransactionClient, id: string) {
    return await tx.discount.findUnique({
      where: { id },
      include: {
        translations: true,
        coupons: true,
        conditions: {
          include: {
            includedProducts: {
              include: {
                product: { include: { translations: true } },
              },
            },
            includedCategories: {
              include: {
                category: { include: { translations: true } },
              },
            },
            includedBrands: {
              include: {
                brand: { include: { translations: true } },
              },
            },
            includedUsers: {
              include: {
                user: {
                  select: { id: true, name: true, surname: true, email: true },
                },
              },
            },
            includedVariants: {
              include: {
                combination: {
                  include: {
                    product: { include: { translations: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  private handleError(error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException(
            'Benzersiz alanlar için çakışma tespit edildi',
          );
        case 'P2003':
          throw new BadRequestException('İlişkili kayıt bulunamadı');
        case 'P2025':
          throw new NotFoundException('Güncellenecek kayıt bulunamadı');
        default:
          throw new InternalServerErrorException(
            'Veritabanı hatası: ' + error.message,
          );
      }
    }

    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }

    console.log(error);
    throw new InternalServerErrorException(
      'İndirim kaydedilirken beklenmeyen bir hata oluştu',
    );
  }

  async getDiscountById(id: string): Promise<DiscountZodType> {
    const discount = await this.prisma.discount.findUniqueOrThrow({
      where: { id },
      include: {
        conditions: {
          include: {
            includedBrands: { select: { brandId: true } },
            includedCategories: { select: { categoryId: true } },
            includedProducts: { select: { productId: true } },
            includedUsers: { select: { userId: true } },
            includedVariants: { select: { combinationId: true } },
          },
        },
        _count: {
          select: {
            usage: true,
          },
        },
        coupons: true,
        translations: {
          select: { locale: true, discountTitle: true },
        },
      },
    });

    if (!discount) {
      throw new NotFoundException('İndirim bulunamadı');
    }

    // Base properties
    const baseDiscount = {
      couponGeneration: discount.couponGeneration || 'MANUAL',
      uniqueId: discount.id,
      isActive: discount.isActive,
      type: discount.type,
      translations: discount.translations.map((t) => ({
        discountTitle: t.discountTitle,
        locale: t.locale,
      })),
      coupons: discount.coupons.map((coupon) => ({
        code: coupon.code,
        limit: coupon.limit,
        perUserLimit: coupon.perUserLimit,
      })),
      conditions: {
        addEndDate: discount.conditions?.addEndDate || false,
        addStartDate: discount.conditions?.addStartDate || false,
        allProducts: discount.conditions?.allProducts || false,
        allUser: discount.conditions?.allUser || false,
        endDate: discount.conditions?.endDate || null,
        hasAmountCondition: discount.conditions?.hasAmountCondition || false,
        hasQuantityCondition:
          discount.conditions?.hasQuantityCondition || false,
        includedBrandIds:
          discount.conditions?.includedBrands.map((b) => b.brandId) || [],
        includedCategoryIds:
          discount.conditions?.includedCategories.map((c) => c.categoryId) ||
          [],
        includedProductIds:
          discount.conditions?.includedProducts.map((p) => p.productId) || [],
        includedVariantIds:
          discount.conditions?.includedVariants.map((v) => v.combinationId) ||
          [],
        minimumAmount: discount.conditions?.minimumAmount
          ? Number(discount.conditions.minimumAmount)
          : null,
        minimumQuantity: discount.conditions?.minimumQuantity || null,
        onlyRegisteredUsers: discount.conditions?.onlyRegisteredUsers || false,
        startDate: discount.conditions?.startDate || null,
        usersIds: discount.conditions?.includedUsers.map((u) => u.userId) || [],
        maximumAmount: discount.conditions?.maximumAmount
          ? Number(discount.conditions.maximumAmount)
          : null,
        maximumQuantity: discount.conditions?.maximumQuantity || null,
      },
    };

    // Type-specific properties
    switch (discount.type) {
      case 'FIXED':
        return {
          ...baseDiscount,
          discountAmount: Number(discount.discountAmount),
          allowedCurrencies: Array.isArray(discount.allowedCurrencies)
            ? discount.allowedCurrencies
            : [],
        } as DiscountZodType;

      case 'PERCENTAGE':
        return {
          ...baseDiscount,
          discountPercentage: Number(discount.discountPercentage),
          allowedCurrencies: Array.isArray(discount.allowedCurrencies)
            ? discount.allowedCurrencies
            : [],
        } as DiscountZodType;

      case 'BUY_X_GET_Y':
        return {
          ...baseDiscount,
          buyXGetYConfig: {
            buyQuantity: discount.buyQuantity || 1,
            buyProductId: discount.buyProductId,
            buyVariantId: discount.buyVariantId,
            getQuantity: discount.getQuantity || 1,
            getProductId: discount.getProductId,
            getVariantId: discount.getVariantId,
            discountPercentage:
              Number(discount.buyXGetYDiscountPercentage) || 0,
          },
        } as DiscountZodType;

      case 'FREE_SHIPPING':
      default:
        return baseDiscount as DiscountZodType;
    }
  }

  async getAllDiscountsForAdmin(
    search: string,
    page: number,
  ): Promise<{
    discounts: DiscountTableData[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    const where: Prisma.DiscountWhereInput = {
      ...(search && {
        OR: [
          {
            coupons: {
              some: {
                code: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            translations: {
              some: {
                discountTitle: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
        ],
      }),
      isDeleted: false,
    };
    const take = 10;
    const skip = (page - 1) * take;

    const [totalCount, discounts] = await this.prisma.$transaction([
      this.prisma.discount.count({ where }),
      this.prisma.discount.findMany({
        where,
        take,
        skip,
        include: {
          coupons: true,
          translations: true,
          conditions: true,
          _count: {
            select: {
              usage: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / take);

    return {
      discounts,
      totalCount,
      currentPage: page,
      totalPages,
    };
  }

  async softDeleteDiscount(discountId: string): Promise<void> {
    try {
      const discount = await this.prisma.discount.findUnique({
        where: { id: discountId },
      });

      if (!discount) {
        throw new NotFoundException('Silinecek indirim bulunamadı');
      }

      await this.prisma.discount.update({
        where: { id: discountId },
        data: {
          isDeleted: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Silinecek indirim bulunamadı');
        }
      }

      throw new InternalServerErrorException(
        'İndirim silinirken bir hata oluştu',
      );
    }
  }
}
