import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database';
import { Category, CategoryIdAndName, Cuid2ZodType } from '@repo/types';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  async createOrUpdateCategory(data: Omit<Category, 'image'>) {
    const { uniqueId, translations, parentId } = data;
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const existingCategory = await prisma.category.findUnique({
          where: { id: uniqueId },
        });

        if (existingCategory) {
          await prisma.categoryTranslation.deleteMany({
            where: { categoryId: uniqueId },
          });

          return await prisma.category.update({
            where: { id: uniqueId },
            data: {
              parentCategoryId: parentId || null,
              translations: {
                createMany: {
                  data: translations.map((t) => ({
                    locale: t.locale,
                    name: t.name.trim(),
                    slug: t.slug.trim(),
                    description: t.description?.trim(),
                    metaTitle: t.metaTitle?.trim(),
                    metaDescription: t.metaDescription?.trim(),
                  })),
                },
              },
            },
          });
        } else {
          return await prisma.category.create({
            data: {
              id: uniqueId,
              parentCategoryId: parentId || null,
              translations: {
                createMany: {
                  data: translations.map((t) => ({
                    locale: t.locale,
                    name: t.name.trim(),
                    slug: t.slug.trim(),
                    description: t.description?.trim(),
                    metaTitle: t.metaTitle?.trim(),
                    metaDescription: t.metaDescription?.trim(),
                  })),
                },
              },
            },
          });
        }
      });

      return {
        success: true,
        message: 'İşlem başarıyla tamamlandı',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Kategori işlemi sırasında hata oluştu',
      );
    }
  }

  async updateCategoryImage(file: Express.Multer.File, uniqueId: Cuid2ZodType) {
    const category = await this.prisma.category.findUnique({
      where: { id: uniqueId },
      include: { image: true },
    });

    if (!category) {
      throw new NotFoundException('Marka bulunamadı');
    }

    if (category.image) {
      const deletedFile = await this.minio.deleteAsset(category.image.url);
      if (!deletedFile.success) {
        throw new InternalServerErrorException(
          'Mevcut marka resmi silinirken bir hata oluştu',
        );
      }
      await this.prisma.asset.delete({
        where: { id: category.image.id },
      });
    }
    const uploadFile = await this.minio.uploadAsset({
      bucketName: 'categories',
      file,
      isNeedOg: true,
      isNeedThumbnail: true,
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
        category: {
          connect: { id: category.id },
        },
      },
    });
    return {
      success: true,
      message: 'Resim başarıyla yüklendi',
    };
  }

  async getCategoryById(id: Cuid2ZodType): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        translations: true,
        image: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }
    return {
      translations: category.translations,
      uniqueId: category.id,
      parentId: category.parentCategoryId || undefined,
      existingImage: category.image ? category.image.url : undefined,
      image: undefined,
    };
  }

  async deleteCategoryImage(url: string) {
    if (!url) {
      throw new NotFoundException("Resim URL'si sağlanmadı");
    }
    const asset = await this.prisma.asset.findUnique({
      where: { url },
      include: { category: true },
    });
    if (!asset) {
      throw new NotFoundException('Resim bulunamadı');
    }
    if (!asset.category) {
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

  async getAllCategories(search?: string, page?: number) {
    const limit = 10;
    const offset = page && page > 0 ? (page - 1) * limit : 0;
    const where: Prisma.CategoryWhereInput = {
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

    return this.prisma.category.findMany({
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
        parentCategory: {
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
            childCategories: true,
            products: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCategoriesCount(search?: string): Promise<number> {
    const where: Prisma.CategoryWhereInput = {
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

    return this.prisma.category.count({ where });
  }

  async deleteCategory(id: Cuid2ZodType) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const category = await prisma.category.findUnique({
          where: { id },
          include: {
            image: true,
            childCategories: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        });

        if (!category) {
          throw new NotFoundException('Kategori bulunamadı');
        }

        // 1. Kategoriye bağlı ürünlerin category bağlantılarını temizle
        if (category._count.products > 0) {
          await prisma.productCategory.deleteMany({
            where: { categoryId: id },
          });
        }

        // 2. Eğer kategorinin resmi varsa, önce MinIO'dan sil
        if (category.image) {
          const deletedFile = await this.minio.deleteAsset(category.image.url);
          if (!deletedFile.success) {
            throw new InternalServerErrorException(
              'Kategori resmi silinirken bir hata oluştu',
            );
          }

          // Asset'i veritabanından sil
          await prisma.asset.delete({
            where: { id: category.image.id },
          });
        }

        // 3. Ana kategori ise, child kategorilerin parentCategoryId'lerini null yap
        if (category.childCategories.length > 0) {
          await prisma.category.updateMany({
            where: { parentCategoryId: id },
            data: { parentCategoryId: null },
          });
        }

        await prisma.category.delete({
          where: { id },
        });

        return {
          success: true,
          message: `Kategori başarıyla silindi${
            category._count.products > 0
              ? `, ${category._count.products} ürünün kategori bağlantısı kaldırıldı`
              : ''
          }${
            category.childCategories.length > 0
              ? ` ve ${category.childCategories.length} alt kategori ana kategori yapıldı`
              : ''
          }`,
        };
      });
    } catch (error) {
      console.error('Delete category error:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      if (error.code === 'P2003') {
        throw new ConflictException(
          'Bu kategori başka kayıtlar tarafından kullanıldığı için silinemez',
        );
      }

      throw new InternalServerErrorException(
        'Kategori silinirken beklenmeyen bir hata oluştu',
      );
    }
  }

  async getAllParentCategories(currentCategoryId?: Cuid2ZodType) {
    // Prisma ile recursive CTE kullanarak hierarchical query
    const result = await this.prisma.$queryRaw<
      Array<{
        id: string;
        level: number;
        name: string;
        locale: string;
      }>
    >`
    WITH RECURSIVE category_hierarchy AS (
      -- Base case: tüm root kategoriler (parentCategoryId null olanlar)
      SELECT 
        c.id,
        0 as level,
        ct.name,
        ct.locale
      FROM "Category" c
      INNER JOIN "CategoryTranslation" ct ON c.id = ct."categoryId"
      WHERE c."parentCategoryId" IS NULL
        AND ct.locale = 'TR'
        ${currentCategoryId ? Prisma.sql`AND c.id != ${currentCategoryId}` : Prisma.empty}
      
      UNION ALL
      
      -- Recursive case: child kategoriler
      SELECT 
        child.id,
        ch.level + 1,
        child_ct.name,
        child_ct.locale
      FROM "Category" child
      INNER JOIN "CategoryTranslation" child_ct ON child.id = child_ct."categoryId"
      INNER JOIN category_hierarchy ch ON child."parentCategoryId" = ch.id
      WHERE child_ct.locale = 'TR'
        ${currentCategoryId ? Prisma.sql`AND child.id != ${currentCategoryId}` : Prisma.empty}
        AND ch.level < 10 -- Sonsuz döngü koruması
    )
    SELECT DISTINCT id, level, name, locale
    FROM category_hierarchy
    ORDER BY level ASC, name ASC
  `;

    return result.map((category) => ({
      value: category.id,
      label: `${'  '.repeat(category.level)}${category.name}`, // Indentation ile hierarchy gösterimi
    }));
  }

  async getAllCategoriesWithoutQuery() {
    return this.prisma.category.findMany({
      select: {
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
        id: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async getAllCategoriesOnlyIdAndName(): Promise<CategoryIdAndName[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        translations: {
          select: {
            name: true,
            locale: true,
          },
        },
      },
    });
    return categories.map((category) => ({
      id: category.id,
      name:
        category.translations.find((t) => t.locale === 'TR')?.name ||
        category.translations[0]?.name ||
        'İsimsiz Kategori',
    }));
  }
  async getAllCategoriesOnlyIdNameImage(): Promise<
    Array<
      CategoryIdAndName & {
        image: { url: string; type: $Enums.AssetType } | null;
      }
    >
  > {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        image: {
          select: {
            url: true,
            type: true,
          },
        },
        translations: {
          select: {
            name: true,
            locale: true,
          },
        },
      },
    });
    return categories.map((category) => ({
      id: category.id,
      name:
        category.translations.find((t) => t.locale === 'TR')?.name ||
        category.translations[0]?.name ||
        'İsimsiz Kategori',
      image: category.image
        ? { url: category.image.url, type: category.image.type }
        : null,
    }));
  }
}
