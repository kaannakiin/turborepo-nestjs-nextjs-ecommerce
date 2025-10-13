import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { type GetOrderZodType, GetOrdersSchema } from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { OrdersService } from './orders.service';

@Controller('/admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('get-orders')
  @UsePipes(new ZodValidationPipe(GetOrdersSchema))
  async getOrders(@Body() body: GetOrderZodType) {
    return this.ordersService.getOrders(body);
  }

  @Get(':orderNumber')
  async getOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByOrderNumber(orderNumber);
  }
}
