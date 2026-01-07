import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CustomerGroup, GroupType, Prisma, User } from '@repo/database';
import {
  AdminUserDeleteBulkAction,
  AdminUserTableBulkActionsZodType,
  AdminUserUpdateGroupBulkAction,
  AdminUserUpdateRoleBulkAction,
  AllUsersReturnType,
  CustomerGroupOutputZodType,
  GetUsersQueriesReturnType,
  Pagination,
  SortAdminUserTable,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async getUsers(params: {
    page: number;
    take: number;
    search: string;
    sortBy?: SortAdminUserTable;
  }): Promise<GetUsersQueriesReturnType> {
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

    const take = 20;
    const skip = (params.page - 1) * take;

    let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'desc' };

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
          orderBy = { createdAt: 'desc' };
      }
    }

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where: whereClause,
        orderBy,
        take,
        skip,
      }),
      this.prismaService.user.count({
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

  async getUserInfos(): Promise<AllUsersReturnType[]> {
    const user = await this.prismaService.user.findMany({
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

  async getUserData(
    page: number,
    search: string | null,
    take: number,
  ): Promise<{ users: User[]; pagination?: Pagination }> {
    const skip = (page - 1) * take;
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              surname: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              phone: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};
    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip,
        take,
      }),
      this.prismaService.user.count({
        where,
      }),
    ]);

    return {
      users,
      pagination: {
        currentPage: page,
        totalCount: total,
        perPage: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async upsertCustomerGroup(
    data: CustomerGroupOutputZodType,
  ): Promise<{ success: boolean; groupId?: string }> {
    try {
      const isSmartGroup = data.type === GroupType.SMART;

      const conditions = isSmartGroup
        ? (data.conditions as Prisma.JsonObject)
        : Prisma.DbNull;

      const usersForCreate = isSmartGroup
        ? undefined
        : {
            connect: (data.users || []).map((userId) => ({ id: userId })),
          };

      const usersForUpdate = isSmartGroup
        ? { set: [] }
        : {
            set: (data.users || []).map((userId) => ({ id: userId })),
          };

      const basePayload = {
        name: data.name,
        description: data.description || null,
        type: data.type,
        conditions: conditions,
      };

      const upserted = await this.prismaService.customerGroup.upsert({
        where: {
          id: data.uniqueId || 'new-record',
        },
        create: {
          ...(data.uniqueId ? { id: data.uniqueId } : {}),
          ...basePayload,
          users: usersForCreate,
        },
        update: {
          ...basePayload,
          users: usersForUpdate,
        },
      });

      return {
        success: true,
        groupId: upserted.id,
      };
    } catch (error) {
      console.error('CustomerGroup (Segment) upsert error:', error);
      throw new InternalServerErrorException('Grup kaydedilemedi');
    }
  }

  async getCustomerGroups(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    groups: (CustomerGroup & { _count: { users: number } })[];
    pagination: Pagination;
  }> {
    try {
      const skip = (page - 1) * limit;

      const where: Prisma.CustomerGroupWhereInput = {
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      };

      const [groups, total] = await Promise.all([
        this.prismaService.customerGroup.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { users: true },
            },
          },
        }),
        this.prismaService.customerGroup.count({ where }),
      ]);

      return {
        groups,
        pagination: {
          currentPage: page,
          totalCount: total,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Get Smart Groups error:', error);
      throw new InternalServerErrorException('Akıllı gruplar alınamadı');
    }
  }

  async getCustomerGroup(
    id: string,
  ): Promise<{ group: CustomerGroup; users: User[] } | null> {
    try {
      const group = await this.prismaService.customerGroup.findUnique({
        where: { id: id },
      });

      if (!group) return null;

      let users: User[] = [];

      if (group.type === 'MANUAL') {
        users = await this.prismaService.user.findMany({
          where: {
            customerGroups: {
              some: {
                id: id,
              },
            },
          },
        });
      }

      return {
        group,
        users,
      };
    } catch (error) {
      console.error('Get CustomerGroup error:', error);
      throw new InternalServerErrorException('Grup detayı alınamadı');
    }
  }

  async handleBulkActions(data: AdminUserTableBulkActionsZodType) {
    try {
      switch (data.action) {
        case 'DELETE':
          return await this.bulkDeleteUsers(data);

        case 'UPDATE_ROLE':
          return await this.bulkUpdateRole(data);

        case 'UPDATE_GROUP':
          return await this.bulkUpdateGroup(data);

        default:
          throw new BadRequestException('Geçersiz işlem tipi');
      }
    } catch (error) {
      throw error;
    }
  }

  private async bulkDeleteUsers(data: AdminUserDeleteBulkAction) {
    const result = await this.prismaService.user.updateMany({
      where: {
        id: { in: data.ids },
      },
      data: {
        accountStatus: 'PASSIVE',
      },
    });

    return { success: true, message: `${result.count} kullanıcı silindi.` };
  }

  private async bulkUpdateRole(data: AdminUserUpdateRoleBulkAction) {
    const result = await this.prismaService.user.updateMany({
      where: {
        id: { in: data.ids },
      },
      data: {
        role: data.role,
      },
    });

    return {
      success: true,
      message: `${result.count} kullanıcının rolü güncellendi.`,
    };
  }

  private async bulkUpdateGroup(data: AdminUserUpdateGroupBulkAction) {
    const group = await this.prismaService.customerGroup.findUnique({
      where: { id: data.groupId },
      select: { id: true, type: true, name: true },
    });

    if (!group) {
      throw new NotFoundException('Hedef grup bulunamadı.');
    }

    if (group.type === 'SMART') {
      throw new BadRequestException(
        `"${group.name}" akıllı bir gruptur. Kullanıcılar manuel olarak eklenemez, koşullara göre otomatik atanır.`,
      );
    }

    await this.prismaService.customerGroup.update({
      where: { id: data.groupId },
      data: {
        users: {
          connect: data.ids.map((userId) => ({ id: userId })),
        },
      },
    });

    return {
      success: true,
      message: `${data.ids.length} kullanıcı "${group.name}" grubuna başarıyla eklendi.`,
    };
  }

  async getAllCustomerGroups(): Promise<CustomerGroup[]> {
    const groups = await this.prismaService.customerGroup.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return groups;
  }
}
