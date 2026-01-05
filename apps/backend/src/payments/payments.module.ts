import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ShippingModule } from 'src/shipping/shipping.module';
import { IyzicoService } from './iyzico/iyzico.service';
import { LocaleModule } from 'src/common/services/locale/locale.module';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, IyzicoService],
  imports: [ShippingModule, LocaleModule],
})
export class PaymentsModule {}
