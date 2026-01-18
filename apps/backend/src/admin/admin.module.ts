import { Module } from '@nestjs/common';
import { SharedModule } from 'src/common/services/shared.module';
import { MinioModule } from 'src/minio/minio.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CampaignsModule } from './campaigns/campaigns.module';
import { DiscountsModule } from './discounts/discounts.module';
import { InventoryModule } from './inventory/inventory.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { Themev2Module } from './themev2/themev2.module';
import { UsersModule } from './users/users.module';
import { StoreModule } from './store/store.module';
import { ShippingModule } from './shipping/shipping.module';
import { PaymentRulesModule } from './payment-rules/payment-rules.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [
    UsersModule,
    SharedModule,
    MinioModule,
    PrismaModule,
    DiscountsModule,
    CampaignsModule,
    PaymentsModule,
    PaymentRulesModule,
    Themev2Module,
    ProductsModule,
    InventoryModule,
    StoreModule,
    ShippingModule,
  ],
})
export class AdminModule {}
