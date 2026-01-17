import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateOrUpdateCargoZoneDto } from './shipping-dto';

@Controller('admin/shipping')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('cargo-zone')
  @UsePipes(ZodValidationPipe)
  async createOrUpdateCargoZone(@Body() dto: CreateOrUpdateCargoZoneDto) {
    return this.shippingService.createOrUpdateCargoZone(dto);
  }

  @Get('cargo-zones')
  async getAllCargoZones(
    @Query(
      'page',
      new ParseIntPipe({
        optional: true,
      }),
    )
    page: number = 1,
    @Query(
      'limit',
      new ParseIntPipe({
        optional: true,
      }),
    )
    limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.shippingService.getCargoZones(page, limit, search);
  }

  @Get('cargo-zone/:id')
  async getCargoZone(@Param('id') id: string) {
    return this.shippingService.getCargoZone(id);
  }
}
