import { Injectable } from '@nestjs/common';
import { User } from '@repo/database';
import { OrderPageReturnType } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async getOrder(
    slug: string,
    user: User | null,
  ): Promise<OrderPageReturnType> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            surname: true,
            phone: true,
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

    if (user && order.userId !== user.id) {
      return {
        success: false,
        message: 'Bu siparişe erişim yetkiniz yok.',
      };
    }

    return {
      success: true,
      message: 'Sipariş başarıyla getirildi.',
      order,
    };
  }
}
