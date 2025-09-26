import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/database';
import { CargoZoneType } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateCargoZone(body: CargoZoneType) {
    let cargoZone = await this.prisma.cargoZone.findUnique({
      where: { id: body.uniqueId },
    });

    const cargoZoneExists = !!cargoZone;

    if (!cargoZone) {
      cargoZone = await this.prisma.cargoZone.create({
        data: { id: body.uniqueId },
      });
    } else {
      await this.prisma.location.deleteMany({
        where: { cargoZoneId: cargoZone.id },
      });

      await this.prisma.cargoRule.deleteMany({
        where: { cargoZoneId: cargoZone.id },
      });
    }

    // Location'ları oluştur
    const locationsToCreate: Prisma.LocationCreateManyInput[] = [];

    for (const loc of body.locations) {
      const locationData = {
        cargoZoneId: cargoZone.id,
        countryId: loc.countryId,
        stateIds: [],
        cityIds: [],
      };

      switch (loc.countryType) {
        case 'NONE':
          break;
        case 'STATE':
          if (loc.stateIds?.length) {
            locationData.stateIds = loc.stateIds;
          }
          break;
        case 'CITY':
          if (loc.cityIds?.length) {
            locationData.cityIds = loc.cityIds;
          }
          break;
      }

      locationsToCreate.push(locationData);
    }

    if (locationsToCreate.length > 0) {
      await this.prisma.location.createMany({
        data: locationsToCreate,
      });
    }

    // Rule'ları oluştur
    const nullifyIfZero = (value: number | null | undefined): number | null => {
      return value === 0 ? null : value || null;
    };

    const rulesToCreate: Prisma.CargoRuleCreateManyInput[] = [];

    for (const rule of body.rules) {
      rulesToCreate.push({
        id: rule.uniqueId, // Rule'un kendi ID'sini kullan
        name: rule.name,
        cargoZoneId: cargoZone.id,
        currency: rule.currency,
        price: rule.shippingPrice,
        ruleType: rule.condition.type,
        minValue:
          rule.condition.type === 'ProductWeight'
            ? nullifyIfZero(rule.condition.minProductWeight)
            : nullifyIfZero(rule.condition.minSalesPrice),
        maxValue:
          rule.condition.type === 'ProductWeight'
            ? nullifyIfZero(rule.condition.maxProductWeight)
            : nullifyIfZero(rule.condition.maxSalesPrice),
      });
    }

    if (rulesToCreate.length > 0) {
      await this.prisma.cargoRule.createMany({
        data: rulesToCreate,
      });
    }

    return {
      success: true,
      message: `Kargo bölgesi başarıyla ${cargoZoneExists ? 'güncellendi' : 'oluşturuldu'}.`,
      data: cargoZone,
    };
  }
  async getAllCargoZones() {
    const cargoZones = await this.prisma.cargoZone.findMany({
      include: {
        locations: {
          include: {
            country: {
              include: {
                translations: true,
              },
            },
          },
        },
        rules: true,
      },
    });
    if (cargoZones.length === 0) {
      return { success: true, cargoZones: [] };
    }
    return {
      success: true,
      cargoZones: cargoZones,
    };
  }

  async getCargoZone(
    id: string,
  ): Promise<CargoZoneType | { success: false; message: string }> {
    const cargoZone = await this.prisma.cargoZone.findUnique({
      where: { id },
      include: {
        locations: {
          include: {
            country: true,
          },
        },
        rules: true,
      },
    });
    if (!cargoZone) {
      return { success: false, message: 'Kargo bölgesi bulunamadı.' };
    }
    return {
      locations: cargoZone.locations.map((loc) => ({
        countryId: loc.countryId,
        countryType: loc.country.type,
        cityIds: loc.cityIds || [],
        stateIds: loc.stateIds || [],
      })),

      rules: cargoZone.rules.map((rule) => ({
        name: rule.name,
        currency: rule.currency,
        shippingPrice: rule.price,
        uniqueId: rule.id,
        condition:
          rule.ruleType === 'ProductWeight'
            ? {
                type: 'ProductWeight',
                minProductWeight: rule.minValue || null,
                maxProductWeight: rule.maxValue || null,
              }
            : {
                type: 'SalesPrice',
                minSalesPrice: rule.minValue || null,
                maxSalesPrice: rule.maxValue || null,
              },
      })),
      uniqueId: cargoZone.id,
    };
  }
}
