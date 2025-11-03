import {
  Controller,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { $Enums } from '@repo/database';

@Controller('/admin/carts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async getAllCarts(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit', new ParseIntPipe()) limit: number,
    @Query('search') search?: string,
    @Query('status', new ParseEnumPipe($Enums.CartStatus, { optional: true }))
    status?: $Enums.CartStatus,
  ) {
    return this.cartsService.getAllCarts({ page, limit, search, status });
  }
}
