import { Injectable } from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database';

@Injectable()
export class CartsService {
  async getAllCarts({
    page,
    limit,
    search,
    status,
  }: {
    page: number;
    limit: number;
    search?: string;
    status?: $Enums.CartStatus;
  }) {
    const skip = (page - 1) * limit;

    const where: Prisma.CartFindManyArgs = {
      take: limit,
      where: {
        ...(search?.trim()
          ? {
              OR: [
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                {
                  user: { surname: { contains: search, mode: 'insensitive' } },
                },
              ],
            }
          : {}),
      },
    };
  }
}
