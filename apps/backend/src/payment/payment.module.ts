import { Module } from '@nestjs/common';
import { CartV3Service } from 'src/cart-v3/cart-v3.service';
import { ShippingModule } from 'src/shipping/shipping.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, CartV3Service],
  imports: [ShippingModule],
})
export class PaymentModule {}
