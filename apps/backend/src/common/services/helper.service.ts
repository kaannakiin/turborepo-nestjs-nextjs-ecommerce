import { Injectable } from '@nestjs/common';
import { CountryType } from '@repo/database';
import { PrismaService } from 'src/prisma/prisma.service';

interface LocationData {
  countryType: CountryType;
  countryId: string;
  stateId?: string | null;
  cityId?: string | null;
  districtId?: string | null;
}

interface LocationDbResult {
  countryId: string;
  stateId: string | null;
  cityId: string | null;
  districtId: string | null;
  latitude: string | null;
  longitude: string | null;
}

@Injectable()
export class HelperService {
  constructor(private readonly prismaService: PrismaService) {}

  getCountryDbState(
    data: LocationData,
  ): Omit<LocationDbResult, 'latitude' | 'longitude'> {
    switch (data.countryType) {
      case 'CITY':
        return {
          countryId: data.countryId,
          stateId: null,
          cityId: data.cityId!,
          districtId: data.districtId || null,
        };
      case 'NONE':
        return {
          countryId: data.countryId,
          stateId: null,
          cityId: null,
          districtId: null,
        };
      case 'STATE':
        return {
          countryId: data.countryId,
          stateId: data.stateId!,
          cityId: null,
          districtId: null,
        };
    }
  }

  async getLocationWithCoordinates(
    data: LocationData,
  ): Promise<LocationDbResult> {
    const baseLocation = this.getCountryDbState(data);

    if (data.cityId) {
      const city = await this.prismaService.city.findUnique({
        where: { id: data.cityId },
        select: { latitude: true, longitude: true },
      });

      if (city?.latitude && city?.longitude) {
        return {
          ...baseLocation,
          latitude: city.latitude,
          longitude: city.longitude,
        };
      }
    }

    return {
      ...baseLocation,
      latitude: null,
      longitude: null,
    };
  }
}
