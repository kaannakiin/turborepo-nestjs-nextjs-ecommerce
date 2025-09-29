import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@repo/database';
import {
  $Enums,
  CategoryGridComponentType,
  LayoutComponentType,
  MainPageComponentsType,
  MantineSize,
  MarqueeType,
} from '@repo/types';

import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ThemeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}
  async deleteMultipleSliders(uniqueIds: string[]) {
    if (!uniqueIds || uniqueIds.length === 0) {
      return {
        success: true,
        message: 'Silinecek slider bulunamadı.',
      };
    }

    let deletedCount = 0;
    const errors: string[] = [];

    for (const uniqueId of uniqueIds) {
      try {
        const slider = await this.prisma.sliderItemSchema.findUnique({
          where: { id: uniqueId },
          select: {
            order: true,
            desktopAsset: { select: { url: true } },
            mobileAsset: { select: { url: true } },
          },
        });

        if (!slider) {
          continue; // Slider zaten silinmiş, devam et
        }

        // Desktop asset'i sil
        if (slider.desktopAsset?.url) {
          await this.minio.deleteAsset(slider.desktopAsset.url);
          await this.prisma.asset
            .delete({
              where: { url: slider.desktopAsset.url },
            })
            .catch(() => {}); // Asset silinmezse devam et
        }

        // Mobile asset'i sil
        if (slider.mobileAsset?.url) {
          await this.minio.deleteAsset(slider.mobileAsset.url);
          await this.prisma.asset
            .delete({
              where: { url: slider.mobileAsset.url },
            })
            .catch(() => {}); // Asset silinmezse devam et
        }

        // Slider item'ı sil
        await this.prisma.sliderItemSchema.delete({
          where: { id: uniqueId },
        });

        deletedCount++;
      } catch (error) {
        console.error(`Slider silme hatası (${uniqueId}):`, error);
        errors.push(`${uniqueId}: ${error.message}`);
      }
    }

    return {
      success: deletedCount > 0,
      message: `${deletedCount} slider başarıyla silindi${errors.length > 0 ? `, ${errors.length} hata` : ''}`,
      deletedCount,
      errors,
    };
  }

  async createSlider(data: {
    uniqueId: string;
    order: number;
    customLink: string;
    desktopAsset: Express.Multer.File;
    mobileAsset: Express.Multer.File;
  }) {
    const { uniqueId, order, customLink, desktopAsset, mobileAsset } = data;

    let sliders = await this.prisma.sliderSettings.findFirst({
      include: {
        items: {
          select: {
            desktopAsset: { select: { url: true, type: true } },
            mobileAsset: { select: { url: true, type: true } },
          },
        },
      },
    });

    if (!sliders) {
      sliders = await this.prisma.sliderSettings.create({
        data: {
          autoPlayInterval: 5000,
          isAutoPlay: true,
        },
        include: {
          items: {
            select: {
              desktopAsset: { select: { url: true, type: true } },
              mobileAsset: { select: { url: true, type: true } },
            },
          },
        },
      });
    }
    const uploadedAssets: {
      desktop: { url: string; type: $Enums.AssetType } | null;
      mobile: { url: string; type: $Enums.AssetType } | null;
    } = {
      desktop: null,
      mobile: null,
    };

    if (desktopAsset) {
      const uploadedDesktopAsset = await this.minio.uploadAsset({
        bucketName: 'theme',
        file: desktopAsset,
        isNeedOg: false,
        isNeedThumbnail: false,
      });

      if (!uploadedDesktopAsset.success || !uploadedDesktopAsset.data) {
        throw new InternalServerErrorException(
          'Masaüstü Dosya yüklenirken bir hata oluştu.',
        );
      }
      uploadedAssets.desktop = {
        url: uploadedDesktopAsset.data.url,
        type: uploadedDesktopAsset.data.type,
      };
    }

    if (mobileAsset) {
      const uploadedMobileAsset = await this.minio.uploadAsset({
        bucketName: 'theme',
        file: mobileAsset,
        isNeedOg: false,
        isNeedThumbnail: false,
      });

      if (!uploadedMobileAsset.success || !uploadedMobileAsset.data) {
        throw new InternalServerErrorException(
          'Mobil Dosya yüklenirken bir hata oluştu.',
        );
      }
      uploadedAssets.mobile = {
        url: uploadedMobileAsset.data.url,
        type: uploadedMobileAsset.data.type,
      };
    }
    await this.prisma.sliderItemSchema.upsert({
      where: { id: uniqueId },
      create: {
        id: uniqueId,
        order,
        customLink: customLink || null,
        SliderSettings: {
          connect: {
            id: sliders.id,
          },
        },
        desktopAsset: uploadedAssets.desktop
          ? {
              create: {
                url: uploadedAssets.desktop.url,
                type: uploadedAssets.desktop.type,
              },
            }
          : undefined,
        mobileAsset: uploadedAssets.mobile
          ? {
              create: {
                url: uploadedAssets.mobile.url,
                type: uploadedAssets.mobile.type,
              },
            }
          : undefined,
      },
      update: {
        order,
        customLink: customLink || null,
        desktopAsset: uploadedAssets.desktop
          ? {
              create: {
                url: uploadedAssets.desktop.url,
                type: uploadedAssets.desktop.type,
              },
            }
          : undefined,
        mobileAsset: uploadedAssets.mobile
          ? {
              create: {
                url: uploadedAssets.mobile.url,
                type: uploadedAssets.mobile.type,
              },
            }
          : undefined,
      },
    });

    return {
      success: true,
      message: 'Slider başarıyla oluşturuldu.',
    };
  }

  async getSliders(): Promise<LayoutComponentType> {
    const sliders = await this.prisma.sliderSettings.findFirst({
      include: {
        items: {
          orderBy: {
            order: 'asc',
          },
          select: {
            mobileAsset: {
              select: { url: true, type: true },
            },
            desktopAsset: {
              select: { url: true, type: true },
            },
            id: true,
            customLink: true,
            order: true,
          },
        },
      },
    });

    if (!sliders) {
      throw new BadRequestException('Slider bulunamadı.');
    }
    for (const item of sliders.items) {
      if (!item.desktopAsset && !item.mobileAsset) {
        await this.prisma.sliderItemSchema.delete({
          where: { id: item.id },
        });
      }
    }

    return {
      type: 'SLIDER',
      layoutOrder: 1,
      data:
        sliders && sliders.items && sliders.items.length > 0
          ? sliders.items
              .filter(
                (data) =>
                  data.desktopAsset !== null || data.mobileAsset !== null,
              )
              .map((item, index) => ({
                uniqueId: item.id,
                customLink: item.customLink,
                order: index + 1,
                existingDesktopAsset: item.desktopAsset
                  ? { url: item.desktopAsset.url, type: item.desktopAsset.type }
                  : null,
                existingMobileAsset: item.mobileAsset
                  ? { url: item.mobileAsset.url, type: item.mobileAsset.type }
                  : null,
                desktopAsset: null,
                mobileAsset: null,
              }))
          : [],
    };
  }

  async deleteSlider(uniqueId: string, type: 'MOBILE' | 'DESKTOP') {
    const slider = await this.prisma.sliderItemSchema.findUnique({
      where: { id: uniqueId },
      select: {
        order: true,
        desktopAsset: { select: { url: true } },
        mobileAsset: { select: { url: true } },
      },
    });
    if (!slider) {
      throw new BadRequestException('Slider bulunamadı.');
    }

    if (type === 'DESKTOP' && slider.desktopAsset) {
      await this.minio.deleteAsset(slider.desktopAsset.url);
      await this.prisma.sliderItemSchema.update({
        where: { id: uniqueId },
        data: {
          desktopAsset: { disconnect: true },
        },
      });
      await this.prisma.asset.delete({
        where: { url: slider.desktopAsset.url },
      });
      return {
        success: true,
        message: 'Slider başarıyla silindi.',
      };
    }

    if (type === 'MOBILE' && slider.mobileAsset) {
      await this.minio.deleteAsset(slider.mobileAsset.url);
      await this.prisma.sliderItemSchema.update({
        where: { id: uniqueId },
        data: {
          mobileAsset: { disconnect: true },
        },
      });
      await this.prisma.asset.delete({
        where: { url: slider.mobileAsset.url },
      });
      return {
        success: true,
        message: 'Slider başarıyla silindi.',
      };
    }

    // this.updateSliderOrders(slider.order);

    return {
      success: true,
      message: 'Slider başarıyla silindi.',
    };
  }

  private updateSliderOrders(deletedOrder: number): void {
    this.prisma.sliderItemSchema
      .updateMany({
        where: {
          order: {
            gt: deletedOrder,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      })
      .catch((error) => {
        console.error('Order güncelleme hatası:', error);
      });
  }

  async updateLayout(
    components: MainPageComponentsType['components'],
    footer?: MainPageComponentsType['footer'],
  ) {
    if (footer) {
      this.prisma.$transaction(async (tx) => {
        // Önce mevcut footer'ı bul veya oluştur
        let existingFooter = await tx.footer.findFirst();

        if (!existingFooter) {
          existingFooter = await tx.footer.create({
            data: {
              options: footer.options ? { ...footer.options } : null,
            },
          });
        } else {
          // Mevcut footer'ın options'ını güncelle
          await tx.footer.update({
            where: { id: existingFooter.id },
            data: {
              options: footer.options ? { ...footer.options } : null,
            },
          });
        }

        // Mevcut tüm footer link groups ve links'leri sil
        await tx.footerLinks.deleteMany({
          where: {
            footerLinkGroup: {
              footerId: existingFooter.id,
            },
          },
        });

        await tx.footerLinkGroups.deleteMany({
          where: {
            footerId: existingFooter.id,
          },
        });

        for (const group of footer.linkGroups) {
          const createdGroup = await tx.footerLinkGroups.create({
            data: {
              order: group.order,
              title: group.title,
              footerId: existingFooter.id,
              ...(group.fontSize
                ? { options: { fontSize: group.fontSize } }
                : {}),
            },
          });

          if (group.links && group.links.length > 0) {
            const linksData: Prisma.FooterLinksCreateManyInput[] =
              group.links.map((link) => ({
                order: link.order,
                title: link.title,
                customLink: link.customLink || null,
                productId: link.productId || null,
                categoryId: link.categoryId || null,
                brandId: link.brandId || null,
                footerLinkGroupId: createdGroup.id,
              }));

            await tx.footerLinks.createMany({
              data: linksData,
            });
          }
        }
      });
    }
    return this.prisma.$transaction(
      async (tx) => {
        let layout = await tx.layout.findFirst();

        if (!layout) {
          layout = await tx.layout.create({
            data: { otherSettings: {} },
          });
        }

        // Slider olmayan mevcut component'leri sil
        await tx.layoutComponent.deleteMany({
          where: {
            layoutId: layout.id,
            type: { not: 'SLIDER' },
          },
        });

        for (const component of components) {
          switch (component.type) {
            case 'MARQUEE':
              await this.handleMarqueeComponent(tx, layout.id, component);
              break;

            case 'PRODUCT_LIST':
              await this.handleProductListComponent(tx, layout.id, component);
              break;
            case 'CATEGORY_GRID':
              await this.handleCategoryGridComponent(tx, layout.id, component);
              break;
            default:
              console.warn(`Bilinmeyen component tipi: ${component.type}`);
          }
        }

        return { success: true, message: 'Layout başarıyla güncellendi' };
      },
      {
        timeout: 10 * 60 * 1000, // 10 dakika
        isolationLevel: 'ReadCommitted',
      },
    );
  }

  private async handleMarqueeComponent(
    tx: Prisma.TransactionClient,
    layoutId: string,
    component: Extract<
      MainPageComponentsType['components'][0],
      { type: 'MARQUEE' }
    >,
  ) {
    // MarqueeSchema oluştur
    const marquee = await tx.marqueeSchema.create({
      data: {
        options: component.data, // ✅ Direkt component.data'yı ver
      },
    });
    // LayoutComponent oluştur
    await tx.layoutComponent.create({
      data: {
        type: 'MARQUEE',
        order: component.layoutOrder,
        layoutId,
        marqueeId: marquee.id,
      },
    });
  }

  private async handleProductListComponent(
    tx: Prisma.TransactionClient,
    layoutId: string,
    component: Extract<
      MainPageComponentsType['components'][0],
      { type: 'PRODUCT_LIST' }
    >,
  ) {
    // ProductListCarousel oluştur
    const carousel = await tx.productListCarousel.create({
      data: {
        translations: {
          create: {
            locale: 'TR',
            title: component.data.title,
          },
        },
        items: {
          create: component.data.items.map((item, index) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            order: index + 1,
          })),
        },
      },
    });

    // LayoutComponent oluştur
    await tx.layoutComponent.create({
      data: {
        type: 'PRODUCT_LIST',
        order: component.layoutOrder,
        layoutId,
        productListCarouselId: carousel.id,
      },
    });
  }

  private async handleCategoryGridComponent(
    tx: Prisma.TransactionClient,
    layoutId: string,
    component: Extract<
      MainPageComponentsType['components'][0],
      { type: 'CATEGORY_GRID' }
    >,
  ) {
    const { uniqueId, categoryIds, ...others } = component.data;
    const category_grid = await tx.categoryGridComponent.upsert({
      where: {
        id: uniqueId,
      },
      create: {
        categories: {
          connect: categoryIds.map((id) => ({ id })),
        },
        options: others,
      },
      update: {
        categories: {
          set: categoryIds.map((id) => ({ id })),
        },
        options: others,
      },
    });
    await tx.layoutComponent.create({
      data: {
        type: 'CATEGORY_GRID',
        order: component.layoutOrder,
        layout: {
          connect: {
            id: layoutId,
          },
        },
        categoryGrid: {
          connect: {
            id: category_grid.id,
          },
        },
      },
    });
  }

  async getLayout(isNeedFooter: boolean): Promise<{
    components: MainPageComponentsType['components'];
    footer: MainPageComponentsType['footer'] | null;
  }> {
    const layout = await this.prisma.layout.findFirst({
      include: {
        components: {
          orderBy: { order: 'asc' },
          include: {
            marquee: {
              select: { id: true, options: true },
            },
            productListCarousel: {
              include: {
                items: {
                  orderBy: { order: 'asc' },
                  select: {
                    variantId: true,
                    productId: true,
                    order: true,
                  },
                },
                translations: {
                  where: { locale: 'TR' },
                  select: { title: true },
                },
              },
            },
            categoryGrid: {
              select: {
                id: true,
                options: true,
                categories: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const sliders = await this.prisma.sliderSettings.findFirst({
      include: {
        items: {
          orderBy: {
            order: 'asc',
          },
          select: {
            mobileAsset: {
              select: { url: true, type: true },
            },
            desktopAsset: {
              select: { url: true, type: true },
            },
            id: true,
            customLink: true,
            order: true,
          },
        },
      },
    });

    if (!layout || !layout.components) {
      return {
        components: [],
        footer: null,
      };
    }

    const returnData = layout.components.map((component) => {
      switch (component.type) {
        case 'MARQUEE':
          if (!component.marquee) {
            throw new Error(
              `Marquee data not found for component ${component.id}`,
            );
          }
          const options = component.marquee.options as Omit<
            MarqueeType,
            'uniqueId'
          >;
          return {
            type: 'MARQUEE' as const,
            layoutOrder: component.order,
            data: {
              uniqueId: component.marquee.id,
              ...options,
            } as MarqueeType,
          };

        case 'PRODUCT_LIST':
          if (!component.productListCarousel) {
            throw new Error(
              `ProductListCarousel data not found for component ${component.id}`,
            );
          }

          return {
            type: 'PRODUCT_LIST' as const,
            layoutOrder: component.order,
            data: {
              uniqueId: component.productListCarousel.id,
              items: component.productListCarousel.items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
              })),
              title: component.productListCarousel.translations[0]?.title || '',
              backgroundColor: '#ffffff', // Bu bilgileri nerede saklayacağını belirle
              titleColor: '#000000',
              textColor: '#000000',
              titleFontSize: MantineSize.md,
            },
          };
        case 'CATEGORY_GRID':
          if (!component.categoryGrid) {
            throw new Error(
              `CategoryGrid data not found for component ${component.id}`,
            );
          }
          return {
            layoutOrder: component.order,
            type: 'CATEGORY_GRID' as const,
            data: {
              uniqueId: component.categoryGrid.id,
              categoryIds: component.categoryGrid.categories.map(
                (cat) => cat.id,
              ),
              ...(component.categoryGrid.options as Omit<
                CategoryGridComponentType,
                'uniqueId' | 'categoryIds'
              >),
            },
          };
      }
    });
    let footer: MainPageComponentsType['footer'] | null = null;
    if (isNeedFooter) {
      footer = (await this.getFooter()).footer;
    }

    if (sliders && sliders.items && sliders.items.length > 0) {
      return {
        components: [
          {
            type: 'SLIDER',
            layoutOrder: 1,
            data:
              sliders && sliders.items && sliders.items.length > 0
                ? sliders.items
                    .filter(
                      (data) =>
                        data.desktopAsset !== null || data.mobileAsset !== null,
                    )
                    .map((item, index) => ({
                      uniqueId: item.id,
                      customLink: item.customLink,
                      order: index + 1,
                      existingDesktopAsset: item.desktopAsset
                        ? {
                            url: item.desktopAsset.url,
                            type: item.desktopAsset.type,
                          }
                        : null,
                      existingMobileAsset: item.mobileAsset
                        ? {
                            url: item.mobileAsset.url,
                            type: item.mobileAsset.type,
                          }
                        : null,
                      desktopAsset: null,
                      mobileAsset: null,
                    }))
                : [],
          },
          ...returnData,
        ],
        footer: isNeedFooter ? footer : null,
      };
    } else {
      return {
        components: returnData,
        footer: isNeedFooter ? footer : null,
      };
    }
  }

  async getFooter(): Promise<{
    footer: MainPageComponentsType['footer'] | null;
  }> {
    const footer = await this.prisma.footer.findFirst({
      include: {
        linkGroups: {
          orderBy: {
            order: 'asc',
          },
          include: {
            links: {
              orderBy: {
                order: 'asc',
              },
              include: {
                brand: {
                  select: { id: true },
                },
                category: {
                  select: { id: true },
                },
                product: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!footer) return { footer: null };
    return footer
      ? {
          footer: {
            options: footer.options
              ? (JSON.parse(
                  JSON.stringify(footer.options),
                ) as MainPageComponentsType['footer']['options'])
              : {
                  backgroundColor: '#ffffff',
                  textColor: '#000000',
                  titleColor: '#000000',
                  textFontSize: 'md',
                  titleFontSize: 'lg',
                },
            linkGroups:
              footer.linkGroups.map((group) => ({
                // fontSize: (group.options?.fontSize as MantineSize) || null,
                fontSize: 'md' as MantineSize,
                links: group.links.map((link) => ({
                  order: link.order,
                  title: link.title,
                  uniqueId: link.id,
                  customLink: link.customLink || '',
                  productId: link.productId || null,
                  categoryId: link.categoryId || null,
                  brandId: link.brandId || null,
                })) as MainPageComponentsType['footer']['linkGroups'][number]['links'],
                order: group.order,
                title: group.title,
                uniqueId: group.id,
              })) || [],
          },
        }
      : { footer: null };
  }
}
