import { BadRequestException, Injectable } from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database';
import {
  CartItemForPayment,
  GetCartForPaymentReturnType,
  GetOrderByIdForPaymentReturnData,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateOrderForPayment(
    data: GetCartForPaymentReturnType['data'],
    shippingAddress: GetCartForPaymentReturnType['data']['cart']['shippingAddress'],
    billingAddress: GetCartForPaymentReturnType['data']['cart']['shippingAddress'],
    provider: $Enums.PaymentProvider,
    userAgent?: string,
    clientIp?: string,
  ): Promise<{
    success: boolean;
    clearUserCart: boolean;
    message: string;
    order?: GetOrderByIdForPaymentReturnData;
  }> {
    return await this.prisma.$transaction(
      async (tx) => {
        const {
          cart,
          totalPrice,
          discountAmount,
          shippingCost,
          totalFinalPrice,
        } = data;

        const cartItems = cart.items as CartItemForPayment[];

        const orderExist = await tx.orderSchema.findUnique({
          where: {
            cartId: cart.id,
          },
          include: {
            itemsSchema: {
              select: {
                variantId: true,
                productId: true,
                quantity: true,
              },
            },
          },
        });

        if (
          orderExist &&
          (orderExist.paymentStatus === 'PAID' ||
            orderExist.paymentStatus === 'PARTIALLY_PAID')
        ) {
          return {
            success: false,
            message: 'Bu siparişin daha önce ödemesi tamamlanmıştır.',
            clearUserCart: true,
            order: orderExist,
          };
        }

        const orderItemsCreateData: Prisma.OrderSchemaCreateArgs['data']['itemsSchema']['createMany']['data'] =
          cartItems.map((item) => {
            const isVariant = !!item.variant;
            const priceSource = isVariant ? item.variant : item.product;

            const price = priceSource.prices.find(
              (p) => p.currency === cart.currency,
            );

            if (!price) {
              throw new BadRequestException(
                `Fiyat (currency: ${cart.currency}) bulunamadı: ${item.productId}`,
              );
            }

            const originalUnitPrice = price.price;

            const finalUnitPrice = price.discountedPrice ?? price.price;

            const quantity = item.quantity;
            const totalOriginalPrice = originalUnitPrice * quantity;
            const totalFinalPrice = finalUnitPrice * quantity;
            const totalDiscountAmount = totalOriginalPrice - totalFinalPrice;

            return {
              productId: item.productId,
              variantId: item.variantId,
              quantity: quantity,
              buyedPrice: finalUnitPrice,
              totalPrice: totalOriginalPrice,
              totalFinalPrice: totalFinalPrice,
              discountAmount: totalDiscountAmount > 0 ? totalDiscountAmount : 0,
              productSnapshot: { ...item.product },
              variantSnapshot: isVariant
                ? { ...item.variant }
                : Prisma.JsonNull,
            };
          });

        if (
          orderExist &&
          (orderExist.paymentStatus === 'PENDING' ||
            orderExist.paymentStatus === 'FAILED')
        ) {
          await tx.orderItemSchema.deleteMany({
            where: { orderId: orderExist.id },
          });

          const updatedOrder = await tx.orderSchema.update({
            where: { id: orderExist.id },
            data: {
              totalPrice: totalPrice,
              totalFinalPrice: totalFinalPrice,
              discountAmount: discountAmount,
              shippingCost: shippingCost,
              currency: cart.currency,
              locale: cart.locale,
              userId: cart.userId,
              billingAddressRecordId:
                cart.billingAddressId || cart.shippingAddressId,
              shippingAddressRecordId: cart.shippingAddressId,
              billingAddressSnapshot: { ...billingAddress },
              shippingAddressSnapshot: { ...shippingAddress },
              cargoRuleId: cart.cargoRuleId,
              cargoRuleSnapshot: cart.cargoRule
                ? { ...cart.cargoRule }
                : Prisma.JsonNull,
              paymentProvider: provider,
              paymentStatus: 'PENDING',
              orderStatus: 'PENDING',
              userAgent: userAgent || null,
              clientIp: clientIp || null,
              itemsSchema: {
                deleteMany: {},
                createMany: {
                  data: orderItemsCreateData,
                  skipDuplicates: true,
                },
              },
            },
            include: {
              itemsSchema: {
                select: {
                  variantId: true,
                  productId: true,
                  quantity: true,
                },
              },
            },
          });

          return {
            success: true,
            clearUserCart: false,
            message: 'Mevcut sipariş güncellendi.',
            order: updatedOrder,
          };
        }

        if (!orderExist) {
          const orderNumber = await this.generateOrderNumber(tx);

          const newOrder = await tx.orderSchema.create({
            data: {
              orderNumber,
              cartId: cart.id,
              totalPrice: totalPrice,
              totalFinalPrice: totalFinalPrice,
              discountAmount: discountAmount,
              shippingCost: shippingCost,
              currency: cart.currency,
              locale: cart.locale,
              userId: cart.userId,
              billingAddressRecordId:
                cart.billingAddressId || cart.shippingAddressId,
              shippingAddressRecordId: cart.shippingAddressId,
              billingAddressSnapshot: { ...billingAddress },
              shippingAddressSnapshot: { ...shippingAddress },
              cargoRuleId: cart.cargoRuleId,
              cargoRuleSnapshot: cart.cargoRule
                ? { ...cart.cargoRule }
                : Prisma.JsonNull,
              paymentProvider: provider,
              paymentStatus: 'PENDING',
              orderStatus: 'PENDING',
              userAgent: userAgent || null,
              clientIp: clientIp || null,
              itemsSchema: {
                create: orderItemsCreateData,
              },
            },
            include: {
              itemsSchema: {
                select: {
                  variantId: true,
                  productId: true,
                  quantity: true,
                },
              },
            },
          });

          return {
            success: true,
            clearUserCart: false,
            message: 'Sipariş başarıyla oluşturuldu.',
            order: newOrder,
          };
        }

        throw new Error('İşlenmeyen sipariş durumu.');
      },
      {
        timeout: 15000,
      },
    );
  }

  async orderUpdate(args: Prisma.OrderSchemaUpdateArgs) {
    return this.prisma.orderSchema.update(args);
  }

  private async getTodayOrdersCount(
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const count = await tx.orderSchema.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return count;
  }

  private async generateOrderNumber(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const todayOrderCount = await this.getTodayOrdersCount(tx);
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const orderCount = (todayOrderCount + 1).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${orderCount}`;
  }

  async getOrderByIdForPayment(
    orderId: string,
  ): Promise<GetOrderByIdForPaymentReturnData | null> {
    return await this.prisma.orderSchema.findUnique({
      where: { id: orderId },
      include: {
        itemsSchema: {
          select: {
            variantId: true,
            productId: true,
            quantity: true,
          },
        },
      },
    });
  }

  async decreaseStockLevelsForOrder(
    tx: Prisma.TransactionClient,
    items: Array<{
      productId: string;
      variantId: string | null;
      quantity: number;
    }>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const variantUpdateMany: Prisma.ProductVariantCombinationUpdateArgs[] =
        items
          .filter((i) => i.variantId !== null)
          .map((item) => ({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          }));

      const productUpdateMany: Prisma.ProductUpdateArgs[] = items
        .filter((i) => i.variantId === null)
        .map((item) => ({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        }));
      for (const variantUpdate of variantUpdateMany) {
        await tx.productVariantCombination.update(variantUpdate);
      }
      for (const productUpdate of productUpdateMany) {
        await tx.product.update(productUpdate);
      }
      return {
        success: true,
        message: 'Stok seviyeleri başarıyla güncellendi.',
      };
    } catch (error) {
      console.error('Stok seviyeleri güncellenirken hata:', error);
      return {
        success: false,
        message: 'Stok seviyeleri güncellenirken bir hata oluştu.',
      };
    }
  }
}
