import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { $Enums } from '@repo/database';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ParseIsoStringPipe } from 'src/common/pipes/parseisostring.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { CartsService } from './carts.service';

@Controller('/admin/carts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async getAllCarts(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit', new ParseIntPipe()) limit: number,
    @Query('startDate', ParseIsoStringPipe) startDate?: Date,
    @Query('endDate', ParseIsoStringPipe) endDate?: Date,
    @Query('search') search?: string,
    @Query('status', new ParseEnumPipe($Enums.CartStatus, { optional: true }))
    status?: $Enums.CartStatus,
  ) {
    return this.cartsService.getAllCarts({
      page,
      limit,
      search,
      status,
      startDate,
      endDate,
    });
  }

  @Get('/:cartId')
  async getCartById(@Param('cartId') cartId: string) {
    return this.cartsService.getCartForAdmin(cartId);
  }
}
