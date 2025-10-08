import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CargoZoneConfigSchema, type CargoZoneType } from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { ShippingService } from './shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('create-or-update-cargo-zone')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'OWNER'])
  @UsePipes(new ZodValidationPipe(CargoZoneConfigSchema))
  async createOrUpdateCargoZone(@Body() body: CargoZoneType) {
    return this.shippingService.createOrUpdateCargoZone(body);
  }

  @Get('get-all-cargo-zones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'OWNER'])
  async getAllCargoZones() {
    return this.shippingService.getAllCargoZones();
  }

  @Get('get-cargo-zone/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'OWNER'])
  async getCargoZone(@Param('id') id: string) {
    return this.shippingService.getCargoZone(id);
  }

  @Get('get-available-shipping-methods/:cartId')
  async getAvailableShippingMethods(@Param('cartId') cartId: string) {
    return this.shippingService.getAvailableShippingMethods(cartId);
  }
}
