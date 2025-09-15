import { BadRequestException, Injectable } from '@nestjs/common';
import { Cuid2ZodType, OrderUpdate, Slider, SliderItem } from '@repo/types';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SliderService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  async createOrUpdateSliderItem(
    sliderItem: Omit<SliderItem, 'desktopAsset' | 'mobileAsset'>,
  ) {
    let sliderSchema = await this.prisma.sliderSchema.findFirst({
      include: {
        sliders: {
          orderBy: { order: 'desc' },
        },
      },
    });
    if (!sliderSchema) {
      sliderSchema = await this.prisma.sliderSchema.create({
        data: {
          isAutoPlay: false,
          autoPlayInterval: null,
        },
        include: {
          sliders: {
            orderBy: { order: 'desc' },
          },
        },
      });
    }

    const finalOrder = (sliderSchema.sliders.length || -1) + 1;

    const sliderItemData = {
      order: finalOrder,
      isActive: sliderItem.isActive ?? true,
      startDate: sliderItem.startDate,
      endDate: sliderItem.endDate,
      customLink: sliderItem.customLink,
      productLink: sliderItem.productLink,
      categoryLink: sliderItem.categoryLink,
      brandLink: sliderItem.brandLink,
      sliderSchemaId: sliderSchema.id,
    };

    return await this.prisma.sliderItemSchema.upsert({
      where: {
        id: sliderItem.uniqueId,
      },
      create: {
        id: sliderItem.uniqueId,
        ...sliderItemData,
      },
      update: sliderItemData,
    });
  }

  async createOrUpdateMobileAsset(
    file: Express.Multer.File,
    uniqueId: Cuid2ZodType,
  ) {
    const slider = await this.prisma.sliderItemSchema.findUnique({
      where: { id: uniqueId },
      include: {
        mobileAsset: true,
      },
    });

    if (!slider) {
      throw new BadRequestException('Slider öğesi bulunamadı.');
    }

    const urls = await this.minio.uploadAsset({
      bucketName: 'theme',
      file,
      isNeedOg: false,
      isNeedThumbnail: false,
    });

    if (!urls.success) {
      throw new BadRequestException(
        'Dosya yüklenemedi, lütfen tekrar deneyin.',
      );
    }

    // Mevcut asset varsa sil, yoksa sadece oluştur
    if (slider.mobileAsset) {
      return await this.prisma.sliderItemSchema.update({
        where: { id: uniqueId },
        data: {
          mobileAsset: {
            delete: true,
            create: {
              url: urls.data.url,
              type: urls.data.type,
            },
          },
        },
      });
    } else {
      return await this.prisma.sliderItemSchema.update({
        where: { id: uniqueId },
        data: {
          mobileAsset: {
            create: {
              url: urls.data.url,
              type: urls.data.type,
            },
          },
        },
      });
    }
  }

  async createOrUpdateDesktopAsset(
    file: Express.Multer.File,
    uniqueId: Cuid2ZodType,
  ) {
    const slider = await this.prisma.sliderItemSchema.findUnique({
      where: { id: uniqueId },
      include: {
        desktopAsset: true,
      },
    });

    if (!slider) {
      throw new BadRequestException('Slider öğesi bulunamadı.');
    }

    const urls = await this.minio.uploadAsset({
      bucketName: 'theme',
      file,
      isNeedOg: false,
      isNeedThumbnail: false,
    });

    if (!urls.success) {
      throw new BadRequestException(
        'Dosya yüklenemedi, lütfen tekrar deneyin.',
      );
    }

    // Mevcut asset varsa sil, yoksa sadece oluştur
    if (slider.desktopAsset) {
      return await this.prisma.sliderItemSchema.update({
        where: { id: uniqueId },
        data: {
          desktopAsset: {
            delete: true,
            create: {
              url: urls.data.url,
              type: urls.data.type,
            },
          },
        },
      });
    } else {
      return await this.prisma.sliderItemSchema.update({
        where: { id: uniqueId },
        data: {
          desktopAsset: {
            create: {
              url: urls.data.url,
              type: urls.data.type,
            },
          },
        },
      });
    }
  }

  async getSliderItem(id: Cuid2ZodType): Promise<SliderItem> {
    const slider = await this.prisma.sliderItemSchema.findUnique({
      where: { id },
      include: {
        brand: {
          select: {
            id: true,
          },
        },
        category: {
          select: {
            id: true,
          },
        },
        product: {
          select: {
            id: true,
          },
        },
        desktopAsset: {
          select: {
            url: true,
            type: true,
          },
        },
        mobileAsset: {
          select: {
            url: true,
            type: true,
          },
        },
      },
    });
    if (!slider) {
      throw new BadRequestException('Slider öğesi bulunamadı.');
    }
    return {
      uniqueId: slider.id,
      customLink: slider.customLink,
      productLink: slider.product?.id || null,
      categoryLink: slider.category?.id || null,
      brandLink: slider.brand?.id || null,
      startDate: slider.startDate,
      endDate: slider.endDate,
      isActive: slider.isActive,
      existingDesktopAsset: slider.desktopAsset
        ? { type: slider.desktopAsset.type, url: slider.desktopAsset.url }
        : null,
      existingMobileAsset: slider.mobileAsset
        ? { type: slider.mobileAsset.type, url: slider.mobileAsset.url }
        : null,
      desktopAsset: undefined,
      mobileAsset: undefined,
    };
  }

  async getSliderItems(): Promise<Slider> {
    const slider = await this.prisma.sliderSchema.findFirst({
      include: {
        sliders: {
          include: {
            brand: {
              select: {
                id: true,
              },
            },
            category: {
              select: {
                id: true,
              },
            },
            product: {
              select: {
                id: true,
              },
            },
            desktopAsset: {
              select: {
                url: true,
                type: true,
              },
            },
            mobileAsset: {
              select: {
                url: true,
                type: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!slider) {
      throw new BadRequestException('Slider bulunamadı.');
    }
    return {
      isAutoPlay: slider.isAutoPlay || false,
      autoPlayInterval: slider.autoPlayInterval || null,
      sliders: slider.sliders.map((s) => ({
        uniqueId: s.id,
        customLink: s.customLink,
        productLink: s.product?.id || null,
        categoryLink: s.category?.id || null,
        brandLink: s.brand?.id || null,
        startDate: s.startDate ? new Date(s.startDate) : null,
        endDate: s.endDate ? new Date(s.endDate) : null,
        isActive: s.isActive,
        existingDesktopAsset: s.desktopAsset
          ? { type: s.desktopAsset.type, url: s.desktopAsset.url }
          : null,
        existingMobileAsset: s.mobileAsset
          ? { type: s.mobileAsset.type, url: s.mobileAsset.url }
          : null,
        desktopAsset: undefined,
        mobileAsset: undefined,
        order: s.order,
      })),
    };
  }

  async orderUpdateSliderItems(body: OrderUpdate) {
    await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        body.map((item, index) =>
          tx.sliderItemSchema.update({
            where: { id: item.uniqueId },
            data: { order: -(index + 1000) },
          }),
        ),
      );

      await Promise.all(
        body.map((item) =>
          tx.sliderItemSchema.update({
            where: { id: item.uniqueId },
            data: { order: item.order },
          }),
        ),
      );
    });

    return {
      message: 'Slider sıralaması başarıyla güncellendi',
    };
  }
  async updateSliderSettings(body: Omit<Slider, 'sliders'>) {
    const slider = await this.prisma.sliderSchema.findFirst();
    if (!slider) {
      throw new BadRequestException('Slider bulunamadı.');
    }
    await this.prisma.sliderSchema.update({
      where: { id: slider.id },
      data: {
        isAutoPlay: body.isAutoPlay,
        autoPlayInterval: body.autoPlayInterval,
      },
    });
    return {
      message: 'Slider ayarları başarıyla güncellendi',
    };
  }
}
