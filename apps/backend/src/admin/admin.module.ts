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
import { UsersModule } from './users/users.module';
import { StoreModule } from './store/store.module';
import { ShippingModule } from './shipping/shipping.module';
import { PaymentRulesModule } from './payment-rules/payment-rules.module';
import { HierarchyModule } from './hierarchy/hierarchy.module';

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
    ProductsModule,
    InventoryModule,
    StoreModule,
    ShippingModule,
    HierarchyModule,
  ],
})
export class AdminModule {}
