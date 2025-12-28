import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CartV3Service } from 'src/cart-v3/cart-v3.service';
import { ShippingModule } from 'src/shipping/shipping.module';
import { IyzicoService } from './iyzico/iyzico.service';
import { OrdersService } from 'src/orders/orders.service';
import { LocaleModule } from 'src/common/services/locale/locale.module';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, CartV3Service, IyzicoService, OrdersService],
  imports: [ShippingModule, LocaleModule],
})
export class PaymentsModule {}
