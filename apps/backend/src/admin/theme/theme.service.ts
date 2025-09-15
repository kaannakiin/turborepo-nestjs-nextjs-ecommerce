import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ThemeService {
  constructor(private readonly prisma: PrismaService) {}

  async getLayoutComponents() {
    const layout = await this.prisma.layout.findFirst({
      include: {
        components: {
          orderBy: { order: 'asc' },
          include: {
            marquee: {
              include: {
                items: true,
              },
            },
            slider: {
              include: {
                sliders: {
                  include: {
                    brand: true,
                    category: true,
                    desktopAsset: true,
                    mobileAsset: true,
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
