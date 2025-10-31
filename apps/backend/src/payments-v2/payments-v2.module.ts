import { Module } from '@nestjs/common';
import { PaymentsV2Service } from './payments-v2.service';
import { PaymentsV2Controller } from './payments-v2.controller';
import { CartV3Service } from 'src/cart-v3/cart-v3.service';
import { ShippingModule } from 'src/shipping/shipping.module';
import { IyzicoService } from './iyzico/iyzico.service';

@Module({
  controllers: [PaymentsV2Controller],
  providers: [PaymentsV2Service, CartV3Service, IyzicoService],
  imports: [ShippingModule],
})
export class PaymentsV2Module {}
