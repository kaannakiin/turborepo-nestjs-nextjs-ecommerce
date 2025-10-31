import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ThemeModule } from './theme/theme.module';
import { DiscountsModule } from './discounts/discounts.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [
    UsersModule,
    ProductsModule,
    ThemeModule,
    DiscountsModule,
    CampaignsModule,
    PaymentsModule,
  ],
})
export class AdminModule {}
