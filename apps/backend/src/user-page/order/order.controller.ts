import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type User } from '@repo/database';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Get('get-order/:slug')
  @UseGuards(OptionalJwtAuthGuard)
  async getOrder(
    @Param('slug') slug: string,
    @CurrentUser() user: User | null,
  ) {
    return this.orderService.getOrder(slug, user);
  }
}
