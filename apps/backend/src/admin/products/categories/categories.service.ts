import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/database';
import {
  adminCategoryTableQuery,
  AdminCategoryTableReturnType,
  CategoryIdAndName,
  CategoryZodType,
} from '@repo/types';
import { LocaleService } from 'src/common/services/locale/locale.service';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  private logger = new Logger(CategoriesService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly minioService: MinioService,
    private readonly localeService: LocaleService,
  ) {}

  async createOrUpdateCategory(
    data: Omit<CategoryZodType, 'image'>,
  ): Promise<{ success: boolean; categoryId: string }> {
    try {
      const category = await this.prismaService.category.upsert({
        where: { id: data.uniqueId },
        create: {
          id: data.uniqueId,
          parentCategoryId: data.parentId || null,
          translations: {
            createMany: {
              data: data.translations.map((t) => ({
                locale: t.locale,
                name: t.name,
                slug: t.slug,
                description: t.description || null,
                metaTitle: t.metaTitle || null,
                metaDescription: t.metaDescription || null,
              })),
              skipDuplicates: true,
            },
          },
        },
        update: {
          parentCategoryId: data.parentId || null,
          translations: {
            deleteMany: {
              locale: {
                notIn: data.translations.map((t) => t.locale),
              },
            },

            upsert: data.translations.map((t) => ({
              where: {
                locale_categoryId: {
                  categoryId: data.uniqueId,
                  locale: t.locale,
                },
              },
              create: {
                locale: t.locale,
                name: t.name,
                slug: t.slug,
                description: t.description || null,
                metaTitle: t.metaTitle || null,
                metaDescription: t.metaDescription || null,
              },
              update: {
                name: t.name,
                slug: t.slug,
                description: t.description || null,
                metaTitle: t.metaTitle || null,
                metaDescription: t.metaDescription || null,
              },
            })),
          },
        },
      });

      return {
        categoryId: category.id,
        success: true,
      };
    } catch (error) {
      this.logger.error('Error creating or updating category', error);
      throw new InternalServerErrorException(
        'Failed to create or update category',
      );
    }
  }
  async uploadCategoryImage(
    categoryId: string,
    file: Express.Multer.File,
  ): Promise<{
    success: boolean;
    message: string;
    data?: { url: string; type: string };
  }> {
    try {
      const category = await this.prismaService.category.findUnique({
        where: { id: categoryId },
        include: { image: true },
      });

      if (!category) {
        return {
          success: false,
          message: 'Kategori bulunamadı',
        };
      }

      const { data, success } = await this.minioService.uploadAsset({
        bucketName: 'categories',
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
        if (category.image) {
          await this.minioService.deleteAsset(category.image.url);
          await tx.asset.delete({
            where: { id: category.image.id },
          });
        }

        await tx.category.update({
          where: { id: categoryId },
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
        message: 'Kategori görseli başarıyla güncellendi',
        data: {
          url: data.url,
          type: data.type,
        },
      };
    } catch (error) {
      this.logger.error('Error uploading category image', error);
      throw new InternalServerErrorException('Failed to upload category image');
    }
  }

  async getCategories(
    page: number,
    limit: number,
    search?: string,
  ): Promise<AdminCategoryTableReturnType> {
    const where: Prisma.CategoryWhereInput = search?.trim()
      ? {
          OR: [
            {
              translations: {
                some: {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            },
            {
              translations: {
                some: {
                  slug: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            },
          ],
        }
      : {};

    try {
      const [categories, totalCount] = await Promise.all([
        this.prismaService.category.findMany({
          where,
          take: limit,
          skip: (page - 1) * limit,
          orderBy: {
            createdAt: 'desc',
          },
          select: adminCategoryTableQuery,
        }),
        this.prismaService.category.count({ where }),
      ]);

      return {
        success: true,
        categories,
        pagination: {
          currentPage: page,
          perPage: limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching categories', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async deleteCategory(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const category = await this.prismaService.category.findUnique({
        where: { id },
        include: {
          image: true,
          childCategories: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!category) {
        throw new NotFoundException('Kategori bulunamadı');
      }

      if (category.childCategories.length > 0) {
        return {
          success: false,
          message: `Bu kategorinin ${category.childCategories.length} alt kategorisi bulunmaktadır. Önce alt kategorileri silin.`,
        };
      }

      await this.prismaService.$transaction(async (tx) => {
        if (category.image) {
          await this.minioService.deleteAsset(category.image?.url);
          await tx.asset.delete({ where: { url: category.image?.url } });
        }

        await tx.category.delete({ where: { id } });
      });

      return {
        success: true,
        message: 'Kategori başarıyla silindi',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error('Error deleting category', error);
      throw new InternalServerErrorException(
        'Kategori silinirken bir hata oluştu',
      );
    }
  }

  async getCategoryFormValue(id: string): Promise<CategoryZodType> {
    try {
      const category = await this.prismaService.category.findUnique({
        where: { id },
        include: {
          image: true,
          translations: true,
        },
      });
      if (!category) {
        throw new NotFoundException('Kategori bulunamadı');
      }
      return {
        translations: category.translations.map((t) => ({
          name: t.name,
          slug: t.slug,
          description: t.description,
          locale: t.locale,
          metaDescription: t.metaDescription,
          metaTitle: t.metaTitle,
        })),
        uniqueId: category.id,
        existingImage: category.image ? category.image?.url : null,
        image: null,
        parentId: category.parentCategoryId || null,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Kategori form verisi getirilirken bir hata oluştu',
      );
    }
  }

  async getAllCategoriesForSelect(excludeCategoryId?: string): Promise<
    Array<{
      group: string;
      items: Array<{ value: string; label: string; disabled?: boolean }>;
    }>
  > {
    try {
      const categories = await this.prismaService.category.findMany({
        select: adminCategoryTableQuery,
        orderBy: { createdAt: 'asc' },
      });

      const tree = this.buildCategoryTree(
        categories,
        null,
        0,
        excludeCategoryId,
      );

      return this.convertToGroupedFormat(tree, categories);
    } catch (error) {
      this.logger.error('Error fetching categories for select', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  private convertToGroupedFormat(
    tree: Array<{
      id: string;
      name: string;
      level: number;
      disabled?: boolean;
    }>,
    allCategories: AdminCategoryTableReturnType['categories'],
  ): Array<{
    group: string;
    items: Array<{ value: string; label: string; disabled?: boolean }>;
  }> {
    const result: Array<{
      group: string;
      items: Array<{ value: string; label: string; disabled?: boolean }>;
    }> = [];

    const rootCategories = tree.filter((cat) => cat.level === 0);

    for (const root of rootCategories) {
      const groupItems: Array<{
        value: string;
        label: string;
        disabled?: boolean;
      }> = [];

      groupItems.push({
        value: root.id,
        label: root.name,
        disabled: root.disabled,
      });

      const children = tree.filter((cat) => {
        const category = allCategories.find((c) => c.id === cat.id);
        return this.isChildOf(allCategories, category?.id || '', root.id);
      });

      for (const child of children) {
        groupItems.push({
          value: child.id,
          label: '—'.repeat(child.level) + ' ' + child.name,
          disabled: child.disabled,
        });
      }

      result.push({
        group: root.name,
        items: groupItems,
      });
    }

    return result;
  }

  private isChildOf(
    categories: AdminCategoryTableReturnType['categories'],
    childId: string,
    parentId: string,
  ): boolean {
    const category = categories.find((c) => c.id === childId);
    if (!category) return false;

    if (category.parentCategoryId === parentId) return true;

    if (category.parentCategoryId) {
      return this.isChildOf(categories, category.parentCategoryId, parentId);
    }

    return false;
  }

  private buildCategoryTree(
    categories: AdminCategoryTableReturnType['categories'],
    parentId: string | null = null,
    level: number = 0,
    excludeId?: string,
  ): Array<{ id: string; name: string; level: number; disabled?: boolean }> {
    const result = [];

    for (const category of categories) {
      if (category.parentCategoryId === parentId) {
        const name = category.translations[0]?.name || 'İsimsiz Kategori';

        const disabled = excludeId
          ? this.isDescendant(categories, excludeId, category.id)
          : false;

        result.push({
          id: category.id,
          name,
          level,
          disabled,
        });

        result.push(
          ...this.buildCategoryTree(
            categories,
            category.id,
            level + 1,
            excludeId,
          ),
        );
      }
    }

    return result;
  }

  private isDescendant(
    categories: AdminCategoryTableReturnType['categories'],
    ancestorId: string,
    categoryId: string,
  ): boolean {
    if (ancestorId === categoryId) return true;

    const children = categories.filter(
      (c) => c.parentCategoryId === categoryId,
    );

    for (const child of children) {
      if (this.isDescendant(categories, ancestorId, child.id)) {
        return true;
      }
    }

    return false;
  }

  async getAllCategoriesOnlyIdAndName(): Promise<CategoryIdAndName[]> {
    try {
      const categories = await this.prismaService.category.findMany({
        select: {
          id: true,
          translations: true,
        },
      });
      const locale = this.localeService.getLocale();
      return categories.map((category) => ({
        id: category.id,
        name:
          category.translations.find((t) => t.locale === locale)?.name ||
          category.translations[0]?.name ||
          'N/A',
      }));
    } catch (error) {
      this.logger.error('Error fetching categories id and name', error);
      throw new InternalServerErrorException(
        'Failed to fetch categories id and name',
      );
    }
  }
}
