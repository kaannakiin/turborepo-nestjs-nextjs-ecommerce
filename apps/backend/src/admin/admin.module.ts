import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ThemeModule } from './theme/theme.module';
import { OrdersModule } from './orders/orders.module';
import { DiscountsModule } from './discounts/discounts.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [UsersModule, ProductsModule, ThemeModule, OrdersModule, DiscountsModule],
})
export class AdminModule {}
