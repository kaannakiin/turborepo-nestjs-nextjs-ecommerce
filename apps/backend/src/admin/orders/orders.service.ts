import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/database';
import { getOrderStatusFromInt, getPaymentStatusFromInt } from '@repo/shared';
import { GetOrderReturnType, GetOrderZodType } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrder({
    page,
    orderStatus,
    paymentStatus,
    search,
  }: GetOrderZodType): Promise<GetOrderReturnType> {
    const take = 10;
    const skip = (page - 1) * take;
    console.log({
      page,
      orderStatus,
      paymentStatus,
      search,
    });
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
}
