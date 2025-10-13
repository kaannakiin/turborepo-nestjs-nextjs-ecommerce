import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/database';
import { getOrderStatusFromInt, getPaymentStatusFromInt } from '@repo/shared';
import {
  GetOrderReturnType,
  GetOrdersReturnType,
  GetOrderZodType,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrders({
    page,
    orderStatus,
    paymentStatus,
    search,
  }: GetOrderZodType): Promise<GetOrdersReturnType> {
    const take = 10;
    const skip = (page - 1) * take;

    const searchTerm = search?.trim();
    const hasSearch = searchTerm && searchTerm.length > 0;

    const where: Prisma.OrderWhereInput = {
      ...(orderStatus !== undefined &&
        orderStatus !== null && {
          orderStatus: getOrderStatusFromInt(orderStatus),
        }),

      ...(paymentStatus !== undefined &&
        paymentStatus !== null && {
          paymentStatus: getPaymentStatusFromInt(paymentStatus),
        }),

      ...(hasSearch && {
        OR: [
          {
            orderNumber: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            user: {
              email: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              surname: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              phone: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            shippingAddress: {
              path: ['phone'],
              string_contains: searchTerm,
            },
          },
          {
            shippingAddress: {
              path: ['tcKimlikNo'],
              string_contains: searchTerm,
            },
          },
          {
            shippingAddress: {
              path: ['email'],
              string_contains: searchTerm,
            },
          },
          {
            shippingAddress: {
              path: ['name'],
              string_contains: searchTerm,
            },
          },
          {
            shippingAddress: {
              path: ['surname'],
              string_contains: searchTerm,
            },
          },
          {
            billingAddress: {
              path: ['phone'],
              string_contains: searchTerm,
            },
          },
          {
            billingAddress: {
              path: ['tcKimlikNo'],
              string_contains: searchTerm,
            },
          },
        ],
      }),
    };

    const [orders, totalCount] = await Promise.all([
      this.prisma.order.findMany({
        where,
        take,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              name: true,
              surname: true,
              email: true,
              phone: true,
              imageUrl: true,
            },
          },
          orderItems: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      success: true,
      message: 'Siparişler başarıyla getirildi.',
      orders,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / take),
        currentPage: page,
        itemsPerPage: take,
        hasNextPage: skip + take < totalCount,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getOrderByOrderNumber(
    orderNumber: string,
  ): Promise<GetOrderReturnType> {
    if (!orderNumber || orderNumber.trim().length === 0) {
      return {
        success: false,
        message: 'Geçersiz sipariş numarası.',
      };
    }

    // 1. Prisma sorgusunda kullanıcı ID'sini de istiyoruz.
    const order = await this.prisma.order.findUnique({
      where: {
        orderNumber,
      },
      include: {
        user: {
          select: {
            id: true, // ID eklendi
            name: true,
            email: true,
            phone: true,
            surname: true,
          },
        },
        orderItems: true,
      },
    });

    if (!order) {
      return {
        success: false,
        message: 'Sipariş bulunamadı.',
      };
    }

    let resultOrder: GetOrderReturnType['order'];

    if (order.user) {
      const successfulOrderCount = await this.prisma.order.count({
        where: {
          userId: order.user.id,
          paymentStatus: { not: 'FAILED' },
        },
      });

      resultOrder = {
        ...order,
        user: {
          ...order.user,
          successfulOrderCount: successfulOrderCount,
        },
      };
    } else {
      resultOrder = {
        ...order,
        user: null,
      };
    }

    return {
      success: true,
      message: 'Sipariş başarıyla getirildi.',
      order: resultOrder,
    };
  }
}
