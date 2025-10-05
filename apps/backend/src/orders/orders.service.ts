import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/database';
import {
  BasketItem,
  ItemTransaction,
  OrderPageGetOrderReturnType,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrderItem(
    orderId: string,
    itemTransactions: ItemTransaction[],
    isThreeD: boolean = false,
  ): Promise<any> {
    const reducedItems = itemTransactions.reduce(
      (acc, transaction) => {
        const existingItem = acc.find(
          (item) => item.itemId === transaction.itemId,
        );

        if (existingItem) {
          existingItem.quantity += 1;
          existingItem.price += transaction.price;
          existingItem.paidPrice += transaction.paidPrice;
          existingItem.merchantPayoutAmount += transaction.merchantPayoutAmount;
          existingItem.iyziCommissionRateAmount +=
            transaction.iyziCommissionRateAmount;
          existingItem.iyziCommissionFee += transaction.iyziCommissionFee;
        } else {
          acc.push({
            ...transaction,
            quantity: 1,
          });
        }

        return acc;
      },
      [] as Array<ItemTransaction & { quantity: number }>,
    );

    // 2. Fetch product/variant data
    const orderItemsData = await Promise.all(
      reducedItems.map(async (item) => {
        const [productId, variantId] = item.itemId.split('-');

        if (!productId) {
          throw new Error(`Invalid itemId format: ${item.itemId}`);
        }

        const commonData = {
          orderId,
          productId,
          variantId: variantId || null,
          buyedPrice: item.paidPrice / item.quantity,
          originalPrice: item.price / item.quantity,
          transactionId: item.paymentTransactionId,
          quantity: item.quantity,
          totalPrice: item.paidPrice,
        };

        if (variantId) {
          const variant =
            await this.prisma.productVariantCombination.findUnique({
              where: { id: variantId },
              include: {
                assets: {
                  take: 1,
                  orderBy: { order: 'asc' },
                  select: {
                    asset: {
                      select: { url: true, type: true },
                    },
                  },
                },
                prices: true,
                translations: true,
                options: {
                  orderBy: [
                    {
                      productVariantOption: {
                        productVariantGroup: { order: 'asc' },
                      },
                    },
                    {
                      productVariantOption: { order: 'asc' },
                    },
                  ],
                  select: {
                    productVariantOption: {
                      select: {
                        variantOption: {
                          select: {
                            id: true,
                            hexValue: true,
                            asset: {
                              select: { url: true, type: true },
                            },
                            translations: true,
                            variantGroup: {
                              select: {
                                id: true,
                                type: true,
                                translations: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                product: {
                  include: {
                    assets: {
                      take: 1,
                      orderBy: { order: 'asc' },
                      select: {
                        asset: {
                          select: { url: true, type: true },
                        },
                      },
                    },
                    translations: true,
                    brand: true,
                    categories: {
                      orderBy: { createdAt: 'desc' },
                      select: { category: true },
                    },
                    prices: true,
                    taxonomyCategory: true,
                  },
                },
              },
            });

          if (!variant?.product) {
            throw new Error(
              `Variant or product not found for itemId: ${item.itemId}`,
            );
          }

          const { product, ...variantData } = variant;

          return {
            ...commonData,
            productSnapshot: product,
            buyedVariants: variantData,
          };
        } else {
          const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
              assets: {
                take: 1,
                orderBy: { order: 'asc' },
                select: {
                  asset: {
                    select: { url: true, type: true },
                  },
                },
              },
              translations: true,
              brand: true,
              categories: {
                orderBy: { createdAt: 'desc' },
                select: { category: true },
              },
              prices: true,
              taxonomyCategory: true,
            },
          });

          if (!product) {
            throw new Error(`Product not found: ${productId}`);
          }

          return {
            ...commonData,
            productSnapshot: product,
            buyedVariants: null,
          };
        }
      }),
    );

    // 3. Insert stratejisi
    if (isThreeD) {
      // 🔍 Mevcut order item'ları getir
      const existingOrderItems = await this.prisma.orderItem.findMany({
        where: { orderId },
        select: { productId: true, variantId: true },
      });

      // 📦 Yeni gelen item'ların ID'lerini topla
      const newItemIds = new Set(
        orderItemsData.map(
          (item) => `${item.productId}-${item.variantId || 'null'}`,
        ),
      );

      // 🗑️ Artık sepette olmayan item'ları bul ve sil
      const itemsToDelete = existingOrderItems.filter((existing) => {
        const existingKey = `${existing.productId}-${existing.variantId || 'null'}`;
        return !newItemIds.has(existingKey);
      });

      if (itemsToDelete.length > 0) {
        await this.prisma.orderItem.deleteMany({
          where: {
            orderId,
            OR: itemsToDelete.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
            })),
          },
        });
      }

      // 🔄 Upsert işlemi
      return await Promise.all(
        orderItemsData.map(async (itemData) => {
          const { orderId, productId, variantId, ...restData } = itemData;

          return this.prisma.orderItem.upsert({
            where: {
              orderId_productId_variantId: {
                orderId,
                productId,
                variantId,
              },
            },
            create: {
              ...restData,
              order: { connect: { id: orderId } },
              product: { connect: { id: productId } },
              ...(variantId && { variant: { connect: { id: variantId } } }),
            },
            update: {
              ...restData,
              order: { connect: { id: orderId } },
              product: { connect: { id: productId } },
              ...(variantId && { variant: { connect: { id: variantId } } }),
            },
          });
        }),
      );
    } else {
      // ⚡ Normal ödeme - CreateMany
      return await this.prisma.orderItem.createMany({
        data: orderItemsData,
        skipDuplicates: true,
      });
    }
  }

  async createOrderItemBeforeThreeD(
    orderId: string,
    basketItems: BasketItem[],
  ) {
    const reducedItems = basketItems.reduce(
      (acc, item) => {
        const existingItem = acc.find(
          (existingItem) => existingItem.id === item.id,
        );

        if (existingItem) {
          existingItem.quantity += 1;
          existingItem.price += item.price;
        } else {
          acc.push({
            ...item,
            quantity: 1,
          });
        }

        return acc;
      },
      [] as Array<BasketItem & { quantity: number }>,
    );
    const orderItemsData: Prisma.OrderItemCreateManyInput[] = reducedItems.map(
      (item) => {
        const [productId, variantId] = item.id.split('-');
        if (!productId) {
          throw new Error(`Invalid itemId format: ${item.id}`);
        }
        if (variantId) {
          return {
            orderId,
            productId,
            variantId,
            buyedPrice: item.price / item.quantity,
            originalPrice: item.price / item.quantity,
            transactionId: null,
            quantity: item.quantity,
            totalPrice: item.price,
          };
        } else {
          return {
            orderId,
            productId,
            variantId,
            buyedPrice: item.price / item.quantity,
            originalPrice: item.price / item.quantity,
            transactionId: null,
            quantity: item.quantity,
            totalPrice: item.price,
          };
        }
      },
    );
    return await this.prisma.orderItem.createMany({
      data: orderItemsData,
      skipDuplicates: true,
    });
  }

  async deleteOrderAndOrderItems(
    cartId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          cartId,
        },
      });
      if (!order) {
        return {
          success: false,
          message: 'Sipariş bulunamadı',
        };
      }

      await this.prisma.order.delete({
        where: { id: order.id },
      });

      await this.prisma.orderItem.deleteMany({
        where: { orderId: order.id },
      });
      return {
        success: true,
        message: 'Sipariş ve sipariş öğeleri başarıyla silindi',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Sipariş silinirken bir hata oluştu',
      };
    }
  }

  async getOrderByOrderNumber(
    orderNumber: string,
  ): Promise<OrderPageGetOrderReturnType> {
    const order = await this.prisma.order.findUnique({
      where: {
        orderNumber,
      },
      include: {
        user: true,
        orderItems: true,
      },
    });

    if (!order) {
      return {
        success: false,
        message: 'Sipariş bulunamadı',
      };
    }

    const { orderItems, ...rest } = order;
    const orderItemsWithType = orderItems.map((item) => {
      const productSnapshot = JSON.parse(
        JSON.stringify(item.productSnapshot),
      ) as OrderPageGetOrderReturnType['order']['orderItems'][number]['productSnapshot'];

      const buyedVariants = item.buyedVariants
        ? (JSON.parse(
            JSON.stringify(item.buyedVariants),
          ) as OrderPageGetOrderReturnType['order']['orderItems'][number]['buyedVariants'])
        : null;

      // Destructure to remove the original productSnapshot and buyedVariants
      const { productSnapshot: _, buyedVariants: __, ...restItem } = item;

      return {
        ...restItem, // Include all other OrderItem fields
        productSnapshot,
        buyedVariants,
      };
    });
    const shippingAddress = JSON.parse(
      JSON.stringify(order.shippingAddress),
    ) as OrderPageGetOrderReturnType['order']['shippingAddress'];
    const billingAddress = JSON.parse(
      JSON.stringify(order.billingAddress),
    ) as OrderPageGetOrderReturnType['order']['billingAddress'];
    return {
      success: true,
      message: 'Sipariş başarıyla bulundu.',
      order: {
        ...rest,
        orderItems: orderItemsWithType,
        billingAddress,
        shippingAddress,
      },
    };
  }
}
