import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { $Enums } from '@repo/database/client';
import { NullableStringPipe } from 'src/common/pipes/nullable-string.pipe';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('/admin/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getAllOrders(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('limit', new ParseIntPipe()) limit: number,
    @Query('search', new NullableStringPipe())
    search?: string,
    @Query('status', new ParseEnumPipe($Enums.OrderStatus, { optional: true }))
    orderStatus?: $Enums.OrderStatus,
  ) {
    return this.ordersService.getOrders({
      page,
      limit,
      search,
      orderStatus,
    });
  }

  @Get('/:orderNumber')
  async getOrderByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByOrderNumber(orderNumber);
  }
}
