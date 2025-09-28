import { Injectable } from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database';
import {
  CargoRuleWithDetails,
  CargoZoneType,
  CartItemWithPrices,
  LocationWithCargoZone,
  ShippingMethodsResponse,
} from '@repo/types';
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

  private calculateCartTotal(
    cartItems: CartItemWithPrices[],
    currency: $Enums.Currency = 'TRY',
  ): number {
    let total = 0;

    for (const item of cartItems) {
      if (item.variant && item.variant.prices.length > 0) {
        const priceObj = item.variant.prices.find(
          (p) => p.currency === currency,
        );
        if (priceObj) {
          if (priceObj.discountedPrice && priceObj.discountedPrice > 0) {
            total += priceObj.discountedPrice * item.quantity;
          } else {
            total += priceObj.price * item.quantity;
          }
        }
      } else if (item.product && item.product.prices.length > 0) {
        const priceObj = item.product.prices.find(
          (p) => p.currency === currency,
        );
        if (priceObj) {
          if (priceObj.discountedPrice && priceObj.discountedPrice > 0) {
            total += priceObj.discountedPrice * item.quantity;
          } else {
            total += priceObj.price * item.quantity;
          }
        }
      }
    }
    return total;
  }

  private async findMatchingCargoZone(
    countryId: string,
    stateId: string | null,
    cityId: string | null,
    currency: $Enums.Currency,
    cartTotal: number,
  ): Promise<{
    rules: CargoRuleWithDetails[];
  } | null> {
    const locations = await this.prisma.location.findMany({
      where: {
        countryId,
      },
      include: {
        country: {
          select: {
            type: true,
          },
        },
        cargoZone: {
          select: {
            rules: {
              where: {
                currency: currency,
              },
            },
          },
        },
      },
    });

    if (locations.length === 0) {
      return null;
    }

    const matchingLocation = this.findBestMatchingLocation(
      locations,
      stateId,
      cityId,
    );

    if (!matchingLocation) {
      return null;
    }

    const applicableRules = matchingLocation.cargoZone.rules.filter((rule) => {
      return this.isRuleApplicable(rule, cartTotal);
    });

    return {
      rules: applicableRules,
    };
  }

  private findBestMatchingLocation(
    locations: LocationWithCargoZone[],
    stateId: string | null,
    cityId: string | null,
  ): LocationWithCargoZone | null {
    if (cityId) {
      const cityMatch = locations.find(
        (loc) => loc.cityIds.length > 0 && loc.cityIds.includes(cityId),
      );
      if (cityMatch) return cityMatch;
    }

    if (stateId) {
      const stateMatch = locations.find(
        (loc) => loc.stateIds.length > 0 && loc.stateIds.includes(stateId),
      );
      if (stateMatch) return stateMatch;
    }

    const countryWideMatch = locations.find(
      (loc) => loc.stateIds.length === 0 && loc.cityIds.length === 0,
    );

    return countryWideMatch || null;
  }

  private isRuleApplicable(
    rule: CargoRuleWithDetails,
    cartTotal: number,
  ): boolean {
    if (rule.ruleType === 'SalesPrice') {
      if (rule.minValue !== null && cartTotal < rule.minValue) {
        return false;
      }
      if (rule.maxValue !== null && cartTotal > rule.maxValue) {
        return false;
      }
    }

    return true;
  }

  async getAvailableShippingMethods(
    cartId: string,
  ): Promise<ShippingMethodsResponse> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        shippingAddress: {
          select: {
            countryId: true,
            addressLocationType: true,
            stateId: true,
            cityId: true,
          },
        },
        items: {
          select: {
            variant: { select: { prices: true } },
            product: { select: { prices: true } },
            quantity: true,
          },
        },
      },
    });

    if (!cart || !cart.shippingAddress || cart.items.length === 0) {
      return {
        success: false,
        message: 'Geçersiz sepet veya eksik gönderim adresi.',
      };
    }

    const cartTotal = this.calculateCartTotal(cart.items, cart.currency);

    const matchingZone = await this.findMatchingCargoZone(
      cart.shippingAddress.countryId,
      cart.shippingAddress.addressLocationType === 'STATE'
        ? cart.shippingAddress.stateId
        : null,
      cart.shippingAddress.addressLocationType === 'CITY'
        ? cart.shippingAddress.cityId
        : null,
      cart.currency,
      cartTotal,
    );

    if (!matchingZone) {
      return {
        success: false,
        message: 'Bu bölge için kargo hizmeti bulunmuyor.',
      };
    }

    if (matchingZone.rules.length === 0) {
      return {
        success: false,
        message: 'Bu sepet tutarı için uygun kargo seçeneği bulunmuyor.',
      };
    }

    return {
      success: true,
      shippingMethods: matchingZone,
    };
  }
}
