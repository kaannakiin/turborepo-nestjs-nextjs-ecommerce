import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ShippingModule } from 'src/shipping/shipping.module';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [ShippingModule],
})
export class PaymentModule {}
