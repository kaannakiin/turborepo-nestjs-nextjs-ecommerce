import { Injectable } from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database'; // Prisma tiplerini import etmek önemli
import {
  CampaignZodType,
  CrossSellingCampaignType,
  GetCampaignsReturnType,
  UpSellingCampaignType,
  UppSellOfferZodType, // Zod şemandan bunu import ettiğini varsayıyorum
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  private getOffersCreateManyPayload(offers: UppSellOfferZodType[]) {
    return {
      createMany: {
        data: offers
          .sort((a, b) => a.order - b.order)
          .map((offer) => ({
            addCountDown: offer.offer.addCountDown,
            ...(offer.offer.addCountDown && {
              countDownMinute: offer.offer.countDownMinute,
            }),
            discountType: offer.offer.discountType,
            discountValue: offer.offer.discountValue,
            order: offer.order,
            title: offer.title.trim(),
            description: offer.description.trim(),
            discountValueAppliedByPrice:
              offer.offer.discountValueAppliedByPrice,
            showPrroductIfInCart: offer.offer.showPrroductIfInCart,
            ...(offer.productId && { productId: offer.productId }),
            ...(offer.variantId &&
              !offer.productId && { variantId: offer.variantId }),
          })),
      },
    };
  }

  async createOrUpdateOffer(
    campaignData: CampaignZodType,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const {
        title,
        currencies,
        dates,
        requirements,
        offers,
        uniqueId,
        status,
      } = campaignData;

      const baseData = {
        title: title.trim(),
        dates: JSON.parse(JSON.stringify(dates)),
        requirements: JSON.parse(JSON.stringify(requirements)),
        status,
      };

      const offersPayload = this.getOffersCreateManyPayload(offers);

      if (uniqueId) {
        const campaign = await this.prisma.campaign.findUnique({
          where: { id: uniqueId },
        });

        if (!campaign) {
          return {
            success: false,
            message: 'Güncellemek istediğiniz kampanya bulunamadı.',
          };
        }

        let updateData: Prisma.CampaignUpdateInput;

        if (campaignData.type === 'CROSS_SELLING') {
          const { conditions, campaignOfferTargetType } =
            campaignData as CrossSellingCampaignType;
          updateData = {
            ...baseData,
            campaignType: 'CROSS_SELLING',
            validCurrencies: { set: currencies },
            campaignOfferType: campaignOfferTargetType,
            conditionsIsAllProducts: conditions.isAllProducts,
            buyableProducts: { deleteMany: {} },
            buyableVariants: { deleteMany: {} },
            conditionProducts: { deleteMany: {} },
            conditionVariants: { deleteMany: {} },
            ...(!conditions.isAllProducts && {
              ...(conditions.productIds && {
                conditionProducts: {
                  createMany: {
                    data: conditions.productIds.map((id) => ({
                      productId: id,
                    })),
                    skipDuplicates: true,
                  },
                },
              }),
              ...(conditions.variantIds && {
                conditionVariants: {
                  createMany: {
                    data: conditions.variantIds.map((id) => ({
                      variantId: id,
                    })),
                    skipDuplicates: true,
                  },
                },
              }),
            }),
            offers: {
              deleteMany: {},
              ...offersPayload,
            },
          };
        } else {
          const { buyableProducts } = campaignData as UpSellingCampaignType;
          updateData = {
            ...baseData,
            campaignType: 'UP_SELLING',
            validCurrencies: { set: currencies },
            // Diğer kampanya tipinin ilişkilerini temizle
            campaignOfferType: null,
            conditionsIsAllProducts: null,
            conditionProducts: { deleteMany: {} },
            conditionVariants: { deleteMany: {} },
            buyableProducts: { deleteMany: {} },
            buyableVariants: { deleteMany: {} },
            ...(buyableProducts?.productIds && {
              buyableProducts: {
                createMany: {
                  data: buyableProducts.productIds.map((id) => ({
                    productId: id,
                  })),
                  skipDuplicates: true,
                },
              },
            }),
            ...(buyableProducts?.variantIds && {
              buyableVariants: {
                createMany: {
                  data: buyableProducts.variantIds.map((id) => ({
                    variantId: id,
                  })),
                  skipDuplicates: true,
                },
              },
            }),
            offers: {
              deleteMany: {},
              ...offersPayload,
            },
          };
        }

        await this.prisma.campaign.update({
          where: { id: uniqueId },
          data: updateData,
        });

        return { success: true, message: 'Kampanya başarıyla güncellendi.' };
      } else {
        let createData: Prisma.CampaignCreateInput;

        if (campaignData.type === 'CROSS_SELLING') {
          const { conditions, campaignOfferTargetType } =
            campaignData as CrossSellingCampaignType;
          createData = {
            ...baseData,
            campaignType: 'CROSS_SELLING',
            validCurrencies: currencies,
            campaignOfferType: campaignOfferTargetType,
            conditionsIsAllProducts: conditions.isAllProducts,
            ...(!conditions.isAllProducts && {
              ...(conditions.productIds && {
                conditionProducts: {
                  createMany: {
                    data: conditions.productIds.map((id) => ({
                      productId: id,
                    })),
                  },
                },
              }),
              ...(conditions.variantIds && {
                conditionVariants: {
                  createMany: {
                    data: conditions.variantIds.map((id) => ({
                      variantId: id,
                    })),
                  },
                },
              }),
            }),
            offers: offersPayload,
          };
        } else {
          const { buyableProducts } = campaignData as UpSellingCampaignType;
          createData = {
            ...baseData,
            campaignType: 'UP_SELLING',
            validCurrencies: currencies,
            ...(buyableProducts?.productIds && {
              buyableProducts: {
                createMany: {
                  data: buyableProducts.productIds.map((id) => ({
                    productId: id,
                  })),
                },
              },
            }),
            ...(buyableProducts?.variantIds && {
              buyableVariants: {
                createMany: {
                  data: buyableProducts.variantIds.map((id) => ({
                    variantId: id,
                  })),
                },
              },
            }),
            offers: offersPayload,
          };
        }

        await this.prisma.campaign.create({
          data: createData,
        });

        return { success: true, message: 'Kampanya başarıyla oluşturuldu.' };
      }
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'Kampanya işlenirken bir hata oluştu.',
      };
    }
  }

  async getCampaignByIdToFormValues(
    id: string,
  ): Promise<{ success: boolean; data?: CampaignZodType; message?: string }> {
    try {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id },
        include: {
          offers: {
            orderBy: {
              order: 'asc',
            },
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });

      if (!campaign) {
        return {
          success: false,
          message: 'Aradığınız kampanya bulunamadı.',
        };
      }
      if (campaign.campaignType === 'CROSS_SELLING') {
        const conditionProducts =
          await this.prisma.campaignConditionProduct.findMany({
            where: {
              campaignId: campaign.id,
            },
          });
        const conditionVariants =
          await this.prisma.campaignConditionVariant.findMany({
            where: {
              campaignId: campaign.id,
            },
          });

        return {
          success: true,
          message: 'Kampanya bulundu.',
          data: {
            campaignOfferTargetType: campaign.campaignOfferType,
            currencies: campaign.validCurrencies,
            dates: JSON.parse(
              JSON.stringify(campaign.dates),
            ) as CrossSellingCampaignType['dates'],
            requirements: JSON.parse(
              JSON.stringify(campaign.requirements),
            ) as CrossSellingCampaignType['requirements'],
            title: campaign.title,
            type: 'CROSS_SELLING',
            uniqueId: campaign.id,
            status: campaign.status,
            conditions: {
              isAllProducts: campaign.conditionsIsAllProducts,
              ...(!campaign.conditionsIsAllProducts && {
                productIds: conditionProducts.map((p) => p.productId),
                variantIds: conditionVariants.map((v) => v.variantId),
              }),
            },
            offers: campaign.offers.map((offer) => ({
              description: offer.description,
              order: offer.order,
              title: offer.title,
              offer: {
                addCountDown: offer.addCountDown,
                discountType: offer.discountType,
                discountValue: offer.discountValue,
                discountValueAppliedByPrice: offer.discountValueAppliedByPrice,
                showPrroductIfInCart: offer.showPrroductIfInCart,
                ...(offer.addCountDown && {
                  countDownMinute: offer.countDownMinute,
                }),
              } as CrossSellingCampaignType['offers'][0]['offer'],
              productId: offer.productId || null,
              variantId: offer.variantId || null,
            })),
          } as CrossSellingCampaignType,
        };
      }

      const buyableProducts = await this.prisma.campaignBuyableProduct.findMany(
        {
          where: {
            campaignId: campaign.id,
          },
        },
      );
      const buyableVariants = await this.prisma.campaignBuyableVariant.findMany(
        {
          where: {
            campaignId: campaign.id,
          },
        },
      );

      return {
        success: true,
        message: 'Kampanya bulundu.',
        data: {
          currencies: campaign.validCurrencies,
          dates: JSON.parse(
            JSON.stringify(campaign.dates),
          ) as CrossSellingCampaignType['dates'],
          requirements: JSON.parse(
            JSON.stringify(campaign.requirements),
          ) as CrossSellingCampaignType['requirements'],
          title: campaign.title,
          type: 'CROSS_SELLING',
          uniqueId: campaign.id,
          status: campaign.status,
          offers: campaign.offers.map((offer) => ({
            description: offer.description,
            order: offer.order,
            title: offer.title,
            offer: {
              addCountDown: offer.addCountDown,
              discountType: offer.discountType,
              discountValue: offer.discountValue,
              discountValueAppliedByPrice: offer.discountValueAppliedByPrice,
              showPrroductIfInCart: offer.showPrroductIfInCart,
              ...(offer.addCountDown && {
                countDownMinute: offer.countDownMinute,
              }),
            } as CrossSellingCampaignType['offers'][0]['offer'],
            productId: offer.productId || null,
            variantId: offer.variantId || null,
          })),
          buyableProducts: {
            productIds: buyableProducts.map((p) => p.productId),
            variantIds: buyableVariants.map((v) => v.variantId),
          },
        } as UpSellingCampaignType,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'Kampanya getirilirken bir hata oluştu.',
      };
    }
  }

  async getCampaigns(
    page: number,
    search?: string,
    type?: $Enums.CampaignStatus,
  ): Promise<GetCampaignsReturnType> {
    const take = 10;
    const skip = (page - 1) * take;

    const where: Prisma.CampaignWhereInput = {
      ...(search && search.trim() !== ''
        ? {
            title: { contains: search.trim(), mode: 'insensitive' },
          }
        : {}),
      ...(type ? { status: type } : {}),
    };

    try {
      const [campaigns, totalCount] = await Promise.all([
        await this.prisma.campaign.findMany({
          where,
          take,
          skip,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            _count: {
              select: {
                offers: true,
              },
            },
          },
        }),

        await this.prisma.campaign.count({
          where,
        }),
      ]);
      return {
        success: true,
        data: campaigns,
        message: 'Kampanyalar başarıyla getirildi.',
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / take),
          totalItems: totalCount,
          itemsPerPage: take,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'Kampanya getirilirken bir hata oluştu.',
      };
    }
  }
}
