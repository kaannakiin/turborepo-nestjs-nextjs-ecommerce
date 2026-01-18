import { Module } from '@nestjs/common';
import { PaymentRulesController } from './payment-rules.controller';
import { PaymentRulesService } from './payment-rules.service';

@Module({
  controllers: [PaymentRulesController],
  providers: [PaymentRulesService],
  exports: [PaymentRulesService],
})
export class PaymentRulesModule {}
