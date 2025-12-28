import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/database';
import {
  adminBrandTableQuery,
  BrandIdAndName,
  BrandTableApiResponse,
  BrandZodType,
} from '@repo/types';
import { LocaleService } from 'src/common/services/locale/locale.service';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly localeService: LocaleService,
    private readonly minioService: MinioService,
  ) {}

  private getWhereCondition(search?: string): Prisma.BrandWhereInput {
    if (!search?.trim()) return {};

    const trimmedValue = search.trim();
    return {
      OR: [
        {
          translations: {
            some: {
              slug: {
                contains: trimmedValue,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          translations: {
            some: {
              name: {
                contains: trimmedValue,
                mode: 'insensitive',
              },
            },
          },
        },
      ],
    };
  }

  async getBrands(params: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<BrandTableApiResponse> {
    const { search, page = 1, limit = 20 } = params;

    const skip = (page - 1) * limit;
    const where = this.getWhereCondition(search);

    try {
      const [brands, total] = await Promise.all([
        this.prismaService.brand.findMany({
          where,
          select: adminBrandTableQuery,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prismaService.brand.count({ where }),
      ]);

      return {
        success: true,
        brands,
        pagination: {
          currentPage: page,
          perPage: limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching brands', error);
      throw new InternalServerErrorException('Failed to fetch brands');
    }
  }

  async getAllBrandsIdsAndName(): Promise<BrandIdAndName[]> {
    const locale = this.localeService.getLocale();
    return await this.prismaService.brand
      .findMany({
        select: {
          id: true,
          translations: true,
        },
      })
      .then((brands) =>
        brands.map((brand) => {
          const translation =
            brand.translations.find((t) => t.locale === locale) ||
            brand.translations[0];
          return {
            id: brand.id,
            name: translation ? translation.name : 'N/A',
          };
        }),
      );
  }

  async createOrUpdateBrand(
    data: Omit<BrandZodType, 'image'>,
  ): Promise<{ success: boolean; brandId: string }> {
    try {
      const brand = await this.prismaService.$transaction(async (prisma) => {
        const brand = prisma.brand.upsert({
          where: { id: data.uniqueId },
          create: {
            id: data.uniqueId,
            translations: {
              createMany: {
                data: data.translations.map((t) => ({
                  locale: t.locale,
                  name: t.name,
                  slug: t.slug,
                  description: t.description,
                  metaDescription: t.metaDescription,
                  metaTitle: t.metaTitle,
                })),
                skipDuplicates: true,
              },
            },
            parentBrandId: data.parentId || null,
          },
          update: {
            parentBrandId: data.parentId || null,
            translations: {
              upsert: data.translations.map((t) => ({
                where: {
                  locale_brandId: {
                    brandId: data.uniqueId,
                    locale: t.locale,
                  },
                },
                create: {
                  locale: t.locale,
                  name: t.name,
                  slug: t.slug,
                  description: t.description,
                  metaDescription: t.metaDescription,
                  metaTitle: t.metaTitle,
                },
                update: {
                  locale: t.locale,
                  name: t.name,
                  slug: t.slug,
                  description: t.description,
                  metaDescription: t.metaDescription,
                  metaTitle: t.metaTitle,
                },
              })),
            },
          },
        });
        return brand;
      });
      return {
        brandId: brand.id,
        success: true,
      };
    } catch (error) {
      this.logger.error('Error creating or updating brand', error);
      throw new InternalServerErrorException(
        'Failed to create or update brand',
      );
    }
  }

  async uploadBrandImage(brandId: string, file: Express.Multer.File) {
    try {
      const brand = await this.prismaService.brand.findUnique({
        where: { id: brandId },
        include: { image: true },
      });

      if (!brand) {
        return {
          success: false,
          message: 'Marka bulunamadı',
        };
      }

      const { data, success } = await this.minioService.uploadAsset({
        bucketName: 'brands',
        file,
        isNeedOg: true,
        isNeedThumbnail: true,
      });

      if (!success) {
        return {
          success: false,
          message: 'Dosya yükleme başarısız oldu',
        };
      }

      await this.prismaService.$transaction(async (tx) => {
        if (brand.image) {
          await tx.asset.delete({
            where: { id: brand.image.id },
          });

          await this.minioService.deleteAsset(brand.image.url);
        }

        await tx.brand.update({
          where: { id: brandId },
          data: {
            image: {
              create: {
                url: data.url,
                type: data.type,
              },
            },
          },
        });
      });

      return {
        success: true,
        message: 'Marka görseli başarıyla güncellendi',
        data: {
          url: data.url,
          type: data.type,
        },
      };
    } catch (error) {
      this.logger.error('Error uploading brand image', error);
      throw new InternalServerErrorException('Failed to upload brand image');
    }
  }

  async deleteBrand(
    brandId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const brand = await this.prismaService.brand.findUnique({
        where: { id: brandId },
        include: { image: true },
      });

      if (!brand) {
        throw new NotFoundException('Marka bulunamadı');
      }

      await this.prismaService.$transaction(async (tx) => {
        if (brand.image) {
          await this.minioService.deleteAsset(brand.image.url);
          await tx.asset.delete({ where: { id: brand.image.id } });
        }

        await tx.brand.delete({ where: { id: brandId } });
      });

      return {
        success: true,
        message: 'Marka başarıyla silindi',
      };
    } catch (error) {
      this.logger.error('Error deleting brand', error);
      throw new InternalServerErrorException(
        'Marka silinirken bir hata oluştu',
      );
    }
  }

  async getBrandFormValue(brandId: string): Promise<BrandZodType> {
    const brand = await this.prismaService.brand.findUnique({
      where: { id: brandId },
      include: {
        image: true,
        translations: true,
      },
    });
    if (!brand) {
      throw new NotFoundException('Marka bulunamadı');
    }
    return {
      translations: brand.translations.map((t) => ({
        locale: t.locale,
        name: t.name,
        slug: t.slug,
        description: t.description,
        metaDescription: t.metaDescription,
        metaTitle: t.metaTitle,
      })),
      uniqueId: brand.id,
      existingImage: brand.image?.url || null,
      parentId: brand.parentBrandId || null,
      image: null,
    };
  }

  async deleteBrandImage(url: string) {
    try {
      const asset = await this.prismaService.asset.findUnique({
        where: { url },
      });

      if (!asset) {
        throw new NotFoundException('Görsel bulunamadı');
      }

      await this.prismaService.$transaction(async (tx) => {
        await tx.asset.delete({ where: { id: asset.id } });
        await this.minioService.deleteAsset(url);
      });
      return { success: true, message: 'Görsel başarıyla silindi' };
    } catch (error) {
      this.logger.error('Error deleting brand image', error);
      throw new InternalServerErrorException(
        'Görsel silinirken bir hata oluştu',
      );
    }
  }
}
