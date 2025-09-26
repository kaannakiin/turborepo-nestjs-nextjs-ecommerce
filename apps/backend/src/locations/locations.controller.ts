import { Controller, Get, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('get-all-countries')
  async getAllCountries() {
    return this.locationsService.getAllCountries();
  }

  @Get('get-cities-by-country/:countryId')
  async getCitiesByCountry(@Param('countryId') countryId: string) {
    return this.locationsService.getCitiesByCountry(countryId);
  }

  @Get('get-states-by-country/:countryId')
  async getStatesByCountry(@Param('countryId') countryId: string) {
    return this.locationsService.getStatesByCountry(countryId);
  }
}
