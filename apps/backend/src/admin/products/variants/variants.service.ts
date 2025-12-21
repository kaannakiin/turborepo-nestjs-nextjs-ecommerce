import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@repo/database';
import { VariantGroupZodType } from '@repo/types';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VariantsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  async getAllVariants(): Promise<VariantGroupZodType[]> {
    const variants = await this.prismaService.variantGroup.findMany({
      include: {
        translations: true,
        options: {
          select: {
            id: true,
            translations: true,
            hexValue: true,
            asset: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });
    if (!variants) {
      return [];
    }
    return variants.map((variant) => ({
      uniqueId: variant.id,
      renderVisibleType: 'BADGE',
      options: variant.options.map((option) => ({
        translations: option.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
          slug: t.slug,
        })) as VariantGroupZodType['options'][0]['translations'],
        uniqueId: option.id,
        hexValue: option.hexValue,
        existingFile: option.asset?.url || null,
        file: null,
      })) as VariantGroupZodType['options'],
      translations: variant.translations.map((t) => ({
        locale: t.locale,
        name: t.name,
        slug: t.slug,
      })) as VariantGroupZodType['translations'],
      type: variant.type,
    }));
  }

  async createOrUpdateVariantGroup(data: VariantGroupZodType) {
    const { uniqueId, translations, type } = data;
    try {
      const upsertedVariantGroup = await this.prismaService.variantGroup.upsert(
        {
          where: { id: uniqueId },
          create: {
            id: uniqueId,
            type,
            translations: {
              createMany: {
                data: translations.map((t) => ({
                  name: t.name,
                  slug: t.slug,
                  locale: t.locale,
                })),
                skipDuplicates: true,
              },
            },
            options: {
              createMany: {
                data: data.options.map((option) => ({
                  hexValue: option.hexValue,
                  id: option.uniqueId,
                })),
                skipDuplicates: true,
              },
            },
          },
          update: {
            id: uniqueId,
            type,
            translations: {
              createMany: {
                data: translations.map((t) => ({
                  name: t.name,
                  slug: t.slug,
                  locale: t.locale,
                })),
                skipDuplicates: true,
              },
            },
            options: {
              upsert: data.options.map((option) => ({
                where: { id: option.uniqueId },
                create: {
                  hexValue: option.hexValue,
                  id: option.uniqueId,
                  translations: {
                    createMany: {
                      data: option.translations.map((t) => ({
                        name: t.name,
                        slug: t.slug,
                        locale: t.locale,
                      })) as Prisma.VariantOptionTranslationCreateManyVariantOptionInput[],
                      skipDuplicates: true,
                    },
                  },
                },
                update: {
                  hexValue: option.hexValue,
                  translations: {
                    upsert: option.translations.map((t) => ({
                      where: {
                        variantOptionId_locale: {
                          locale: t.locale,
                          variantOptionId: option.uniqueId,
                        },
                      },
                      create: {
                        name: t.name,
                        slug: t.slug,
                        locale: t.locale,
                      },
                      update: {
                        locale: t.locale,
                        name: t.name,
                        slug: t.slug,
                      },
                    })) as Prisma.VariantOptionTranslationUpsertWithWhereUniqueWithoutVariantOptionInput[],
                  },
                  id: option.uniqueId,
                },
              })),
            },
          },
        },
      );
      return {
        success: true,
        variantGroup: upsertedVariantGroup,
      };
    } catch (error) {
      throw new InternalServerErrorException('Varyant grubu oluşturulamadı');
    }
  }

  async uploadVariantOptionFile(
    optionId: string,
    file: Express.Multer.File,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const option = await this.prismaService.variantOption.findUnique({
        where: { id: optionId },
        include: { asset: true },
      });

      if (!option) {
        return {
          success: false,
          message: 'Variant seçeneği bulunamadı',
        };
      }

      if (option.asset) {
        await this.minioService.deleteAsset(option.asset.url);
        await this.prismaService.asset.delete({
          where: { id: option.asset.id },
        });
      }

      const uploadedAsset = await this.minioService.uploadAsset({
        file,
        bucketName: 'variant-options',
        isNeedOg: false,
        isNeedThumbnail: false,
      });

      if (!uploadedAsset.success) {
        return {
          success: false,
          message: 'Dosya yüklenirken bir hata oluştu',
        };
      }

      await this.prismaService.asset.create({
        data: {
          url: uploadedAsset.data.url,
          type: uploadedAsset.data.type,
          variantOption: {
            connect: {
              id: optionId,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Dosya başarıyla yüklendi',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Dosya yüklenirken bir hata oluştu',
      );
    }
  }
}
