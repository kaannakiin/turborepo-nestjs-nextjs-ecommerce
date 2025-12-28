import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CartsModule } from './carts/carts.module';
import { DiscountsModule } from './discounts/discounts.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { Themev2Module } from './themev2/themev2.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SharedModule } from 'src/common/services/shared.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [
    UsersModule,
    SharedModule,
    DiscountsModule,
    CampaignsModule,
    PaymentsModule,
    OrdersModule,
    CartsModule,
    Themev2Module,
    ProductsModule,
  ],
})
export class AdminModule {}
