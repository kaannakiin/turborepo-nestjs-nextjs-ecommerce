import { Injectable } from '@nestjs/common';
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
}
