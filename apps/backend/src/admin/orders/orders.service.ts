import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database';
import {
  AdminGetOrderReturnType,
  AdminGetOrdersReturnType,
  OrderItemWithSnapshot,
  OrderWithSnapshot,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrders({
    page,
    limit,
    search,
    orderStatus,
  }: {
    page: number;
    limit: number;
    search?: string;
    orderStatus?: $Enums.OrderStatus;
  }): Promise<AdminGetOrdersReturnType> {
    try {
      const take = limit;
      const skip = (page - 1) * limit;

      const searchConditions: Prisma.OrderSchemaWhereInput['OR'] = search
        ? [
            {
              user: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              user: {
                surname: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              user: {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              user: {
                phone: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              orderNumber: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ]
        : undefined;

      const orderWhere: Prisma.OrderSchemaWhereInput = {
        ...(orderStatus && { orderStatus }),
        ...(searchConditions && { OR: searchConditions }),
      };

      const [orders, total] = await Promise.all([
        this.prisma.orderSchema.findMany({
          where: orderWhere,
          take,
          skip,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                phone: true,
              },
            },
            itemsSchema: true,
            shipments: true,
            transactions: true,
          },
        }),
        this.prisma.orderSchema.count({
          where: orderWhere,
        }),
      ]);

      return {
        success: true,
        orders: orders.map((order) => ({
          ...order,
          billingAddressSnapshot: JSON.parse(
            JSON.stringify(order.billingAddressSnapshot),
          ) as OrderWithSnapshot['billingAddressSnapshot'],
          shippingAddressSnapshot: JSON.parse(
            JSON.stringify(order.shippingAddressSnapshot),
          ) as OrderWithSnapshot['shippingAddressSnapshot'],
          cargoRuleSnapshot: JSON.parse(
            JSON.stringify(order.cargoRuleSnapshot),
          ) as OrderWithSnapshot['cargoRuleSnapshot'],
          itemSchema: order.itemsSchema.map((item) => ({
            ...item,
            productSnapshot: JSON.parse(
              JSON.stringify(item.productSnapshot),
            ) as OrderItemWithSnapshot['productSnapshot'],
            variantSnapshot: item.variantSnapshot
              ? (JSON.parse(
                  JSON.stringify(item.variantSnapshot),
                ) as OrderItemWithSnapshot['variantSnapshot'])
              : null,
          })) as OrderItemWithSnapshot[],
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching orders:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          'Veritabanı hatası: Siparişler alınırken bir sorun oluştu.',
        );
      }

      throw new InternalServerErrorException(
        'Siparişler alınırken beklenmeyen bir hata oluştu.',
      );
    }
  }

  async getOrderByOrderNumber(
    orderNumber: string,
  ): Promise<AdminGetOrderReturnType> {
    try {
      const order = await this.prisma.orderSchema.findUnique({
        where: {
          orderNumber,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              phone: true,
            },
          },
          itemsSchema: true,
          shipments: true,
          transactions: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!order) {
        return {
          success: false,
          message: 'Sipariş bulunamadı.',
        };
      }
      return {
        success: true,
        message: 'Sipariş başarıyla alındı.',
        order: {
          ...order,
          billingAddressSnapshot: JSON.parse(
            JSON.stringify(order.billingAddressSnapshot),
          ) as OrderWithSnapshot['billingAddressSnapshot'],
          shippingAddressSnapshot: JSON.parse(
            JSON.stringify(order.shippingAddressSnapshot),
          ) as OrderWithSnapshot['shippingAddressSnapshot'],
          cargoRuleSnapshot: JSON.parse(
            JSON.stringify(order.cargoRuleSnapshot),
          ) as OrderWithSnapshot['cargoRuleSnapshot'],
          itemSchema: order.itemsSchema.map((item) => ({
            ...item,
            productSnapshot: JSON.parse(
              JSON.stringify(item.productSnapshot),
            ) as OrderItemWithSnapshot['productSnapshot'],
            variantSnapshot: item.variantSnapshot
              ? (JSON.parse(
                  JSON.stringify(item.variantSnapshot),
                ) as OrderItemWithSnapshot['variantSnapshot'])
              : null,
          })) as OrderItemWithSnapshot[],
        },
      };
    } catch (error) {
      console.error('Error fetching order by order number:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          'Veritabanı hatası: Sipariş alınırken bir sorun oluştu.',
        );
      }

      throw new InternalServerErrorException(
        'Sipariş alınırken beklenmedik bir hata oluştu.',
      );
    }
  }
}
