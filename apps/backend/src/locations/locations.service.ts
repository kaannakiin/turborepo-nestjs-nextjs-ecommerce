import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthUserAddressZodType, success } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async getAllCountries() {
    return this.prisma.country.findMany({
      select: {
        translations: {
          select: {
            name: true,
            locale: true,
          },
        },
        id: true,
        emoji: true,
        type: true,
      },
    });
  }

  async getCitiesByCountry(countryId: string) {
    return this.prisma.city.findMany({
      where: {
        countryId: countryId,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getStatesByCountry(countryId: string) {
    return this.prisma.state.findMany({
      where: {
        countryId: countryId,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getUserAddresses(userId: string) {
    const [addresses, user] = await Promise.all([
      this.prisma.addressSchema.findMany({
        where: { userId },
        include: {
          city: {
            select: { id: true, name: true },
          },
          country: {
            select: {
              id: true,
              translations: { select: { name: true, locale: true } },
              emoji: true,
              name: true,
              type: true,
            },
          },
          state: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { defaultAddressId: true },
      }),
    ]);

    // Client-side'da kontrol et
    return addresses.map((address) => ({
      ...address,
      isDefault: address.id === user?.defaultAddressId,
    }));
  }

  async addUserAddress(userId: string, address: AuthUserAddressZodType) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı');
    }

    const createdAddress = await this.prisma.addressSchema.upsert({
      where: {
        id: address.id,
      },
      create: {
        addressLine1: address.addressLine1,
        addressLocationType: address.addressType,
        addressLine2: address.addressLine2,
        name: address.name,
        phone: address.phone,
        surname: address.surname,
        addressTitle: address.addressTitle,
        ...(address.addressType === 'CITY'
          ? { cityId: address.cityId }
          : address.addressType === 'STATE'
            ? {
                stateId: address.stateId,
              }
            : {}),
        countryId: address.countryId,
        userId: user.id,
        tcKimlikNo: address.tcKimlikNo || null,
      },
      update: {
        addressLine1: address.addressLine1,
        addressLocationType: address.addressType,
        addressLine2: address.addressLine2,
        name: address.name,
        phone: address.phone,
        surname: address.surname,
        addressTitle: address.addressTitle,
        tcKimlikNo: address.tcKimlikNo || null,
        ...(address.addressType === 'CITY'
          ? { cityId: address.cityId, stateId: null }
          : address.addressType === 'STATE'
            ? {
                stateId: address.stateId,
                cityId: null,
              }
            : {
                stateId: null,
                cityId: null,
              }),
        countryId: address.countryId,
        userId: user.id,
      },
    });

    const newUserAddress = await this.prisma.user.update({
      where: { id: user.id },
      data: { defaultAddressId: createdAddress.id },
    });

    return {
      success: true,
      message: 'Adres başarıyla eklendi',
    };
  }
}
