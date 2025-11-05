import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database';
import {
  Coupon,
  DiscountUpsertResponse,
  FilterCondition,
  GetAllDiscountReturnType,
  MainDiscount,
  TierType,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DiscountsService {
  constructor(private readonly prismaService: PrismaService) {}

  async upgradeOrCreateDiscount(
    body: MainDiscount,
  ): Promise<DiscountUpsertResponse> {
    const { uniqueId } = body;

    try {
      const result = await this.prismaService.$transaction(async (tx) => {
        if (uniqueId) {
          const existing = await tx.discount.findUnique({
            where: { id: uniqueId },
            include: {
              coupons: {
                where: { isDelete: false },
                select: {
                  code: true,
                  id: true,
                  usageCount: true,
                },
              },
            },
          });
          if (!existing) {
            throw new NotFoundException('Güncellenecek indirim bulunamadı.');
          }
          return await this._updateDiscountInTransaction(
            tx,
            uniqueId,
            body,
            existing.coupons,
          );
        } else {
          return await this._createDiscountInTransaction(tx, body);
        }
      });

      return {
        success: true,
        message: uniqueId
          ? 'İndirim başarıyla güncellendi.'
          : 'İndirim başarıyla oluşturuldu.',
        discountId: result.id,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (
          error.code === 'P2002' &&
          (error.meta?.target as string[]).includes('code')
        ) {
          throw new BadRequestException(
            'Kupon kodlarından bazıları zaten kullanımda.',
          );
        }
      }

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('İndirim işlemi başarısız:', error);
      throw new InternalServerErrorException(
        error.message || 'İndirim işlemi başarısız oldu.',
      );
    }
  }

  private async _createDiscountInTransaction(
    tx: Prisma.TransactionClient,
    body: MainDiscount,
  ) {
    const commonData = this._getCommonAndTypeSpecificData(body);

    const couponsData: Prisma.CouponCreateNestedManyWithoutDiscountInput = {
      createMany: {
        data: body.coupons.map((c: Coupon) => ({
          code: c.couponName.trim(),
        })),
        skipDuplicates: false,
      },
    };

    let tiersData: Prisma.DiscountTierCreateNestedManyWithoutDiscountInput = {};
    const isGrowType = [
      'PERCENTAGE_GROW_QUANTITY',
      'PERCENTAGE_GROW_PRICE',
      'FIXED_AMOUNT_GROW_QUANTITY',
      'FIXED_AMOUNT_GROW_PRICE',
    ].includes(body.type);

    if (isGrowType && 'tiers' in body && body.tiers && body.tiers.length > 0) {
      tiersData.createMany = {
        data: (body.tiers as TierType[]).map((tier) => ({ ...tier })),
      };
    }

    let customersData: Prisma.DiscountCustomerCreateNestedManyWithoutDiscountInput =
      {};
    if (
      !body.allCustomers &&
      body.otherCustomers &&
      body.otherCustomers.length > 0
    ) {
      customersData.createMany = {
        data: body.otherCustomers.map((userId) => ({
          userId: userId,
        })),
      };
    }

    let conditionGroupsData: Prisma.DiscountConditionGroupCreateNestedManyWithoutDiscountInput =
      {};
    const oldConditions = body.conditions.conditions;

    if (
      !body.conditions.isAllProducts &&
      oldConditions &&
      oldConditions.length > 0
    ) {
      const operator = oldConditions[0].operator;

      const productIds = oldConditions
        .filter((c) => c.type === 'PRODUCT' && c.ids)
        .flatMap((c) => c.ids!)
        .map((productId) => ({ productId }));

      const variantIds = oldConditions
        .filter((c) => c.type === 'PRODUCT' && c.subIds)
        .flatMap((c) => c.subIds!)
        .map((variantId) => ({ variantId }));

      const categoryIds = oldConditions
        .filter((c) => c.type === 'CATEGORY' && c.ids)
        .flatMap((c) => c.ids!)
        .map((categoryId) => ({ categoryId }));

      const brandIds = oldConditions
        .filter((c) => c.type === 'BRAND' && c.ids)
        .flatMap((c) => c.ids!)
        .map((brandId) => ({ brandId }));

      conditionGroupsData.create = [
        {
          operator: operator,
          products: productIds.length
            ? { createMany: { data: productIds } }
            : undefined,
          categories: categoryIds.length
            ? { createMany: { data: categoryIds } }
            : undefined,
          brands: brandIds.length
            ? { createMany: { data: brandIds } }
            : undefined,
          variants: variantIds.length
            ? { createMany: { data: variantIds } }
            : undefined,
        },
      ];
    }

    return tx.discount.create({
      data: {
        ...commonData,
        coupons: couponsData,
        tiers: tiersData,
        customers: customersData,
        conditionGroups: conditionGroupsData,
      },
    });
  }

  private async _updateDiscountInTransaction(
    tx: Prisma.TransactionClient,
    discountId: string,
    body: MainDiscount,
    existingCoupons: Array<{ code: string; id: string; usageCount: number }>,
  ) {
    const commonData = this._getCommonAndTypeSpecificData(body);

    const newCouponCodes = body.coupons.map((c) => c.couponName.trim());
    const existingCouponCodes = existingCoupons.map((c) => c.code);
    const couponsToDelete = existingCoupons.filter(
      (existing) => !newCouponCodes.includes(existing.code),
    );
    const couponsToCreate = newCouponCodes.filter(
      (newCode) => !existingCouponCodes.includes(newCode),
    );
    for (const coupon of couponsToDelete) {
      if (coupon.usageCount > 0) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: {
            isDelete: true,
          },
        });
      } else {
        await tx.coupon.delete({
          where: { id: coupon.id },
        });
      }
    }
    const couponsData: Prisma.CouponUpdateManyWithoutDiscountNestedInput = {
      createMany:
        couponsToCreate.length > 0
          ? {
              data: couponsToCreate.map((code) => ({ code })),
              skipDuplicates: true,
            }
          : undefined,
    };

    let tiersData: Prisma.DiscountTierUpdateManyWithoutDiscountNestedInput = {
      deleteMany: {},
    };

    const isGrowType = [
      'PERCENTAGE_GROW_QUANTITY',
      'PERCENTAGE_GROW_PRICE',
      'FIXED_AMOUNT_GROW_QUANTITY',
      'FIXED_AMOUNT_GROW_PRICE',
    ].includes(body.type);

    if (isGrowType && 'tiers' in body && body.tiers && body.tiers.length > 0) {
      tiersData.createMany = {
        data: (body.tiers as TierType[]).map((tier) => ({ ...tier })),
      };
    }

    let customersData: Prisma.DiscountCustomerUpdateManyWithoutDiscountNestedInput =
      {
        deleteMany: {},
      };
    if (
      !body.allCustomers &&
      body.otherCustomers &&
      body.otherCustomers.length > 0
    ) {
      customersData.createMany = {
        data: body.otherCustomers.map((userId) => ({
          userId: userId,
        })),
      };
    }

    let conditionGroupsData: Prisma.DiscountConditionGroupUpdateManyWithoutDiscountNestedInput =
      {
        deleteMany: {},
      };
    const oldConditions = body.conditions.conditions;

    if (
      !body.conditions.isAllProducts &&
      oldConditions &&
      oldConditions.length > 0
    ) {
      const operator = oldConditions[0].operator;
      const productIds = oldConditions
        .filter((c) => c.type === $Enums.DiscountConditionType.PRODUCT && c.ids)
        .flatMap((c) => c.ids!)
        .map((productId) => ({ productId }));

      const categoryIds = oldConditions
        .filter(
          (c) => c.type === $Enums.DiscountConditionType.CATEGORY && c.ids,
        )
        .flatMap((c) => c.ids!)
        .map((categoryId) => ({ categoryId }));

      const brandIds = oldConditions
        .filter((c) => c.type === $Enums.DiscountConditionType.BRAND && c.ids)
        .flatMap((c) => c.ids!)
        .map((brandId) => ({ brandId }));

      conditionGroupsData.create = [
        {
          operator: operator,
          products: productIds.length
            ? { createMany: { data: productIds } }
            : undefined,
          categories: categoryIds.length
            ? { createMany: { data: categoryIds } }
            : undefined,
          brands: brandIds.length
            ? { createMany: { data: brandIds } }
            : undefined,
        },
      ];
    }

    return tx.discount.update({
      where: { id: discountId },
      data: {
        ...commonData,
        coupons: couponsData,
        tiers: tiersData,
        customers: customersData,
        conditionGroups: conditionGroupsData,
      },
    });
  }

  private _getCommonAndTypeSpecificData(
    body: MainDiscount,
  ): Omit<
    Prisma.DiscountCreateInput,
    'coupons' | 'tiers' | 'customers' | 'conditionGroups' | 'usages'
  > {
    const { type } = body;

    let typeSpecificData: {
      discountValue: number | null;
      discountAmount: number | null;
    } = {
      discountValue: null,
      discountAmount: null,
    };

    if (type === 'PERCENTAGE' && 'discountValue' in body) {
      typeSpecificData.discountValue = body.discountValue;
    } else if (type === 'FIXED_AMOUNT' && 'discountAmount' in body) {
      typeSpecificData.discountAmount = body.discountAmount;
    }

    return {
      title: body.title,
      type: body.type,
      status: 'ACTIVE',
      currencies: body.currencies,
      startDate: body.addStartDate ? new Date(body.startDate!) : null,
      endDate: body.addEndDate ? new Date(body.endDate!) : null,
      isLimitPurchase: body.isLimitPurchase,
      minPurchaseAmount: body.isLimitPurchase
        ? (body.minPurchaseAmount ?? null)
        : null,
      maxPurchaseAmount: body.isLimitPurchase
        ? (body.maxPurchaseAmount ?? null)
        : null,
      isLimitItemQuantity: body.isLimitItemQuantity,
      minItemQuantity: body.isLimitItemQuantity
        ? (body.minItemQuantity ?? null)
        : null,
      maxItemQuantity: body.isLimitItemQuantity
        ? (body.maxItemQuantity ?? null)
        : null,
      allowDiscountedItems: body.allowDiscountedItems,
      allowedDiscountedItemsBy: body.allowDiscountedItems
        ? (body.allowedDiscountedItemsBy ?? null)
        : null,
      mergeOtherCampaigns: body.mergeOtherCampaigns,
      isLimitTotalUsage: body.isLimitTotalUsage,
      totalUsageLimit: body.isLimitTotalUsage
        ? (body.totalUsageLimit ?? null)
        : null,
      isLimitTotalUsagePerCustomer: body.isLimitTotalUsagePerCustomer,
      totalUsageLimitPerCustomer: body.isLimitTotalUsagePerCustomer
        ? (body.totalUsageLimitPerCustomer ?? null)
        : null,
      isAllCustomers: body.allCustomers,
      isAllProducts: body.conditions.isAllProducts,
      ...typeSpecificData,
    };
  }

  async getDiscounts(
    page: number,
    type: $Enums.DiscountType,
    search?: string,
  ): Promise<GetAllDiscountReturnType> {
    const take = 10;
    const skip = (page - 1) * take;

    const whereClause: Prisma.DiscountWhereInput = {
      ...(type ? { type: type } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              {
                coupons: {
                  some: {
                    code: { contains: search, mode: 'insensitive' },
                    isDelete: false,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [discounts, totalCount] = await this.prismaService.$transaction([
      this.prismaService.discount.findMany({
        where: whereClause,
        skip: skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              usages: true,
            },
          },
          coupons: {
            where: { isDelete: false },
            select: { code: true, usageCount: true },
          },
        },
      }),
      this.prismaService.discount.count({ where: whereClause }),
    ]);
    return {
      success: true,
      message: 'Discounts retrieved successfully',
      data: discounts,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / take),
        currentPage: page,
        pageSize: take,
      },
    };
  }

  async getDiscountBySlug(slug: string): Promise<MainDiscount> {
    const discount = await this.prismaService.discount.findUnique({
      where: { id: slug },
      include: {
        tiers: true,
        customers: {
          select: {
            userId: true,
          },
        },
        coupons: {
          where: { isDelete: false },
          select: {
            code: true,
          },
        },
        conditionGroups: {
          include: {
            brands: { select: { brandId: true } },
            categories: { select: { categoryId: true } },
            products: { select: { productId: true } },
            variants: { select: { variantId: true } },
          },
        },
      },
    });

    if (!discount) {
      throw new NotFoundException('İndirim bulunamadı.');
    }

    let formattedConditions: FilterCondition[] | null = null;
    if (!discount.isAllProducts && discount.conditionGroups.length > 0) {
      const group = discount.conditionGroups[0];
      formattedConditions = [];

      if (group.products.length > 0 || group.variants.length > 0) {
        formattedConditions.push({
          operator: group.operator,
          type: 'PRODUCT',
          ids: group.products.map((p) => p.productId),
          subIds: group.variants.map((v) => v.variantId),
        });
      }
      if (group.categories.length > 0) {
        formattedConditions.push({
          operator: group.operator,
          type: 'CATEGORY',
          ids: group.categories.map((c) => c.categoryId),
          subIds: null,
        });
      }
      if (group.brands.length > 0) {
        formattedConditions.push({
          operator: group.operator,
          type: 'BRAND',
          ids: group.brands.map((b) => b.brandId),
          subIds: null,
        });
      }
    }

    const formattedCoupons = discount.coupons.map((c) => ({
      couponName: c.code,
    }));

    const formattedCustomers = discount.isAllCustomers
      ? null
      : discount.customers.map((c) => c.userId);

    const formattedStartDate = discount.startDate
      ? discount.startDate.toISOString()
      : null;
    const formattedEndDate = discount.endDate
      ? discount.endDate.toISOString()
      : null;

    // 5. MainDiscount nesnesini oluştur
    const mainDiscount: MainDiscount = {
      uniqueId: discount.id,
      title: discount.title,
      type: discount.type,
      status: discount.status,
      currencies: discount.currencies,
      isLimitPurchase: discount.isLimitPurchase,
      minPurchaseAmount: discount.minPurchaseAmount,
      maxPurchaseAmount: discount.maxPurchaseAmount,
      isLimitItemQuantity: discount.isLimitItemQuantity,
      minItemQuantity: discount.minItemQuantity,
      maxItemQuantity: discount.maxItemQuantity,
      allowDiscountedItems: discount.allowDiscountedItems,
      allowedDiscountedItemsBy: discount.allowedDiscountedItemsBy,
      mergeOtherCampaigns: discount.mergeOtherCampaigns,
      isLimitTotalUsage: discount.isLimitTotalUsage,
      totalUsageLimit: discount.totalUsageLimit,
      isLimitTotalUsagePerCustomer: discount.isLimitTotalUsagePerCustomer,
      totalUsageLimitPerCustomer: discount.totalUsageLimitPerCustomer,

      // Tipe özel alanlar
      discountValue: discount.discountValue,
      discountAmount: discount.discountAmount,
      tiers: discount.tiers, // Bu 1:1 eşleşiyor

      addStartDate: discount.startDate ? true : false,
      startDate: formattedStartDate,
      addEndDate: discount.endDate ? true : false,
      endDate: formattedEndDate,

      allCustomers: discount.isAllCustomers,
      otherCustomers: formattedCustomers,

      coupons: formattedCoupons,

      conditions: {
        isAllProducts: discount.isAllProducts,
        conditions: formattedConditions,
      },
    };

    // --- Veri Dönüşümü Sonu ---

    return mainDiscount; // Dönüştürülmüş nesneyi döndür
  }
}
