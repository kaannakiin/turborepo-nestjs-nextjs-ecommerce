import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ShippingModule } from 'src/shipping/shipping.module';
import { CartV2Module } from 'src/cart-v2/cart-v2.module';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [ShippingModule, CartV2Module],
})
export class PaymentModule {}
