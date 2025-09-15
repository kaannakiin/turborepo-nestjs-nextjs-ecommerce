import { Injectable } from '@nestjs/common';
import { MarqueeItem } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MarqueeService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateMarqueeItem(data: MarqueeItem) {
    let marquee = await this.prisma.marqueeSchema.findFirst();
    if (!marquee) {
      marquee = await this.prisma.marqueeSchema.create({
        data: {},
      });
    }
  }
}
