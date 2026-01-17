import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@repo/database';
import { RuleType } from '@repo/database/client';
import {
  AdminCargoZoneQuery,
  CargoZones,
  CargoZoneType,
  Pagination,
  ProductWeightCondition,
  SalesPriceCondition,
  ShippingRuleType,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrUpdateCargoZoneDto } from './shipping-dto';

@Injectable()
export class ShippingService {
  constructor(private readonly prismaService: PrismaService) {}

  private mapRuleToCargoRuleData(rule: ShippingRuleType, cargoZoneId: string) {
    const isProductWeight = rule.condition?.type === RuleType.ProductWeight;

    const minValue = isProductWeight
      ? (rule.condition as ProductWeightCondition).minProductWeight
      : (rule.condition as SalesPriceCondition).minSalesPrice;

    const maxValue = isProductWeight
      ? (rule.condition as ProductWeightCondition).maxProductWeight
      : (rule.condition as SalesPriceCondition).maxSalesPrice;

    return {
      cargoZoneId,
      name: rule.name,
      ruleType: rule.condition?.type || RuleType.SalesPrice,
      minValue: minValue ?? null,
      maxValue: maxValue ?? null,
      price: rule.shippingPrice ?? null,
      currency: rule.currency,
    };
  }

  async createOrUpdateCargoZone(
    dto: CreateOrUpdateCargoZoneDto,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const { uniqueId, locations, rules } = dto;

      if (uniqueId) {
        await this.prismaService.$transaction(async (tx) => {
          const existingZone = await tx.cargoZone.findUnique({
            where: { id: uniqueId },
          });

          if (!existingZone) {
            throw new Error('Kargo bölgesi bulunamadı');
          }

          await tx.location.deleteMany({
            where: { cargoZoneId: uniqueId },
          });

          await tx.cargoRule.deleteMany({
            where: { cargoZoneId: uniqueId },
          });

          await tx.location.createMany({
            data: locations.map((location) => ({
              cargoZoneId: uniqueId,
              countryId: location.countryId,
              stateIds: location.stateIds || [],
              cityIds: location.cityIds || [],
            })),
          });

          await tx.cargoRule.createMany({
            data: rules.map((rule) =>
              this.mapRuleToCargoRuleData(rule, uniqueId),
            ),
          });

          await tx.cargoZone.update({
            where: { id: uniqueId },
            data: { updatedAt: new Date() },
          });
        });

        return {
          success: true,
          message: 'Kargo bölgesi başarıyla güncellendi',
        };
      } else {
        await this.prismaService.$transaction(async (tx) => {
          const cargoZone = await tx.cargoZone.create({
            data: {},
          });
          await tx.location.createMany({
            data: locations.map((location) => ({
              cargoZoneId: cargoZone.id,
              countryId: location.countryId,
              stateIds: location.stateIds || [],
              cityIds: location.cityIds || [],
            })),
          });

          await tx.cargoRule.createMany({
            data: rules.map((rule) =>
              this.mapRuleToCargoRuleData(rule, cargoZone.id),
            ),
          });
        });

        return {
          success: true,
          message: 'Kargo bölgesi başarıyla oluşturuldu',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Kargo bölgesi işlemi başarısız oldu',
      };
    }
  }

  async getCargoZones(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    success: boolean;
    message: string;
    data?: CargoZones[];
    pagination?: Pagination;
  }> {
    try {
      const where: Prisma.CargoZoneWhereInput = {};

      if (search) {
        where.OR = [
          {
            rules: {
              some: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
          {
            locations: {
              some: {
                country: {
                  translations: {
                    some: {
                      name: { contains: search, mode: 'insensitive' },
                    },
                  },
                },
              },
            },
          },
        ];
      }

      const [cargoZones, total] = await Promise.all([
        this.prismaService.cargoZone.findMany({
          where,
          include: AdminCargoZoneQuery,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prismaService.cargoZone.count({ where }),
      ]);

      return {
        success: true,
        message: 'Kargo bölgeleri başarıyla getirildi',
        data: cargoZones,
        pagination: {
          currentPage: page,
          perPage: limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Kargo bölgeleri getirilemedi');
    }
  }

  private mapCargoZoneToType(cargoZone: CargoZones): CargoZoneType {
    return {
      uniqueId: cargoZone.id,
      locations: cargoZone.locations.map((loc) => ({
        countryId: loc.countryId,
        countryType: loc.country.type,
        stateIds: loc.stateIds.length > 0 ? loc.stateIds : null,
        cityIds: loc.cityIds.length > 0 ? loc.cityIds : null,
      })),
      rules: cargoZone.rules.map((rule) => ({
        uniqueId: rule.id,
        name: rule.name,
        currency: rule.currency,
        shippingPrice: rule.price ?? undefined,
        condition:
          rule.ruleType === 'ProductWeight'
            ? {
                type: 'ProductWeight' as const,
                minProductWeight: rule.minValue ?? undefined,
                maxProductWeight: rule.maxValue ?? undefined,
              }
            : {
                type: 'SalesPrice' as const,
                minSalesPrice: rule.minValue ?? undefined,
                maxSalesPrice: rule.maxValue ?? undefined,
              },
      })),
    };
  }

  async getCargoZone(id: string): Promise<{
    success: boolean;
    data?: CargoZoneType;
  }> {
    try {
      const cargoZone = await this.prismaService.cargoZone.findUnique({
        where: { id },
        include: AdminCargoZoneQuery,
      });

      if (!cargoZone) {
        throw new InternalServerErrorException('Kargo bölgesi bulunamadı');
      }

      return {
        success: true,
        data: this.mapCargoZoneToType(cargoZone),
      };
    } catch (error) {
      throw new InternalServerErrorException('Kargo bölgesi getirilemedi');
    }
  }
}
