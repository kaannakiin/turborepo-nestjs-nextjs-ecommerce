import { Controller, Get, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Get('get-order/:orderNumber')
  async getOrderByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByOrderNumber(orderNumber);
  }
}
