import { Injectable } from '@nestjs/common';
import { MainDiscount } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DiscountsService {
  constructor(private readonly prisma: PrismaService) {}
  async upgradeOrCreateDiscount(body: MainDiscount) {}
}
