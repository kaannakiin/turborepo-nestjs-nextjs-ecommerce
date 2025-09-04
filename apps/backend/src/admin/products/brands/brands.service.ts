import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/database';
import { slugify } from '@repo/shared';
import { Brand, Cuid2ZodType } from '@repo/types';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  async createOrUpdateBrand(data: Omit<Brand, 'image'>) {
    try {
      const brand = await this.prisma.brand.findUnique({
        where: {
          id: data.uniqueId,
        },
      });

      if (!brand) {
        await this.prisma.brand.create({
          data: {
            id: data.uniqueId,
            translations: {
              createMany: {
                data: data.translations.map((translation) => ({
                  name: translation.name.trim(),
                  slug: translation.slug?.trim()
                    ? translation.slug.trim()
                    : slugify(translation.name.trim()),
                  description: translation.description?.trim(),
                  locale: translation.locale,
                  metaTitle: translation.metaTitle?.trim(),
                  metaDescription: translation.metaDescription?.trim(),
                })),
                skipDuplicates: true,
              },
            },
            ...(data.parentId && {
              parentBrand: { connect: { id: data.parentId } },
            }),
          },
        });

        return {
          success: true,
          message: 'Marka başarıyla oluşturuldu',
        };
      } else {
        await this.prisma.brand.update({
          where: {
            id: data.uniqueId,
          },
          data: {
            translations: {
              upsert: data.translations.map((translation) => ({
                where: {
                  locale_brandId: {
                    brandId: data.uniqueId,
                    locale: translation.locale,
                  },
                },
                update: {
                  name: translation.name.trim(),
                  slug: translation.slug?.trim()
                    ? translation.slug.trim()
                    : slugify(translation.name.trim()),
                  description: translation.description?.trim(),
                  metaTitle: translation.metaTitle?.trim(),
                  metaDescription: translation.metaDescription?.trim(),
                },
                create: {
                  name: translation.name.trim(),
                  slug: translation.slug?.trim()
                    ? translation.slug.trim()
                    : slugify(translation.name.trim()),
                  description: translation.description?.trim(),
                  locale: translation.locale,
                  metaTitle: translation.metaTitle?.trim(),
                  metaDescription: translation.metaDescription?.trim(),
                },
              })),
            },
            ...(data.parentId
              ? {
                  parentBrand: { connect: { id: data.parentId } },
                }
              : { parentBrand: { disconnect: true } }),
          },
        });

        return {
          success: true,
          message: 'Marka başarıyla güncellendi',
        };
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'P2002') {
        throw new ConflictException('Bu marka adı zaten kullanımda');
      }

      throw new InternalServerErrorException(
        'Marka kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.',
      );
    }
  }

  async updateBrandImage(file: Express.Multer.File, uniqueId: Cuid2ZodType) {
    const brand = await this.prisma.brand.findUnique({
      where: { id: uniqueId },
      include: { image: true },
    });

    if (!brand) {
      throw new NotFoundException('Marka bulunamadı');
    }

    if (brand.image) {
      const deletedFile = await this.minio.deleteAsset(brand.image.url);
      if (!deletedFile.success) {
        throw new InternalServerErrorException(
          'Mevcut marka resmi silinirken bir hata oluştu',
        );
      }
      await this.prisma.asset.delete({
        where: { id: brand.image.id },
      });
    }
    const uploadFile = await this.minio.uploadAsset({
      bucketName: 'brands',
      file,
    });
    if (!uploadFile.success) {
      throw new InternalServerErrorException(
        'Marka resmi yüklenirken bir hata oluştu',
      );
    }
    const asset = await this.prisma.asset.create({
      data: {
        url: uploadFile.data.url,
        type: 'IMAGE',
        brand: {
          connect: { id: brand.id },
        },
      },
    });
    return {
      success: true,
      message: 'Resim başarıyla yüklendi',
    };
  }

  async getAllBrands(search?: string, page?: number) {
    const limit = 10;
    const offset = page && page > 0 ? (page - 1) * limit : 0;
    const where: Prisma.BrandWhereInput = {
      ...(search?.trim() && {
        translations: {
          some: {
            OR: [
              { name: { contains: search.trim(), mode: 'insensitive' } },
              { slug: { contains: search.trim(), mode: 'insensitive' } },
            ],
          },
        },
      }),
    };

    return this.prisma.brand.findMany({
      where,
      include: {
        translations: {
          select: {
            name: true,
            locale: true,
            slug: true,
          },
        },
        image: {
          select: {
            url: true,
          },
        },
        parentBrand: {
          include: {
            translations: {
              select: {
                name: true,
                locale: true,
              },
            },
          },
        },
        _count: {
          select: {
            childBrands: true,
            products: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBrandsCount(search?: string): Promise<number> {
    const where: Prisma.BrandWhereInput = {
      ...(search?.trim() && {
        translations: {
          some: {
            OR: [
              { name: { contains: search.trim(), mode: 'insensitive' } },
              { slug: { contains: search.trim(), mode: 'insensitive' } },
            ],
          },
        },
      }),
    };

    return this.prisma.brand.count({ where });
  }

  async deleteBrand(id: Cuid2ZodType) {
    try {
      // Transaction ile tüm işlemleri güvenli hale getir
      return await this.prisma.$transaction(async (prisma) => {
        const brand = await prisma.brand.findUnique({
          where: { id },
          include: {
            image: true,
            childBrands: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        });

        if (!brand) {
          throw new NotFoundException('Marka bulunamadı');
        }

        // 1. Brand'e bağlı ürünlerin brandId'lerini null yap
        if (brand._count.products > 0) {
          await prisma.product.updateMany({
            where: { brandId: id },
            data: { brandId: null },
          });
        }

        // 2. Eğer brand'in resmi varsa, önce MinIO'dan sil
        if (brand.image) {
          const deletedFile = await this.minio.deleteAsset(brand.image.url);
          if (!deletedFile.success) {
            throw new InternalServerErrorException(
              'Marka resmi silinirken bir hata oluştu',
            );
          }

          // Asset'i veritabanından sil
          await prisma.asset.delete({
            where: { id: brand.image.id },
          });
        }

        // 3. Ana marka ise, child markaların parentBrandId'lerini null yap
        if (brand.childBrands.length > 0) {
          await prisma.brand.updateMany({
            where: { parentBrandId: id },
            data: { parentBrandId: null },
          });
        }

        // 4. Brand'i sil (translations cascade ile silinir)
        await prisma.brand.delete({
          where: { id },
        });

        return {
          success: true,
          message: `Marka başarıyla silindi${
            brand._count.products > 0
              ? `, ${brand._count.products} ürünün marka bağlantısı kaldırıldı`
              : ''
          }${
            brand.childBrands.length > 0
              ? ` ve ${brand.childBrands.length} alt marka ana marka yapıldı`
              : ''
          }`,
        };
      });
    } catch (error) {
      console.error('Delete brand error:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Prisma constraint error'ları
      if (error.code === 'P2003') {
        throw new ConflictException(
          'Bu marka başka kayıtlar tarafından kullanıldığı için silinemez',
        );
      }

      // Genel hata
      throw new InternalServerErrorException(
        'Marka silinirken beklenmeyen bir hata oluştu',
      );
    }
  }

  async getBrand(id: Cuid2ZodType): Promise<Brand | null> {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        image: {
          select: {
            url: true,
          },
        },
        parentBrand: {
          select: {
            id: true,
          },
        },
        translations: {
          select: {
            locale: true,
            metaDescription: true,
            metaTitle: true,
            slug: true,
            name: true,
            description: true,
          },
        },
      },
    });
    if (!brand) {
      throw new NotFoundException('Marka bulunamadı');
    }
    return {
      uniqueId: brand.id,
      translations: brand.translations.map((t) => ({
        locale: t.locale,
        name: t.name,
        slug: t.slug,
        description: t.description,
        metaDescription: t.metaDescription,
        metaTitle: t.metaTitle,
      })),
      existingImage: brand.image ? brand.image.url : null,
      parentId: brand.parentBrandId ? brand.parentBrandId : null,
      image: null,
    };
  }

  async deleteBrandImage(url: string) {
    if (!url) {
      throw new NotFoundException("Resim URL'si sağlanmadı");
    }
    const asset = await this.prisma.asset.findUnique({
      where: { url },
      include: { brand: true },
    });
    if (!asset) {
      throw new NotFoundException('Resim bulunamadı');
    }
    if (!asset.brand) {
      throw new ConflictException('Bu resim bir markaya bağlı değil');
    }
    const deletedFile = await this.minio.deleteAsset(url);
    if (!deletedFile.success) {
      throw new InternalServerErrorException(
        'Resim silinirken bir hata oluştu',
      );
    }
    await this.prisma.asset.delete({
      where: { id: asset.id },
    });
    return {
      success: true,
      message: 'Resim başarıyla silindi',
    };
  }

  async getAllParentBrands(currentBrandId?: Cuid2ZodType) {
    // Prisma ile recursive CTE kullanarak hierarchical query
    const result = await this.prisma.$queryRaw<
      Array<{
        id: string;
        level: number;
        name: string;
        locale: string;
      }>
    >`
    WITH RECURSIVE brand_hierarchy AS (
      -- Base case: tüm root brand'ler (parentBrandId null olanlar)
      SELECT 
        b.id,
        0 as level,
        bt.name,
        bt.locale
      FROM "Brand" b
      INNER JOIN "BrandTranslation" bt ON b.id = bt."brandId"
      WHERE b."parentBrandId" IS NULL
        AND bt.locale = 'TR'
        ${currentBrandId ? Prisma.sql`AND b.id != ${currentBrandId}` : Prisma.empty}
      
      UNION ALL
      
      -- Recursive case: child brand'ler
      SELECT 
        child.id,
        bh.level + 1,
        child_bt.name,
        child_bt.locale
      FROM "Brand" child
      INNER JOIN "BrandTranslation" child_bt ON child.id = child_bt."brandId"
      INNER JOIN brand_hierarchy bh ON child."parentBrandId" = bh.id
      WHERE child_bt.locale = 'TR'
        ${currentBrandId ? Prisma.sql`AND child.id != ${currentBrandId}` : Prisma.empty}
        AND bh.level < 10 -- Sonsuz döngü koruması
    )
    SELECT DISTINCT id, level, name, locale
    FROM brand_hierarchy
    ORDER BY level ASC, name ASC
  `;

    return result.map((brand) => ({
      value: brand.id,
      label: `${'  '.repeat(brand.level)}${brand.name}`, // Indentation ile hierarchy gösterimi
    }));
  }
  async getAllBrandsWithoutQuery() {
    return this.prisma.brand.findMany({
      select: {
        id: true,
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
      },
    });
  }
}
