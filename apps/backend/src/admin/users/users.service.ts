import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/database';
import {
  AllUsersReturnType,
  GetUsersQueriesReturnType,
  SortAdminUserTable,
  UserIdAndName,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

interface getUsersParams {
  search: string;
  page: number;
  sortBy: SortAdminUserTable;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers(params: getUsersParams): Promise<GetUsersQueriesReturnType> {
    const whereClause: Prisma.UserWhereInput = {
      ...(params.search &&
        params.search.trim() !== '' && {
          OR: [
            {
              name: {
                contains: params.search,
                mode: 'insensitive',
              },
            },
            {
              surname: {
                contains: params.search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: params.search,
                mode: 'insensitive',
              },
            },
            {
              phone: {
                contains: params.search,
                mode: 'insensitive',
              },
            },
          ],
        }),
    };

    const take = 10;
    const skip = (params.page - 1) * take;

    // Default sıralama ekle - eğer sortBy gelmezse default olarak createdAt desc
    let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'desc' };

    // sortBy parametresi varsa ve geçerliyse kullan
    if (
      params.sortBy &&
      Object.values(SortAdminUserTable).includes(params.sortBy)
    ) {
      switch (params.sortBy) {
        case SortAdminUserTable.nameAsc:
          orderBy = { name: 'asc' };
          break;
        case SortAdminUserTable.nameDesc:
          orderBy = { name: 'desc' };
          break;
        case SortAdminUserTable.createdAtAsc:
          orderBy = { createdAt: 'asc' };
          break;
        case SortAdminUserTable.createdAtDesc:
          orderBy = { createdAt: 'desc' };
          break;
        default:
          // Default durumda en yeni kayıtlar üstte
          orderBy = { createdAt: 'desc' };
      }
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        orderBy,
        take,
        skip,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          surname: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({
        where: whereClause,
      }),
    ]);

    return {
      users,
      pagination: {
        total,
        page: params.page,
        totalPages: Math.ceil(total / take),
        hasNext: params.page * take < total,
        hasPrev: params.page > 1,
      },
    };
  }

  async getUsersIdAndName(): Promise<UserIdAndName[]> {
    const users = await this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        surname: true,
      },
    });
    return users.map((user) => ({
      id: user.id,
      name: `${user.name} ${user.surname}`,
    }));
  }

  async getUserInfos(): Promise<AllUsersReturnType[]> {
    const user = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        surname: true,
      },
    });

    if (!user) {
      return [];
    }

    return user;
  }
}
