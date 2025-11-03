import { Injectable } from '@nestjs/common';
import { $Enums } from '@repo/database';
import { CartWhereInput, GetAllCartsReturnType } from '@repo/types';
import { LocaleService } from 'src/common/services/locale.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartsService {
  private locale: $Enums.Locale;
  constructor(
    private readonly localeService: LocaleService,
    private prisma: PrismaService,
  ) {
    this.locale = this.localeService.getLocale();
  }
  async getAllCarts({
    page,
    limit,
    search,
    status,
    startDate,
    endDate,
  }: {
    page: number;
    limit: number;
    search?: string;
    status?: $Enums.CartStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<GetAllCartsReturnType> {
    const skip = (page - 1) * limit;

    const where: CartWhereInput = {
      ...(status ? { status: status } : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
      ...(search?.trim()
        ? {
            OR: [
              { user: { email: { contains: search, mode: 'insensitive' } } },
              { user: { name: { contains: search, mode: 'insensitive' } } },
              { user: { surname: { contains: search, mode: 'insensitive' } } },
              {
                orderAttempts: {
                  some: {
                    orderNumber: { contains: search, mode: 'insensitive' },
                  },
                },
              },
            ],
          }
        : {}),
    };

    try {
      const [carts, totalCount] = await this.prisma.$transaction([
        this.prisma.cart.findMany({
          where: where,
          take: limit,
          skip: skip,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: true,
            _count: {
              select: {
                items: true,
                orderAttempts: true,
              },
            },
          },
        }),
        this.prisma.cart.count({ where }),
      ]);

      return {
        success: true,
        message: 'Sepetler başarıyla getirildi.',
        data: {
          carts,
          pagination: {
            currentPage: page,
            perPage: limit,
            totalCount: totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Sepetler getirilirken bir hata oluştu.',
        data: null,
      };
    }
  }
}
