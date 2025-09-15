// Backend Service - Fixed
import { BadRequestException, Injectable } from '@nestjs/common';
import { CategoryHeaderData } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserPageService {
  constructor(private readonly prisma: PrismaService) {}

  async getHeaderCategoiresData(): Promise<CategoryHeaderData[]> {
    try {
      // Parent kategorisi olmayan kategorileri al
      const parentCategories = await this.prisma.category.findMany({
        where: {
          parentCategoryId: null, // Parent kategorisi yok
          products: {
            some: {
              product: {
                OR: [
                  {
                    active: true,
                    isVariant: false,
                    stock: { gt: 0 },
                  },
                  {
                    active: true,
                    isVariant: true,
                    variantCombinations: {
                      some: {
                        active: true,
                        stock: { gt: 0 },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        include: {
          translations: {
            select: {
              locale: true,
              name: true,
              slug: true,
            },
          },
          // Bu kategorideki ürünlerin resimlerini almak için
          products: {
            where: {
              product: {
                OR: [
                  {
                    active: true,
                    isVariant: false,
                    stock: { gt: 0 },
                  },
                  {
                    active: true,
                    isVariant: true,
                    variantCombinations: {
                      some: {
                        active: true,
                        stock: { gt: 0 },
                      },
                    },
                  },
                ],
              },
            },
            include: {
              product: {
                include: {
                  assets: {
                    take: 1, // Her üründen 1 resim al
                    orderBy: {
                      order: 'asc',
                    },
                    include: {
                      asset: {
                        select: {
                          url: true,
                          type: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            take: 3, // Maksimum 3 ürün al
          },
        },
      });

      // Recursive fonksiyon - belirli bir parent kategorinin tüm alt kategorilerini al
      const getAllChildCategories = async (
        parentId: string,
      ): Promise<any[]> => {
        const childCategories = await this.prisma.category.findMany({
          where: {
            parentCategoryId: parentId,
            products: {
              some: {
                product: {
                  OR: [
                    {
                      active: true,
                      isVariant: false,
                      stock: { gt: 0 },
                    },
                    {
                      active: true,
                      isVariant: true,
                      variantCombinations: {
                        some: {
                          active: true,
                          stock: { gt: 0 },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          include: {
            translations: {
              select: {
                locale: true,
                name: true,
                slug: true,
              },
            },
          },
        });

        const result: any[] = [];

        for (const child of childCategories) {
          // Alt kategoriyi ekle
          result.push({
            id: child.id,
            translations: child.translations,
          });

          // Bu alt kategorinin de alt kategorilerini al (recursive)
          const grandChildren = await getAllChildCategories(child.id);
          result.push(...grandChildren);
        }

        return result;
      };

      // Veriyi istenen formata dönüştür
      const result: CategoryHeaderData[] = [];

      for (const category of parentCategories) {
        // Bu kategorinin tüm alt kategorilerini al (recursive)
        const allChildCategories = await getAllChildCategories(category.id);

        // Ürün resimlerini topla (maksimum 3 tane)
        const productImages: Array<{ url: string; type: any }> = [];

        for (const productCategory of category.products) {
          if (productImages.length >= 3) break;

          const product = productCategory.product;
          if (product.assets && product.assets.length > 0) {
            const asset = product.assets[0].asset;
            productImages.push({
              url: asset.url,
              type: asset.type,
            });
          }
        }

        result.push({
          id: category.id,
          translations: category.translations,
          allChildCategories:
            allChildCategories.length > 0 ? allChildCategories : undefined,
          productImages,
        });
      }

      return result;
    } catch (error) {
      console.error('Error fetching header categories data:', error);
      throw new BadRequestException('Kategoriler alınamadı');
    }
  }
}
