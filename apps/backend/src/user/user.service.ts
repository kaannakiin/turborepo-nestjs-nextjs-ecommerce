import { Injectable } from '@nestjs/common';
import { type Prisma } from '@repo/database/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findUnique(args: Prisma.UserFindUniqueArgs) {
    return this.prismaService.user.findUnique(args);
  }
  async findFirst(args: Prisma.UserFindFirstArgs) {
    return this.prismaService.user.findFirst(args);
  }

  async findMany(args: Prisma.UserFindManyArgs) {
    return this.prismaService.user.findMany(args);
  }

  async createUser(args: Prisma.UserCreateArgs) {
    return this.prismaService.user.create(args);
  }
  async updateUser(args: Prisma.UserUpdateArgs) {
    return this.prismaService.user.update(args);
  }
}
