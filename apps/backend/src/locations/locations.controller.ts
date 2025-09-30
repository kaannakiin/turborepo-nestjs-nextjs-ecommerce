import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type User } from '@repo/database';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  AuthUserAddressSchema,
  type AuthUserAddressZodType,
} from '@repo/types';

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

  @UseGuards(JwtAuthGuard)
  @Get('get-user-addresses')
  async getUserAddresses(@CurrentUser() user: User) {
    return this.locationsService.getUserAddresses(user.id);
  }

  @Post('add-user-address')
  @UseGuards(JwtAuthGuard)
  async addUserAddress(
    @Body(new ZodValidationPipe(AuthUserAddressSchema))
    address: AuthUserAddressZodType,
    @CurrentUser() user: User,
  ) {
    return this.locationsService.addUserAddress(user.id, address);
  }
}
